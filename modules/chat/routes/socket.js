var safe = require('safe');
var _ = require("lodash");
var async = require('async');
var moment = require('moment');
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var dbHelper = require(__dirname + '/../helpers/db_helper.js');
var userApi = require(__dirname + '/../api/user.js');



module.exports = function (app, io) {
    io.on('connection', function (socket) {
        var emitError = function (err) {
            console.trace(err);
            socket.emit('err', err);
        };

        var cUser;
        var cGroup;
        var chatId;

        /*
        * join chat group
        */
        socket.on('join', function (_formGroup) {
            if (_.isEmpty(_formGroup)) {
                return emitError(404);
            }
            var data = {
                params: []
            };
            data.params.push(_formGroup);
            async.waterfall([
                function (cb) {
                    userApi.checkAuth (data, safe.sure(cb, function (_user, _params) {
                        if (! _user || ! _params) {
                            return cb(403);
                        }
                        cUser = _user;
                        dbHelper.collection("chatgroups", safe.sure(cb, function  (chatgroups) {
                            chatgroups.findOne({_id: BSON.ObjectID(_params.chatId.toString()), "users._id" : _user._id}, safe.sure(cb, function( _group) {
                                if (! _group) {
                                    return cb(403);
                                }
                                cGroup = _group;
                                chatId = cGroup._id.toHexString();
                                cb();
                            }));
                        }));
                    }));
                },
                function (cb) {
                    var userIds = [];
                    _.each(cGroup.users, function (usr) {
                        userIds.push(BSON.ObjectID(usr._id));
                    });

                    dbHelper.collection("users", safe.sure(cb, function  (users) {
                        users.find({_id: {$in : userIds}}, {login:1, email:1}).toArray(safe.sure(cb, function( _uArr) {
                            if (! _.isEmpty(_uArr)) {
                                var uObj = {};
                                _.each(_uArr, function (usr) {
                                    uObj[usr._id] = {
                                        login: usr.login,
                                        email: usr.email
                                    };
                                });

                                _.each(cGroup.users, function (usr) {
                                    usr.login = uObj[usr._id].login;
                                    usr.email = uObj[usr._id].email;
                                });
                            }
                            socket.leaveAll();
                            cb();
                        }));
                    }));
                },
                function (cb) {
                    socket.join(chatId, cb);
                },
            ], function (err) {
                if (err) {
                    return emitError(err);
                } else {
                    console.log('join ', chatId)
                    socket.to(chatId).emit('join', {cUser: cUser, cGroup: cGroup});
                    socket.emit('join', {cUser: cUser, cGroup: cGroup});
                }
            });
        });

        /*
        * message
        */
        socket.on('message', function (_msg) {

            var msg;
            if (_.isEmpty(_msg) || _.isEmpty(_msg.chatText) || _.isEmpty(_msg.chatId)) {
                return emitError(404);
            }
            var data = {
                params: []
            };
            data.params.push(_msg);
            async.waterfall([
                function (cb) {
                    userApi.checkAuth (data, safe.sure(cb, function (_user, _params) {
                        if (! _user || ! _params) {
                            return cb(403);
                        }
                        cUser = _user;
                        msg = _params;
                        dbHelper.collection("chatgroups", safe.sure(cb, function  (chatgroups) {
                            chatgroups.findOne({_id: BSON.ObjectID(msg.chatId.toString()), "users._id" : _user._id}, safe.sure(cb, function( _group) {
                                if (! _group) {
                                    return cb(403);
                                }
                                cGroup = _group;
                                chatId = cGroup._id.toHexString();
                                cb();
                            }));
                        }));
                    }));
                },
                function (cb) {
                    dbHelper.collection("chatmessages", safe.sure(cb, function  (chatmessages) {
                        chatmessages.insert({
                            userId: cUser._id,
                            chatId: chatId,
                            chatText : msg.chatText.toString(),
                            date: Date()
                        }, cb);
                    }));
                },
            ], function (err) {
                if (err) {
                    return emitError(err);
                } else {
                    console.log('msg ' ,chatId)
                    socket.to(chatId).emit('message', {
                        userId: cUser._id,
                        login: cUser.login,
                        chatId: chatId,
                        chatText : msg.chatText.toString(),
                        date: Date()
                    });
                    socket.emit('message', {
                        userId: cUser._id,
                        login: cUser.login,
                        chatId: chatId,
                        chatText : msg.chatText.toString(),
                        date: Date()
                    });
                }
            });
        });
        // leave room
        socket.on('disconnect', function(){
            console.log('disconnect', chatId)
            socket.leave(chatId);
        });
    });
};
/*
var mongoose = require('mongoose');
var async = require('async')
var _ = require('lodash')
var redis = require("redis");
clientRedis = redis.createClient();
//model require
var UserModel = require(__dirname + '/../models/user.js');
var ChatGroupModel = require(__dirname + '/../models/chatgroup.js');
var ChatMessageModel = require(__dirname + '/../models/chatmessage.js');
var UserHelper = require(__dirname + '/../helpers/userhelper.js');
var user_helper = new UserHelper();
module.exports = function (app, io) {
    io.on('connection', function (socket)
    {
        var login = null;
        var userId = null;
        var chatRoom = null;
        socket.on('join', function (room) {
            clientRedis.hgetall(room.token.toString(), function (err, _user)
            {
                if (err) {
                    console.log('1', err);
                }
                if (! _user) {
                    socket.emit('join', false);
                } else {
                    userId = _user.id;
                    login = _user.login;
                    async.waterfall([
                        function (cb) {
                            ChatGroupModel.findOne({_id: room.group.toString(), 'users.id': userId}, cb);
                        },
                        function (group, cb) {
                            if (group) {
                                chatRoom = room.group.toString();
                                var res = {
                                    login: login,
                                    time: new Date(),
                                    data: "i,m online",
                                    permission: true,
                                }

                                socket.join(chatRoom);
                                socket.emit('join', userId);
                                socket.broadcast.to(chatRoom).emit('join', userId);
                                socket.emit('message', res);
                                socket.broadcast.to(chatRoom).emit('message', res);
                            } else {
                                socket.emit('join', false);
                            }
                            cb();
                        }
                    ], function (err) {
                        if (err) {
                            console.log('2');
                            console.log(err);
                        }
                    })
                }
            });
        });

        // message
        socket.to(chatRoom).on('message', function (msg)
        {
            clientRedis.hgetall(msg.token.toString(), function (err, _user)
            {
                if (err) {
                    console.log('3');
                    console.log(err);
                }
                if (! _user) {
                    var res = {
                        userId: _user.id,
                        login: login,
                        time: new Date(),
                        data: "sorry, it is not your chat",
                        permission: false,
                    }
                    socket.emit('message', res);
                } else {
                    async.waterfall([
                        function (cb) {
                            var newMessage = new ChatMessageModel({
                                groupId: chatRoom,
                                senderId: userId,
                                senderLogin: login,
                                message: msg.message.toString(),
                                date: new Date()
                            });
                            newMessage.save(function (err) {
                                if (err) {
                                    console.log('4');
                                    console.log(err);
                                }
                                cb();
                            });
                        }
                    ], function (err) {
                        if (err) {
                            console.log('5');
                            console.log(err)
                        }
                        var res = {
                            userId: _user.id,
                            login: login,
                            time: new Date(),
                            data: msg.message.toString(),
                            permission: true,
                        }
                        socket.emit('message', res);
                        socket.broadcast.to(chatRoom).emit('message', res);
                    });
                }
            });
        });
        // leave room
        socket.on('disconnect', function(){
            var res = {
                login: login,
                time: new Date(),
                data: "i'm offline",
                permission: true,
            }
            socket.broadcast.to(chatRoom).emit('message', res);
            socket.leave(chatRoom);
        });
    });
};
*/
