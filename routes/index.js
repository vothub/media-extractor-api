const Helpers = require('../lib/helpers');
const resolvers = require('../lib/resolvers');
const JobLib = require('../lib/job');
const express = require('express');
const _ = require('lodash');
const request = require('request');

function routes(app) {
  app.use('/public', express.static('public'));

  app.get('/', function (req, res) {
    Helpers.logRequest('PAGE_VIEW');
    res.locals.page = { title: 'Welcome to URLGent' };
    res.render('pages/home');
  });

  app.get('/stats', function (req, res) {
    const requestLog = Helpers.getJson('../requestlog');
    Helpers.logRequest('PAGE_VIEW');
    let rtn = {};
    _.each(requestLog, function (val, key) {
      var total = _.sum(_.map(val));
      rtn[key] = total;
    });

    res.locals.page = {title: 'Stats'};
    res.locals.stats = rtn;

    res.render('pages/stats');
  });

  app.get('/about', function (req, res) {
    Helpers.logRequest('PAGE_VIEW');
    res.render('pages/about');
  });

  // demo
  app.post('/create', function (req, res) {
    Helpers.logRequest('URL_RESOLUTION_REQUEST_WEB');
    require('./create')(req, res);
  });

  app.get('/view/:id', function (req, res) {
    Helpers.logRequest('URL_RESOLUTION_VIEW_WEB');
    const id = req.params.id;
    let job = JobLib.get(id);

    if (job) {
      res.locals.page = {title: 'URLGent: ' + (_.get(job, 'data.title', 'Resolving'))};
      res.locals.data = _.get(job, 'data');
      res.locals.id = _.get(job, 'id');
      res.locals.exists = true;
    }

    res.render('pages/results');
  });

  // api middleware
  app.use('/api', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
  });

  // api landing page
  app.get('/api', function (req, res) {
    Helpers.logRequest('PAGE_VIEW');
    res.locals.page = {title: 'API'};
    res.render('pages/api');
  });

  // api v2 create
  app.get('/api/v2/create', function (req, res) {
    Helpers.logRequest('URL_RESOLUTION_REQUEST_API');
    var inputUrl = (req.body.lookupInput || '').trim();

    if (!inputUrl.length) {
      return res.status(404).send('No URL provided :(');
    }
    var jobData = {url: inputUrl, opts: {ytdl: true}};

    const jobId = jobLib.create(jobData);
    jobLib.start(jobId);
    res.redirect('/view/' + jobId);
  });

  // api v2 get
  app.get('/api/v2/get/:id', function (req, res) {
    Helpers.logRequest('URL_RESOLUTION_VIEW_API');
    const id = req.params.id;
    let job = JobLib.get(id);
    res.json(rtn);
  });

  // api v2 stream
  app.get('/api/v2/stream/:id/:type/:nicename', function (req, res) {
    Helpers.logRequest('URL_STREAM');
    const id = req.params.id;
    const type = req.params.type;
    let job = JobLib.get(id);

    // res.send('Placeholder');
    request(job.data.media[type]).pipe(res);
  });


  // api v1
  app.get('/api/v1/resolve', function (req, res) {
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
      Helpers.logRequest('URL_RESOLUTION_REQUEST_ERR');
      return res.json({error: 'Invalid URL'});
    }
    url = url.trim();

    if (url.length < 1 || url.indexOf('http') !== 0) {
      Helpers.logRequest('URL_RESOLUTION_REQUEST_ERR');
      return res.json({error: 'Invalid URL'});
    }

    Helpers.logRequest('URL_RESOLUTION_REQUEST_API');

    resolvers(url, opts, function (data) {
      const rtn = _.omit(data, 'errors');
      res.json(rtn);
    });
  });
}

module.exports = routes;
