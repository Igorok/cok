"use strict";
var crypto = require('crypto');
var safe = require('safe');
var _ = require("lodash");
var moment = require('moment');
var mongo = require('mongodb');
var cokcore = require('cokcore');
var Api = function () {
    var self = this;
};
Api.prototype.init = function (cb) {
    return cb();
    var self = this;
    safe.parallel([
        function (cb) {
            cokcore.collection("chatgroups", safe.sure(cb, function (chatgroups) {
                cb();
            }));
        },
        function (cb) {
            cokcore.collection("users", safe.sure(cb, function (users) {
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
    cokcore.ctx.api["user"].checkAuth (_data, safe.sure(cb, function (_user, _params) {
        cokcore.collection("users", safe.sure(cb, function (users) {
            users.find({}, {login: 1, email: 1, group: 1, status: 1}).toArray(cb);
        }));
    }));
};

/**
* detail user
*/
Api.prototype.deactivateUser = function (_data, cb) {
    var self = this;
    cokcore.ctx.api["user"].checkAuth (_data, safe.sure(cb, function (_user, _params) {
        cokcore.collection("users", safe.sure(cb, function (users) {
            users.find({}, {login: 1, email: 1, status: 1}).toArray(cb);
        }));
    }));
};


/**
* all permissions
*/
Api.prototype.getPermissionList = function (_data, cb) {
    var self = this;
    cokcore.ctx.api["user"].checkAuth (_data, safe.sure(cb, function (_user, _params) {
        cokcore.collection("permissions", safe.sure(cb, function (permissions) {
            permissions.find({}).toArray(cb);
        }));
    }));
};

/**
* edit permission
*/
Api.prototype.editPermission = function (_data, cb) {
    var self = this;
    cokcore.ctx.api["user"].checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (! _params._id || ! _params.key || ! _params.title) {
            return cb(new Error("Wrong data!"));
        }
        var id = _params._id.toString();
        var key = _params.key.toString();
        var title = _params.title.toString();

        cokcore.collection("permissions", safe.sure(cb, function (permissions) {
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
                        permissions.update({_id: cokcore.ObjectID(id)}, {$set: {key: key, title: title}}, cb);
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
    cokcore.ctx.api["user"].checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (! _params._id) {
            return cb(new Error("Wrong data!"));
        }
        var id = _params._id.toString();

        cokcore.collection("permissions", safe.sure(cb, function (permissions) {
            permissions.remove({_id: cokcore.ObjectID(id)}, cb)
        }));
    }));
};

/**
* all groups
*/
Api.prototype.getGroupList = function (_data, cb) {
    var self = this;
    cokcore.ctx.api["user"].checkAuth (_data, safe.sure(cb, function (_user, _params) {
        cokcore.collection("usergroups", safe.sure(cb, function (usergroups) {
            usergroups.find({}).toArray(cb);
        }));
    }));
};

/**
* edit group
*/
Api.prototype.editGroup = function (_data, cb) {
    var self = this;
    cokcore.ctx.api["user"].checkAuth (_data, safe.sure(cb, function (_user, _params) {
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

        cokcore.collection("permissions", safe.sure(cb, function (permissions) {
        cokcore.collection("usergroups", safe.sure(cb, function (usergroups) {
            safe.series([
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
                                usergroups.update({_id: cokcore.ObjectID(id)}, {$set: {
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
    cokcore.ctx.api["user"].checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (! _params._id) {
            return cb(new Error("Wrong data!"));
        }
        var id = _params._id.toString();

        cokcore.collection("usergroups", safe.sure(cb, function (usergroups) {
            usergroups.remove({_id: cokcore.ObjectID(id)}, cb)
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
