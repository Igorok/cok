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
    dbHelper.redis.get(token, safe.sure(cb, function (_user) {
        if (! _user) {
            return cb (403);
        } else {
            _user = JSON.parse(_user);
            var startArr = [null, _user];
            var params = startArr.concat(_data.params);
            cb.apply(self, params);
        }
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
                    users.findOne({_id: BSON.ObjectID(_user._id)}, safe.sure(cb, function (_cUser) {
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
