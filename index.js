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

app.listen(config.port, function () {
  console.log('Listening on port', config.port);
});
