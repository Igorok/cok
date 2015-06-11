"use strict";
// create server
var express = require('express');
var http = require('http');
var compression = require('compression');
var errorhandler = require('errorhandler');
var bodyParser = require('body-parser');
var multer = require('multer');
var lessMiddleware = require('less-middleware');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// Configuration
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({ dest: './tmp/'}));
app.use(lessMiddleware(__dirname + '/modules/web/less', {
    dest: __dirname + '/modules/web/public',
    preprocess: {
        path: function(pathname, req) {
            return pathname.replace('/stylesheets/', '/');
        }
    }
}));

var dust = require('dustjs-linkedin');
var cons = require('consolidate');
app.engine('dust', cons.dust);
app.set('view engine', 'dust');
app.set('views', __dirname + '/modules/web/views');

app.use(express.static(__dirname + '/modules/web/public'));
app.use(errorhandler());

var cokcore = require('cokcore');

new Promise(function (resolve, reject) {
    cokcore.init(__dirname + '/config', function (err, cfg) {
        if (err) {
            return reject(err);
        }
        resolve();
    });
}).then(function () {
    return new Promise(function (resolve, reject) {
        cokcore.db(function (err, val) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}).then(function () {
    return new Promise(function (resolve, reject) {
        cokcore.apiLoad(__dirname + '/modules/web/api', function (err, val) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}).then(function () {
    // Routes
    require('./modules/web/routes/index.js')(app);
    require('./modules/web/routes/socket.js')(app, io);
    // start server
    var port = process.env.PORT || 3000;
    server.listen(port, function () {
        console.log('Web listening at ', port);
    });
}).catch(function (e) {
    console.trace(e);
    process.exit();
});
