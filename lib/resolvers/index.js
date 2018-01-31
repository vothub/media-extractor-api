var _ = require('lodash');
var async = require('async');
var uuid = require('uuid');

var ytdl = require('./lib/ytdl');
var htmlRaw = require('./lib/htmlRaw');
var htmlClean = require('./lib/htmlClean');


/**
 * Main function - runs all parses
 * @param {String} url URL to resolve
 * @param {Object} opts No options supported yet
 * @param {Function} callback Returns object in a single argument
 */
function main (url, opts, callback) {
  opts = opts || {};
  opts.ytdl = typeof opts.ytdl !== 'undefined' ? opts.ytdl : false;
  opts.html = typeof opts.html !== 'undefined' ? opts.html : false;

  var resolverData = {
    timestamp: Date.now(),
    errors: {}
  };

  var resolvers = [];

  if (opts.ytdl) {
    resolvers.push(function (cb) {
      ytdl(url, function (err, info) {
        if (err || !info) {
          resolverData.errors['ytdl'] = err;
        }
        if (opts.ytdl) resolverData.ytdl = !err && info ? info : false;
        return cb();
      });
    });
  }

  if (opts.html) {
    resolvers.push(function (cb) {
      htmlRaw(url, function (err, info) {
        if (err || !info) {
          // console.log(err);
          resolverData.errors['raw'] = err;
        }
        // escape info.response
        // resolverData.raw = !err && info ? info : false;

        htmlClean(url, function (err, info) {
          if (err || !info) {
            resolverData.errors['clean'] = err;
          }
          resolverData.clean = !err && info ? info : false;

          return cb();
        });
      });
    });
  }


  async.parallel(resolvers, function(err, results) {
    var canonical = {};

    var formats = _.get(resolverData, 'ytdl.formats', []);
    var audioFormats = _.filter(formats, {vcodec: 'none', width: null, height: null});

    var media = {
      audio: _.last(audioFormats),
      video: _.last(formats)
    };

    // canonical.timestamp = resolverData.timestamp;
    canonical.title = _.get(resolverData, 'ytdl.fulltitle') || _.get(resolverData, 'clean.title') || null;
    canonical.description = _.get(resolverData, 'ytdl.description') || _.get(resolverData, 'clean.description') || null;
    canonical.url = _.get(resolverData, 'ytdl.webpage_url') || _.get(resolverData, 'clean.url') || null;
    canonical.media = media;

    // resolverData.canonical = canonical;
    // return callback(resolverData);

    console.log(resolverData);
    return callback(canonical);
  });
}

module.exports = main;
