define (["jquery", "cok_core"], function ($, cok_core) {
    function cok_controller () {};
    
    // check user login
    var checkAuth = cok_controller.prototype.checkAuth = function (cb) {
        cok_core.getUser(function (_user) {
            if (_.isEmpty(_user)) {
                window.location = "/#/login";
            } else {
                cb(_user);
            }
        });
    }
    
    // loin page
    cok_controller.prototype.login = function () {
        cok_core.getUser(function (_user) {
            if (! _.isEmpty(_user)) {
                window.location = "/";
            } else {
                cok_core.render ($("#body"), "loginIndex");
            }
        });
    }
    
    // home page
    cok_controller.prototype.homepage = function () {
        checkAuth(function (_user) {
            cok_core.render ($("#body"), "defaultIndex");
        });
    }
    
    // user index page
    cok_controller.prototype.userIndex = function () {
        checkAuth(function (_user) {
            var token = _user.token;
            cok_core.call("user.getUserList", {token: token}, function (result) {
                cok_core.render ($("#body"), "userIndex", {data: result[0]});
            });
        });
    }
    
    // user detail page
    cok_controller.prototype.userDetail = function (_id) {
        checkAuth(function (_user) {
            var token = _user.token;
            cok_core.call("user.getUserDetail", {token: token, _id: _id}, function (result) {
                cok_core.render ($("#body"), "userDetail", {data: result[0]});
            });
        });
    }
    
    return new cok_controller();
    
});