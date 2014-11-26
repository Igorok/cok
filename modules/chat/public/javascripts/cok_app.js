define (["jquery", "cok_core"], function ($, cok_core) {
    
    // routes
    var routes = {
        default: {
            index: function () {
                checkAuth(function () {
                    homepage();
                })
            }
        },
        login: {
            index: login
        },
        user: {
            index: userIndex,
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
                cb();
            }
        });
    }
    function login () {
        cok_core.render ($("#body"), "loginIndex");
    }
    function homepage () {
        cok_core.render ($("#body"), "defaultIndex");
    }
    function userIndex () {
        cok_core.call("index.getUserList", function (result) {
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