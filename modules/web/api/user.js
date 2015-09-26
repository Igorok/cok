"use strict";
var crypto = require('crypto');
var safe = require('safe');
var _ = require("lodash");
var moment = require('moment');
var mongo = require('mongodb');
var cokcore = require('cokcore');


var Api = function () {
    this.init = function (cb) {
        cokcore.collection("users", safe.sure(cb, function (users) {
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
    cokcore.ctx.col.users.find({$or : [{login: login}, {email: email}]}).toArray(safe.sure(cb, function (_result) {
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
        cokcore.ctx.col.users.insert(newUser, safe.sure(cb, function (_result) {
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
    var uId = null;
    safe.series([
        function (cb) {
            cokcore.ctx.col.users.findOne({login: login, status: 1}, safe.sure(cb, function (_obj) {
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
            uId = user._id.toString();
            var catchedUser = {
                _id: uId,
                token: user.token,
                login: user.login,
                email: user.email,
                group:  user.group,
                rooms: [],
                date: moment().format('YYYY-MM-DD HH:mm:ss'),
            }
            catchedUser = JSON.stringify(catchedUser);
            cokcore.ctx.redis.set(uId, catchedUser, safe.sure(cb, function () {
                cb();
            }));
        },
        function (cb) {
            cokcore.ctx.redis.expire(uId, 24 * 60 * 60, safe.sure(cb, function () {
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
    var user = null;
    if (! _data || ! _data.params || ! cb || (typeof(cb) != 'function')) {
        return cb (404);
    }
    if (! _data.params[0] || ! _data.params[0].token, ! _data.params[0].uId) {
        return cb (403);
    }
    var uId = _data.params[0].uId.toString();
    var token = _data.params[0].token.toString();
    cokcore.ctx.redis.get(uId, safe.sure(cb, function (_user) {
        if (! _user) {
            return cb (403);
        }
        user = JSON.parse(_user);
        if (user.token !== token) {
            return cb (403);
        }
        user.date = moment().format('YYYY-MM-DD HH:mm:ss');
        var startArr = [null, user];
        var params = startArr.concat(_data.params);
        cokcore.ctx.redis.set(user._id, JSON.stringify(user), safe.sure(cb, function () {
            cb.apply(self, params);
        }));
    }));
};

/**
* logout to system
*/
Api.prototype.logout = function (_data, cb) {
    Api.prototype.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        cokcore.ctx.redis.del(_params.token, {}, cb);
    }));
};
/**
* all users
*/
Api.prototype.getUserList = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        var uId = mongo.ObjectID(_user._id);
        var uArr = [];
        var friendObj = {};
        var users = [];
        safe.series([
            function (cb) {
                cokcore.ctx.col.users.findOne({_id: uId}, safe.sure(cb, function (_obj) {
                    _.each(_obj.friends, function (val) {
                        friendObj[val._id.toString()] = val;
                    });
                    _.each(_obj.selfFriendRequests, function (val) {
                        friendObj[val._id.toString()] = val;
                    });
                    _.each(_obj.friendRequests, function (val) {
                        friendObj[val._id.toString()] = val;
                    });
                    cb();
                }));
            },
            function (cb) {
                cokcore.ctx.col.users.find({_id: {$ne: uId}, status: 1}, {login: 1, email: 1}).toArray(safe.sure(cb, function (_arr) {
                    _.each(_arr, function (val) {
                        // hide friend button
                        if (friendObj[val._id.toString()]) {
                            val.friend = 1;
                        } else {
                            val.friend = 0;
                        }
                        users.push(val);
                    });
                    cb();
                }));
            },
        ], safe.sure(cb, function () {
            cb(null, users);
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
            _id = mongo.ObjectID(_user._id);
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
        cokcore.ctx.col.users.findOne({_id: _id, status: 1}, rows, safe.sure(cb, function (_result) {
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
        var uId = mongo.ObjectID(_user._id);
        var fid = _params._id.toString();
        var uObj = null;
        var friends = null;
        var selfFriendRequests = null;
        var friendRequests = null;
        safe.series([
            function (cb) {
                cokcore.ctx.col.users.findOne({_id: uId}, safe.sure(cb, function (_obj) {
                    uObj = _obj;
                    cb();
                }));
            },
            function (cb) {
                var friends = _.map(uObj.friends, function (val) {
                    return val._id.toString();
                });
                var selfFriendRequests = _.map(uObj.selfFriendRequests, function (val) {
                    return val._id.toString();
                });
                var friendRequests = _.map(uObj.friendRequests, function (val) {
                    return val._id.toString();
                });

                if (_.include(friends, fid) || _.include(selfFriendRequests, fid) || _.include(friendRequests, fid)) {
                    return cb();
                }

                fid = mongo.ObjectID(fid);
                safe.parallel([
                    function (cb) {
                        var setData = {
                            $set: {updated: new Date()},
                            $addToSet: {
                                selfFriendRequests: {_id: fid},
                            },
                        };
                        cokcore.ctx.col.users.update({_id: uId}, setData, cb);
                    },
                    function (cb) {
                        var setData = {
                            $set: {updated: new Date()},
                            $addToSet: {
                                friendRequests: {_id: uId},
                            },
                        };
                        cokcore.ctx.col.users.update({_id: fid}, setData, cb);
                    },

                ], safe.sure(cb, function () {
                    cb();
                }));
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
        var uId = mongo.ObjectID(_user._id);
        var frId = _params._id.toString();


        safe.parallel([
            function (cb) {
                cokcore.ctx.col.users.findOne({_id: uId, "friendRequests._id": mongo.ObjectID(frId)}, safe.sure(cb, function (cUser) {
                    if (! cUser) {
                        return cb ("Request from friend is not defined");
                    }
                    var updateObj = {
                        $set: {updated: new Date()},
                        $addToSet: {
                            friends: {_id: mongo.ObjectID(frId)}
                        },
                        $pull: {
                            selfFriendRequests: {_id: mongo.ObjectID(frId)},
                            friendRequests: {_id: mongo.ObjectID(frId)},
                        }
                    };
                    cokcore.ctx.col.users.update({_id: cUser._id}, updateObj, cb);
                }));
            },
            function (cb) {
                cokcore.ctx.col.users.findOne({_id: mongo.ObjectID(frId), "selfFriendRequests._id": uId}, safe.sure(cb, function (reqUser) {
                    if (! reqUser) {
                        return cb ("Request to friend is not defined");
                    }
                    var updateObj = {
                        $set: {updated: new Date()},
                        $addToSet: {
                            friends: {_id: uId}
                        },
                        $pull: {
                            friendRequests: {_id: uId},
                            selfFriendRequests: {_id: uId},
                        }
                    };
                    cokcore.ctx.col.users.update({_id: reqUser._id}, updateObj, cb);
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
        var uId = mongo.ObjectID(_user._id);
        var uObj = null;
        var friends = null;
        safe.series([
            function (cb) {
                cokcore.ctx.col.users.findOne({_id: uId}, safe.sure(cb, function (_obj) {
                    uObj = _obj;
                    cb();
                }));
            },
            function (cb) {
                if (! uObj.friends || ! uObj.friends.length) {
                    return cb();
                }
                var frIds = _.pluck(uObj.friends, '_id');
                cokcore.ctx.col.users.find({_id: {$in: frIds}}, {login: 1, email: 1, picture: 1}).toArray(safe.sure(cb, function (_arr) {
                    friends = _arr;
                    cb();
                }));
            },
        ], safe.sure(cb, function () {
            cb(null, friends);
        }));
    }));
};
/**
* friends list
*/
Api.prototype.getFriendRequests = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        var uId = mongo.ObjectID(_user._id);
        var uObj = null;
        var friends = null;
        safe.series([
            function (cb) {
                cokcore.ctx.col.users.findOne({_id: uId}, safe.sure(cb, function (_obj) {
                    uObj = _obj;
                    cb();
                }));
            },
            function (cb) {
                if (! uObj.friendRequests || ! uObj.friendRequests.length) {
                    return cb();
                }
                var frIds = _.pluck(uObj.friendRequests, '_id');
                cokcore.ctx.col.users.find({_id: {$in: frIds}}, {login: 1, email: 1, picture: 1}).toArray(safe.sure(cb, function (_arr) {
                    friends = _arr;
                    cb();
                }));
            },
        ], safe.sure(cb, function () {
            cb(null, friends);
        }));
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
        var frId = mongo.ObjectID(_params._id.toString());
        var uId = mongo.ObjectID(_user._id);

        safe.parallel([
            function (cb) {
                cokcore.ctx.col.users.update({_id: uId}, {
                    $pull: {friends: {_id: frId}},
                    $set: {updated: new Date()},
                }, cb)
            },
            function (cb) {
                cokcore.ctx.col.users.update({_id: frId}, {
                    $pull: {friends: {_id: uId}},
                    $set: {updated: new Date()},
                }, cb)
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
