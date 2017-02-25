const Helpers = require('../lib/helpers');
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
    res.locals.page = {title: 'Stats'};
    res.locals.stats = JSON.stringify(requestLog, null, 2);
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
  handler: function (req, res) {
    Helpers.logRequest('URL resolved');
    var data = {
      id: 'testhex',
      input: req.body.lookupInput
    }

    var lines = data.input.split('\n');
    lines = _.filter(lines, function (i) {
      return i.trim().length;
    });

    res.locals.page = {title: 'Results'};
    res.locals.results = lines;
    res.locals.data = data;
    res.render('pages/results')

    // res.redirect(`/results/${data.id}`);
  }
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

// routes.push({
//   method: 'GET',
//   path: '/api',
//   handler: function (req, res) {
//     res.locals.page = {title: 'API', body: `API description here` };
//     Helpers.logRequest('Info page view');
//     res.render('pages/info');
//   }
// });
// routes = routes.concat(require('./api'));

function registerRoutes(app, routesArray) {
  for (var i = 0; i < routesArray.length; i++) {
    var currentRoute = routesArray[i];
    // console.log('Registering route:', currentRoute.method, currentRoute.path);

    app[currentRoute.method.toLowerCase()](currentRoute.path, currentRoute.handler);
  }
}

module.exports = routes;
module.exports.registerRoutes = registerRoutes;
