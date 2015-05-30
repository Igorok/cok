"use strict";
var crypto = require('crypto');
var safe = require('safe');
var _ = require("lodash");
var async = require('async');
var moment = require('moment');
var mongo = require('mongodb');
var cokcore = require('cokcore');
var dbHelper = cokcore.db;
var collections = cokcore.collections;


var Api = function () {
    this.init = function (cb) {
        async.parallel([
            function (cb) {
                dbHelper.collection("chatgroups", safe.sure(cb, function (chatgroups) {
                    cb();
                }));
            },
            function (cb) {
                dbHelper.collection("users", safe.sure(cb, function (users) {
                    cb();
                }));
            }
        ], cb);
    }
};


/**
* login to system
*/
Api.prototype.Registration = function (_data, cb) {
    var params = _data.params[0];
    if (_.isUndefined(params.login) || _.isUndefined(params.email) || _.isUndefined(params.password)) {
        return cb ("Wrong data");
    }
    var login = params.login.toString().trim();
    var email = params.email.toString().trim();
    var password = params.password.toString().trim();
    collections["users"].find({$or : [{login: login}, {email: email}]}).toArray(safe.sure(cb, function (_result) {
        if (! _.isEmpty(_result)) {
            return cb (" Username or email already registered");
        }
        var hash = crypto.createHash('sha1');
        hash = hash.update(password).digest('hex');

        var newUser = {
            login: login,
            email: email,
            password: hash,
            group: "SimpleUser",
            created: new Date(),
            status: 1
        };
        collections["users"].insert(newUser, safe.sure(cb, function (_result) {
            cb(null, true);
        }));
    }));
};

/**
* login to system
*/
Api.prototype.Authorise = function (_data, cb) {
    var params = _data.params[0];
    if (_.isUndefined(params.login) || _.isUndefined(params.password)) {
        return cb ("Wrong data");
    }
    var login = params.login.toString().trim();
    var password = params.password.toString().trim();
    var user = null;
    async.series([
        function (cb) {
            collections["users"].findOne({login: login, status: 1}, safe.sure(cb, function (_obj) {
                var hash = crypto.createHash('sha1');
                hash = hash.update(password).digest('hex');
                if (! _obj || (hash != _obj.password)) {
                    return cb ("Wrong data");
                }
                delete _obj.password;
                user = _obj;
                cb();
            }));
        },
        function (cb) {
            crypto.randomBytes(48, safe.sure(cb, function (buf) {
                user.token = buf.toString('hex');
                cb();
            }));
        },
        function (cb) {
            collections["users"].update({_id: user._id}, {$set: {token: user.token}}, safe.sure(cb, function () {
                cb();
            }));
        }
    ], safe.sure(cb, function () {
        cb (null, user);
    }));
};


/**
* check authenticate
*/
Api.prototype.checkAuth = function (_data, cb) {
    var self = this;
    if (! _data || ! _data.params || ! cb || (typeof(cb) != 'function')) {
        return cb (403);
    }
    if (! _data.params[0] || ! _data.params[0].token) {
        return cb (403);
    }
    var token = _data.params[0].token.toString();
    var rows = {
        _id: 1,
        login: 1,
        email: 1,
        group: 1,
        created: 1,
    };
    collections["users"].findOne({token: token, status: 1}, rows, safe.sure(cb, function (_user) {
        if (! _user) {
            return cb (403);
        } else {
            var startArr = [null, _user];
            var params = startArr.concat(_data.params);
            cb.apply(self, params);
        }
    }));
};

/**
* logout to system
*/
Api.prototype.logout = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        collections["users"].update({token: token}, {$unset: {token: ""}}, safe.sure(cb, function (_result) {
            cb (null, _result);
        }));
    }));
};
/**
* all users
*/
Api.prototype.getUserList = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        var uArr = null;
        var cUser = null;
        var friendIds = [];
        async.series([
            function (cb) {
                collections["users"].findOne({_id: mongo.ObjectID(_user._id)}, safe.sure(cb, function (_cUser) {
                    cUser = _cUser;
                    friendIds = _.pluck(cUser.friends, "_id");
                    var selfFriendReqIds = _.pluck(cUser.selfFriendRequests, "_id");
                    var friendReqIds = _.pluck(cUser.friendRequests, "_id");
                    friendIds = friendIds.concat(selfFriendReqIds);
                    friendIds = friendIds.concat(friendReqIds);
                    cb();
                }));
            },
            function (cb) {
                collections["users"].find({_id: {$ne: mongo.ObjectID(_user._id)}, status: 1}, {login: 1, email: 1}, {limit: 100}).toArray(safe.sure(cb, function (_uArr) {
                    uArr = _uArr;
                    _.each(uArr, function (val) {
                        if (_.contains(friendIds, val._id.toHexString())) {
                            val.friend = true;
                        }
                    });
                    cb();
                }));
            },
        ], safe.sure(cb, function () {
            cb(null, uArr);
        }));
    }));
};

/**
* detail user
*/
Api.prototype.getUserDetail = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        var _id;
        if (_.isEmpty(_params._id)) {
            _id = _user._id;
        } else {
            _id = mongo.ObjectID(_params._id.toString());
        }
        collections["users"].findOne({_id: _id, status: 1}, {login:1, email: 1, picture: 1, friends: 1}, safe.sure(cb, function (_result) {
            cb (null, _result);
        }));
    }));
};



/**
* add friends for user
*/
Api.prototype.addFriendRequest = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        var cUser = _user;
        if (_.isEmpty(_params._id)) {
            return cb ("Wrong form data");
        }
        var fid = _params._id.toString();
        dbHelper.collection("users", safe.sure(cb, function (users) {
            async.parallel([
                function (cb) {
                    users.findOne({_id: mongo.ObjectID(cUser._id)}, safe.sure(cb, function (_cUser) {
                        if (_.isEmpty(_cUser)) {
                            return cb(404);
                        } else {
                            var userObj = _cUser;
                            var fIds = _.pluck(userObj.friends, "_id");
                            var frIds = _.pluck(userObj.selfFriendRequests, "_id");

                            if (_.contains(fIds, fid) || _.contains(frIds, fid)) {
                                cb();
                            } else {
                                users.update({_id: userObj._id}, {$push: {selfFriendRequests: {_id: fid}}}, safe.sure(cb, function () {
                                    cb();
                                }));
                            }
                        }
                    }));
                },
                function (cb) {
                    users.findOne({_id: mongo.ObjectID(fid)}, safe.sure(cb, function (_fUser) {
                        if (_.isEmpty(_fUser)) {
                            return cb(404);
                        } else {
                            var fUser = _fUser;
                            var fIds = _.pluck(fUser.friends, "_id");
                            var frIds = _.pluck(fUser.friendRequests, "_id");

                            if (_.contains(fIds, cUser._id) || _.contains(frIds, cUser._id)) {
                                cb();
                            } else {
                                users.update({_id: fUser._id}, {$push: {friendRequests: {_id: cUser._id}}}, safe.sure(cb, function () {
                                    cb();
                                }));
                            }
                        }
                    }));
                },

            ], safe.sure(cb, function () {
                cb(null, true);
            }));
        }));
    }));
};

/**
* add friends for user
*/
Api.prototype.addFriend = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        var cUser = _user;
        if (_.isEmpty(_params._id)) {
            return cb ("Wrong data");
        }
        var fid = _params._id.toString();
        dbHelper.collection("users", safe.sure(cb, function (users) {
            async.waterfall([
                function (cb) {
                    users.findOne({_id: mongo.ObjectID(cUser._id)}, safe.sure(cb, function (_cUser) {
                        if (_.isEmpty(_cUser)) {
                            return cb("Wrong data");
                        } else {
                            var userObj = _cUser;
                            var fIds = _.pluck(userObj.friends, "_id");
                            var frIds = _.pluck(userObj.friendRequests, "_id");

                            if (_.contains(fIds, fid)) {
                                cb();
                            } else if (! _.contains(frIds, fid)) {
                                cb("Wrong data");
                            } else {
                                users.update({_id: userObj._id}, {$push: {friends: {_id: fid}}, $pull: {friendRequests: {_id: fid}}}, safe.sure(cb, function () {
                                    cb();
                                }));
                            }
                        }
                    }));
                },
                function (cb) {
                    users.findOne({_id: mongo.ObjectID(fid)}, safe.sure(cb, function (_fUser) {
                        if (_.isEmpty(_fUser)) {
                            return cb("Wrong data");
                        } else {
                            var fUser = _fUser;
                            var fIds = _.pluck(fUser.friends, "_id");

                            if (_.contains(fIds, cUser._id)) {
                                cb();
                            } else {
                                users.update({_id: fUser._id}, {$pull: {selfFriendRequests: {_id: cUser._id}}, $push: {friends: {_id: cUser._id}}}, safe.sure(cb, function () {
                                    cb();
                                }));
                            }
                        }
                    }));
                },

            ], safe.sure(cb, function () {
                cb(null, true);
            }));
        }));
    }));
};


/**
 * delete friends for user
 */
Api.prototype.deleteFriend = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params._id)) {
            return cb ("Wrong form data");
        }
        var _id = _params._id.toString();
        var usersIds = [_id, _user._id];
        dbHelper.collection("users", safe.sure(cb, function (users) {
            async.each(usersIds, function (uId, cb) {
                users.findOne({_id: mongo.ObjectID(uId)}, safe.sure(cb, function (_cUser) {
                    if (_.isEmpty(_cUser)) {
                        return cb(404);
                    } else {
                        var cUser = _cUser;
                        var removedId = _.difference(usersIds, [uId]);
                        removedId = removedId[0];
                        users.update({_id: cUser._id}, { $pull: {
                            friends: {_id: removedId},
                            selfFriendRequests: {_id: removedId},
                            friendRequests: {_id: removedId}
                        }}, safe.sure(cb, function (_delRes, info) {
                            cb();
                        }));
                    }
                }));
            }, safe.sure(cb, function () {
                cb(null, true);
            }));
        }));
    }));
};

/**
* friends list
*/
Api.prototype.getFriendList = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        dbHelper.collection("users", safe.sure(cb, function (users) {
            users.findOne({_id: mongo.ObjectID(_user._id)}, safe.sure(cb, function (cUser) {
                if (_.isEmpty(cUser.friendRequests) && _.isEmpty(cUser.friends)) {
                    return cb();
                }
                var friendIds = [];
                var friendReqIds = [];
                _.each(cUser.friends, function (val) {
                    friendIds.push(mongo.ObjectID(val._id));
                });
                _.each(cUser.friendRequests, function (val) {
                    friendReqIds.push(mongo.ObjectID(val._id));
                });

                var friendList = [];
                var friendReq = [];
                async.parallel([
                    function (cb) {
                        users.find({_id: {$in: friendIds}}, {login: 1, email: 1}).toArray(safe.sure(cb, function (fArr) {
                            _.each(fArr, function (val) {
                                val.friend = true;
                                friendList.push(val);
                            });
                            cb();
                        }));
                    },
                    function (cb) {
                        users.find({_id: {$in: friendReqIds}}, {login: 1, email: 1}).toArray(safe.sure(cb, function (frArr) {
                            _.each(frArr, function (val) {
                                val.friend = false;
                                friendReq.push(val);
                            });
                            cb();
                        }));
                    },
                ], safe.sure(cb, function () {
                    cb(null, friendList, friendReq);
                }));
            }));
        }));
    }));
};

/**
* detail user
*/
Api.prototype.deleteUser = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params._id)) {
            return cb ("Wrong form data");
        }
        var _id = _params._id.toString();
        dbHelper.collection("users", safe.sure(cb, function (users) {
            users.remove({_id: mongo.ObjectID(_id)}, safe.sure(cb, function (_result) {
                cb (null, _result);
            }));
        }));
    }));
};




/**
 * init function
 */
module.exports.init = function (cb) {
    var api = new Api();
    console.time('init user api');
    api.init(safe.sure(cb, function () {
        console.timeEnd('init user api');
        cb(null, api);
    }));
};
