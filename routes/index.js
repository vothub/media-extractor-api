const Helpers = require('../lib/helpers');
const resolvers = require('../lib/resolvers');
const express = require('express');
const _ = require('lodash');
let routes = [];

routes.push({
  method: 'USE',
  path: '/public',
  handler: express.static('public')
});

routes.push({
  method: 'GET',
  path: '/',
  handler: function (req, res) {
    res.locals.page = { title: 'Welcome to URLGent' };
    Helpers.logRequest('Homepage view');
    res.render('pages/home');
  }
});

routes.push({
  method: 'GET',
  path: '/stats',
  handler: function (req, res) {
    const requestLog = Helpers.getJson('../requestlog');
    let rtn = {};
    _.each(requestLog, function (val, key) {
      var total = _.sum(_.map(val));
      rtn[key] = total;
    });

    res.locals.page = {title: 'Stats'};
    res.locals.stats = rtn;

    Helpers.logRequest('Info page view');
    res.render('pages/stats');
  }
});


routes.push({
  method: 'GET',
  path: '/about',
  handler: function (req, res) {
    Helpers.logRequest('Info page view');
    res.render('pages/about');
  }
});

routes.push({
  method: 'POST',
  path: '/resolve',
  handler: require('./resolve-post')
});

routes.push({
  method: 'GET',
  path: '/results',
  handler: function (req, res) {
    res.redirect(`/`);
  }
});

// routes.push({
//   method: 'GET',
//   path: '/results/:id',
//   handler: function (req, res) {
//     res.locals.page = {title: 'Results'};
//     res.locals.results = [];
//     res.locals.query = {id: req.params.id}
//     res.render('pages/results');
//   }
// });





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
      opts.html = true;
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







function registerRoutes(app, routesArray) {
  for (var i = 0; i < routesArray.length; i++) {
    var currentRoute = routesArray[i];
    // console.log('Registering route:', currentRoute.method, currentRoute.path);

    app[currentRoute.method.toLowerCase()](currentRoute.path, currentRoute.handler);
  }
}

module.exports = routes;
module.exports.registerRoutes = registerRoutes;
