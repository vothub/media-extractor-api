const path = require('path');
const _ = require('lodash');
const fse = require('fs-extra');
const crypto = require('crypto');

const config = require('../config');


var helpers = {
  leadZeroes: function leadZeroes (num, positions) {
    if (!num) {
      num = 0;
    }
    num = num.toString();
    var rtn = num;
    var iterations = 2 - num.length;

    if (iterations > 0) {
      for (i = 0; i < iterations; i++) {
        rtn = '0' + rtn;
      }
    }

    return rtn;
  },

  now: function now () {
    var d = new Date();
    var time = [
      helpers.leadZeroes(d.getHours()),
      helpers.leadZeroes(d.getMinutes()),
      helpers.leadZeroes(d.getSeconds())
    ].join(':');
    time += '.' + helpers.leadZeroes(d.getMilliseconds());
    return '[' + time + ']';
  },

  today: function today () {
    const now = new Date();
    const date = [
      now.getFullYear(),
      helpers.leadZeroes(now.getMonth() + 1),
      helpers.leadZeroes(now.getDate())
    ].join('-');
    return date;
  },

  logRequest: function logRequest(url) {
    if (url === '/favicon.ico' || url === '/robots.txt') {
      return;
    }
    const key = url.replace('.', '-') + '.' + helpers.today();

    const data = fse.readJsonSync(config.paths.logfile) || {};
    const currentCount = _.get(data, key) || 0;
    _.set(data, key, currentCount + 1);

    fse.writeJsonSync(config.paths.logfile, data);
  },

  replacePlaceholders: function replacePlaceholders(data) {
    data = data.replace(/%%BASEURL%%/g, config.baseUrl);
    return data;
  },


  getJson: function getJson(file) {
    let data;

    try {
      data = fse.readFileSync(path.resolve(config.paths.data + '/' + file + '.json')).toString();
      data = helpers.replacePlaceholders(data);
      data = JSON.parse(data);
    } catch (e) {
      console.log(e);
      data = '404';
    }
    return data;
  },

  // hash: function hash(text) {
  //   const shasum = crypto.createHash('sha1');
  //   shasum.update(text);
  //   return shasum.digest('hex');
  // }
};

module.exports = {
  now: helpers.now,
  today: helpers.today,
  logRequest: helpers.logRequest,
  replacePlaceholders: helpers.replacePlaceholders,
  getJson: helpers.getJson,
  hash: helpers.hash
};
