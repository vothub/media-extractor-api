var _ = require('lodash');
var async = require('async');
var uuid = require('uuid');

var ytdl = require('./lib/ytdl');
var fetch = require('./lib/fetch');
var extract = require('./lib/extract');


/**
 * Main function - runs all parses
 * @param {String} url URL to resolve
 * @param {Object} opts No options supported yet
 * @param {Function} callback Returns object in a single argument
 */
function main (url, opts, callback) {
  opts = opts || {};
  opts.ytdl = typeof opts.ytdl !== 'undefined' ? opts.ytdl : false;
  opts.raw = typeof opts.raw !== 'undefined' ? opts.raw : false;
  opts.clean = typeof opts.clean !== 'undefined' ? opts.clean : false;

  var resolverData = {
    timestamp: Date.now(),
    errors: {}
  };

  var resolvers = [];

  resolvers.push(function (cb) {
    ytdl(url, function (err, info) {
      if (err || !info) {
        resolverData.errors['ytdl'] = err;
      }
      if (opts.ytdl) resolverData.ytdl = !err && info ? info : false;
      return cb();
    });
  });

  resolvers.push(function (cb) {
    fetch(url, function (err, info) {
      if (err || !info) {
        // console.log(err);
        resolverData.errors['fetch'] = err;
      }
      // escape info.response
      if (opts.raw) resolverData.raw = !err && info ? info : false;

      extract(url, function (err, info) {
        if (err || !info) {
          resolverData.errors['extract'] = err;
        }
        if (opts.clean) resolverData.clean = !err && info ? info : false;

        return cb();
      });
    });
  });


  async.parallel(resolvers, function(err, results) {
    var canonical = {};

    var formats = _.get(resolverData, 'ytdl.formats', []);
    var audioFormats = _.filter(formats, {vcodec: 'none', width: null, height: null});

    var media = {
      audio: _.last(audioFormats),
      video: _.last(formats)
    };

    canonical.timestamp = resolverData.timestamp;
    canonical.id = uuid.v4();
    canonical.title = _.get(resolverData, 'ytdl.fulltitle') || _.get(resolverData, 'clean.title') || null;
    canonical.description = _.get(resolverData, 'ytdl.description') || null;
    canonical.url = _.get(resolverData, 'ytdl.webpage_url') || _.get(resolverData, 'clean.url') || _.get(resolverData, 'raw.url') || null;
    canonical.media = media;

    // resolverData.canonical = canonical;
    // return callback(resolverData);
    return callback(canonical);
  });
}

module.exports = main;
