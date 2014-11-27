var crypto = require('crypto');
var safe = require('safe');
var _ = require("lodash");
var async = require('async');
var moment = require('moment');
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var dbHelper = require(__dirname + '/../helpers/db_helper.js');

exports.Authorise = function (_data, cb) {
    var params = _data.params[0];
    if (_.isUndefined(params.login) || _.isUndefined(params.password)) {
        return cb ("Wrong data");
    }
    var login = params.login.toString().trim();
    var password = params.password.toString().trim();
    dbHelper.collection("users", safe.sure(cb, function (users) {
        users.findOne({login: login}, safe.sure(cb, function (user) {
            if (! user || (password != user.password)) {
                return cb ("Wrong data");
            }
            delete user.password;
            var userToken = crypto.createHash('sha1').digest('hex');
            dbHelper.redis.hmset(userToken, user, safe.sure(cb, function () {
                dbHelper.redis.expire(userToken, 24*60*60, safe.sure(cb, function () {
                    user.token = userToken;
                    cb (null, user);
                }));
            }));
        }));
    }));
};

// user list
exports.getUserList = function (_data, cb) {
    var params = _data.params[0];
    var token = params ? params.token.toString() : null;
    if (! token) {
        return cb (403);
    }
    dbHelper.redis.hgetall(token, safe.sure(cb, function (_user) {
        if (! _user) {
            return cb (403);
        } else {
            dbHelper.collection("users", safe.sure(cb, function (users) {
                users.find().toArray(cb);
            }));
        }
    }));
};