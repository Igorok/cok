"use strict";
var safe = require('safe');
var _ = require("lodash");
var moment = require('moment');
var mongo = require('mongodb');
var cokcore = require('cokcore');

module.exports = function (app, io) {
    io.use(function (socket, next) {
        var emitError = function (err) {
            console.trace(err);
            return socket.emit('err', err);
        };
        /**
         * join to group between two users
         * take token, users ids and returned a room id and users with statuses
         */
        socket.on('joinPersonal', function (_obj) {
            if (_.isEmpty(_obj)) {
                return emitError(404);
            }
            var data = {
                params: []
            };
            data.params.push(_obj);
            cokcore.ctx.api.chat.joinPersonal(data, safe.sure(emitError, function (data) {
                socket.join(data._id, safe.sure(emitError, function () {
                    socket.broadcast.to(data._id).emit('freshStatus', {_id: data._id, users: data.users});
                    socket.emit('joinPersonal', {_id: data._id, users: data.users, history: data.history});
                }));
            }));
        });



        /**
         * join room
         * take token, users ids and returned a room id and users with statuses
         */
        socket.on('joinRoom', function (_obj) {
            if (_.isEmpty(_obj)) {
                return emitError(404);
            }
            var data = {
                params: []
            };
            data.params.push(_obj);
            cokcore.ctx.api.chat.joinRoom(data, safe.sure(emitError, function (data) {
                socket.join(data._id, safe.sure(emitError, function () {
                    socket.broadcast.to(data._id).emit('freshStatus', {_id: data._id, users: data.users});
                    socket.emit('joinRoom', {_id: data._id, users: data.users, history: data.history});
                }));
            }));
        });
        /**
         * chat message
         */
        socket.on('message', function (_obj) {
            if (_.isEmpty(_obj)) {
                return emitError(404);
            }
            var data = {
                params: [],
            };
            data.params.push(_obj);
            cokcore.ctx.api.chat.message(data, safe.sure(emitError, function (data) {
                socket.broadcast.to(data.rId).emit('message', {
                    msg: data.msg,
                    uId: data.uId,
                    login: data.login,
                    date: data.date,
                });
                socket.emit('message', {
                    msg: data.msg,
                    uId: data.uId,
                    login: data.login,
                    date: data.date,
                });
            }));
        });

        /**
         * check users statuses
         */
        socket.on('checkStatus', function (_obj) {
            if (_.isEmpty(_obj)) {
                return emitError(404);
            }
            var data = {
                params: [],
            };
            data.params.push(_obj);
            cokcore.ctx.api.chat.checkStatus(data, safe.sure(emitError, function (users) {
                socket.emit('freshStatus', {users: users});
            }));
        });



        next();
    });
};






























//
// module.exports = function (app, io) {
//     io.use(function (socket, next) {
//         var emitError = function (err) {
//             console.trace(err);
//             return socket.emit('err', err);
//         };
//         socket.on('joinPersonal', function (_obj) {
//             if (_.isEmpty(_obj)) {
//                 return emitError(404);
//             }
//             var data = {
//                 params: []
//             };
//             data.params.push(_obj);
//             cokcore.ctx.api.chat.joinPersonal(data, safe.sure(emitError, function (_group, _user) {
//
//
//                 console.log('_group ', _group);
//                 cr.join(_group, safe.sure(emitError, function (_room) {
//                     socket.join(_room._id, safe.sure(emitError, function () {
//                         socket.broadcast.to(_room._id).emit('joinUser', {user: _user._id});
//                         socket.emit('joinPersonal', _room);
//                     }));
//                 }));
//             }));
//         });
//
//         socket.on('message', function (_obj) {
//             var msg = null;
//             var users = null;
//             safe.series([
//                 function (cb) {
//                     cr.message(_obj, safe.sure(cb, function (_msg) {
//                         msg = _msg;
//                         cb();
//                     }));
//                 },
//                 function (cb) {
//                     cr.getRoomUsers(msg.room, safe.sure(emitError, function (_users) {
//                         users = _users;
//                         cb();
//                     }));
//                 },
//             ], safe.sure(emitError, function (argument) {
//                 socket.broadcast.to(msg.room).emit('freshUsers', users);
//                 socket.emit('freshUsers', users);
//
//                 socket.broadcast.to(msg.room).emit('message', msg);
//                 socket.emit('message', msg);
//             }));
//         });
//         next();
//     });
// };
