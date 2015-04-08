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
                permissions.find({key: key}, {key: 1}).toArray(safe.sure(cb, function (_result) {
                    if (!! _result && _result.length > 0) {
                        return cb(new Error("Permission already exist!"));
                    } else {
                        permissions.insert({key: key, title: title}, cb);
                    }
                }));
            } else {
                permissions.find({key: key}, {key: 1}).toArray(safe.sure(cb, function (_result) {
                    if (!! _result.length && (_result[0]._id.toString() != id)) {
                        return cb(new Error("Permission already exist!"));
                    } else {
                        permissions.update({_id: BSON.ObjectID(id)}, {$set: {key: key, title: title}}, cb);
                    }
                }));
            }
        }));
    }));
};

/**
* remove permission
*/
exports.removePermission = function (_data, cb) {
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (! _params._id) {
            return cb(new Error("Wrong data!"));
        }
        var id = _params._id.toString();

        dbHelper.collection("permissions", safe.sure(cb, function (permissions) {
            permissions.remove({_id: BSON.ObjectID(id)}, cb)
        }));
    }));
};

/**
* all groups
*/
exports.getGroupList = function (_data, cb) {
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        dbHelper.collection("usergroups", safe.sure(cb, function (usergroups) {
            usergroups.find({}).toArray(cb);
        }));
    }));
};

/**
* edit group
*/
exports.editGroup = function (_data, cb) {
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (! _params._id || ! _params.title || ! _params.description || ! _params.permission || ! _.isArray(_params.permission)) {
            return cb(new Error("Wrong data!"));
        }
        var id = _params._id.toString();
        var title = _params.title.toString();
        var description = _params.description.toString();
        var permission = [];
        _.each(_params.permission, function (val) {
            permission.push(val.toString());
        });

        dbHelper.collection("permissions", safe.sure(cb, function (permissions) {
        dbHelper.collection("usergroups", safe.sure(cb, function (usergroups) {
            async.series([
                function (cb) {
                    permissions.find({}, {key: 1}).toArray(safe.sure(cb, function (_permArr) {
                        permission = _.intersection(_.pluck(_permArr, "key"), permission);
                        cb();
                    }));
                },
                function (cb) {
                    if (id == '-1') {
                        usergroups.find({title: title}).toArray(safe.sure(cb, function (_result) {
                            if (!! _result && !! _result.length) {
                                return cb(new Error("Permission already exist!"));
                            } else {
                                usergroups.insert({
                                    title: title,
                                    description: description,
                                    permission: permission,
                                }, cb);
                            }
                        }));
                    } else {
                        usergroups.find({title: title}, {title: 1}).toArray(safe.sure(cb, function (_result) {
                            if (!! _result.length && (_result[0]._id.toString() != id)) {
                                return cb(new Error("Permission already exist!"));
                            } else {
                                usergroups.update({_id: BSON.ObjectID(id)}, {$set: {
                                    title: title,
                                    description: description,
                                    permission: permission,
                                }}, cb);
                            }
                        }));
                    }
                },
            ], cb);
        }));
        }));
    }));
};

/**
* remove group
*/
exports.removeGroup = function (_data, cb) {
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (! _params._id) {
            return cb(new Error("Wrong data!"));
        }
        var id = _params._id.toString();

        dbHelper.collection("usergroups", safe.sure(cb, function (usergroups) {
            usergroups.remove({_id: BSON.ObjectID(id)}, cb)
        }));
    }));
};