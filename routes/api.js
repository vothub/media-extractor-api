const Helpers = require('../lib/helpers');
const _ = require('lodash');
const resolvers = require('remotestack/resolvers');
let routes = [];

routes.push({
  method: 'GET',
  path: '/api',
  handler: function (req, res) {
    res.locals.page = {title: 'API'};
    // Helpers.logRequest('API: Homepage');
    res.render('pages/api');
  }
});

routes.push({
  method: 'GET',
  path: '/api/v1/resolve',
  handler: function (req, res) {
    // Helpers.logRequest('API v1: URL resolution request');
    const resolver = req.query.resolver;
    let url = req.query.url;
    let opts = {};

    if (typeof url !== 'string') {
      return res.json({error: 'Invalid URL'});
    }
    url = url.trim();

    if (url.length < 1 || url.indexOf('http') !== 0) {
      return res.json({error: 'Invalid URL'});
    }

    if (resolver) {
      opts.ytdl = resolver === 'ytdl';
      opts.raw = resolver === 'raw';
      opts.clean = resolver === 'clean';
    }
    resolvers(url, opts, function (data) {
      // Helpers.logRequest('API v1: URL resolved');
      Helpers.logRequest('_URL resolved');
      const rtn = _.omit(data, 'errors');
      res.json(rtn);
    });
  }
});

module.exports = routes;
