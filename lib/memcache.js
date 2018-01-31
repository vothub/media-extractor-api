var _ = require('lodash');
var cache = {};
var cacheTTL = 60 * 60 * 1000; // 1 hour

var shouldUseCache = function (store, key) {
  var cacheObj = _.get(cache, [store, key].join('.'));
  if (!cacheObj) {
    console.log('[' + store + ']', 'Not cached:', key);
    return false;
  }

  var stamp = cacheObj.cachetimestamp || 0;

  return (stamp + cacheTTL > Date.now());
}

function save (store, key, value) {
  if (!value) {
    return;
  }
  console.log('[' + store + ']', 'Store cache:', key);
  value.cachetimestamp = Date.now();
  _.set(cache, [store, key].join('.'), value)
}

function get (store, key) {
  console.log('[' + store + ']', 'Get cache:', key);
  return _.get(cache, [store, key].join('.'));
}

module.exports = {
  get: get,
  save: save,
  shouldUseCache: shouldUseCache
}
