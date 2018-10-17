const path = require('path');
const _ = require('lodash');
const fse = require('fs-extra');
const config = require('../config');


const helpers = {
  leadZeroes: function leadZeroes(num) {
    if (!num) {
      num = 0;
    }
    num = num.toString();
    let rtn = num;
    const iterations = 2 - num.length;

    if (iterations > 0) {
      for (let i = 0; i < iterations; i++) {
        rtn = `0${rtn}`;
      }
    }

    return rtn;
  },

  now: function now() {
    const d = new Date();
    let time = [
      helpers.leadZeroes(d.getHours()),
      helpers.leadZeroes(d.getMinutes()),
      helpers.leadZeroes(d.getSeconds())
    ].join(':');
    time += `.${helpers.leadZeroes(d.getMilliseconds())}`;
    return `[${time}]`;
  },

  today: function today() {
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
    const key = `${url.replace('.', '-')}.${helpers.today()}`;

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
      data = fse.readFileSync(path.resolve(`${config.paths.data}/${file}.json`)).toString();
      data = JSON.parse(data);
    } catch (e) {
      console.log(e);
      data = '404';
    }
    return data;
  }
};

module.exports = {
  now: helpers.now,
  today: helpers.today,
  logRequest: helpers.logRequest,
  replacePlaceholders: helpers.replacePlaceholders,
  getJson: helpers.getJson
};
