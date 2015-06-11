"use strict";
var safe = require('safe');
var _ = require("lodash");
var moment = require('moment');
var mongo = require('mongodb');
var fs = require('fs');
var cokcore = require('cokcore');
var collections = cokcore.collections;

var Api = function () {
    var self = this;
    self.api = {};
};
Api.prototype.init = function (cb) {
    return cb();
    var self = this;
    safe.parallel([
        function (cb) {
            cokcore.collection("chatgroups", safe.sure(cb, function (chatgroups) {
                self.colChatgroups = chatgroups;
                cb();
            }));
        },
        function (cb) {
            cokcore.collection("users", safe.sure(cb, function (users) {
                self.colUsers = users;
                cb();
            }));
        },
        function (cb) {
            cokcore.apiLoad(__dirname + '/user.js', safe.sure(cb, function (_api) {
                self.api.user = _api['user'];
                cb();
            }));
        }
    ], cb);
};






/**
 * make private chat for 2 users
 *
 */

Api.prototype.addPrivateChat = function (_data, cb) {
    cokcore.ctx.api["user"].checkAuth (_data, safe.sure(cb, function (_user, _params) {

    }));
};
/**
* all users
*/

Api.prototype.getChatList = function (_data, cb) {
    cokcore.ctx.api["user"].checkAuth (_data, safe.sure(cb, function (_user, _params) {
        cokcore.collection("chatgroups", safe.sure(cb, function (chatgroups) {
            cokcore.collection("users", safe.sure(cb, function (users) {
                var result = [];
                var userIds = [];
                var userObj = {};
                safe.series([
                    function (cb) {
                        chatgroups.find({"users._id": _user._id}, {sort: {date: -1}}).toArray(safe.sure(cb, function (groupsArr) {
                            _.each(groupsArr, function (curentGroup) {
                                _.each(curentGroup.users, function (curentUser) {
                                    if (! _.contains(userIds, mongo.ObjectID(curentUser._id))) {
                                        userIds.push(mongo.ObjectID(curentUser._id));
                                    }
                                });
                            });
                            result = groupsArr;
                            cb();
                        }));
                    },
                    function (cb) {
                        users.find({_id: {$in: userIds}}, {login: 1, picture: 1, email: 1}).toArray(safe.sure(cb, function (userArr) {
                            _.each(userArr, function (curentUser) {
                                userObj[curentUser._id] = curentUser;
                            });
                            cb();
                        }));
                    },
                ], safe.sure(cb, function () {
                    _.each(result, function (val) {
                        val.fDate = moment(val.date).format('DD/MM/YYYY HH:mm');
                        _.each(val.users, function (curentUser) {
                            if (userObj[curentUser._id]) {
                                curentUser.login = userObj[curentUser._id].login;
                                curentUser.email = userObj[curentUser._id].email;
                                curentUser.picture = userObj[curentUser._id].picture;
                            }
                        });

                        if (val.creator == _user._id) {
                            val.crPermission = true;
                        }
                    });
                    cb(null, result);
                }));
            }));
        }));
    }));
};

/**
* add new chat group
*/
Api.prototype.addChat = function (_data, cb) {
    cokcore.ctx.api["user"].checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params) || _.isEmpty(_params.users) || ! _.isArray(_params.users)) {
            return cb('Wrong data');
        }
        cokcore.collection("chatgroups", safe.sure(cb, function (chatgroups) {
            var userArr = [];
            if (! _.contains(_params.users, _user._id)) {
                userArr.push({_id: _user._id});
            }
            _.each(_params.users, function (val) {
                userArr.push({_id: val.toString()});
            });
            chatgroups.insert({users: userArr, creator: _user._id, date: new Date()}, safe.sure(cb, function () {
                cb(null, true);
            }));
        }));
    }));
};


/**
* edit chat group
*/
Api.prototype.editChat = function (_data, cb) {
    cokcore.ctx.api["user"].checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params) || _.isEmpty(_params._id) || _.isEmpty(_params.users) || ! _.isArray(_params.users)) {
            return cb('Wrong data');
        }
        cokcore.collection("chatgroups", safe.sure(cb, function (chatgroups) {
            var _id = _params._id.toString();
            var userArr = [];
            if (! _.contains(_params.users, _user._id)) {
                userArr.push({_id: _user._id});
            }
            _.each(_params.users, function (val) {
                userArr.push({_id: val.toString()});
            });
            var cGroup = null;
            safe.waterfall([
                function (cb) {
                    chatgroups.findOne({_id: mongo.ObjectID(_id), creator: _user._id}, safe.sure(cb, function (_cGroup) {
                        if (_.isEmpty(_cGroup)) {
                            return cb(403);
                        } else {
                            cGroup = _cGroup;
                            cb();
                        }
                    }));
                },
                function (cb) {
                    chatgroups.update({_id: mongo.ObjectID(_id)}, {$set: {users: userArr}}, safe.sure(cb, function () {
                        cb();
                    }));
                }
            ], safe.sure(cb, function () {
                cb(null, true);
            }));
        }));
    }));
};

/**
* get edit chat
*/
Api.prototype.getEditChat = function (_data, cb) {
    cokcore.ctx.api["user"].checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params) || _.isEmpty(_params._id)) {
            return cb('Wrong data');
        }
        var cUser = _user;
        var _id = _params._id.toString();
        var cGroup = null;
        var friendIds = [];
        var groupUsrIds = [];
        var usrIds = [];
        var usrArr = [];
        if (cUser.friends && (cUser.friends.length > 0)) {
            friendIds = _.pluck(cUser.friends, "_id");
        }
        cokcore.collection("chatgroups", safe.sure(cb, function (chatgroups) {
        cokcore.collection("users", safe.sure(cb, function (users) {
            safe.waterfall([
                function (cb) {
                    chatgroups.findOne({_id: mongo.ObjectID(_id), creator: cUser._id}, safe.sure(cb, function (_cGroup) {
                        if (_.isEmpty(_cGroup)) {
                            return cb(403);
                        } else {
                            cGroup = _cGroup;
                            groupUsrIds = _.pluck(cGroup.users, "_id");
                            usrIds = _.union(friendIds, groupUsrIds);
                            cb();
                        }
                    }));
                },
                function (cb) {
                    if (! _.isEmpty(usrIds)) {
                        var usrObjIds = [];
                        _.each(usrIds, function (val) {
                            if (val != cUser._id) {
                                usrObjIds.push(mongo.ObjectID(val));
                            }
                        });
                        users.find({_id: {$in : usrObjIds}}, {login: 1}).toArray(safe.sure(cb, function (_uArr) {
                            if (! _.isEmpty(_uArr)) {
                                _.each(_uArr, function (val) {
                                    if (_.contains(groupUsrIds, val._id.toHexString())) {
                                        val.checked = true;
                                    }
                                    usrArr.push(val);
                                });
                                cGroup.usrArr = usrArr;
                            }
                            cb();
                        }));
                    } else {
                        cb();
                    }
                },
            ], safe.sure(cb, function () {
                cb(null, cGroup);
            }));
        }));
        }));
    }));
};
/**
* remove chat group
*/
Api.prototype.removeChat = function (_data, cb) {
    cokcore.ctx.api["user"].checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params) || _.isEmpty(_params._id)) {
            return cb('Wrong data');
        }
        var _id = _params._id.toString();
        cokcore.collection("chatgroups", safe.sure(cb, function (chatgroups) {
            cokcore.collection("chatmessages", safe.sure(cb, function (chatmessages) {
                chatgroups.findOne({_id: mongo.ObjectID(_id)}, safe.sure(cb, function (_group) {
                    if (_group.creator != _user._id) {
                        return cb(403);
                    }
                    safe.parallel([
                        function (cb) {
                            chatmessages.remove({chatId: _id}, cb);
                        },
                        function (cb) {
                            chatgroups.remove({_id: mongo.ObjectID(_id)}, cb);
                        },
                    ], safe.sure(cb, function() {
                        cb(null, true);
                    }));
                }));
            }));
        }));
    }));
};


/**
* remove chat group
*/
Api.prototype.leaveChat = function (_data, cb) {
    cokcore.ctx.api["user"].checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params) || _.isEmpty(_params._id)) {
            return cb('Wrong data');
        }
        var _id = _params._id.toString();
        cokcore.collection("chatgroups", safe.sure(cb, function (chatgroups) {
            chatgroups.update({_id: mongo.ObjectID(_id), "users._id": _user._id}, {$pull: { users: {_id: _user._id}}}, {multi: true}, safe.sure(cb, function (_result) {
                cb(null, true);
            }));
        }));
    }));
};


 /**
  * init function
  */
 module.exports.init = function (cb) {
     var api = new Api();
     console.time('init chat api');
     api.init(safe.sure(cb, function () {
         console.timeEnd('init chat api');
         cb(null, api);
     }));
 };
