var crypto = require('crypto');
var safe = require('safe');
var _ = require("lodash");
var async = require('async');
var moment = require('moment');
var mongo = require('mongodb');
var dbHelper = require('cok_db');
var self = this;



/**
* login to system
*/
exports.Registration = function (_data, cb) {
    var params = _data.params[0];
    if (_.isUndefined(params.login) || _.isUndefined(params.email) || _.isUndefined(params.password)) {
        return cb ("Wrong data");
    }
    var login = params.login.toString().trim();
    var email = params.email.toString().trim();
    var password = params.password.toString().trim();
    dbHelper.collection("users", safe.sure(cb, function (users) {
        users.find({$or : [{login: login}, {email: email}]}).toArray(safe.sure(cb, function (_result) {
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
            users.insert(newUser, safe.sure(cb, function (_result) {
                cb(null, true);
            }));
        }));
    }));
};

/**
* login to system
*/
exports.Authorise = function (_data, cb) {
    var params = _data.params[0];
    if (_.isUndefined(params.login) || _.isUndefined(params.password)) {
        return cb ("Wrong data");
    }
    var login = params.login.toString().trim();
    var password = params.password.toString().trim();
    var redis = null;
    dbHelper.collection("users", safe.sure(cb, function (users) {
        users.findOne({login: login, status: 1}, safe.sure(cb, function (user) {
            var hash = crypto.createHash('sha1');
            hash = hash.update(password).digest('hex');
            if (! user || (hash != user.password)) {
                return cb ("Wrong data");
            }
            delete user.password;
            var userToken = null;
            async.series([
                function (cb) {
                    crypto.randomBytes(48, safe.sure(cb, function(buf) {
                        userToken = buf.toString('hex');
                        cb();
                    }));
                },
                function (cb) {
                    var ruser = JSON.stringify(user);
                    dbHelper.redis(safe.sure(cb, function (_redis) {
                        redis = _redis;
                        redis.set(userToken, ruser, safe.sure(cb, function () {
                            cb();
                        }));
                    }));

                },
                function (cb) {
                    redis.expire(userToken, 24*60*60, safe.sure(cb, function () {
                        cb();
                    }));
                }
            ], safe.sure(cb, function () {
                user.token = userToken;
                cb (null, user);
            }));
        }));
    }));
};


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
* logout to system
*/
exports.logout = function (_data, cb) {
    self.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        dbHelper.redis(safe.sure(cb, function (_redis) {
            _redis.del(_params.token, {}, cb);
        }));
    }));
};
/**
* all users
*/
exports.getUserList = function (_data, cb) {
    self.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        var uArr = null;
        var cUser = null;
        var friendIds = [];
        dbHelper.collection("users", safe.sure(cb, function (users) {
            async.waterfall([
                function (cb) {
                    users.findOne({_id: mongo.ObjectID(_user._id)}, safe.sure(cb, function (_cUser) {
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
                    users.find({_id: {$ne: mongo.ObjectID(_user._id)}, {status: 1}}, {login: 1, email: 1}, {limit: 100}).toArray(safe.sure(cb, function (_uArr) {
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
    }));
};

/**
* detail user
*/
exports.getUserDetail = function (_data, cb) {
    self.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        var _id;
        if (_.isEmpty(_params._id)) {
            _id = _user._id;
        } else {
            _id = _params._id.toString();
        }
        dbHelper.collection("users", safe.sure(cb, function (users) {
            users.findOne({_id: mongo.ObjectID(_id), status: 1}, {login:1, email: 1, picture: 1, friends: 1}, safe.sure(cb, function (_result) {
                cb (null, _result);
            }));
        }));
    }));
};



/**
* add friends for user
*/
exports.addFriendRequest = function (_data, cb) {
    self.checkAuth (_data, safe.sure(cb, function (_user, _params) {
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
exports.addFriend = function (_data, cb) {
    self.checkAuth (_data, safe.sure(cb, function (_user, _params) {
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
exports.deleteFriend = function (_data, cb) {
    self.checkAuth (_data, safe.sure(cb, function (_user, _params) {
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
exports.getFriendList = function (_data, cb) {
    self.checkAuth (_data, safe.sure(cb, function (_user, _params) {
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
exports.deleteUser = function (_data, cb) {
    self.checkAuth (_data, safe.sure(cb, function (_user, _params) {
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
