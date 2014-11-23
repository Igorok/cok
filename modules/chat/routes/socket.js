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
