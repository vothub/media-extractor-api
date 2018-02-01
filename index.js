const config = require('./config');
const routes = require('./routes');
const express = require('express');

const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const hbs = config.views.engine;
hbs.registerPartials(config.views.partialsPath);
app.engine('html', hbs.__express);
app.set('view engine', 'html');

routes.registerRoutes(app, routes);

if (config.appNetwork === 'private' && !config.appNetworkInterface) {
      console.log('Couldnt determine private interface - restricting to localhost');
      config.appNetworkInterface = '127.0.0.1';
    }
    // start app
    app.listen(config.appPort, config.appNetworkInterface, 0, function () {
  console.log('URLGent listening on port', config.appPort);
});
