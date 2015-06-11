"use strict";
var fs = require("fs");
var _ = require("lodash");
var mongo = require('mongodb');
var safe = require('safe');
var path = require('path');






var Core = function () {
    var self = this;
    var _db = null;

    // for fatal error
    var exit = function (e) {
        console.trace(e);
        process.exit();
    };

    /**
    * these is a testing function to learning a native promises
    */
    var loop = function () {
        var _arr = arguments[0];
        var _limit = arguments[1];
        var _func = arguments[2];
        var _cb = arguments[3];

        if (! _arr.length) {
            return _cb();
        }

        if (_limit === 1) {
            Promise.resolve(0).then(function next (i) {
                if (i < _arr.length) {
                    return new Promise(function (resolve, reject) {
                        _func(_arr[i], function () {
                            if (arguments[0]) {
                                return reject(arguments[0]);
                            }
                            resolve();
                        });
                    }).then(function () {
                        return next(++i);
                    }).catch(function (e) {
                        console.trace(e)
                    });
                }
            }).then(function() {
                _cb();
            }).catch(function(e) {
                console.trace(e);
                _cb(e);
            });;
        } else {
            _arr = _.chunk(_arr, _limit);
            Promise.resolve(0).then(function next (i) {
                if (i < _arr.length) {
                    var pArr = _arr[i].map(function (val) {
                        return new Promise(function (resolve, reject) {
                            _func(val, function () {
                                if (arguments[0]) {
                                    return reject(arguments[0]);
                                }
                                resolve();
                            });
                        }).catch(function (e) {
                            console.trace(e)
                        });
                    });

                    return Promise.all(pArr).then(function () {
                        return next(++i);
                    });
                }
            }).then(function() {
                _cb();
            }).catch(function(e) {
                console.trace(e);
                _cb(e);
            });;
        }
    };

    self.loop = {
        each: function () {
            var _arr = arguments[0];
            var _func = arguments[1];
            var _cb = arguments[2];
            return loop(_arr, 1, _func, _cb);
        },
        all: function () {
            var _arr = arguments[0];
            var _limit = _arr.length;
            var _func = arguments[1];
            var _cb = arguments[2];
            return loop(_arr, _limit, _func, _cb);
        },
        limit: loop,
    };

    // this object contains initialized api and mongodb collections
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
        } else {
            var api = require(_path);
            api.init(function (err, _api) {
                self.ctx.api[fileName] = _api;
                cb(err);
            });
        }
    };





    self.apiLoad = function (_path, cb) {
        var checkExist = new Promise(function (_res, _rej) {
            fs.exists(_path, function (exists) {
                if (! exists) {
                    return _rej(new Error ('Module not found'));
                }
                _res();
            });
        });
        var readStat = new Promise(function (_res, _rej) {
            fs.lstat(_path, function (err, stat) {
                if (err) {
                    return _rej(err);
                }
                _res(stat);
            });
        });

        var readDir = new Promise(function (_res, _rej) {
            fs.readdir(_path, function (err, stat) {
                if (err) {
                    return _rej(err);
                }
                var statArr = _.map(stat, function (val) {
                    return _path + '/' + val;
                });
                _res(statArr);
            });
        });


        checkExist.then(function () {
            return readStat;
        }).then(function (_stat) {
            if (_stat.isFile()) {
                return [_path];
            } else {
                return readDir;
            }
        }).then(function (_arr) {
            self.loop.each(_arr, apiSingleInit, cb);
        }).catch(function(e) {
            console.trace(e);
            cb(e);
        });
    };



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
        dbc.open(function(e, db) {
            if (e) {
                return cb(e);
            }
            _db = db;
            if (! self.ctx.cfg.mongo.auth) {
                cb(null, _db);
            } else {
                _db.authenticate(
                    self.ctx.cfg.mongo.user,
                    self.ctx.cfg.mongo.password,
                    cb
                );
            }
        });
    };

    self.collection = function (name, cb) {
        if (self.ctx.col[name]) {
            cb(null, self.ctx.col[name]);
        } else {
            new Promise(function (resolve, reject) {
                self.db(function(err, db) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(db);
                });
            }).then(function (db) {
                return new Promise(function (resolve, reject) {
                    db.collection(name, function (err, collection) {
                        if (err) {
                            return reject(err);
                        }
                        console.log('Get collection ' + name);
                        self.ctx.col[name] = collection;
                        resolve();
                    });
                });
            }).then(function () {
                cb(null, self.ctx.col[name]);
            }).catch(function (e) {
                console.trace(e);
                cb(e);
            });
        }
    };
    // find config for project, merge local and default
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
                var conf = require(_path + "/config-default.js");
                resolve(conf);
            });
        });
        Promise.all([confDef, confLoc]).then(function (val) {
            self.ctx.cfg = _.merge(val[0], val[1]);
            cb() ;
        }).catch(exit);
    };


};

// export
module.exports = new Core();
