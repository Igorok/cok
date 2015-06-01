var fs = require('fs');
var _ = require('lodash');
var api = null;

// routes
module.exports = function (app, _api) {
    api = _api;
    app.get('/', index);
    app.get('/admin', admin);
    app.post('/jsonrpc', jsonrpc);
    app.post('/upload', upload);
};



/*
* main page
*/
function index (req, res) {
    res.render('index');
}

/*
* admin page
*/
function admin (req, res) {
    res.render('admin', {layout: false});
}

function jsonrpc (req, res) {
    /*if (! req.xhr) {
        return res.send(400);
    }*/
    var jsonrpc = req.body;
    res.header("Cache-Control", "no-cache");
    var params = jsonrpc.params;
    if (typeof params !== 'object') {
        params = JSON.parse(params);
    }
    params = {
        params: params
    };
    if (! _.isArray(params)) {
        params = [params];
    }
    var func = jsonrpc.method.match(/^(.*)\.(.*)$/);
    var module = func[1];
    func = func[2];
    if (! api[module] || ! api[module][func]) {
        console.log("not found", module, func)
        var jsonres = {jsonrpc: "2.0", id: jsonrpc.id};
        console.trace(404, module, func);
        jsonres.error = {err: 404, code:-1};
        jsonres.result = null;
//        return res.json(jsonres);
        return res.sendStatus(404);
    }
    var fn = api[module][func];
    var rf = function () {
        var jsonres = {jsonrpc: "2.0", id: jsonrpc.id};
        if (arguments[0]) {
            var err = arguments[0];
            console.trace(err, module, func);
            jsonres.error = {message: err.toString(), err: err, code:-1};
            jsonres.result = null;
        } else {
            jsonres.result = Array.prototype.slice.call(arguments, 1);
        }
        res.json(jsonres);
    };

    params.push(rf);
    fn.apply(api, params);
}

function upload(req, res) {
    var _result = {};
    if (_.isEmpty(req.files.file)) {
        _result = {
            error: {err: "The file is required", code: -1},
            result: null
        };
        res.json(_result);
    } else if (_.isEmpty(req.body.action) || _.isEmpty(req.body.token)) {
        fs.unlink(req.files.file.path, function (err) {
            if (err) {
                console.trace(err);
            }
            _result = {
                error: {err: 403, code: -1},
                result: null
            };
            res.json(_result);
        });
    } else {
        var actionArr = req.body.action.toString();
        var params = req.body;
        var data = {
            params : [
                req.body,
                req.files.file
            ]
        };
        actionArr = actionArr.split(".");
        if ((actionArr.length < 2) || ! api[actionArr[0]] || ! api[actionArr[0]][actionArr[1]]) {
            console.trace(404, actionArr);
            _result.error = {err: 404, code:-1};
            _result.result = null;
//            return res.json(_result);
            return res.sendStatus(404);
        } else {
            api[actionArr[0]][actionArr[1]].apply(api, [data, function (err, _data) {
                if (err) {
                    console.trace(err);
                    _result.error = {err: err, code: -1};
                    _result.result = null;
                } else {
                    _result.error = null;
                    _result.result = _data;
                }
                res.json(_result);
            }]);
        }
    }
}