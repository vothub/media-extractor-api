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
  app.get('/', (req, res) => {
    Helpers.logRequest('PAGE_VIEW');
    res.locals.pageTitle = 'URLGent. Browse privately. No bloat.';
    res.render('pages/home');
  });

  /**
   * Web
   * Info page about API
   */
  app.get('/api', (req, res) => {
    Helpers.logRequest('PAGE_VIEW');
    res.locals.pageTitle = 'API - URLGent';
    res.render('pages/api');
  });


  /**
   * Web
   * Stats page
   */
  app.get('/stats', (req, res) => {
    const requestLogData = Helpers.getJson('../requestlog');
    Helpers.logRequest('PAGE_VIEW');
    const rtn = {};
    _.each(requestLogData, (val, key) => {
      const total = _.sum(_.map(val));
      rtn[key] = total;
    });

    res.locals.pageTitle = 'Usage stats - URLGent';
    res.locals.stats = rtn;

    res.render('pages/stats');
  });

  /**
   * Web
   * History page
   */
  app.get('/history', (req, res) => {
    Helpers.logRequest('PAGE_VIEW');

    JobLib.getPublicHistory((publicHistoryErr, publicHistoryData) => {
      res.locals.pageTitle = 'History - URLGent';
      res.locals.history = publicHistoryData;

      res.render('pages/history');
    });
  });

  /**
   * Web
   * About page
   */
  app.get('/about', (req, res) => {
    Helpers.logRequest('PAGE_VIEW');
    res.locals.pageTitle = 'About - URLGent';
    res.render('pages/about');
  });

  /**
   * Web
   * Create a lookup request
   * Redirects to lookup results page
   */
  app.post('/create', (req, res) => {
    Helpers.logRequest('URL_LOOKUP_REQUEST_WEB');
    const inputUrl = (req.body.url || '').trim();
    const inputType = (req.body.type || 'media').trim();
    const inputPublic = req.body.public === 'true';

    if (!inputUrl.length) {
      return res.status(412).send('No URL provided.');
    }

    const jobData = { url: inputUrl, type: inputType, public: inputPublic };
    JobLib.create(jobData, (err, jobId) => {
      JobLib.start(jobId);
      res.redirect(`/view/${jobId}`);
    });
  });

  /**
   * Web
   * Lookup results page
   */
  app.get('/view/:id', (req, res) => {
    Helpers.logRequest('URL_LOOKUP_RESULT_WEB');
    const id = req.params.id;
    JobLib.get(id, (err, job) => {
      if (job && job.id) {
        if (job.state === 'complete' && !job.lastResolvedTimestamp) {
          job.lastResolvedTimestamp = 0;
        }
        const lastResolved = new Date(job.lastResolvedTimestamp);
        const now = new Date();
        const diff = now - lastResolved;
        const ttl = 60 * 60 * 1000;

        if (diff > ttl) {
          console.log(`Data for ${job.id} last resolved over an hour ago - refreshing.`);
          JobLib.start(job.id);
          return res.redirect(`/view/${job.id}`);
        }
      }

      if (job && job.data && job.data.description) {
        job.data.description = job.data.description.replace(/\n/g, '<br />');
      }
      if (job && job.data && job.data.clean && job.data.clean.text) {
        job.data.clean.text = job.data.clean.text.replace(/\n/g, '<br />');
      }

      if (job) {
        // bind data to page
        res.locals.pageTitle = `${_.get(job, 'data.title', 'Resolving')} - URLGent`;
        res.locals.data = _.get(job, 'data');
        // console.log(JSON.stringify(res.locals.data, null, 2));
        res.locals.id = _.get(job, 'id');
        res.locals.exists = true;
      }

      res.render('pages/view-result');
    });
  });


  /**
   * API
   * Middleware
   */
  app.use('/api', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
  });

  /**
   * API v2
   * POST /create
   */
  app.post('/api/v2/create', (req, res) => {
    Helpers.logRequest('URL_LOOKUP_REQUEST_API');
    const inputUrl = (req.body.url || '').trim();
    const inputType = (req.body.type || 'media').trim();

    if (!inputUrl.length) {
      return res.status(404).json({ error: 'No URL provided.' });
    }

    if (inputType !== 'media') {
      return res.status(412).send('The only supported "type" is "media".');
    }

    const jobData = { url: inputUrl, type: inputType };
    JobLib.create(jobData, (err, jobId) => {
      JobLib.start(jobId);
      res.json({ id: jobId, url: `/api/v2/get/${jobId}` });
    });
  });

  /**
   * API v2
   * GET /get/:id
   */
  app.get('/api/v2/get/:id', (req, res) => {
    Helpers.logRequest('URL_LOOKUP_RESULT_API');
    const id = req.params.id;
    JobLib.get(id, (err, job) => {
      if (!job || !Object.keys(job).length) {
        return res.status(404).send('Job not found.');
      }

      res.json(job);
    });
  });

  /**
   * API v2
   * GET /stream/:id/:type
   */
  app.get('/api/v2/stream/:id/:type', (req, res) => {
    Helpers.logRequest('FILE_STREAM');
    const id = req.params.id;
    const type = req.params.type;

    JobLib.get(id, (err, job) => {
      if (!job || !Object.keys(job).length) {
        return res.status(404).send('Job not found.');
      }

      const mediaObject = _.get(job, 'data.media', {})[type];
      if (!mediaObject || !mediaObject.urlRaw) {
        return res.status(404).send('Media type not found.');
      }

      request(mediaObject.urlRaw).pipe(res);
    });
  });

  app.get('/api/v2/stream/:id/:type/:niceName', (req, res) => {
    Helpers.logRequest('FILE_STREAM');
    const id = req.params.id;
    const type = req.params.type;
    const niceName = req.params.niceName;

    JobLib.get(id, (err, job) => {
      if (!job || !Object.keys(job).length) {
        return res.status(404).send('Job not found.');
      }

      const mediaObject = _.get(job, 'data.media', {})[type];
      if (!mediaObject || !mediaObject.urlRaw) {
        return res.status(404).send('Media type not found.');
      }
      // Here is where I change the title
      const filename = `${_.get(job, 'data.title')}.${mediaObject.ext}`;

      const url = `${mediaObject.urlProxied}/${filename}`;
      if (niceName !== filename) {
        return res.redirect(url);
      }
      request(mediaObject.urlRaw).pipe(res);
    });
  });

  /**
   * API v2
   * GET /stats
   */
  app.get('/api/v2/stats', (req, res) => {
    const requestLogData = Helpers.getJson('../requestlog');
    res.json(requestLogData);
  });


  /**
   * API v1
   */
  app.get('/api/v1/resolve', (req, res) => {
    const type = req.query.type;
    let url = req.query.url;

    if (typeof url !== 'string') {
      Helpers.logRequest('URL_LOOKUP_REQUEST_ERR');
      return res.json({ error: 'Invalid URL' });
    }
    url = url.trim();

    if (url.length < 1 || url.indexOf('http') !== 0) {
      Helpers.logRequest('URL_LOOKUP_REQUEST_ERR');
      return res.json({ error: 'Invalid URL' });
    }

    Helpers.logRequest('URL_LOOKUP_REQUEST_API');

    resolvers(url, type, (data) => {
      Helpers.logRequest('URL_LOOKUP_RESULT_API');
      const rtn = _.omit(data, 'errors');
      res.json(rtn);
    });
  });
}

module.exports = routes;
