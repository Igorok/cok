define (["jquery", "cok_core"], function ($, cok_core) {
    
    // routes
    var routes = {
        default: {
            index: function () {
                checkAuth(function (_user) {
                    homepage(_user);
                });
            }
        },
        login: {
            index: login
        },
        user: {
            index: function () {
                checkAuth(function (_user) {
                    userIndex(_user);
                });
            },
            detail: function () {
                console.log("user detail");
            }
        },
        chat: {
            index: function () {
                console.log("chat index");
            },
            detail: function () {
                console.log("chat detail");
            }
        }
    };
    
    // actions
    function checkAuth (cb) {
        cok_core.getUser(function (_user) {
            if (_.isEmpty(_user)) {
                window.location = "/#/login";
            } else {
                cb(_user);
            }
        });
    }
    function login () {
        cok_core.getUser(function (_user) {
            if (! _.isEmpty(_user)) {
                window.location = "/";
            } else {
                cok_core.render ($("#body"), "loginIndex");
            }
        });
    }
    function homepage (_user) {
        cok_core.render ($("#body"), "defaultIndex");
    }
    function userIndex (_user) {
        var token = _user ? _user.token : null;
        cok_core.call("user.getUserList", {token: token}, function (result) {
            cok_core.render ($("#body"), "userIndex", {data: result[0]});
        });
    }
    
    
    
    
    
    // initialise
    cok_core.init(routes, function () {
        cok_core.router(location.hash)
    });
    $(window).bind('hashchange', function() {
        cok_core.router(location.hash);
    });
});