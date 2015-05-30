var safe = require('safe');
var mongo = require('mongodb');
var requireRedis = require("redis");
var cfg = require('cok_config');
var _db = null;
var _redis= null;
var collections = [];

/**
* databases
*/
function dbHelper () {
    var self = this;
    self.db = function (cb) {
        if (_db) {
            return cb(null, _db);
        }
        console.log("Connecting to: " , cfg.mongo);
        var dbc = new mongo.Db(
            cfg.mongo.db,
            new mongo.Server(cfg.mongo.host, cfg.mongo.port, cfg.mongo.opts), {native_parser: false, safe:true, w: 1}
        );
        dbc.open(safe.sure(cb, function(db) {
            _db = db;
            if (! cfg.mongo.auth) {
                cb(null, _db);
            } else {
                _db.authenticate(cfg.mongo.user, cfg.mongo.password, safe.sure(cb, function() {
                    cb(null, _db);
                }));
            }
        }));
    };

    self.collection = function(name, cb) {
        if (! collections[name]) {
            self.db(safe.sure(cb, function(db) {
                db.collection(name, function (err, collection) {
                    collections[name] = collection;
                    cb(err, collection);
                });
            }));
        } else {
            cb(null, collections[name]);
        }

    };

    self.redis = function (cb) {
        if (! _redis) {
            if (! cfg.redis.auth) {
                _redis = requireRedis.createClient();
                cb(null, _redis);
            } else {
                _redis = requireRedis.createClient(cfg.redis.port, cfg.redis.host);
                _redis.auth(cfg.redis.password, safe.sure(cb, function() {
                    cb(null, _redis);
                }));
            }
        } else {
            cb(null, _redis);
        }
    };
}

// export
module.exports = new dbHelper();
