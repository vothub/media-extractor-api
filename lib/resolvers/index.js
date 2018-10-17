const _ = require('lodash');

const ytdl = require('./lib/ytdl');
const htmlRaw = require('./lib/htmlRaw');
const htmlClean = require('./lib/htmlClean');

function ytdlResolverFn(url, cb) {
  ytdl(url, (err, data) => {
    if (err) {
      return cb(err);
    }
    return cb(null, { ytdl: data });
  });
}

function htmlResolverFn(url, cb) {
  const rtnData = { url };

  htmlRaw(url, (rawErr, rawData) => {
    if (rawErr || !rawData) {
      return cb(rawErr);
    }
    rtnData.raw = rawData;

    htmlClean(url, (cleanErr, cleanData) => {
      if (cleanErr || !cleanData) {
        return cb(cleanErr);
      }
      rtnData.clean = cleanData;

      return cb(null, rtnData);
    });
  });
}


/**
 * Main function - runs all parses
 * @param {String} url URL to resolve
 * @param {String} type "media" or "html"
 * @param {Function} callback Returns object in a single argument
 */
function main(url, type, callback) {
  type = type || 'media'.trim();
  // const resolverData = {
  //   timestamp: Date.now(),
  //   errors: {}
  // };

  let resolverFn;

  if (type === 'media') {
    resolverFn = ytdlResolverFn;
  }

  if (type === 'html') {
    resolverFn = htmlResolverFn;
  }

  if (!resolverFn) {
    return callback({});
  }

  resolverFn(url, (err, results) => {
    const rtnData = {};

    if (type === 'media') {
      // parse formats
      const formats = _.get(results, 'ytdl.formats', []);
      const audioFormats = _.filter(formats, { vcodec: 'none' });

      const media = {
        audio: _.last(audioFormats),
        video: _.last(formats)
      };

      // bind properties
      rtnData.title = _.get(results, 'ytdl.fulltitle');
      rtnData.description = _.get(results, 'ytdl.description');
      rtnData.url = _.get(results, 'ytdl.webpage_url');
      rtnData.media = media;
    }

    if (type === 'html') {
      rtnData.title = _.get(results, 'clean.title');
      rtnData.description = _.get(results, 'clean.description');
      rtnData.url = _.get(results, 'clean.url');
      rtnData.raw = _.get(results, 'raw');
      rtnData.clean = _.get(results, 'clean');
    }

    return callback(rtnData);
  });
}

module.exports = main;
