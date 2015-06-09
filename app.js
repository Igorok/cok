// create server
var express = require('express');
var http = require('http');
var safe = require('safe');
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






var fs = require('fs');
var path = require('path');



var moduleInit = function (_path, cb) {
    var checkExist = new Promise(function (_res, _rej) {
        console.log(_path);
        fs.exists(_path, function (exists) {
            if (! exists) {
                return _rej(new Error ('Module not found'));
            }
            _res(1);
        });
    }).catch(function (e) {
        console.trace('e ', e);
    });
    var readStat = new Promise(function (_res, _rej) {
        fs.lstat(_path, function (err, stat) {
            if (err) {
                return _rej(err);
            }
            _res(stat);
        });
    }).catch(function (e) {
        console.trace('e ', e);
    });
    var readStat = new Promise(function (_res, _rej) {
        fs.lstat(_path, function (err, stat) {
            if (err) {
                return _rej(err);
            }
            _res(stat);
        });
    }).catch(function (e) {
        console.trace('e ', e);
    });

    var readDir = new Promise(function (_res, _rej) {
        fs.readdir(_path, function (err, stat) {
            if (err) {
                return _rej(err);
            }
            _res(stat);
        });
    }).catch(function (e) {
        console.trace('e ', e);
    });




















    /*
    Promise.prototype.thenReturn = function(value) {
        return this.then(function() {
            return value;
        });
    };

    function readFile(index) {
        return new Promise(function(resolve) {
            setTimeout(function() {
                console.log("Read file number " + (index +1));
                resolve();
            }, 500);
        });
    }
    // The loop initialization
    var len = 10;
    Promise.resolve(0).then(function loop(i) {
        // The loop check
        if (i < len) {              // The post iteration increment
            return readFile(i).thenReturn(i + 1).then(loop);
        }
    }).then(function() {
        console.log("done");
    }).catch(function(e) {
        console.log("error", e);
    });
    */
















    var fileObj = {};
    var readFile = function (val) {
        return new Promise(function (resolve, reject) {
            fs.readFile(_path + '/' + val, function (err, data) {
              if (err) {
                  reject(err);
              }
              var key = val.replace('.js', '');
              fileObj[key] = data;
              resolve();
            });
        });
    };

    var myLoop = function (_arr, _pr, cb) {
        Promise.resolve(0).then(function loop (i) {
            if (i < _arr.length) {
                return _pr(_arr[i]).then(function () {
                    return ++i;
                }).then(loop);
            }
        }).then(function() {
            console.log("done");
            cb();
        }).catch(function(e) {
            console.log("error", e);
        }); ;
    }

    checkExist.then(function (val) {
        console.log(val);
        return readStat;
    }).then(function (_stat) {
        console.log('_stat ', _stat.isFile());
        if (_stat.isFile()) {
            return 'file';
        } else {
            return readDir;
        }
    }).then(function (_file) {
        console.log('_file ', _file);
        myLoop(_file, readFile, function () {
            console.log(fileObj);
        });
    });


    // fs.readFile('/etc/passwd', function (err, data) {
    //     if (err) throw err;
    //     console.log(data);
    // });
    // fs.exists(_path, function (exists) {
    //     if (! exists) {
    //         return cb(new Error ('Module not found'));
    //     }
    //     fs.lstat(_path, safe.sure(cb, function (stat) {
    //         if (stat.isFile()) {
    //             moduleSingleInit(_path, cb);
    //         } else {
    //             fs.readdir(_path, safe.sure(cb, function (arr) {
    //                 safe.forEachSeries(arr, function (_file, cb) {
    //                     moduleSingleInit(_path + '/' + _file, cb);
    //                 }, safe.sure(cb, function () {
    //                     cb(null, apiArr);
    //                 }));
    //             }));
    //         }
    //     }));
    // });
};

var apiFolder = __dirname + "/modules/web/api";
console.log('init');
moduleInit(apiFolder, function (err, _arr) {
    console.log(_arr)
});


//
//
// var cokCore = require('cokcore');
// var cfg = cokCore.init(__dirname + '/config');
// dbHelper = cokCore.db;
//
// var api = null;
// safe.series([
//     function (cb) {
//         dbHelper.db(cb);
//     },
//     function (cb) {
//         cokCore.mInit(__dirname + '/modules/web/api', safe.sure(cb, function (_api) {
//             api = _api;
//             cb();
//         }));
//     },
// ], function (err) {
//     if (err) {
//         console.trace(err);
//         process.exit();
//     }
//     // Routes
//     require('./modules/web/routes/index.js')(app, api);
//     require('./modules/web/routes/socket.js')(app, io, api);
//     // start server
//     var port = process.env.PORT || 3000;
//     server.listen(port, function () {
//         console.log('Web listening at ', port);
//     });
// });
