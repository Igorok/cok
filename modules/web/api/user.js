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
            dtCreated: new Date(),
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
    var device = params.dev ? params.dev.toString().trim() : "web";

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
            var tokens = {};
            if (user.tokens) {
                tokens = _.indexBy(user.tokens, 'dev');
            }
            tokens[device] = {
                token: user.token,
                dev: device,
                dtExpire: moment().add(cokcore.ctx.cfg.app.expireTokenDay, 'days').toDate(),
            };

            var q = {
                _id: user._id,
            };
            var s = {
                $set: {
                    tokens: _.toArray(tokens),
                    dtActive: new Date(),
                },
            };
            cokcore.ctx.col.users.update(q, s, cb);
        },
    ], safe.sure(cb, function () {
        delete user.tokens;
        cb(null, user);
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
    if (! _data.params[0] || ! _data.params[0].token || ! _data.params[0].uId) {
        return cb (403);
    }
    var uId = _data.params[0].uId.toString();
    var token = _data.params[0].token.toString();
    var device = _data.params[0].dev ? _data.params[0].dev.toString().trim() : "web";

    var q = {
        _id: cokcore.ObjectID(uId),
        "tokens.token": token,
    };
    cokcore.ctx.col.users.findOne(q, safe.sure(cb, function (_user) {
        if (! _user) {
            return cb (403);
        }
        // find the token for type of device
        var devToken = _.find(_user.tokens, function (val) {
            return device == val.dev;
        });

        if (
            _.isEmpty(devToken) ||
            moment().isAfter(moment(devToken._dtExpire))
        ) {
            return cb (403);
        }

        var s = {
            $set: {
                dtActive: new Date(),
            }
        }
        cokcore.ctx.col.users.update(q, s, safe.sure(cb, function () {
            var params = [null, _user].concat(_data.params);
            cb.apply(self, params);
        }));
    }));
};

/**
* logout to system
*/
Api.prototype.logout = function (_data, cb) {
    Api.prototype.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        var device = _params.dev ? _params.dev.toString().trim() : "web";
        var tokens = {};
        if (_user.tokens) {
            tokens = _.indexBy(_user.tokens, 'dev');
        }
        delete tokens[device];
        var q = {
            _id: user._id,
        };
        var s = {
            $set: {
                tokens: _.toArray(tokens),
            },
        };
        cokcore.ctx.col.users.update(q, s, safe.sure(cb, function () {
            cb();
        }));
    }));
};




/**
* user list for mobile
* @param date - date of last request of user list
* @return retObj.act - boolean, check of actuality information for requested date
* @return retObj.data - array of users if information did changed
*/
Api.prototype.getMobileUserList = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        var uId = cokcore.ObjectID(_user._id);
        var uArr = [];
        var friendObj = {};
        var reqDt = _params.date || null;
        var retObj = {
            act: true,
            data: [],
        };



        var dtUpdated = _user.dtUpdated || null;
        // check that date of last request later last update of user
        if (reqDt && (new Date(reqDt).valueOf() > new Date(dtUpdated).valueOf())) {
            return cb(null, retObj);
        }

        retObj.act = false;
        _.each(_user.friends, function (val) {
            friendObj[val._id.toString()] = val;
        });
        _.each(_user.selfFriendRequests, function (val) {
            friendObj[val._id.toString()] = val;
        });
        _.each(_user.friendRequests, function (val) {
            friendObj[val._id.toString()] = val;
        });

        cokcore.ctx.col.users.find({_id: {$ne: uId}, status: 1}, {login: 1, email: 1}).toArray(safe.sure(cb, function (_arr) {
            _.each(_arr, function (val) {
                // hide friend button
                if (friendObj[val._id.toString()]) {
                    val.friend = 1;
                } else {
                    val.friend = 0;
                }
                retObj.data.push(val);
            });

            cb(null, retObj);
        }));
    }));
};


/**
* friends list
*/
Api.prototype.getMobileFriendList = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        var uId = cokcore.ObjectID(_user._id);
        var reqDt = _params.date || null;
        var retObj = {
            act: true,
            data: [],
        };

        var dtUpdated = _user.dtUpdated || null;
        // check that date of last request later last update of user
        if (reqDt && (new Date(reqDt).valueOf() > new Date(dtUpdated).valueOf())) {
            return cb(null, retObj);
        }

        retObj.act = false;
        if (! _user.friends || ! _user.friends.length) {
            return cb(null, retObj);
        }
        var frIds = _.pluck(_user.friends, '_id');
        cokcore.ctx.col.users.find({_id: {$in: frIds}}, {login: 1, email: 1, picture: 1}).toArray(safe.sure(cb, function (_arr) {
            retObj.data = _arr;
            cb(null, retObj);
        }));
    }));
};

/**
* all users
*/
Api.prototype.getUserList = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        var uId = cokcore.ObjectID(_user._id);
        var uArr = [];
        var friendObj = {};
        var users = [];
        _.each(_user.friends, function (val) {
            friendObj[val._id.toString()] = val;
        });
        _.each(_user.selfFriendRequests, function (val) {
            friendObj[val._id.toString()] = val;
        });
        _.each(_user.friendRequests, function (val) {
            friendObj[val._id.toString()] = val;
        });

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

            cb(null, users);
        }));
    }));
};

/**
* detail user
*/
Api.prototype.getUserDetail = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        if (! _params || ! _params._id) {
            var _result = {
                _id: _user._id,
                login: _user.login,
                email: _user.email,
                friendRequests: _user.friendRequests,
                selfFriendRequests: _user.selfFriendRequests,
                friends: _user.friends,
            };

            return cb(null, _result);
        }

        var _id = cokcore.ObjectID(_params._id.toString());
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
        var uId = cokcore.ObjectID(_user._id);
        var fid = _params._id.toString();
        var uObj = null;
        var friends = null;
        var selfFriendRequests = null;
        var friendRequests = null;

        var friends = _.map(_user.friends, function (val) {
            return val._id.toString();
        });
        var selfFriendRequests = _.map(_user.selfFriendRequests, function (val) {
            return val._id.toString();
        });
        var friendRequests = _.map(_user.friendRequests, function (val) {
            return val._id.toString();
        });

        if (_.include(friends, fid) || _.include(selfFriendRequests, fid) || _.include(friendRequests, fid)) {
            return cb();
        }

        fid = cokcore.ObjectID(fid);
        safe.parallel([
            function (cb) {
                var setData = {
                    $set: {dtUpdated: new Date()},
                    $addToSet: {
                        selfFriendRequests: {_id: fid},
                    },
                };
                cokcore.ctx.col.users.update({_id: uId}, setData, cb);
            },
            function (cb) {
                var setData = {
                    $set: {dtUpdated: new Date()},
                    $addToSet: {
                        friendRequests: {_id: uId},
                    },
                };
                cokcore.ctx.col.users.update({_id: fid}, setData, cb);
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
        var uId = cokcore.ObjectID(_user._id);
        var frId = _params._id.toString();


        safe.parallel([
            function (cb) {
                cokcore.ctx.col.users.findOne({_id: uId, "friendRequests._id": cokcore.ObjectID(frId)}, safe.sure(cb, function (cUser) {
                    if (! cUser) {
                        return cb ("Request from friend is not defined");
                    }
                    var updateObj = {
                        $set: {dtUpdated: new Date()},
                        $addToSet: {
                            friends: {_id: cokcore.ObjectID(frId)}
                        },
                        $pull: {
                            selfFriendRequests: {_id: cokcore.ObjectID(frId)},
                            friendRequests: {_id: cokcore.ObjectID(frId)},
                        }
                    };
                    cokcore.ctx.col.users.update({_id: cUser._id}, updateObj, cb);
                }));
            },
            function (cb) {
                cokcore.ctx.col.users.findOne({_id: cokcore.ObjectID(frId), "selfFriendRequests._id": uId}, safe.sure(cb, function (reqUser) {
                    if (! reqUser) {
                        return cb ("Request to friend is not defined");
                    }
                    var updateObj = {
                        $set: {dtUpdated: new Date()},
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


Api.prototype.getFriendList = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        var uId = cokcore.ObjectID(_user._id);
        var friends = null;
        if (! _user.friends || ! _user.friends.length) {
            return cb();
        }
        var frIds = _.pluck(_user.friends, '_id');
        cokcore.ctx.col.users.find({_id: {$in: frIds}}, {login: 1, email: 1, picture: 1}).toArray(safe.sure(cb, function (_arr) {
            friends = _arr;
            cb(null, friends);
        }));
    }));
};
/**
* friends list
*/
Api.prototype.getFriendRequests = function (_data, cb) {
    Api.prototype.checkAuth(_data, safe.sure(cb, function (_user, _params) {
        var uId = cokcore.ObjectID(_user._id);
        var friends = null;
        if (! _user.friendRequests || ! _user.friendRequests.length) {
            return cb();
        }
        var frIds = _.pluck(_user.friendRequests, '_id');
        cokcore.ctx.col.users.find({_id: {$in: frIds}}, {login: 1, email: 1, picture: 1}).toArray(safe.sure(cb, function (_arr) {
            friends = _arr;
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
        var frId = cokcore.ObjectID(_params._id.toString());
        var uId = cokcore.ObjectID(_user._id);

        safe.parallel([
            function (cb) {
                cokcore.ctx.col.users.update({_id: uId}, {
                    $pull: {friends: {_id: frId}},
                    $set: {dtUpdated: new Date()},
                }, cb)
            },
            function (cb) {
                cokcore.ctx.col.users.update({_id: frId}, {
                    $pull: {friends: {_id: uId}},
                    $set: {dtUpdated: new Date()},
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
