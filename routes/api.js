const _ = require('lodash');
const Helpers = require('../lib/helpers');
const resolvers = require('../lib/resolvers');
let routes = [];

routes.push({
  method: 'USE',
  path: '/api',
  handler: function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
  }
});

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
    const types = typeof req.query.type === 'string' ? req.query.type.split(',') : [];
    let url = req.query.url;
    let opts = {
      ytdl: false,
      raw: false,
      clean: false
    };

    if (types.indexOf('media') != -1) {
      opts.ytdl = true;
    }

    if (types.indexOf('html') != -1) {
      opts.raw = true;
      opts.clean = true;
    }

    if (typeof url !== 'string') {
      return res.json({error: 'Invalid URL'});
    }
    url = url.trim();

    if (url.length < 1 || url.indexOf('http') !== 0) {
      return res.json({error: 'Invalid URL'});
    }

    resolvers(url, opts, function (data) {
      // Helpers.logRequest('API v1: URL resolved');
      Helpers.logRequest('URL resolved');
      const rtn = _.omit(data, 'errors');
      res.json(rtn);
    });
  }
});

module.exports = routes;
