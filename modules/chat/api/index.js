var safe = require('safe');
var _ = require("lodash");
var async = require('async');
var moment = require('moment');
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var dbHelper = require(__dirname + '/../helpers/db_helper.js');
var userApi = require(__dirname + '/user.js');



/**
* all users
*/
exports.getChatList = function (_data, cb) {
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        dbHelper.collection("chatgroups", safe.sure(cb, function (chatgroups) {
            dbHelper.collection("users", safe.sure(cb, function (users) {
                var result = [];
                var userIds = [];
                var userObj = {};
                async.series([
                    function (cb) {
                        chatgroups.find({"users._id": _user._id}, {sort: {date: -1}}).toArray(safe.sure(cb, function (groupsArr) {
                            _.each(groupsArr, function (curentGroup) {
                                _.each(curentGroup.users, function (curentUser) {
                                    if (! _.contains(userIds, BSON.ObjectID(curentUser._id))) {
                                        userIds.push(BSON.ObjectID(curentUser._id));
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
exports.addChat = function (_data, cb) {
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params) || _.isEmpty(_params.users)) {
            return cb('Wrong data');
        }
        dbHelper.collection("chatgroups", safe.sure(cb, function (chatgroups) {
            var userArr = [];
            _.each(_params.users, function (val) {
                userArr.push({_id: val.toString()});
            });
            userArr.push({_id: _user._id});
            chatgroups.insert({users: userArr, creator: _user._id, date: new Date()}, safe.sure(cb, function () {
                cb(null, true);
            }));
        }));
    }));
};

/**
* remove chat group
*/
exports.removeChat = function (_data, cb) {
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params) || _.isEmpty(_params._id)) {
            return cb('Wrong data');
        }
        var _id = _params._id.toString();
        dbHelper.collection("chatgroups", safe.sure(cb, function (chatgroups) {
            dbHelper.collection("chatmessages", safe.sure(cb, function (chatmessages) {
                chatgroups.findOne({_id: BSON.ObjectID(_id)}, safe.sure(cb, function (_group) {
                    if (_group.creator != _user._id) {
                        return cb(403);
                    }
                    async.parallel([
                        function (cb) {
                            chatmessages.remove({chatId: _id}, cb)
                        },
                        function (cb) {
                            chatgroups.remove({_id: BSON.ObjectID(_id)}, cb)
                        },
                    ], safe.sure(cb, function() {
                        cb(null, true)
                    }));
                }));
            }));
        }));
    }));
};
