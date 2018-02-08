/**
 * Memcache adapter
 */
const _ = require('lodash');
const config = require('../config');
const memcacheTTL = config.memcache;
const cache = {};

// function shouldUseCache(store, key) {
//   if (memcacheTTL === 0)
//   var cacheObj = _.get(cache, [store, key].join('.'));
//   if (!cacheObj) {
//     console.log('[' + store + ']', 'Not cached:', key);
//     return false;
//   }
//
//   var stamp = cacheObj.cachetimestamp || 0;
//
//   return (stamp + memcacheTTL > Date.now());
// }

// function save(store, key, value) {
//   if (!value) {
//     return;
//   }
//   console.log('[' + store + ']', 'Store cache:', key);
//   value.cachetimestamp = Date.now();
//   _.set(cache, [store, key].join('.'), value)
// }

// function get(store, key) {
//   console.log('[' + store + ']', 'Get cache:', key);
//   return _.get(cache, [store, key].join('.'));
// }

// module.exports = {
//   get: get,
//   save: save,
//   shouldUseCache: shouldUseCache
// }

/**
 * Base model to instantiate a collection-specific model
 *
 * @param {string} collectionName A name of collection to use
 */
function Model(storeName) {
  if (typeof storeName !== 'string' || !storeName.length) {
    throw new Error('Store name provided to base model needs to be a string.');
  }

  cache[storeName] = cache[storeName] || {};

  const store = cache[storeName];

  const rtnModelObject = {
    _type: 'memcache',
    upsert: function upsert(data, callback) {
      if (!data || !data.id) {
        throw new Error('ID. must be provided');
      }

      data.timestamp = Date.now();
      store[data.id] = data;

      return callback(null, data);
    },

    getById: function getById(id, callback) {
      const data = store[id];
      return callback(null, data);
    },


    // find: function find(query, callback) {
    //     col.find(query).toArray(function(err, reply) {
    //       db.close();
    //       return callback(err, reply);
    //     });
    // },

    deleteOne: function deleteOne(query, callback) {
      delete store[id];
      // col.deleteOne(query, function(err, reply) {
      //   return callback(null, reply);
      // });
    }
  };

  return rtnModelObject;
};


const jobsModel = new Model('jobs');

module.exports = {
  jobs: jobsModel
};
