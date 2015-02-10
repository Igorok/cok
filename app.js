var path = require('path');
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
var dbHelper = require('cok_db');

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

var hbs = app.engine('hbs', exphbs({
    defaultLayout: __dirname + '/modules/chat/views/layout.hbs',
    //helpers: helpers,
}));


app.set('view engine', 'hbs');
app.set('views', __dirname + '/modules/chat/views');
app.use(express.static(__dirname + '/modules/chat/public'));
app.use(errorhandler());


dbHelper.redis(function (err, _redis) {
    if (err) {
        console.trace(err);
    }
    dbHelper.db(function (err, _mongo) {
        if (err) {
            console.trace(err);
        }
        // Routes
        require('./modules/chat/routes/index.js')(app);
        require('./modules/chat/routes/socket.js')(app, io);
        // start server
        var port = (process.env.NODE_ENV == 'production') ? process.env.PORT : 3000;
        server.listen(port, function () {
            console.log('Example app listening at ', port);
        });
    });
});
