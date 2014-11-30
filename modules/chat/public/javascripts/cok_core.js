define(["jquery", "jsonrpcclient", "storageapi", "lodash", "handlebars", "tpl"], function ($, jsonrpc, storageapi, _, hbs, tpl) {
    function cok_core () {}
    var routes;
    var menu;
    var user;
    var storage = $.localStorage;
    
    // get current user
    var getUser = cok_core.prototype.getUser = function (cb) {
        if (! user) {
            user = storage.get('user');
        }
        cb(user);
    };
    
    // set vars
    cok_core.prototype.init = function (_routes, _menu, cb) {
        if (! routes) {
            routes = _routes;
        }
        if (! menu) {
            menu = _menu;
            render($('#mainMenu'), "mainMenu", {data: menu});
        }
        getUser (function (user) {
            cb();
        });
    };
    
    // logout
    var logout = cok_core.prototype.logout = function () {
        routes = null;
        menu = null;
        user = null;
        user = null;
        $('#mainMenu').empty();
        storage.remove('user');
        window.location = "/#/login";
    };
    
    // render views
    var render = cok_core.prototype.render = function (selector, view, data) {
        var _view = tpl[view](data);
        selector.html(_view);
    };
    
    // parse hash
    cok_core.prototype.router = function (alias) {
        var curentController;
        var curentAction;
        var params;
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
            if (alias.length > 2) {
                params = alias.slice(2, alias.length);
            }
        }
        routes[curentController][curentAction].apply(this, params);
    };
    
    // ajax request
    var call = cok_core.prototype.call = function () {
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
                    logout();
                }
                console.log("error ", error);
            }
        );
    };
    
    // authorise
    cok_core.prototype.authorise = function (data) {
        call ("user.Authorise", data, function (result) {
            if (_.isUndefined(result) || _.isUndefined(result)) {
                return false;
            } else {
                user = result[0];
                storage.set('user', result[0]);
                render($('#mainMenu'), "mainMenu", {data: menu});
                window.location = "#/";
            }
        });
    };
    
    // shared functions
    return new cok_core();
});