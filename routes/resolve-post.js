var _ = require('lodash');
var async = require('async');
var Helpers = require('../lib/helpers');
var resolvers = require('../lib/resolvers');

module.exports = function (req, res) {
  var input = (req.body.lookupInput || '').trim();

  if (!input.length) {
    return res.status(404).send('No URL provided :(');
  }

  resolvers(input, {ytdl: true}, function (data) {
    Helpers.logRequest('URL resolved');

    res.locals.page = {title: 'Results'};
    res.locals.data = data;
    res.render('pages/results')
  });

  // res.redirect(`/results/${data.id}`);
}
