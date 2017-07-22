var _ = require('lodash');
var cache = {};
var cacheTTL = 360 * 60 * 1000; // 6 hours

var shouldUseCache = function (store, key) {
  var cacheObj = _.get(cache, [store, key].join('.'));
  if (!cacheObj) {
    console.log('No cache found for', store, key);
    return false;
  }

  var stamp = cacheObj.cachetimestamp || 0;

  return (stamp + cacheTTL > Date.now());
}

function save (store, key, value) {
  if (!value) {
    return;
  }
  console.log('Storing cache for', store, key);
  value.cachetimestamp = Date.now();
  _.set(cache, [store, key].join('.'), value)
}

function get (store, key) {
  console.log('Getting cache for', store, key);
  return _.get(cache, [store, key].join('.'));
}

module.exports = {
  get: get,
  save: save,
  shouldUseCache: shouldUseCache
}
