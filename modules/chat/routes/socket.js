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
        console.log('connection')
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
            socket.leaveAll();
            console.log('join')
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
                        if (! _user || ! _params || ! _params.chatId) {
                            return cb(403);
                        }
                        cUser = _user;
                        chatId = _params.chatId.toString();
                        cb();
                    }));
                },
                function (cb) {
                    dbHelper.collection("chatgroups", safe.sure(cb, function  (chatgroups) {
                        chatgroups.findOne({_id: BSON.ObjectID(chatId), "users._id" : cUser._id}, safe.sure(cb, function( _group) {
                            if (! _group) {
                                return cb(403);
                            }
                            cGroup = _group;
                            cb();
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
                    socket.broadcast.to(chatId).emit('join', {cUser: cUser, cGroup: cGroup});
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
                    socket.broadcast.to(chatId).emit('message', {
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
            socket.leaveAll();
        });
    });
};
