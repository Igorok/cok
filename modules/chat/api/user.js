var crypto = require('crypto');
var safe = require('safe');
var _ = require("lodash");
var async = require('async');
var moment = require('moment');
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var dbHelper = require(__dirname + '/../helpers/db_helper.js');
var self = this;
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
    dbHelper.collection("users", safe.sure(cb, function (users) {
        users.findOne({login: login}, safe.sure(cb, function (user) {
            if (! user || (password != user.password)) {
                return cb ("Wrong data");
            }
            delete user.password;
            var userToken;
            async.series([
                function (cb) {
                    crypto.randomBytes(48, safe.sure(cb, function(buf) {
                        userToken = buf.toString('hex');
                        cb();
                    }));
                },
                function (cb) {
                    var ruser = JSON.stringify(user);
                    dbHelper.redis.set(userToken, ruser, safe.sure(cb, function () {
                        cb();
                    }));
                },
                function (cb) {
                    dbHelper.redis.expire(userToken, 24*60*60, safe.sure(cb, function () {
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
    var params = _data.params[0];
    var token;
    if (! params || ! params.token) {
        return cb (403);
    }
    token = params.token.toString();
    dbHelper.redis.get(token, safe.sure(cb, function (_user) {
        if (! _user) {
            return cb (403);
        } else {
            _user = JSON.parse(_user);
            cb(null, _user, params);
        }
    }));
}

/**
* logout to system
*/
exports.logout = function (_data, cb) {
    self.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        dbHelper.redis.del(_params.token, {}, cb);
    }));
};
/**
* all users
*/
exports.getUserList = function (_data, cb) {
    self.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        var friendIds = [];
        if (_user.friends && (_user.friends.length > 0)) {
            friendIds = _.pluck(_user.friends, "_id");
        }
        dbHelper.collection("users", safe.sure(cb, function (users) {
            users.find({_id: {$ne: new BSON.ObjectID(_user._id)}}, {login: 1, email: 1}, {limit: 100}).toArray(safe.sure(cb, function (uArr) {
                _.each(uArr, function (val) {
                    if (_.contains(friendIds, val._id.toHexString())) {
                        val.friend = true;
                    }
                });
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
        if (_.isEmpty(_params._id)) {
            return cb ("Wrong form data");
        }
        var _id = _params._id.toString();
        dbHelper.collection("users", safe.sure(cb, function (users) {
            users.findOne({_id: new BSON.ObjectID(_id)}, {login:1, email: 1}, safe.sure(cb, function (_result) {
                cb (null, _result);
            }));
        }));
    }));
    
};

/**
* add friends for user
*/
exports.addFriend = function (_data, cb) {
    self.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params._id)) {
            return cb ("Wrong form data");
        }
        var token = _params.token;
        var _id = _params._id.toString();
        var uFriends;
        if (_user.friends && (_user.friends.length > 0)) {
            uFriends = _.pluck(_user.friends, "_id");
        } else {
            uFriends = [];
        }
        if (_.contains(uFriends, _id)) {
            return cb ("Friend already exists");
        }
        dbHelper.collection("users", safe.sure(cb, function (users) {
            users.update({_id: new BSON.ObjectID(_user._id)},
                {$push: {
                    friends: {_id: _id}
                }},
                safe.sure(cb, function () {
                    if (! _user.friends) {
                        _user.friends = [];
                    }
                    _user.friends.push({_id: _id});
                    _user = JSON.stringify(_user);
                dbHelper.redis.set(token, _user, cb);
            }));
        }));
    }));
};


/**
* delete friends for user
*/
exports.deleteFriend = function (_data, cb) {
    self.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params._id) || ! _user.friends) {
            return cb ("Already deleted");
        }
        var token = _params.token;
        var _id = _params._id.toString();
        var friendIds = _.pluck(_user.friends, "_id");
        if (! _.contains(friendIds, _id)) {
            return cb ("Already deleted");
        }
        _.remove(_user.friends, function(val) {
            return val._id == _id;
        });
        dbHelper.collection("users", safe.sure(cb, function (users) {
            users.update({_id: new BSON.ObjectID(_user._id)},
                {$pull: {
                    friends: {_id: _id}
                }},
                safe.sure(cb, function () {
                    _user = JSON.stringify(_user);
                    dbHelper.redis.set(token, _user, cb);
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
            if (! _user.friends || ! (_user.friends.length > 0)) {
                return cb();
            }
            var friendIds = [];
            _.each(_user.friends, function (val) {
                friendIds.push(new BSON.ObjectID(val._id));
            });
            users.find({_id: {$in: friendIds}}, {login: 1, email: 1}).toArray(safe.sure(cb, function (uArr) {
                _.each(uArr, function (val) {
                    val.friend = true;
                });
                cb(null, uArr)
            }));
        }));
    }));
};
