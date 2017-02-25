const path = require('path');
const fse = require('fs-extra');
const hbs = require('hbs');

const config = {
  baseUrl: 'http://localhost:7000',
  port: 7000,
  paths: {
    public: path.join(__dirname, 'public'),
    views: path.join(__dirname, 'views'),
    data: path.join(__dirname, 'data'),
    logfile: path.join(__dirname, 'requestlog.json')
  }
};

config.views = {
  engine: hbs,
  partialsPath: config.paths.views + '/partials'
};

// ensure request log file
try {
  fse.accessSync(config.paths.logfile);
} catch (e) {
  fse.writeJsonSync(config.paths.logfile, {});
}

module.exports = config;
