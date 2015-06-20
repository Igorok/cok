"use strict";
var safe = require('safe');
var _ = require("lodash");
var moment = require('moment');
var mongo = require('mongodb');
var cokcore = require('cokcore');

var ChatRooms = function () {
    var self = this;
    var rooms = {};
    var users = {};
    var getUserStatus = function (uDate) {
        var diff = moment().diff(moment(uDate), 'minutes');
        if (! uDate || (diff > 2)) {
            return 'off';
        } else if (diff > 1) {
            return 'suspend';
        } else {
            return 'on';
        }
    };
    var updateUser = function (uObj) {
        if (! users[uObj._id]) {
            users[uObj._id] = uObj;
        }
        // update a date of activity and a status
        if (
            (uObj.date && ! users[uObj._id].date) ||
            (
                uObj.date &&
                users[uObj._id].date &&
                (uObj.date.valueOf() > users[uObj._id].date.valueOf())
            )
        ) {
            users[uObj._id].date = uObj.date;
        }
        // update a token
        if (users[uObj._id].token !== uObj.token) {
            users[uObj._id].token = uObj.token;
        }


        users[uObj._id].status = getUserStatus(users[uObj._id].date);
    };
    var getUser = function (uId) {
        if (! users[uId]) {
            return null;
        }
        return {
            _id: users[uId]._id,
            login: users[uId].login,
            status: getUserStatus(users[uId].date),
        };
    };

    /**
     * join to chat room
     */
    var join = function (_room, _user, cb) {
        var rId = _room._id.toString();
        if (! rooms[rId]) {
            // for understanding structure of a room
            rooms[rId] = {
                _id: rId,
                admin: _room.admin,
                users: {},
                type: _room.type,
            };
        }
        _.forOwn(_room.uObj, function (val) {
            val._id = val._id.toString();
            updateUser(val);
            rooms[rId].users[val._id] = getUser(val._id);
        });
        var pub = {
            _id: rooms[rId]._id.toString(),
            users: rooms[rId].users,
        };
        cb(null, pub);
    };

    /**
     * message,
     * i don't want to check token into the db every time
     */
    var message = function (msg, cb) {
        if (! rooms[msg.room]) {
            return cb(404);
        }

        if (
            ! rooms[msg.room].users[msg.user._id] ||
            (users[msg.user._id].token !== msg.user.token)
        ) {
            return cb(403);
        }
        if (_.isEmpty(msg.message)) {
            return false;
        }

        delete msg.user.token;
        msg.date = new Date();
        users[msg.user._id].date = msg.date;
        cb(null, msg);
    };







    self.join = join;
    self.message = message;
    self.getRoomUsers = function (_rId, cb) {
        if (! _rId || ! rooms[_rId]) {
            return cb(404);
        }
        _.forOwn(rooms[_rId].users, function (val, key) {
            rooms[_rId].users[key] = getUser(key);
        });
        return cb(null, rooms[_rId].users);
    };
};

var cr = new ChatRooms();















module.exports = function (app, io) {
    io.use(function (socket, next) {
        var emitError = function (err) {
            console.trace(err);
            return socket.emit('err', err);
        };
        socket.on('joinPersonal', function (_obj) {
            if (_.isEmpty(_obj)) {
                return emitError(404);
            }
            var data = {
                params: []
            };
            data.params.push(_obj);
            cokcore.ctx.api["chat"].joinPersonal(data, safe.sure(emitError, function (_group, _user) {
                cr.join(_group, _user, safe.sure(emitError, function (_room) {
                    socket.join(_room._id, safe.sure(emitError, function () {
                        socket.broadcast.to(_room._id).emit('joinUser', {user: _user._id.toString()});
                        socket.emit('joinPersonal', _room);
                    }));
                }));
            }));
        });

        socket.on('message', function (_obj) {
            var msg = null;
            var users = null;
            safe.series([
                function (cb) {
                    cr.message(_obj, safe.sure(cb, function (_msg) {
                        msg = _msg;
                        cb();
                    }));
                },
                function (cb) {
                    cr.getRoomUsers(msg.room, safe.sure(emitError, function (_users) {
                        users = _users;
                        cb();
                    }));
                },
            ], safe.sure(emitError, function (argument) {
                socket.broadcast.to(msg.room).emit('freshUsers', users);
                socket.emit('freshUsers', users);

                socket.broadcast.to(msg.room).emit('message', msg);
                socket.emit('message', msg);
            }));
        });
        next();
    });







};
