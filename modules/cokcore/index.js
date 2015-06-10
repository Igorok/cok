"use strict";
var fs = require("fs");
var _ = require("lodash");
var mongo = require('mongodb');
var safe = require('safe');
var path = require('path');
var _db = null;
var collections = [];
var cfg = null;
var apiArr = [];
























var Core = function () {
    var self = this;


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
        var _promise = null;

        if (_limit === 1) {
            _promise = Promise.resolve(0).then(function next (i) {
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
            });
        } else {
            _arr = _.chunk(_arr, _limit);
            _promise = Promise.resolve(0).then(function next (i) {
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
            });
        }
        _promise.then(function() {
            _cb();
        }).catch(function(e) {
            console.trace(e);
            _cb(e);
        });
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
    /*
    * async initialization api factories
    * api factory will have to include .init method
    * for initialization its requirements
    */
    var apiSingleInit = function (_path, cb) {



        var fileName = path.basename(_path);
        fileName = fileName.replace('.js', '');



        if (apiArr[fileName]) {
            return cb();
        } else {

            var api = require(_path);
            api.init(function (err, _api) {
                apiArr[fileName] = _api;
                cb(err);
            });
        }
    };





    var apiLoad = function (_path, cb) {
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
            console.log('_stat ', _stat.isFile());
            if (_stat.isFile()) {
                return [_path];
            } else {
                return readDir;
            }
        }).then(function (_arr) {
            console.log('_arr ', _arr);
            self.loop.each(_arr, apiSingleInit, function () {
                console.log('finish');
            });
        }).catch(function(e) {
            console.trace(e);
        });


        // fs.exists(_path, function (exists) {
        //     if (! exists) {
        //         return cb(new Error ('Module not found'));
        //     }
        //     fs.lstat(_path, safe.sure(cb, function (stat) {
        //         if (stat.isFile()) {
        //             moduleSingleInit(_path, cb);
        //         } else {
        //             fs.readdir(_path, safe.sure(cb, function (arr) {
        //                 safe.forEachSeries(arr, function (_file, cb) {
        //                     moduleSingleInit(_path + '/' + _file, cb);
        //                 }, safe.sure(cb, function () {
        //                     cb(null, apiArr);
        //                 }));
        //             }));
        //         }
        //     }));
        // });
    };


    self.ctx = {
        config: null,
        api: {},
        collections: {},
    };
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
            self.ctx.config = _.merge(val[0], val[1]);
            cb(null, self.ctx.config) ;
        }).catch(exit);
    };

    self.apiLoad = apiLoad;
};

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
                    safe.forEachSeries(arr, function (_file, cb) {
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
module.exports = new Core();
