"use strict";
var safe = require('safe');
var _ = require("lodash");
var moment = require('moment');
var mongo = require('mongodb');
var fs = require('fs');
var cokcore = require('cokcore');

var Api = function () {
    var self = this;
};
Api.prototype.init = function (cb) {
    var self = this;
    safe.series([
        function (cb) {
            safe.parallel([
                function (cb) {
                    cokcore.collection("images", safe.sure(cb, function (coll) {
                        cb();
                    }));
                },
                function (cb) {
                    cokcore.collection("users", safe.sure(cb, function (coll) {
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
* upload pictire
*/
Api.prototype.picUpload = function (_data, cb) {
    var self = this;
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params, _file) {
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
            safe.waterfall([
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
                    cokcore.ctx.col.images.insert({userId: _user._id, dtCreated: new Date(), name: newFileName}, safe.sure(cb, function () {
                        cb();
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
Api.prototype.mainPicUpload = function (_data, cb) {
    var self = this;
    self.picUpload(_data, safe.sure(cb, function (newFileName, _user, _params) {
        cokcore.ctx.col.users.update({_id: cokcore.ObjectID(_user._id)}, {$set: { picture: newFileName}}, safe.sure(cb, function () {
            cb(null, true);
        }));
    }));
};


/**
* get user pictures
*/
Api.prototype.getUserPic = function (_data, cb) {
    var self = this;
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        var ownerId;
        if (_.isEmpty(_params.ownerId)) {
        	ownerId = _user._id;
        } else {
        	ownerId = _params.ownerId.toString();
        }
        cokcore.ctx.col.images.find({userId: ownerId}).toArray(safe.sure(cb, function (_result) {
            cb(null, _result);
        }));
    }));
};


/**
* remove pictures
*/
Api.prototype.deletePic = function (_data, cb) {
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params) || _.isEmpty(_params._id)) {
            return cb('Wrong data');
        }
        var _id = _params._id;
        var userId = _user._id;
        cokcore.ctx.col.images.findOne({_id: cokcore.ObjectID(_id), userId: userId}, safe.sure(cb, function (_result) {
            if (_.isEmpty(_result)) {
                return cb('Wrong data');
            }
            var filePath = __dirname + '/../public/images/users/' + _result.name;
            cokcore.ctx.col.images.remove({_id: cokcore.ObjectID(_id)}, safe.sure(cb, function () {
                fs.unlink(filePath, safe.sure(cb, function () {
                    cb();
                }));
            }));
        }));
    }));
};

/**
* set main picture
*/
Api.prototype.setMainPic = function (_data, cb) {
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        if (_.isEmpty(_params) || _.isEmpty(_params._id)) {
            return cb('Wrong data');
        }
        var _id = _params._id;
        var userId = _user._id;
        cokcore.ctx.col.images.findOne({_id: cokcore.ObjectID(_id), userId: userId}, safe.sure(cb, function (_result) {
            if (_.isEmpty(_result)) {
                return cb('Wrong data');
            }
            cokcore.ctx.col.users.update({_id: cokcore.ObjectID(_user._id)}, {$set: { picture: _result.name}}, safe.sure(cb, function () {
                cb();
            }));
        }));
    }));
};














 /**
  * init function
  */
 module.exports.init = function (cb) {
     var api = new Api();
     console.time('init index api');
     api.init(safe.sure(cb, function () {
         console.timeEnd('init index api');
         cb(null, api);
     }));
 };
