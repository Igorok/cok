"use strict";
var fs = require('fs');
var _ = require('lodash');
var cokcore = require('cokcore');
var multer = require('multer');
var multerUp = multer({
    dest: './tmp/'
});

// routes
module.exports = function (app) {
    app.get('/', chat);
    app.get('/admin', admin);
    app.post('/jsonrpc', jsonrpc);
    app.post('/upload', multerUp.single('upload'), upload);
    //The 404 Route (ALWAYS Keep this as the last route)
    app.get('*', function (req, res, next) {
        res.status(404).render('404', {layout: false});
    });
};



/*
* chat page
*/
function chat (req, res) {
    res.render('chat', {layout: false});
}

/*
* admin page
*/
function admin (req, res, next) {
    res.render('admin', {layout: false});
}

function jsonrpc (req, res, next) {
    let jsonrpc = req.body;
    res.header("Cache-Control", "no-cache");
    let params = jsonrpc.params;
    if (typeof params !== 'object') {
        params = JSON.parse(params);
    }
    params = {
        params: params
    };
    if (! _.isArray(params)) {
        params = [params];
    }
    let func = jsonrpc.method.match(/^(.*)\.(.*)$/);
    let module = func[1];
    func = func[2];
    if (! cokcore.ctx.api[module] || ! cokcore.ctx.api[module][func]) {
        console.trace(404, module, func);
        return res.status(404).send({err: 404});
    }
    let fn = cokcore.ctx.api[module][func];
    let rf = function () {
        let jsonres = {jsonrpc: "2.0", id: jsonrpc.id};
        if (arguments[0]) {
            let err = arguments[0];
            console.trace(err, module, func);
            jsonres.error = {message: err.toString(), err: err, code:-1};
            jsonres.result = null;
        } else {
            jsonres.result = Array.prototype.slice.call(arguments, 1);
        }
        res.send(jsonres);
    };

    params.push(rf);
    fn.apply(cokcore.ctx.api, params);
}

function upload(req, res, next) {
    let _result = {};
    if (_.isEmpty(req.files.file)) {
        res.status(400).send({err: "The file is required"});
    } else if (_.isEmpty(req.body.action) || _.isEmpty(req.body.token)) {
        fs.unlink(req.files.file.path, function (err) {
            if (err) {
                console.trace(err);
            }
            res.status(403).send({err: 403});
        });
    } else {
        let actionArr = req.body.action.toString();
        let params = req.body;
        let data = {
            params : [
                req.body,
                req.files.file
            ]
        };
        actionArr = actionArr.split(".");
        if ((actionArr.length < 2) || ! cokcore.ctx.api[actionArr[0]] || ! cokcore.ctx.api[actionArr[0]][actionArr[1]]) {
            console.trace(404, actionArr);
            res.status(404).send({err: 404});
        } else {
            cokcore.ctx.api[actionArr[0]][actionArr[1]].apply(cokcore.ctx.api, [data, function (err, _data) {
                if (err) {
                    console.trace(err);
                    return res.status(500).send({err: err});
                }
                _result.result = _data;
                res.send(_result);
            }]);
        }
    }
}
