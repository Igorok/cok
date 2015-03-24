"use strict";
var crypto = require('crypto');
var safe = require('safe');
var _ = require("lodash");
var async = require('async');
var moment = require('moment');
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var dbHelper = require('cok_db');
var userApi = require(__dirname + '/user.js');
var self = this;


/**
* all users
*/
exports.getUserList = function (_data, cb) {
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        dbHelper.collection("users", safe.sure(cb, function (users) {
            users.find({}, {login: 1, email: 1}).toArray(cb);
        }));
    }));
};


/**
* all permissions
*/
exports.getPermissionList = function (_data, cb) {
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        dbHelper.collection("permissions", safe.sure(cb, function (permissions) {
            permissions.find({}).toArray(cb);
        }));
    }));
};

/**
* edit permission
*/
exports.editPermission = function (_data, cb) {
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (! _params._id || ! _params.key || ! _params.title) {
            return cb(new Error("Wrong data!"));
        }
        var id = _params._id.toString();
        var key = _params.key.toString();
        var title = _params.title.toString();

        dbHelper.collection("permissions", safe.sure(cb, function (permissions) {
            if (id == '-1') {
                permissions.find({key: key}).toArray(safe.sure(cb, function (_result) {
                    if (!! _result && _result.length > 0) {
                        return cb(new Error("Permission already exist!"));
                    } else {
                        permissions.insert({key: key, title: title}, cb);
                    }
                }));
            } else {
                permissions.update({_id: BSON.ObjectID(id)}, {$set: {key: key, title: title}}, cb);
            }
        }));
    }));
};
