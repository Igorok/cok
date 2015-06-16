"use strict";
var fs = require("fs");
var path = require('path');
var _ = require("lodash");
var safe = require("safe");
var mongo = require('mongodb');


var Core = function () {
    var self = this;
    var _db = null;

    /**
     * function for fatal erros
     * @param e - that is a error
     */
    self.exit = function (e) {
        if (e) {
            console.trace(e);
        }
        process.exit();
    };


    /**
    * object contain config of application,
    * an api that was already initialized and
    * collections of mongodb
    */
    self.ctx = {
        cfg: null,
        api: {},
        col: {},
    };

    /*
    * async initialization api factories
    * api factory will have to include .init method
    * for initialization its requirements
    */
    var apiSingleInit = function (_path, cb) {
        var fileName = path.basename(_path);
        fileName = fileName.replace('.js', '');
        if (self.ctx.api[fileName]) {
            return cb();
        }
        var api = require(_path);
        api.init(safe.sure(cb, function (_api) {
            self.ctx.api[fileName] = _api;
            cb();
        }));
    };
    /*
    * my api contain factories, and init function for async initialization
    */
    self.apiLoad = function (_path, cb) {
        var filesArr = [];
        safe.series([
            function (cb) {
                fs.exists(_path, function (exists) {
                    if (! exists) {
                        return cb(new Error ('Module not found'));
                    }
                    cb();
                });
            },
            function (cb) {
                fs.lstat(_path, safe.sure(cb, function (_stat) {
                    if (_stat.isFile()) {
                        filesArr.push(_path);
                        return cb();
                    }
                    fs.readdir(_path, safe.sure(cb, function (_files) {
                        filesArr = _.map(_files, function (val) {
                            return _path + '/' + val;
                        });
                        cb();
                    }));
                }));
            },
        ], safe.sure(cb, function () {
            safe.eachSeries(filesArr, apiSingleInit, cb);
        }));
    };


    /*
    * function for singleton save mongodb connection
    */
    self.db = function (cb) {
        if (_db) {
            return cb(null, _db);
        }
        console.log("Connecting to: " , self.ctx.cfg.mongo);
        var dbc = new mongo.Db(
            self.ctx.cfg.mongo.db,
            new mongo.Server(
                self.ctx.cfg.mongo.host,
                self.ctx.cfg.mongo.port,
                self.ctx.cfg.mongo.opts
            ),
            {
                native_parser: false,
                safe:true,
                w: 1
            }
        );
        dbc.open(safe.sure(cb, function (db) {
            _db = db;
            if (! self.ctx.cfg.mongo.auth) {
                cb(null, _db);
            } else {
                _db.authenticate(
                    self.ctx.cfg.mongo.user,
                    self.ctx.cfg.mongo.password,
                    safe.sure(cd, function () {
                        cb(null, _db);
                    })
                );
            }
        }));
    };


    /**
     * singleton for saving mongodb collection in memory
     * @param name of collection
     */
    self.collection = function (name, cb) {
        if (self.ctx.col[name]) {
            return cb(null, self.ctx.col[name]);
        }
        self.db(safe.sure(cb, function(db) {
            db.collection(name, safe.sure(cb, function (collection) {
                console.log('Get collection ' + name);
                self.ctx.col[name] = collection;
                cb(null, self.ctx.col[name]);
            }));
        }));
    };


    /**
     * my function for initialization of core.
     * It take parameters, find configuration,
     * and later use for the application as db connections
     * @param _path - that is a folder of .js configs
     * required file the config-default.js,
     * config-local.js is not included in the git control
     * @param cb - that is a callback after a reading of directory
     */
    self.init = function (_path, cb) {
        var confDef = new Promise (function (resolve, reject) {
            fs.exists(_path + "/config-default.js", function (exist) {
                if (! exist) {
                    return reject(new Error("config not found"));
                }
                var conf = require(_path + "/config-default.js");
                resolve(conf);
            });
        });
        var confLoc = new Promise (function (resolve, reject) {
            fs.exists(_path + "/config-local.js", function (exist) {
                if (! exist) {
                    return resolve(null);
                }
                var conf = require(_path + "/config-local.js");
                resolve(conf);
            });
        });
        Promise.all([confDef, confLoc]).then(function (val) {
            self.ctx.cfg = _.merge(val[0], val[1]);
            cb() ;
        }).catch(self.exit);
    };
};

// export
module.exports = new Core();
