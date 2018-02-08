/**
 * Mongo adapter
 */
const config = require('../config');
const MongoClient = require('mongodb').MongoClient;
const mongoUrl = config.mongoUrl;

/**
 * Creates a Mongo connection
 *
 * @param {function} callback Signature: (err, db)
 */
function _getClient(callback) {
  MongoClient.connect(mongoUrl, function(err, db) {
    if (err || !db) {
      console.log('Couldn\'t connect to Mongo at ' + url);
      if (err) {
        console.error(err);
      }
      return callback(err);
    }

    // console.log('Connected correctly to server');
    return callback(null, db);
  });
}

/**
 * Base model to instantiate a collection-specific model
 *
 * @param {string} collectionName A name of collection to use
 */
function Model(collectionName) {
  if (!mongoUrl) {
    // return {
    //   upsertOne: function upsertOne(queryWhere, querySet, callback) {
    //     return callback();
    //   },
    //   findOne: function findOne(query, callback) {
    //     return callback();
    //   },
    //   find: function find(query, callback) {
    //     return callback();
    //   },
    //   deleteOne: function deleteOne(query, callback) {
    //     return callback();
    //   }
    // };
    return undefined;
  }

  if (typeof collectionName !== 'string' || !collectionName.length) {
    throw new Error('Collection name provided to base model needs to be a string.');
  }

  const rtnModelObject = {
    _type: 'mongo',
    upsert: function upsert(data, callback) {
      _getClient(function (error, db) {
        if (error) {
          console.log(error);
          return callback(error);
        }
        const col = db.collection(collectionName);

        col.updateOne({id: data.id}, data, {upsert: true}, function (err, r) {
          // console.log(r.upsertedId._id);
          db.close();
          return callback(err, r);
        });
      });
    },

    getById: function getById(id, callback) {
      _getClient(function (e, db) {
        var col = db.collection(collectionName);

        col.find({id: id}).limit(1).toArray(function(err, reply) {
          db.close();
          return callback(err, (reply && reply.length ? reply[0] : null));
        });
      });
    },


    // find: function find(query, callback) {
    //   _getClient(function (e, db) {
    //     var col = db.collection(collectionName);
    //
    //     col.find(query).toArray(function(err, reply) {
    //       db.close();
    //       return callback(err, reply);
    //     });
    //   });
    // },

    deleteOne: function deleteOne(query, callback) {
      _getClient(function (e, db) {
        var col = db.collection(collectionName);

        col.deleteOne(query, function(err, reply) {
          return callback(null, reply);
        });
      });
    }
  };

  return rtnModelObject;
};


const jobsModel = new Model('jobs');

module.exports = {
  jobs: jobsModel
};
