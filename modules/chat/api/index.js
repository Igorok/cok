var safe = require('safe');
var _ = require("lodash");
var async = require('async');
var moment = require('moment');
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var dbHelper = require(__dirname + '/../helpers/db_helper.js');


exports.getMainMenu = function (_data, cb) {
    var params = _data.params[0];
    var token = params ? params.token.toString() : null;
    if (! token) {
        return cb (403);
    }
};
