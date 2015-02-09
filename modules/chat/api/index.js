var safe = require('safe');
var _ = require("lodash");
var async = require('async');
var moment = require('moment');
var mongo = require('mongodb');
var fs = require('fs');
var BSON = mongo.BSONPure;
var dbHelper = require('cok_db');
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
        if (_.isEmpty(_params) || _.isEmpty(_params.users) || ! _.isArray(_params.users)) {
            return cb('Wrong data');
        }
        dbHelper.collection("chatgroups", safe.sure(cb, function (chatgroups) {
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
exports.editChat = function (_data, cb) {
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params) || _.isEmpty(_params._id) || _.isEmpty(_params.users) || ! _.isArray(_params.users)) {
            return cb('Wrong data');
        }
        dbHelper.collection("chatgroups", safe.sure(cb, function (chatgroups) {
            var _id = _params._id.toString();
            var userArr = [];
            if (! _.contains(_params.users, _user._id)) {
                userArr.push({_id: _user._id});
            }
            _.each(_params.users, function (val) {
                userArr.push({_id: val.toString()});
            });
            var cGroup = null;
            async.waterfall([
                function (cb) {
                    chatgroups.findOne({_id: BSON.ObjectID(_id), creator: _user._id}, safe.sure(cb, function (_cGroup) {
                        if (_.isEmpty(_cGroup)) {
                            return cb(403);
                        } else {
                            cGroup = _cGroup;
                            cb();
                        }
                    }));
                },
                function (cb) {
                    chatgroups.update({_id: BSON.ObjectID(_id)}, {$set: {users: userArr}}, safe.sure(cb, function () {
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
exports.getEditChat = function (_data, cb) {
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
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
        dbHelper.collection("chatgroups", safe.sure(cb, function (chatgroups) {
        dbHelper.collection("users", safe.sure(cb, function (users) {
            async.waterfall([
                function (cb) {
                    chatgroups.findOne({_id: BSON.ObjectID(_id), creator: cUser._id}, safe.sure(cb, function (_cGroup) {
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
                                usrObjIds.push(BSON.ObjectID(val));
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
                            chatmessages.remove({chatId: _id}, cb);
                        },
                        function (cb) {
                            chatgroups.remove({_id: BSON.ObjectID(_id)}, cb);
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
exports.leaveChat = function (_data, cb) {
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params) || _.isEmpty(_params._id)) {
            return cb('Wrong data');
        }
        var _id = _params._id.toString();
        dbHelper.collection("chatgroups", safe.sure(cb, function (chatgroups) {
            chatgroups.update({_id: BSON.ObjectID(_id), "users._id": _user._id}, {$pull: { users: {_id: _user._id}}}, {multi: true}, safe.sure(cb, function (_result) {
                cb(null, true);
            }));
        }));
    }));
};



/**
* upload pictire
*/
exports.picUpload = function (_data, cb) {
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params, _file) {
        var picExt = ["jpg", "jpeg", "png", "gif"];
        if (_.isEmpty(_params) || _.isEmpty(_file)) {
            return cb('Wrong data');
        }
        var newFileName = _user.login + Date.now() + "." + _file.extension;
        var oldPath = __dirname + '/../../../' + _file.path;
        var newPath = __dirname + '/../public/images/users/' + newFileName;
        
        if (! _.contains(picExt, _file.extension)) {
            fs.unlink(oldPath, safe.sure(cb, function () {
                cb('Wrong data');
            }));
        } else {
            async.waterfall([
                function existFile (cb) {
                    fs.exists(oldPath, function (exists) {
                        if (! exists) {
                            return cb('Wrong data');
                        } else {
                            cb();
                        }
                    });
                },
                function renameFile (cb) {
                    fs.rename(oldPath, newPath, safe.sure(cb, function () {
                        cb();
                    }));
                },
                function saveImage (cb) {
                    dbHelper.collection("images", safe.sure(cb, function (images) {
                        images.insert({userId: _user._id, created: new Date(), name: newFileName}, safe.sure(cb, function () {
                            cb();
                        }));
                    }));
                }
            ], safe.sure(cb, function () {
                cb(null, newFileName, _user, _params);
            }));
        }
    }));
};

/**
* upload main picture for user
*/
exports.mainPicUpload = function (_data, cb) {
    exports.picUpload(_data, safe.sure(cb, function (newFileName, _user, _params) {
        dbHelper.collection("users", safe.sure(cb, function (users) {
            users.update({_id: BSON.ObjectID(_user._id)}, {$set: { picture: newFileName}}, safe.sure(cb, function () {
                cb(null, true);
            }));
        }));
    }));
};


/**
* get user pictures
*/
exports.getUserPic = function (_data, cb) {
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        var ownerId;
        if (_.isEmpty(_params.ownerId)) {
        	ownerId = _user._id;
        } else {
        	ownerId = _params.ownerId.toString();
        }
        dbHelper.collection("images", safe.sure(cb, function (images) {
            images.find({userId: ownerId}).toArray(safe.sure(cb, function (_result) {
                cb(null, _result);
            }));
        }));
    }));
};


/**
* remove pictures
*/
exports.deletePic = function (_data, cb) {
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params) || _.isEmpty(_params._id)) {
            return cb('Wrong data');
        }
        var _id = _params._id;
        var userId = _user._id;
        dbHelper.collection("images", safe.sure(cb, function (images) {
            images.findOne({_id: BSON.ObjectID(_id), userId: userId}, safe.sure(cb, function (_result) {
                if (_.isEmpty(_result)) {
                    cb('Wrong data');
                } else {
                    var filePath = __dirname + '/../public/images/users/' + _result.name;
                    images.remove({_id: BSON.ObjectID(_id)}, safe.sure(cb, function () {
                        fs.unlink(filePath, safe.sure(cb, function () {
                            cb();
                        }));
                    }));
                }
            }));
        }));
    }));
};

/**
* set main picture
*/
exports.setMainPic = function (_data, cb) {
    userApi.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params) || _.isEmpty(_params._id)) {
            return cb('Wrong data');
        }
        var _id = _params._id;
        var userId = _user._id;
        dbHelper.collection("images", safe.sure(cb, function (images) {
            images.findOne({_id: BSON.ObjectID(_id), userId: userId}, safe.sure(cb, function (_result) {
                if (_.isEmpty(_result)) {
                    cb('Wrong data');
                } else {
                    dbHelper.collection("users", safe.sure(cb, function (users) {
                        users.update({_id: BSON.ObjectID(_user._id)}, {$set: { picture: _result.name}}, safe.sure(cb, function () {
                            cb();
                        }));
                    }));
                }
            }));
        }));
    }));
};