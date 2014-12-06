var _ = require('lodash');
var api = {
    "index": require(__dirname + '/../api/index.js'),
    "user": require(__dirname + '/../api/user.js'),
};

// routes
module.exports = function (app) {
    app.get('/', index);
    app.post('/jsonrpc', jsonrpc);
};



// actions
function index (req, res) {
    res.render('index');
}

function jsonrpc (req, res) {
    if (! req.xhr) {
        return res.send(400);
    }
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
        return res.json(jsonres);
    }
    var fn = api[module][func];
    var rf = function () {
        var jsonres = {jsonrpc: "2.0", id: jsonrpc.id};
        if (arguments[0]) {
            var err = arguments[0];
            console.trace(err, module, func);
            jsonres.error = {err: err, code:-1};
            jsonres.result = null;
        } else {
            jsonres.result = Array.prototype.slice.call(arguments, 1);
        }
        res.json(jsonres);
    };

    params.push(rf);
    fn.apply(api, params);
}
