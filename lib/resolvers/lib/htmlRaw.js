var request = require('request');
var cache = require('../../memcache');

module.exports = function fetch (url, opts, cb) {
  // console.log('RETRIEVE', url);
  if (!cb && typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  opts = opts || {};

  if (!url) {
    return cb();
  }

  if (cache.shouldUseCache('fetch', url)) {
    return cb(null, cache.get('fetch', url));
  }

  var requestOpts = {
    url: url,
    method: opts.method || 'GET',
    followRedirect: opts.followRedirections || true,
    maxRedirections: 10
  };

  request(requestOpts, function (err, response, body) {
    var rtn = {
      url: url,
      response: body,
      code: response && response.statusCode ? response.statusCode : false
    };
    if (err) {
      rtn.error = err;
    }

    if (!rtn.error && rtn.code === 200) {
      cache.save('fetch', url, rtn);
    }
    return cb(err, rtn);
  });
};
