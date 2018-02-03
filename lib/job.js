const uuidv4 = require('uuid/v4');
const _ = require('lodash');
const resolvers = require('./resolvers');

let jobs = {};

/**
 * Create a job
 * @param data object
 * @returns job id
 *
 * data = {
 *   pathIn: '/tmp/file/path',
 *   format: 'mp4',
 *   fileBasename: 'MyImportantPresentation',
 *   filenamePatern: '$base.$format'
 * }
 */
function create(data) {
  if (typeof data !== 'object' || !data.url) {
    console.log('Missing arguments when creating a job. Provided:', data);
    return null;
  }
  data.id = uuidv4();

  // TODO insert data to mongo instead
  jobs[data.id] = data;

  return data.id;
}


function get(id) {
  return jobs[id];
}

function start(id) {
  console.log('Starting job #' + id);
  var job = get(id);

  if (!job || !job.id) {
    console.log('Job #' + id + ' could not be located.');
    return;
  }

  job.opts = {ytdl: true};

  resolvers(job.url, job.opts, function (data) {
    job.data = data;
    job.state = 'complete';
    //
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

    jobs[id] = job;
  });
}

const jobLib = {
  create,
  get,
  start
};

module.exports = jobLib;
