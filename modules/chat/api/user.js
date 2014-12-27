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
    if (! _data || ! _data.params || ! cb || (typeof(cb) != 'function')) {
        return cb (403);
    }
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
        var uArr;
        var cUser;
        var friendIds = [];
        dbHelper.collection("users", safe.sure(cb, function (users) {
            async.waterfall([
                function (cb) {
                    users.findOne({_id: BSON.ObjectID(_user._id)}, safe.sure(cb, function (_cUser) {
                        cUser = _cUser;
                        friendIds = _.pluck(cUser.friends, "_id");
                        cb();
                    }));
                },
                function (cb) {
                    users.find({_id: {$ne: BSON.ObjectID(_user._id)}}, {login: 1, email: 1}, {limit: 100}).toArray(safe.sure(cb, function (_uArr) {
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
        var _id = _params._id.toString();
        var usersIds = [_id, _user._id];
        dbHelper.collection("users", safe.sure(cb, function (users) {
            async.each(usersIds, function (uId, cb) {
                var cUser;
                users.findOne({_id: BSON.ObjectID(uId)}, safe.sure(cb, function (_cUser) {
                    if (_.isEmpty(_cUser)) {
                        return cb(404);
                    } else {
                        cUser = _cUser;
                        var cloneId = _.clone(usersIds);
                        _.remove(cloneId, function(val) {
                            return val == uId;
                        });
                        cloneId = cloneId[0];
                        var fIds = _.pluck(cUser.friends, "_id");
                        if (_.contains(fIds, cloneId)) {
                            cb();
                        } else {
                            users.update({_id: cUser._id}, {$push: {friends: {_id: cloneId}}}, safe.sure(cb, function () {
                                cb();
                            }));
                        }
                    }
                }));
            }, safe.sure(cb, function () {
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
                var cUser;
                users.findOne({_id: BSON.ObjectID(uId)}, safe.sure(cb, function (_cUser) {
                    if (_.isEmpty(_cUser)) {
                        return cb(404);
                    } else {
                        cUser = _cUser;
                        var cloneId = _.clone(usersIds);
                        _.remove(cloneId, function(val) {
                            return val == uId;
                        });
                        cloneId = cloneId[0];
                        var fIds = _.pluck(cUser.friends, "_id");
                        if (! _.contains(fIds, cloneId)) {
                            cb();
                        } else {
                            users.update({_id: cUser._id}, {$pull: {friends: {_id: cloneId}}}, safe.sure(cb, function () {
                                cb();
                            }));
                        }
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
            users.findOne({_id: BSON.ObjectID(_user._id)}, safe.sure(cb, function (cUser) {
                if (! cUser.friends || _.isEmpty(cUser.friends)) {
                    return cb();
                }
                var friendIds = [];
                _.each(cUser.friends, function (val) {
                    friendIds.push(BSON.ObjectID(val._id));
                });
                console.log('friendIds ', friendIds);
                users.find({_id: {$in: friendIds}}, {login: 1, email: 1}).toArray(safe.sure(cb, function (uArr) {
                    _.each(uArr, function (val) {
                        val.friend = true;
                    });
                    console.log('uArr ', uArr)
                    cb(null, uArr)
                }));
            }))
        }));
    }));
};
