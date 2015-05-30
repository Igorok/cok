"use strict";
var crypto = require('crypto');
var safe = require('safe');
var _ = require("lodash");
var async = require('async');
var moment = require('moment');
var mongo = require('mongodb');
var cokcore = require('cokcore');
var dbHelper = cokcore.db;
var userApi = null;
var Api = function () {
    var self = this;
};
Api.prototype.init = function (cb) {
    var self = this;
    async.parallel([
        function (cb) {
            dbHelper.collection("chatgroups", safe.sure(cb, function (chatgroups) {
                self.colChatgroups = chatgroups;
                cb();
            }));
        },
        function (cb) {
            dbHelper.collection("users", safe.sure(cb, function (users) {
                self.colUsers = users;
                cb();
            }));
        },
        function (cb) {
            cokcore.mInit(__dirname + '/user.js', safe.sure(cb, function (_api) {
                userApi = _api['user'];
                cb();
            }));
        }
    ], cb);
};
/**
* all users
*/
Api.prototype.getUserList = function (_data, cb) {
    var self = this;
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        dbHelper.collection("users", safe.sure(cb, function (users) {
            users.find({}, {login: 1, email: 1, group: 1, status: 1}).toArray(cb);
        }));
    }));
};

/**
* detail user
*/
Api.prototype.deactivateUser = function (_data, cb) {
    var self = this;
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        dbHelper.collection("users", safe.sure(cb, function (users) {
            users.find({}, {login: 1, email: 1, status: 1}).toArray(cb);
        }));
    }));
};


/**
* all permissions
*/
Api.prototype.getPermissionList = function (_data, cb) {
    var self = this;
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        dbHelper.collection("permissions", safe.sure(cb, function (permissions) {
            permissions.find({}).toArray(cb);
        }));
    }));
};

/**
* edit permission
*/
Api.prototype.editPermission = function (_data, cb) {
    var self = this;
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
                        permissions.update({_id: mongo.ObjectID(id)}, {$set: {key: key, title: title}}, cb);
                    }
                }));
            }
        }));
    }));
};

/**
* remove permission
*/
Api.prototype.removePermission = function (_data, cb) {
    var self = this;
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (! _params._id) {
            return cb(new Error("Wrong data!"));
        }
        var id = _params._id.toString();

        dbHelper.collection("permissions", safe.sure(cb, function (permissions) {
            permissions.remove({_id: mongo.ObjectID(id)}, cb)
        }));
    }));
};

/**
* all groups
*/
Api.prototype.getGroupList = function (_data, cb) {
    var self = this;
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        dbHelper.collection("usergroups", safe.sure(cb, function (usergroups) {
            usergroups.find({}).toArray(cb);
        }));
    }));
};

/**
* edit group
*/
Api.prototype.editGroup = function (_data, cb) {
    var self = this;
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
                                usergroups.update({_id: mongo.ObjectID(id)}, {$set: {
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
Api.prototype.removeGroup = function (_data, cb) {
    var self = this;
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (! _params._id) {
            return cb(new Error("Wrong data!"));
        }
        var id = _params._id.toString();

        dbHelper.collection("usergroups", safe.sure(cb, function (usergroups) {
            usergroups.remove({_id: mongo.ObjectID(id)}, cb)
        }));
    }));
};


















/**
 * init function
 */
module.exports.init = function (cb) {
    var api = new Api();
    console.time('init admin api');
    api.init(safe.sure(cb, function () {
        console.timeEnd('init admin api');
        cb(null, api);
    }));
};
