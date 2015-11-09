"use strict";
var safe = require('safe');
var _ = require("lodash");
var moment = require('moment');
var mongo = require('mongodb');
var fs = require('fs');
var cokcore = require('cokcore');

var Api = function () {
    var self = this;
    self.api = {};
    // private function, only for api
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
    safe.series([
        function (cb) {
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
            ], cb);
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
 * @param _params.limit - limit of messages
 * @param _params.fDate - date for start messages find
 */
Api.prototype.joinPersonal = function (_data, cb) {
     var self = this;
     cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
         if (_.isUndefined(_params.personId)) {
             return cb ("Wrong _id 1");
         }
         var uId = mongo.ObjectID(_user._id);
         var cRoom = null;
         var rId = null;
         var users = {};
         var history = [];

        // query for messages
        var msgQwe = {};
        if (_params.fDate) {
            msgQwe.date = {
                $gt: new Date(_params.fDate.toString()),
            }
        }
        var msgOpt = {
            sort: {date: -1}
        }
        if (_params.limit) {
            msgOpt.limit = parseInt(_params.limit);
        }

         safe.series([
             function (cb) {
                 cokcore.ctx.col.chatgroups.findOne({$and: [{'users._id':  uId}, {'users._id':  mongo.ObjectID(_params.personId)}], type: 'personal'}, safe.sure(cb, function (_obj) {
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
                     cokcore.ctx.col.chatgroups.insert(insObj, safe.sure(cb, function (result) {
                         cRoom = result.ops[0];
                         cb();
                     }));
                 }));
             },
             function (cb) {
                 if (cRoom.users.length !== 2) {
                     return cb("Wrong _id 2");
                 }
                 msgQwe.rId = cRoom._id;
                 rId = cRoom._id.toString();
                 var userIds = _.pluck(cRoom.users, '_id');

                 cokcore.ctx.col.users.find({_id: {$in: userIds}}, {login: 1}).toArray(safe.sure(cb, function (_arr) {
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
                 cokcore.ctx.col.chatmessages.find(msgQwe, msgOpt).toArray(safe.sure(cb, function (_arr) {
                     _.forEachRight(_arr, function (val) {
                         var uId = val.uId.toString();
                         var msg = {
                             uId: uId,
                             login: users[uId].login,
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
                 _id: rId,
                 users: users,
                 history: history,
             };
             cb(null, data);
         }));
     }));
 };



 /**
  * chat room any count of users
  * @param _id - id of user for chat
  */
 Api.prototype.joinRoom = function (_data, cb) {
      var self = this;
      cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
          if (_.isUndefined(_params.rId)) {
              return cb ("Wrong rId");
          }
          var uId = mongo.ObjectID(_user._id);
          var rId = mongo.ObjectID(_params.rId);
          var cRoom = null;
          var users = {};

          safe.series([
              function (cb) {
                  cokcore.ctx.col.chatgroups.findOne({_id: rId, 'users._id': uId}, safe.sure(cb, function (_obj) {
                      if (! _obj) {
                          return cb(404);
                      }
                      cRoom = _obj;
                      cb();
                  }));
              },
              function (cb) {
                  var userIds = _.pluck(cRoom.users, '_id');
                  cokcore.ctx.col.users.find({_id: {$in: userIds}}, {login: 1}).toArray(safe.sure(cb, function (_arr) {
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
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
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

        cokcore.ctx.col.chatmessages.insert(insObj, safe.sure(cb, function () {
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
* a request from a browser to take a actual statuses of users
*/
Api.prototype.checkStatus = function (_data, cb) {
    var self = this;
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isUndefined(_params.rId)) {
            return cb ("wrong rId");
        }
        var rId = _params.rId.toString();
        if (! _.include(_user.rooms, rId)) {
            return cb ("chat room not found");
        }


        var cRoom = null;
        var users = {};
        safe.series([
            function (cb) {
                cokcore.ctx.col.chatgroups.findOne({_id: mongo.ObjectID(rId), "users._id": mongo.ObjectID(_user._id)}, safe.sure(cb, function (_obj) {
                    if (_obj) {
                        cRoom = _obj;
                        return cb();
                    }
                    _.pull(_user.rooms, rId);
                    cokcore.ctx.redis.set(user._id, JSON.stringify(user), safe.sure(cb, function () {
                        cb("chat room not found");
                    }));
                }));
            },
            function (cb) {
                var userIds = _.pluck(cRoom.users, '_id');
                safe.each(userIds, function(_id, cb) {
                    var id = _id.toString();
                    users[id] = {
                        _id: id,
                    }
                    self.getUserStatus(id, safe.sure(cb, function (status) {
                        users[id].status = status;
                        cb();
                    }));

                }, cb);
            },
        ], safe.sure(cb, function () {
            cb(null, users);
        }));

    }));
};

/**
* all users
*/
Api.prototype.getChatList = function (_data, cb) {
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        var groupsArr = [];
        var userIds = [];
        var userObj = {};
        safe.series([
            function (cb) {
                cokcore.ctx.col.chatgroups.find({"users._id": mongo.ObjectID(_user._id), type: 'group'}, {sort: {date: -1}}).toArray(safe.sure(cb, function (arr) {
                    _.forEach(arr, function (curentGroup) {
                        _.forEach(curentGroup.users, function (curentUser) {
                            if (! _.contains(userIds, curentUser._id)) {
                                userIds.push(curentUser._id);
                            }
                        });
                    });
                    groupsArr = arr;
                    cb();
                }));
            },
            function (cb) {
                cokcore.ctx.col.users.find({_id: {$in: userIds}}, {login: 1, email: 1}).toArray(safe.sure(cb, function (arr) {
                    _.forEach(arr, function (curentUser) {
                        userObj[curentUser._id.toString()] = curentUser;
                    });
                    cb();
                }));
            },
        ], safe.sure(cb, function () {
            _.forEach(groupsArr, function (val) {
                val.fcDate = val.cDate ? moment(val.cDate).calendar() : null;
                val.fuDate = val.uDate ? moment(val.uDate).calendar() : null;
                _.forEach(val.users, function (curentUser) {
                    var uId = curentUser._id.toString();
                    if (userObj[uId]) {
                        curentUser.login = userObj[uId].login;
                        curentUser.email = userObj[uId].email;
                    }
                });

                if (val.creator == _user._id) {
                    val.edit = true;
                }
            });
            cb(null, groupsArr);
        }));
    }));
};


Api.prototype.getEditRoom = function (_data, cb) {
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params) || ! _params.rId) {
            return cb('Room id is required');
        }
        var rId = _params.rId.toString();
        var usersIds = null;


        var result = {
            _id: _params.rId,
            users: [],
            creator: null,
            date: null,
            type: null,
            friends: [],
        };
        safe.series([
            function (cb) {
                cokcore.ctx.col.users.findOne({_id: mongo.ObjectID(_user._id)}, safe.sure(cb, function (_obj) {
                    usersIds = _.pluck(_obj.friends, '_id');
                    cb();
                }));
            },
            function (cb) {
                if (rId === '-1') {
                    return cb();
                }
                cokcore.ctx.col.chatgroups.findOne({_id: mongo.ObjectID(rId)}, safe.sure(cb, function (_obj) {
                    result = _obj;
                    usersIds.concat(_.pluck(_obj.users, '_id'));
                    cb();
                }));
            },
            function (cb) {
                cokcore.ctx.col.users.find({_id: {$in: usersIds}}, {login: 1}).toArray(safe.sure(cb, function (_arr) {
                    result.friends = _arr;
                    var usersObj = _.indexBy(_arr, '_id');
                    if (! result.users.length) {
                        return cb();
                    }
                    result.users = _.map(result.users, function (val) {
                        return usersObj[val._id.toString()];
                    });
                    cb();
                }));
            },
        ], safe.sure(cb, function () {
            cb(null, result);
        }));
    }));
};





// chatRoomEdit
Api.prototype.chatRoomEdit = function (_data, cb) {
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params) || _.isEmpty(_params.rId) || _.isEmpty(_params.uIds)) {
            return cb('Wrong data');
        }
        var roomId = _params.rId.toString();
        var userIds = _params.uIds.toString().split(',');
        var userId = mongo.ObjectID(_user._id);

        userIds = _.map(userIds, function (val) {
            return {_id: mongo.ObjectID(val)};
        });
        userIds.push({
            _id: userId,
        });
        if (roomId === '-1') {
            return Api.prototype.addRoom(userId, userIds, cb);
        }
        roomId = mongo.ObjectID(roomId);
        Api.prototype.editRoom(userId, roomId, userIds, cb);
    }));
};



Api.prototype.addRoom = function (userId, userIds, cb) {
    var newRoom = {
        users: userIds,
        creator: userId,
        cDate: new Date(),
        type: "group"
    };

    var rId = null;
    safe.series([
        function (cb) {
            cokcore.ctx.col.chatgroups.insert(newRoom, safe.sure(cb, function (_obj) {
                newRoom = _obj.ops[0];
                rId = newRoom._id.toString();
                cb();
            }));
        },
        function (cb) {
            safe.each(newRoom.users, function (_obj, cb) {
                var uId = _obj._id.toString();
                var uObj = null;
                cokcore.ctx.redis.get(uId, safe.sure(cb, function (_user) {
                    if (! _user) {
                        return cb();
                    }
                    uObj = JSON.parse(_user);
                    if (_.include(uObj.rooms, rId)) {
                        return cb();
                    }
                    uObj.rooms.push(rId);
                    cokcore.ctx.redis.set(uId, JSON.stringify(uObj), cb);
                }));
            }, cb);
        },
    ], safe.sure(cb, function () {
        cb();
    }));
};

Api.prototype.editRoom = function (userId, roomId, userIds, cb) {
    var newRoom = {
        users: userIds,
        creator: userId,
        cDate: new Date(),
        type: "group"
    };
    var oldRoom = null;
    var rId = roomId.toString();
    safe.series([
        function (cb) {
            cokcore.ctx.col.chatgroups.findOne({_id: roomId}, safe.sure(cb, function (_obj) {
                oldRoom = _obj;
                cb();
            }));
        },
        function (cb) {
            cokcore.ctx.col.chatgroups.update({_id: roomId}, {$set: {users: newRoom.users}}, cb);
        },
        function (cb) {
            var uDeleted = _.difference(oldRoom.users, newRoom.users);
            safe.each(uDeleted, function (_obj, cb) {
                var uId = _obj._id.toString();
                var uObj = null;
                cokcore.ctx.redis.get(uId, safe.sure(cb, function (_user) {
                    if (! _user) {
                        return cb();
                    }
                    uObj = JSON.parse(_user);
                    if (! _.include(uObj.rooms, rId)) {
                        return cb();
                    }
                    _.pull(uObj.rooms, rId);
                    cokcore.ctx.redis.set(uId, JSON.stringify(uObj), cb);
                }));
            }, cb);
        },
        function (cb) {
            safe.each(newRoom.users, function (_obj, cb) {
                var uId = _obj._id.toString();
                var uObj = null;
                cokcore.ctx.redis.get(uId, safe.sure(cb, function (_user) {
                    if (! _user) {
                        return cb();
                    }
                    uObj = JSON.parse(_user);
                    if (_.include(uObj.rooms, rId)) {
                        return cb();
                    }
                    uObj.rooms.push(rId);
                    cokcore.ctx.redis.set(uId, JSON.stringify(uObj), cb);
                }));
            }, cb);
        },
    ], cb);
};








































/**
* add new chat group
*/
Api.prototype.addChatRoom = function (_data, cb) {
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
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
* add new chat group
*/
Api.prototype.addChat = function (_data, cb) {
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
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
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
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
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
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
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
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
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
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
