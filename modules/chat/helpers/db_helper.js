var safe = require('safe');
var mongo = require('mongodb');
var requireRedis = require("redis");
var cfg = require('./config_helper');
var _db;
var _redis;

/**
* databases
*/
function dbHelper () {
    var self = this;
    self.db = function (cb) {
        if (_db) {
            return cb(null, _db);
        }
        console.log("Connecting to: " + cfg.mongo.host);
        var dbc = new mongo.Db(
            cfg.mongo.db,
            new mongo.Server(cfg.mongo.host, cfg.mongo.port, cfg.mongo.opts), {native_parser: false, safe:true, maxPoolSize: 100}
        );
        dbc.open(safe.sure(cb, function(db) {
            _db = db;
            cb(null, _db);
        }));
    };

    self.collection = function(name, cb) {
        self.db(safe.sure(cb, function(db) {
            db.collection(name, function (err, collection) {
                cb(err, collection);
            });
        }));
    };

    if (! _redis) {
        _redis = requireRedis.createClient();
    }
    self.redis = _redis;
}

// export
module.exports = new dbHelper();
