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
            chatgroups.find().toArray(cb);
        }));
    }));
};
