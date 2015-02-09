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


dbHelper.db(function () {
    // Routes
    require('./modules/chat/routes/index.js')(app);
    require('./modules/chat/routes/socket.js')(app, io);
    // start server
    server.listen(3000, function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log('Example app listening at http://%s:%s', host, port);
    });
});
