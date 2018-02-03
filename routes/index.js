const Helpers = require('../lib/helpers');
const resolvers = require('../lib/resolvers');
const JobLib = require('../lib/job');
const express = require('express');
const _ = require('lodash');
const request = require('request');

function routes(app) {
  /**
   * Web
   * Public dir
   */
  app.use('/public', express.static('public'));

  /**
   * Web
   * Homepage
   */
  app.get('/', function (req, res) {
    Helpers.logRequest('PAGE_VIEW');
    res.locals.pageTitle = 'URLGent. Because privacy.';
    res.render('pages/home');
  });

  /**
   * Web
   * Info page about API
   */
  app.get('/api', function (req, res) {
    Helpers.logRequest('PAGE_VIEW');
    res.locals.pageTitle = 'API - URLGent';
    res.render('pages/api');
  });


  /**
   * Web
   * Stats page
   */
  app.get('/stats', function (req, res) {
    const requestLogData = Helpers.getJson('../requestlog');
    Helpers.logRequest('PAGE_VIEW');
    let rtn = {};
    _.each(requestLogData, function (val, key) {
      const total = _.sum(_.map(val));
      rtn[key] = total;
    });

    res.locals.pageTitle = 'Usage stats - URLGent';
    res.locals.stats = rtn;

    res.render('pages/stats');
  });

  /**
   * Web
   * About page
   */
  app.get('/about', function (req, res) {
    Helpers.logRequest('PAGE_VIEW');
    res.locals.pageTitle = 'About - URLGent';
    res.render('pages/about');
  });

  /**
   * Web
   * Create a lookup request
   * Redirects to lookup results page
   */
  app.post('/create', function (req, res) {
    Helpers.logRequest('URL_LOOKUP_REQUEST_WEB');
    const inputUrl = (req.body.url || '').trim();

    if (!inputUrl.length) {
      return res.status(412).send('No URL provided.');
    }

    const jobData = {url: inputUrl, opts: {ytdl: true}};
    const jobId = JobLib.create(jobData);

    JobLib.start(jobId);
    res.redirect('/view/' + jobId);
  });

  /**
   * Web
   * Lookup results page
   */
  app.get('/view/:id', function (req, res) {
    Helpers.logRequest('URL_LOOKUP_RESULT_WEB');
    const id = req.params.id;
    const job = JobLib.get(id);
    if (job && job.data && job.data.description) {
      job.data.description = job.data.description.replace(/\n/g, '<br />');
    }

    if (job) {
      // bind data to page
      res.locals.pageTitle = _.get(job, 'data.title', 'Resolving') + ' - URLGent';
      res.locals.data = _.get(job, 'data');
      res.locals.id = _.get(job, 'id');
      res.locals.exists = true;
    }

    res.render('pages/view-result');
  });



  /**
   * API
   * Middleware
   */
  app.use('/api', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
  });

  /**
   * API v2
   * POST /create
   */
  app.post('/api/v2/create', function (req, res) {
    Helpers.logRequest('URL_LOOKUP_REQUEST_API');
    const inputUrl = (req.body.url || '').trim();
    const inputType = (req.body.type || 'media').trim();

    if (!inputUrl.length) {
      return res.status(404).json({error: 'No URL provided.'});
    }

    if (inputType !== 'media') {
      return res.status(412).send('The only supported "type" is "media".');
    }

    const jobData = {url: inputUrl, opts: {ytdl: true}};
    const jobId = JobLib.create(jobData);

    JobLib.start(jobId);
    res.json({id: jobId, url: '/api/v2/get/' + jobId});
  });

  /**
   * API v2
   * GET /get/:id
   */
  app.get('/api/v2/get/:id', function (req, res) {
    Helpers.logRequest('URL_LOOKUP_RESULT_API');
    const id = req.params.id;
    let job = JobLib.get(id);

    if (!job || !Object.keys(job).length) {
      return res.status(404).send('Job not found.');
    }

    res.json(job);
  });

  /**
   * API v2
   * GET /stream/:id/:type
   */
  app.get('/api/v2/stream/:id/:type', function (req, res) {
    Helpers.logRequest('FILE_STREAM');
    const id = req.params.id;
    const type = req.params.type;
    let job = JobLib.get(id);

    if (!job || !Object.keys(job).length) {
      return res.status(404).send('Job not found.');
    }

    const mediaObject = _.get(job, 'data.media', {})[type];
    if (!mediaObject || !mediaObject.urlRaw) {
      return res.status(404).send('Media type not found.');
    }

    request(mediaObject.urlRaw).pipe(res);
  });

  /**
   * API v2
   * GET /stats
   */
  app.get('/api/v2/stats', function (req, res) {
    const requestLogData = Helpers.getJson('../requestlog');
    res.json(requestLogData);
  });



  /**
   * API v1
   */
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
      Helpers.logRequest('URL_LOOKUP_REQUEST_ERR');
      return res.json({error: 'Invalid URL'});
    }
    url = url.trim();

    if (url.length < 1 || url.indexOf('http') !== 0) {
      Helpers.logRequest('URL_LOOKUP_REQUEST_ERR');
      return res.json({error: 'Invalid URL'});
    }

    Helpers.logRequest('URL_LOOKUP_REQUEST_API');

    resolvers(url, opts, function (data) {
      Helpers.logRequest('URL_LOOKUP_RESULT_API');
      const rtn = _.omit(data, 'errors');
      res.json(rtn);
    });
  });
}

module.exports = routes;
