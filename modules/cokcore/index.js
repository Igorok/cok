"use strict";
var fs = require("fs");
var _ = require("lodash");
var mongo = require('mongodb');
var safe = require('safe');
var async = require('async');
var path = require('path');
var _db = null;
var collections = [];
var cfg = null;
var apiArr = [];

// find config for project, merge local and default
var config = function (_path) {
    var confDef = {};
    var confLoc = {};

    if (fs.existsSync(_path + "/config-default.js")) {
        confDef = require(_path + "/config-default.js");
    } else {
        console.log("config not found");
        return null;
    }
    if (fs.existsSync(_path + "/config-local.js")) {
        confLoc = require(_path + "/config-local.js");
    }

    return _.merge(confDef, confLoc);
};


/**
* connect to mongo db, and collections
*/
var DataBase = function () {
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
        if (collections[name]) {
            cb(null, collections[name]);
        } else {
            self.db(safe.sure(cb, function(db) {
                db.collection(name, function (err, collection) {
                    console.log('Get collection ' + name);
                    collections[name] = collection;
                    cb(err, collection);
                });
            }));
        }

    };
}

var moduleSingleInit = function (_path, cb) {
    var fileName = path.basename(_path);
    fileName = fileName.replace('.js', '');
    if (apiArr[fileName]) {
        cb(null, apiArr);
    } else {
        var api = require(_path);
        api.init(safe.sure(cb, function (_api) {
            apiArr[fileName] = _api;
            cb(null, apiArr);
        }));
    }
};
var moduleInit = function (_path, cb) {
    fs.exists(_path, function (exists) {
        if (! exists) {
            return cb(new Error ('Module not found'));
        }
        fs.lstat(_path, safe.sure(cb, function (stat) {
            if (stat.isFile()) {
                moduleSingleInit(_path, cb);
            } else {
                fs.readdir(_path, safe.sure(cb, function (arr) {
                    async.forEachSeries(arr, function (_file, cb) {
                        moduleSingleInit(_path + '/' + _file, cb);
                    }, safe.sure(cb, function () {
                        cb(null, apiArr);
                    }));
                }));
            }
        }));
    });
};

var init = function (_confPath) {
    cfg = config(_confPath);
    return cfg;
};



// export
module.exports.init = init;
module.exports.db = new DataBase();
module.exports.collections = collections;
module.exports.mInit = moduleInit;
