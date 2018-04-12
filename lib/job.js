const uuidv4 = require('uuid/v4');
const _ = require('lodash');
const resolvers = require('./resolvers');
const jobsModelMongo = require('../models/mongo').jobs;
const jobsModelMemcache = require('../models/memcache').jobs;

const jobsModel = jobsModelMongo._type ? jobsModelMongo : jobsModelMemcache;
console.log('Using persistence store:', jobsModel._type);

/**
 * Create a job
 * @param data object
 * @returns job id
 *
 * data = {
 *   url: 'https://www.youtube.com/watch?v=C0DPdy98e4c'
 * }
 */
function create(data, callback) {
  if (typeof data !== 'object' || !data.url || !data.type) {
    console.log('Missing arguments when creating a job. Provided:', data);
    return null;
  }
  const id = uuidv4();
  data.id = id;
  jobsModel.upsert(data, function () {
    return callback(null, data.id);
  });
}

function get(id, callback) {
  // return callback(null, jobs[id]);
  jobsModel.getById(id, callback);
  // return jobs[id];
}

function start(id, callback) {
  console.log('Starting job #' + id);
  get(id, function (jobErr, job) {
    if (!job || !job.id) {
      console.log('Job #' + id + ' could not be located.');
      return;
    }

    // clear out the existing data
    job.data = undefined;
    job.state = undefined;
    job.lastResolvedTimestamp = new Date();

    jobsModel.upsert(job, function (err, data) {
      resolvers(job.url, job.type, function (data) {
        job.data = data;
        job.state = 'complete';
        job.lastResolvedTimestamp = new Date();

        // map media urls
        let media = _.get(job, 'data.media');
        if (media) {
          _.each(media, function (val, key) {
            if (val && val.url) {
              val.urlProxied = '/api/v2/stream/' + id + '/' + key;
              val.urlRaw = val.url;
              val.url = undefined;
              media[key] = val;
            }
          });
          job.data.media = media;
        }

        jobsModel.upsert(job, function (err, data) {
          if (typeof callback === 'function') {
            return callback();
          }
        });
      });
    });

  });
}

const jobLib = {
  create,
  get,
  start
};

module.exports = jobLib;
