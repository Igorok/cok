var safe = require('safe');
var _ = require("lodash");
var async = require('async');
var moment = require('moment');
var mongo = require('mongodb');
var dbHelper = require('cok_db');
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
            var cHistory;
            async.waterfall([
                function getAuth (cb) {
                    userApi.checkAuth (data, safe.sure(cb, function (_user, _params) {
                        if (! _user || ! _params || ! _params.chatId) {
                            return cb(403);
                        }
                        cUser = _user;
                        chatId = _params.chatId.toString();
                        cb();
                    }));
                },
                function getGroup (cb) {
                    dbHelper.collection("chatgroups", safe.sure(cb, function  (chatgroups) {
                        chatgroups.findOne({_id: mongo.ObjectID(chatId), "users._id" : cUser._id}, safe.sure(cb, function( _group) {
                            if (! _group) {
                                return cb(403);
                            }
                            cGroup = _group;
                            cb();
                        }));
                    }));
                },
                function getHistory (cb) {
                    dbHelper.collection("chatmessages", safe.sure(cb, function  (chatmessages) {
                        chatmessages.find({chatId: chatId}, {userId: 1, chatText: 1, date: 1}, {sort: {date: 1}, limit: 100}).toArray(safe.sure(cb, function(_history) {
                            cHistory = _history;
                            cb();
                        }));
                    }));
                },
                function getUsers (cb) {
                    var userIds = [];
                    _.each(cGroup.users, function (usr) {
                        userIds.push(mongo.ObjectID(usr._id));
                    });
                    _.each(cHistory, function (cH) {
                        if (! _.contains(userIds, mongo.ObjectID(cH.userId))) {
                            userIds.push(mongo.ObjectID(cH.userId));
                        }
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

                                _.each(cHistory, function (cH) {
                                    cH.login = uObj[cH.userId].login;
                                    cH.email = uObj[cH.userId].email;
                                    cH.fDate = moment(cH.date).format('DD/MM/YYYY HH:mm');
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
                    socket.emit('join', {cUser: cUser, cGroup: cGroup, cHistory: cHistory});
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
                            chatgroups.findOne({_id: mongo.ObjectID(msg.chatId.toString()), "users._id" : _user._id}, safe.sure(cb, function( _group) {
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
                            date: new Date()
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
                        date: Date(),
                        fDate: moment().format('DD/MM/YYYY HH:mm')
                    });
                    socket.emit('message', {
                        userId: cUser._id,
                        login: cUser.login,
                        chatId: chatId,
                        chatText : msg.chatText.toString(),
                        date: Date(),
                        fDate: moment().format('DD/MM/YYYY HH:mm')
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
