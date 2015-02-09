"use strict";
var fs = require("fs");
var _ = require("lodash");

function Config () {
    var confDef;
    var confLoc;
    
    if (fs.existsSync(__dirname + "/config-default.json")) {
        confDef = fs.readFileSync(__dirname + "/config-default.json");
        confDef = JSON.parse(confDef);
    } else {
        console.log("config not found");
        return null;
    }
    if (fs.existsSync(__dirname + "/config-local.json")) {
        confLoc = fs.readFileSync(__dirname + "/config-local.json");
        confLoc = JSON.parse(confLoc);
    }
    return _.merge(confDef, confLoc);
};
module.exports = new Config ();