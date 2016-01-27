"use strict";
var fs = require("fs");
var path = require('path');
var _ = require("lodash");
var safe = require("safe");
var mongo = require('mongodb');


var Core = function () {
    let self = this;
    let _db = null;

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
        redis: null,
    };

    // add and use functions for validation
    let Validate = function () {
        let fObj = {};
        // add new rule of validation
        this.add = function (_name, _func) {
            if (
                _name,
                _func,
                ! _.isString(_name),
                ! _.isFunction(_func)
            ) {
                return self.exit("Wrong data");
            }

            fObj[_name] = _func;
        };

        this.check = function () {
            let param = _.toArray(arguments);
            if (param.length < 2) {
                return self.exit("Wrong data");
            }
            let name = param[0];
            if (! fObj[name]) {
                return self.exit('Validation is not exists');
            }
            param = param.slice(1);
            fObj[name].apply(this, param);
        };
    };
    self.validate = new Validate();



    /*
    * async initialization api factories
    * api factory will have to include .init method
    * for initialization its requirements
    */
    let apiSingleInit = function (_path, cb) {
        let fileName = path.basename(_path);
        fileName = fileName.replace('.js', '');
        if (self.ctx.api[fileName]) {
            return cb();
        }
        let api = require(_path);
        api.init(safe.sure(cb, function (_api) {
            self.ctx.api[fileName] = _api;
            cb();
        }));
    };

    self.isMongoID = function (_id) {
        return _id instanceof mongo.ObjectID;
    };

    self.ObjectID = function () {
        let id = arguments.length ? arguments[0] : undefined;
        let strict = arguments.length > 1 ? Boolean(strict) : true;

        if (! id) {
            return undefined;
        }

        if (self.isMongoID(id)) {
            return id;
        }

        if (strict) {
            return new mongo.ObjectID(id);
        }

        let obj;
        _.attempt(function () {
            obj = new mongo.ObjectID(id);
        });

        return obj;
    }


    /*
    * my api contain factories, and init function for async initialization
    */
    self.apiLoad = function (_path, cb) {
        let filesArr = [];
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
        let dbc = new mongo.Db(
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
                return cb(null, _db);
            }
            _db.authenticate(
                self.ctx.cfg.mongo.user,
                self.ctx.cfg.mongo.password,
                safe.sure(cb, function () {
                    cb(null, _db);
                })
            );
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
        let confDef = new Promise (function (resolve, reject) {
            fs.exists(_path + "/config-default.js", function (exist) {
                if (! exist) {
                    return reject(new Error("config not found"));
                }
                let conf = require(_path + "/config-default.js");
                resolve(conf);
            });
        });
        let confLoc = new Promise (function (resolve, reject) {
            fs.exists(_path + "/config-local.js", function (exist) {
                if (! exist) {
                    return resolve(null);
                }
                let conf = require(_path + "/config-local.js");
                resolve(conf);
            });
        });
        Promise.all([confDef, confLoc]).then(function (val) {
            self.ctx.cfg = _.merge(val[0], val[1]);

            if (process.env.MONGOHOST) {
                self.ctx.cfg.mongo.auth = true;
                self.ctx.cfg.mongo.host = process.env.MONGOHOST.toString();
                self.ctx.cfg.mongo.port = parseInt(process.env.MONGOPORT);
                self.ctx.cfg.mongo.user = process.env.MONGOUSER.toString();
                self.ctx.cfg.mongo.password = process.env.MONGOPASSWORD.toString();
            }

            if (process.env.REDISHOST) {
                self.ctx.cfg.redis.auth = true;
                self.ctx.cfg.redis.host = process.env.REDISHOST.toString();
                self.ctx.cfg.redis.port = parseInt(process.env.REDISPORT);
                self.ctx.cfg.redis.password = process.env.REDISPASSWORD.toString();
            }

            cb() ;
        }).catch(self.exit);
    };
};

// export
module.exports = new Core();
