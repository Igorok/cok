"use strict";
var crypto = require('crypto');
var safe = require('safe');
var _ = require("lodash");
var moment = require('moment');
var mongo = require('mongodb');
var cokcore = require('cokcore');
var dbHelper = cokcore.db;
var collections = cokcore.collections;


var Api = function () {
    this.init = function (cb) {
        dbHelper.collection("users", safe.sure(cb, function (users) {
            cb();
        }));
    }
};


/**
* login to system
*/
Api.prototype.Registration = function (_data, cb) {
    var params = _data.params[0];
    var emailReg = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    if (
        _.isUndefined(params.login) ||
        _.isUndefined(params.email) ||
        _.isUndefined(params.password) ||
        ! emailReg.test(params.email.toString())
    ) {
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
    safe.series([
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
        friendRequests: 1,
        selfFriendRequests: 1,
        friends: 1,
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
        var uArr = [];
        var friendObj = {};
        _.each(_user.friends, function (val) {
            friendObj[val._id.toString()] = val;
        });
        _.each(_user.selfFriendRequests, function (val) {
            friendObj[val._id.toString()] = val;
        });
        _.each(_user.friendRequests, function (val) {
            friendObj[val._id.toString()] = val;
        });
        collections["users"].find({_id: {$ne: mongo.ObjectID(_user._id)}, status: 1}, {login: 1, email: 1}).toArray(safe.sure(cb, function (_arr) {
            _.each(_arr, function (val) {
                // hide friend button
                if (friendObj[val._id.toString()]) {
                    val.friend = true;
                }
            });
            cb(null, _arr);
        }));
    }));
};

/**
* detail user
*/
Api.prototype.getUserDetail = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        var _id;
        if (! _params || ! _params._id) {
            return cb (null, _user);
        } else {
            _id = mongo.ObjectID(_params._id.toString());
        }
        var rows = {
            _id: 1,
            login: 1,
            email: 1,
            friendRequests: 1,
            selfFriendRequests: 1,
            friends: 1,
        };
        collections["users"].findOne({_id: _id, status: 1}, rows, safe.sure(cb, function (_result) {
            cb (null, _result);
        }));
    }));
};



/**
* add friends for user
*/
Api.prototype.addFriendRequest = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params._id)) {
            return cb ("Wrong _id");
        }
        var fid = _params._id.toString();
        fid = mongo.ObjectID(fid);


        safe.parallel([
            function (cb) {
                var setData = {
                    $addToSet: {
                        selfFriendRequests: {_id: fid},
                    },
                };
                collections["users"].update({_id: _user._id}, setData, cb);
            },
            function (cb) {
                var setData = {
                    $addToSet: {
                        friendRequests: {_id: _user._id},
                    },
                };
                collections["users"].update({_id: fid}, setData, cb);
            },

        ], safe.sure(cb, function () {
            cb(null, true);
        }));
    }));
};


/**
* add friends for user
*/
Api.prototype.addFriend = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params._id)) {
            return cb ("_id is required");
        }
        var frId = _params._id.toString();
        safe.parallel([
            function (cb) {
                collections["users"].findOne({_id: _user._id, "friendRequests._id": mongo.ObjectID(frId)}, safe.sure(cb, function (cUser) {
                    if (! cUser) {
                        return cb ("Request from friend is not defined");
                    }
                    var updateObj = {
                        $addToSet: {
                            friends: {_id: mongo.ObjectID(frId)}
                        },
                        $pull: {
                            friendRequests: {_id: mongo.ObjectID(frId)}
                        }
                    };
                    collections["users"].update({_id: cUser._id}, updateObj, cb);
                }));
            },
            function (cb) {
                collections["users"].findOne({_id: mongo.ObjectID(frId), "selfFriendRequests._id": _user._id}, safe.sure(cb, function (reqUser) {
                    if (! reqUser) {
                        return cb ("Request to friend is not defined");
                    }
                    var updateObj = {
                        $addToSet: {
                            friends: {_id: _user._id}
                        },
                        $pull: {
                            selfFriendRequests: {_id: _user._id}
                        }
                    };
                    collections["users"].update({_id: reqUser._id}, updateObj, cb);
                }));
            },
        ], safe.sure(cb, function () {
            cb(null, true);
        }));
    }));
};

/**
* friends list
*/
Api.prototype.getFriendList = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        if (! _user.friends || ! _user.friends.length) {
            return cb(null, []);
        }
        var frIds = _.pluck(_user.friends, '_id');

        collections["users"].find({_id: {$in: frIds}}, {login: 1, email: 1, picture: 1}).toArray(cb);

    }));
};
/**
* friends list
*/
Api.prototype.getFriendRequests = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        if (! _user.friendRequests || ! _user.friendRequests.length) {
            return cb(null, []);
        }

        var frIds = _.pluck(_user.friendRequests, '_id');

        collections["users"].find({_id: {$in: frIds}}, {login: 1, email: 1, picture: 1}).toArray(cb);

    }));
};

/**
 * delete friends for user
 */
Api.prototype.deleteFriend = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params._id)) {
            return cb ("_id is required");
        }
        var frId = _params._id.toString();

        safe.parallel([
            function (cb) {
                collections["users"].update({_id: _user._id}, {$pull: {friends: mongo.ObjectID(frId)}}, cb)
            },
            function (cb) {
                collections["users"].update({_id: mongo.ObjectID(frId)}, {$pull: {friends: _user._id}}, cb)
            },
        ], safe.sure(cb, function () {
            cb(null, true);
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
