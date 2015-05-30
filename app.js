// create server
var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var compression = require('compression');
var errorhandler = require('errorhandler');
var bodyParser = require('body-parser');
var multer = require('multer');
var exphbs = require('express-handlebars');
var lessMiddleware = require('less-middleware');

// Configuration
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({ dest: './tmp/'}));
app.use(lessMiddleware(__dirname + '/modules/chat/less', {
    dest: __dirname + '/modules/chat/public',
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
app.set('views', __dirname + '/modules/chat/views');

app.use(express.static(__dirname + '/modules/chat/public'));
app.use(errorhandler());






var cokCore = require('cokcore');
var cfg = cokCore.init(__dirname + '/config');
dbHelper = cokCore.db;





dbHelper.db(function (err, _mongo) {
    if (err) {
        console.trace(err);
    }
    cokCore.mInit(__dirname + '/modules/chat/api', function (err, _api) {
        if (err) {
            console.trace(err);
            process.exit();
        }
        _api['user'].getUserList(null, function(err, arr) {
            console.log('arr', arr);
            process.exit();
        });
    });
});
















//
// dbHelper.redis(function (err, _redis) {
//     if (err) {
//         console.trace(err);
//     }
//     dbHelper.db(function (err, _mongo) {
//         if (err) {
//             console.trace(err);
//         }
//         // Routes
//         require('./modules/chat/routes/index.js')(app);
//         require('./modules/chat/routes/socket.js')(app, io);
//         // start server
//         var port = process.env.PORT || 3000;
//         server.listen(port, function () {
//             console.log('Example app listening at ', port);
//         });
//     });
// });
