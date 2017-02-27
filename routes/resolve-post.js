var _ = require('lodash');
var Helpers = require('../lib/helpers');
var resolvers = require('remotestack/resolvers');
var async = require('async');

module.exports = function (req, res) {
  Helpers.logRequest('URL resolution request');
  var data = {
    id: 'testhex',
    input: req.body.lookupInput
  }

  var lines = data.input.split('\n');
  lines = _.filter(lines, function (i) {
    return i.trim().length;
  });

  var lookupResults = [];

  async.each(lines, function (line, cb) {
    Helpers.logRequest('URL resolution request');
    resolvers(line, {}, function (data) {
      lookupResults.push(data);
      Helpers.logRequest('URL resolved');
      cb();
    })
  }, function () {
    // console.log(lookupResults);

    res.locals.page = {title: 'Results'};
    res.locals.results = lookupResults;
    res.locals.data = data;
    res.render('pages/results')
  })


  // res.redirect(`/results/${data.id}`);
}
