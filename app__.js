// create server
var express = require('express');
var http = require('http');
var safe = require('safe');
var compression = require('compression');
var errorhandler = require('errorhandler');
var bodyParser = require('body-parser');
var multer = require('multer');
var exphbs = require('express-handlebars');
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






var cokCore = require('cokcore');
var cfg = cokCore.init(__dirname + '/config');
dbHelper = cokCore.db;

var api = null;
safe.series([
    function (cb) {
        dbHelper.db(cb);
    },
    function (cb) {
        cokCore.mInit(__dirname + '/modules/web/api', safe.sure(cb, function (_api) {
            api = _api;
            cb();
        }));
    },
], function (err) {
    if (err) {
        console.trace(err);
        process.exit();
    }
    // Routes
    require('./modules/web/routes/index.js')(app, api);
    require('./modules/web/routes/socket.js')(app, io, api);
    // start server
    var port = process.env.PORT || 3000;
    server.listen(port, function () {
        console.log('Web listening at ', port);
    });
});
