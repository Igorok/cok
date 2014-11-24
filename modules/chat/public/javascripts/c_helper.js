define(["jquery", "lodash", "handlebars", "tpl"], function ($, _, hbs, tpl) {
    var routes;
    
    function init (_routes, cb) {
        if (! routes) {
            routes = _routes;
        }
        cb();
    }
    function render (selector, view, data) {
        var _view = tpl[view](data);
        selector.html(_view);
    }
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
            curentAction = alias[1];
        }
        if (_.isEmpty(curentAction) || ! routes[curentController][curentAction]) {
            curentAction = "index";
        }
        routes[curentController][curentAction].apply();
    }
    return {
        init: init,
        render: render,
        router: router,
    }
});