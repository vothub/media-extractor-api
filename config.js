const path = require('path');
const fse = require('fs-extra');
const hbs = require('hbs');
const clarg = require('clarg');
const clOpts = clarg().opts;

const portRaw = clOpts.port || clOpts.p;
const portParsed = parseInt(portRaw, 10);
const portFinal = (portRaw == portParsed) ? portParsed : 4000;

const config = {
  baseUrl: clOpts.url || clOpts.u || 'http://localhost:' + portFinal,
  port: portFinal,
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
