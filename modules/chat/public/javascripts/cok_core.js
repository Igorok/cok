define(["jquery", "jsonrpcclient", "storageapi", "lodash", "handlebars", "tpl"], function ($, jsonrpc, storageapi, _, hbs, tpl) {
    function cok_core () {}
    var routes;
    var menu;
    var user;
    var storage = $.localStorage;
    // get current user
    var getUser = cok_core.prototype.getUser = function () {
        if (! user) {
            user = storage.get('user');
        }
        return user;
    };

    cok_core.prototype.setUser = function (_user, cb) {
        if (_user) {
            storage.set('user', _user);
            user = _user
        }
        cb();
    };
    cok_core.prototype.removeUser = function (_user) {
        user = storage.remove('user');
    };
    
    // set vars
    cok_core.prototype.init = function (_routes, cb) {
        if (! routes) {
            routes = _routes;
        }
        getUser();
    };
    

    
    // render views
    var render = cok_core.prototype.render = function (selector, view, data) {
        /*var _view = tpl[view](data);
        selector.html(_view);*/
        var _view = tpl[view](data);
        return selector.html(_view);
    };

    var systemMessage = cok_core.prototype.systemMessage = function (selector, event, message) {
        if (! selector.length) {
            selector = $('#body');
        }
        render(selector, 'systemMessage', {event: event, message: message})
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
            routes[curentController][curentAction].apply(this, params);
        } else if (! _.isEmpty(alias[0]) && ! _.contains(_.keys(routes), alias[0])) {
            window.location = "#!/";
        } else if (_.isEmpty(alias[1]) || ! routes[alias[0]][alias[1]]) {
            window.location = "#!/" + alias[0] + "/index";
        } else {
            curentController = alias[0];
            curentAction = alias[1];
            if (alias.length > 2) {
                params = alias.slice(2, alias.length);
            }
            routes[curentController][curentAction].apply(this, params);
        }
    };
    
    // ajax request
    cok_core.prototype.call = function () {
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
                    window.location = "#!/logout";
                } else if (error.err === 404) {
                    window.location = "#!/";
                }

                var msg = error.err ? error.err : error;
                systemMessage($('#body'), 'danger', msg);
                console.log("error ", error);
            }
        );
    };
    

    
    // shared functions
    return new cok_core();
});
