define(["jquery", "jsonrpcclient", "storageapi", "lodash", "handlebars", "tpl"], function ($, jsonrpc, storageapi, _, hbs, tpl) {
    var routes;
    var user;
    var storage = $.localStorage;
    
    function getUser (cb) {
        if (! user) {
            user = storage.get('user');
        }
        cb(user);
    }
    
    // set vars
    function init (_routes, cb) {
        if (! routes) {
            routes = _routes;
        }
        getUser (function (user) {
            cb()
        })
    }
    
    // render views
    function render (selector, view, data) {
        var _view = tpl[view](data);
        selector.html(_view);
    }
    
    // parse hash
    function router (alias) {
        var curentController;
        var curentAction;
        alias = alias.toString().split("/");
        
        alias.shift();
        if (_.isEmpty(alias) || _.isEmpty(alias[0])) {
            curentController = "default";
            curentAction = "index";
        } else if (! _.isEmpty(alias[0]) && ! _.contains(_.keys(routes), alias[0])) {
            window.location = "/";
        } else {
            curentController = alias[0];
            if (_.isEmpty(alias[1]) || ! routes[curentController][alias[1]]) {
                curentAction = "index";
            } else {
                curentAction = alias[1];
            }
        }
        routes[curentController][curentAction].apply();
    }
    
    // ajax request
    function call () {
        if (arguments.length < 2) {
            return false;
        }
        var _method = arguments[0];
        var cb = arguments[arguments.length - 1];
        var data = Array.prototype.slice.call(arguments, 1, arguments.length - 1);
        var rpc = new $.JsonRpcClient({ ajaxUrl: '/jsonrpc' });
        rpc.call(
            _method,
            data,
            function (result) {
                cb(result);
            },
            function(error) {
                if (error.err === 403) {
                    user = null;
                    storage.remove('user');
                    window.location = "/#/login";
                }
                console.log("error ", error)
            }
        );
    }
    
    // authorise
    function authorise (data) {
        call ("user.Authorise", data, function (result) {
            if (_.isUndefined(result) || _.isUndefined(result)) {
                return false;
            } else {
                user = result[0];
                storage.set('user', result[0]);
                window.location = "/";
            }
        });
    }
    
    // shared functions
    return {
        init: init,
        render: render,
        router: router,
        call: call,
        authorise: authorise,
        getUser: getUser,
    }
});