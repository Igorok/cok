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
    self.getUserStatus = function (_id, cb) {
        cokcore.ctx.redis.get(_id, safe.sure(cb, function (_user) {
            if (! _user) {
                return cb(null, 'off');
            }
            _user = JSON.parse(_user);
            if (! _user.date) {
                return cb(null, 'off');
            }
            var diff = moment().diff(moment(_user.date), 'minutes');
            if (diff > 30) {
                return cb(null, 'off');
            } else if (diff > 15) {
                return cb(null, 'absent');
            } else {
                return cb(null, 'on');
            }
        }));
    };
};
Api.prototype.init = function (cb) {
    var self = this;
    safe.parallel([
        function (cb) {
            cokcore.collection("chatgroups", safe.sure(cb, function (chatgroups) {
                cb();
            }));
        },
        function (cb) {
            cokcore.collection("chatmessages", safe.sure(cb, function (chatmessages) {
                cb();
            }));
        },
        function (cb) {
            cokcore.collection("users", safe.sure(cb, function (users) {
                cb();
            }));
        },
        function (cb) {
            cokcore.apiLoad(__dirname + '/user.js', safe.sure(cb, function (_api) {
                cb();
            }));
        }
    ], cb);
};



/**
 * personal chat only for 2 users
 * @param _id - id of user for chat
 */
Api.prototype.joinPersonal = function (_data, cb) {
     var self = this;
     cokcore.ctx.api["user"].checkAuth (_data, safe.sure(cb, function (_user, _params) {
         if (_.isUndefined(_params.personId)) {
             return cb ("Wrong _id 1");
         }
         var uId = mongo.ObjectID(_user._id);
         var cRoom = null;
         var rId = null;
         var users = {};
         var history = [];
         safe.series([
             function (cb) {
                 cokcore.ctx.col["chatgroups"].findOne({$and: [{'users._id':  uId}, {'users._id':  mongo.ObjectID(_params.personId)}], type: 'personal'}, safe.sure(cb, function (_obj) {
                     if (_obj) {
                         cRoom = _obj;
                         return cb();
                     }

                     var insObj = {
                         users:[
                             {_id: uId},
                             {_id: mongo.ObjectID(_params.personId)},
                         ],
                         creator: uId,
                         date: new Date(),
                         type: "personal"
                     };
                     cokcore.ctx.col["chatgroups"].insert(insObj, safe.sure(cb, function (result) {
                         cRoom = result.ops[0];
                         cb();
                     }));
                 }));
             },
             function (cb) {
                 if (cRoom.users.length !== 2) {
                     return cb("Wrong _id 2");
                 }
                 rId = cRoom._id.toString();
                 var userIds = _.pluck(cRoom.users, '_id');
                 cokcore.ctx.col["users"].find({_id: {$in: userIds}}, {login: 1}).toArray(safe.sure(cb, function (_arr) {
                     safe.each(_arr, function(_usr, cb) {
                         var id = _usr._id.toString();
                         users[id] = {
                             _id: id,
                             login: _usr.login,
                         }
                         self.getUserStatus(id, safe.sure(cb, function (status) {
                             users[id].status = status;
                             cb();
                         }));

                     }, cb);
                 }));
             },
             function (cb) {
                 cokcore.ctx.col["chatmessages"].find({rId: cRoom._id}, {$sort: {date: -1}, limit: 100}).toArray(safe.sure(cb, function (_arr) {
                     _.forEach(_arr, function (val) {
                         var msg = {
                             uId: val.uId.toString(),
                             login: users[val.uId.toString()].login,
                             msg: val.msg,
                             date: moment(val.date).calendar(),
                         };
                         history.push(msg);
                     });
                     cb();
                 }));
             },
             function (cb) {
                 if (_.include(_user.rooms, rId)) {
                     return cb();
                 }
                 _user.rooms.push(rId);

                 cokcore.ctx.redis.set(_user._id, JSON.stringify(_user), safe.sure(cb, function () {
                     cb();
                 }));
             },
         ], safe.sure(cb, function () {
             var data = {
                 _id: cRoom._id.toString(),
                 users: users,
                 history: history,
             };
             cb(null, data);
         }));
     }));
 };





/*
{
    user: {
        uId: self.user._id,
        token: self.user.token,
        _id: self.user._id,
    },
    rId: self.room,
    message: msg,
}
*/
Api.prototype.message = function (_data, cb) {
    cokcore.ctx.api["user"].checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isUndefined(_params.rId)) {
            return cb ("wrong rId");
        }
        if (! _.include(_user.rooms, _params.rId)) {
            return cb ("chat room not found");
        }
        var insObj = {
            uId: mongo.ObjectID(_user._id),
            rId: mongo.ObjectID(_params.rId),
            msg: _.escape(_params.message),
            date: new Date()
        };

        cokcore.ctx.col["chatmessages"].insert(insObj, safe.sure(cb, function () {
            cb(null, {
                uId: _user._id,
                login: _user.login,
                rId: _params.rId,
                msg: insObj.msg,
                date: moment(insObj.date).calendar(),
            });
        }));
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
