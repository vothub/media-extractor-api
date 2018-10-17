const request = require('request');
// const cache = require('../../cache');
const _ = require('lodash');

module.exports = function fetch(url, opts, cb) {
  // console.log('RETRIEVE', url);
  if (!cb && typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  opts = opts || {};

  if (!url) {
    return cb();
  }

  // if (cache.shouldUseCache('fetch', url)) {
  //   return cb(null, cache.get('fetch', url));
  // }

  const requestOpts = {
    url: url,
    method: opts.method || 'GET',
    followRedirect: opts.followRedirections || true,
    maxRedirections: 10
  };

  request(requestOpts, (err, response, body) => {
    const rtn = {
      url: url,
      body: body,
      code: _.get(response, 'statusCode'),
      headers: _.get(response, 'headers')
    };
    if (err) {
      rtn.error = err;
    }

    // if (!rtn.error && rtn.code === 200) {
    //   cache.save('fetch', url, rtn);
    // }
    return cb(err, rtn);
  });
};
