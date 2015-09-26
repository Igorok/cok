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
            console.log('joinPersonal');
            if (_.isEmpty(_obj)) {
                return emitError(404);
            }
            var data = {
                params: []
            };
            data.params.push(_obj);
            cokcore.ctx.api.chat.joinPersonal(data, safe.sure(emitError, function (data) {
                if(socket.rooms.indexOf(data._id) >= 0) {
                    socket.to(data._id).emit('freshStatus', {_id: data._id, users: data.users});
                    socket.emit('joinPersonal', {_id: data._id, users: data.users, history: data.history});
                } else {
                    socket.join(data._id, safe.sure(emitError, function () {
                        socket.to(data._id).emit('freshStatus', {_id: data._id, users: data.users});
                        socket.emit('joinPersonal', {_id: data._id, users: data.users, history: data.history});
                    }));
                }
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
                if(socket.rooms.indexOf(data._id) >= 0) {
                    socket.to(data._id).emit('freshStatus', {_id: data._id, users: data.users});
                    socket.emit('joinRoom', {_id: data._id, users: data.users, history: data.history});
                } else {
                    socket.join(data._id, safe.sure(emitError, function () {
                        socket.to(data._id).emit('freshStatus', {_id: data._id, users: data.users});
                        socket.emit('joinRoom', {_id: data._id, users: data.users, history: data.history});
                    }));
                }

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
                socket.to(data.rId).emit('message', {
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


        // leave room
        socket.on('disconnect', function() {
            console.log('disconnect')
            socket.leaveAll();
        });
        next();
    });
};
