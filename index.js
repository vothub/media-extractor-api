const config = require('./config');
const routes = require('./routes');
const express = require('express');
const bodyParser = require('body-parser');

function startApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  const hbs = config.views.engine;
  hbs.registerPartials(config.views.partialsPath);
  app.engine('html', hbs.__express); // eslint-disable-line no-underscore-dangle
  app.set('view engine', 'html');

  routes(app);

  if (config.appNetwork === 'private' && !config.appNetworkInterface) {
    console.log('Couldn\'t determine private interface - restricting to localhost');
    config.appNetworkInterface = '127.0.0.1';
  }

  // start app
  app.listen(config.appPort, config.appNetworkInterface, 0, () => {
    console.log('Media Extractor API listening on port', config.appPort);
  });
}

startApp();
