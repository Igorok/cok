var safe = require('safe');
var _ = require("lodash");
var async = require('async');
var moment = require('moment');
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var GridStore = mongo.GridStore;
var path = require('path');
var redis = require("redis");
clientRedis = redis.createClient();
var dbHelper = require(__dirname + '/../helpers/db_helper.js');


exports.getUserList = function (cb) {
    dbHelper.collection("users", safe.sure(cb, function (users) {
        users.find().toArray(cb);
    }));
};
