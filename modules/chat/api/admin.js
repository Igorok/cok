"use strict";
var crypto = require('crypto');
var safe = require('safe');
var _ = require("lodash");
var async = require('async');
var moment = require('moment');
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var dbHelper = require('cok_db');
var self = this;

/**
* check authenticate
*/
exports.checkAuth = function (_data, cb) {
    var self = this;
    if (! _data || ! _data.params || ! cb || (typeof(cb) != 'function')) {
        return cb (403);
    }
    var token;
    if (! _data.params[0] || ! _data.params[0].token) {
        return cb (403);
    }
    token = _data.params[0].token.toString();
    dbHelper.redis(safe.sure(cb, function (_redis) {
        _redis.get(token, safe.sure(cb, function (_user) {
            if (! _user) {
                return cb (403);
            } else {
                _user = JSON.parse(_user);
                var startArr = [null, _user];
                var params = startArr.concat(_data.params);
                cb.apply(self, params);
            }
        }));
    }));
};


/**
* all users
*/
exports.getUserList = function (_data, cb) {
    dbHelper.collection("users", safe.sure(cb, function (users) {
        users.find({}, {login: 1, email: 1}).toArray(cb);
    }));
};


/**
* all permissions
*/
exports.getPermissionList = function (_data, cb) {
    dbHelper.collection("permissions", safe.sure(cb, function (permissions) {
        permissions.find({}).toArray(cb);
    }));
};

