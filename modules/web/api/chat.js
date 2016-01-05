"use strict";
var safe = require('safe');
var _ = require("lodash");
var moment = require('moment');
var cokcore = require('cokcore');

var Api = function () {
    var self = this;
    self.api = {};
    // private function, only for api
    self.getUserStatus = function (_user) {
        if (! _user || ! _user.dtActive) {
            return 'off';
        }
        var diff = moment().diff(moment(_user.dtActive), 'minutes');
        if (diff > 30) {
            return 'off';
        } else if (diff > 15) {
            return 'absent';
        } else {
            return 'on';
        }
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
         var uId = cokcore.ObjectID(_user._id);
         var cRoom = null;
         var rId = null;
         var users = {};
         var history = [];

        // query for messages
        var msgQwe = {};
        if (_params.fDate) {
            msgQwe.date = {
                $gt: new Date(parseInt(_params.fDate) * 1000 + 1000),
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
                 var q = {
                     $and: [
                         {'users._id':  uId},
                         {'users._id':  cokcore.ObjectID(_params.personId)}
                     ],
                     type: 'personal',
                 };
                 cokcore.ctx.col.chatgroups.findOne(q, safe.sure(cb, function (_obj) {
                     if (_obj) {
                         cRoom = _obj;
                         return cb();
                     }

                     var insObj = {
                         users:[
                             {_id: uId},
                             {_id: cokcore.ObjectID(_params.personId)},
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

                 cokcore.ctx.col.users.find({_id: {$in: userIds}}, {login: 1, dtActive: 1}).toArray(safe.sure(cb, function (_arr) {
                     _.forEach(_arr, function (_usr) {
                         var id = _usr._id.toString();
                         users[id] = {
                             _id: id,
                             login: _usr.login,
                             status:  self.getUserStatus(_usr),
                         }
                     });
                     cb();
                 }));
             },
             function (cb) {
                 cokcore.ctx.col.chatmessages.find(msgQwe, msgOpt).toArray(safe.sure(cb, function (_arr) {
                     if (! _arr || ! _arr.length) {
                         return cb();
                     }
                     _.forEachRight(_arr, function (val) {
                         var uId = val.uId.toString();
                         var msg = {
                             uId: uId,
                             login: users[uId].login,
                             msg: val.msg,
                             date: moment(val.date).calendar(),
                             dt: Math.round(val.date.valueOf() / 1000),
                             rId: rId,
                         };
                         history.push(msg);
                     });
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
 * personal chat only for 2 users
 * @param _params.rId - id of chat room
 * @param _params.limit - limit of messages
 * @param _params.fDate - date for start messages find
 */
Api.prototype.joinRoom = function (_data, cb) {
    var self = this;
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isUndefined(_params.rId)) {
            return cb ("Wrong rId");
        }
        var uId = cokcore.ObjectID(_user._id);
        var rId = cokcore.ObjectID(_params.rId);
        var cRoom = null;
        var users = {};
        var history = [];

        // query for messages
        var msgQwe = {};
        if (_params.fDate) {
            msgQwe.date = {
                $gt: new Date(parseInt(_params.fDate) * 1000 + 1000),
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
                cokcore.ctx.col.chatgroups.findOne({_id: rId, 'users._id': uId}, safe.sure(cb, function (_obj) {
                    if (! _obj) {
                        return cb("chat room not found");
                    }
                    cRoom = _obj;
                    msgQwe.rId = _obj._id;
                    cb();
                }));
            },
            function (cb) {
                var userIds = _.pluck(cRoom.users, '_id');
                cokcore.ctx.col.users.find({_id: {$in: userIds}}, {login: 1, dtActive: 1}).toArray(safe.sure(cb, function (_arr) {
                    _.forEach(_arr, function(_usr) {
                        var id = _usr._id.toString();
                        users[id] = {
                            _id: id,
                            login: _usr.login,
                            status: self.getUserStatus(_usr),
                        };
                    });
                    cb();
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
                            dt: Math.round(val.date.valueOf() / 1000),
                            rId: rId,
                        };
                        history.push(msg);
                    });
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
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isUndefined(_params.rId)) {
            return cb ("wrong rId");
        }
        var insObj = {
            uId: cokcore.ObjectID(_user._id),
            rId: cokcore.ObjectID(_params.rId),
            msg: _.escape(_params.message),
            date: new Date()
        };
        var groupQuery = {
            _id: cokcore.ObjectID(_params.rId),
            "users._id": cokcore.ObjectID(_user._id)
        };

        cokcore.ctx.col.chatgroups.findOne(groupQuery, safe.sure(cb, function (_obj) {
            if (! _obj) {
                return cb("chat room not found");
            }

            cokcore.ctx.col.chatmessages.insert(insObj, safe.sure(cb, function () {
                cb(null, {
                    uId: _user._id,
                    login: _user.login,
                    rId: _params.rId,
                    msg: insObj.msg,
                    date: moment(insObj.date).calendar(),
                    dt: Math.round(insObj.date.valueOf() / 1000),
                });
            }));
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
        var cRoom = null;
        var users = {};
        var query = {
            _id: cokcore.ObjectID(rId),
            "users._id": cokcore.ObjectID(_user._id),
        };
        safe.series([
            function (cb) {
                cokcore.ctx.col.chatgroups.findOne(query, safe.sure(cb, function (_obj) {
                    if (! _obj) {
                        cb("chat room not found");
                    }
                    cRoom = _obj;
                    cb();
                }));
            },
            function (cb) {
                var userIds = _.pluck(cRoom.users, '_id');
                cokcore.ctx.col.users.find({_id: {$in: userIds}}, {dtActive: 1}).toArray(safe.sure(cb, function (_arr) {
                    _.forEach(_arr, function (_usr) {
                        var id = _usr._id.toString();
                        users[id] = {
                            _id: id,
                            status: self.getUserStatus(_usr),
                        }
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
* all users
*/
Api.prototype.getChatList = function (_data, cb) {
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        var groupsArr = [];
        var userIds = [];
        var userObj = {};
        safe.series([
            function (cb) {
                cokcore.ctx.col.chatgroups.find({"users._id": cokcore.ObjectID(_user._id), type: 'group'}, {sort: {date: -1}}).toArray(safe.sure(cb, function (arr) {
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
                cokcore.ctx.col.users.findOne({_id: cokcore.ObjectID(_user._id)}, safe.sure(cb, function (_obj) {
                    usersIds = _.pluck(_obj.friends, '_id');
                    cb();
                }));
            },
            function (cb) {
                if (rId === '-1') {
                    return cb();
                }
                cokcore.ctx.col.chatgroups.findOne({_id: cokcore.ObjectID(rId)}, safe.sure(cb, function (_obj) {
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
        var userId = cokcore.ObjectID(_user._id);

        userIds = _.map(userIds, function (val) {
            return {_id: cokcore.ObjectID(val)};
        });
        userIds.push({
            _id: userId,
        });
        if (roomId === '-1') {
            return Api.prototype.addRoom(userId, userIds, cb);
        }
        roomId = cokcore.ObjectID(roomId);
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
    cokcore.ctx.col.chatgroups.insert(newRoom, safe.sure(cb, function (_obj) {
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
    ], cb);
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
