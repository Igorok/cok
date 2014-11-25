define (["jquery", "cok_core"], function ($, cok_core) {
    var routes = {
        default: {
            index: homepage
        },
        user: {
            index: userIndex,
            detail: function () {
                console.log("user detail")
            }
        },
        chat: {
            index: function () {
                console.log("chat index")
            },
            detail: function () {
                console.log("chat detail")
            }
        }
    };
    
    function homepage () {
        console.log("home page")
    }
    function userIndex () {
        cok_core.call("index.getUserList", function (result) {
            cok_core.render ($("#body"), "userList", {data: result[0]});
        });
    }
    cok_core.init(routes, function () {
        cok_core.router(location.hash)
    });
    $(window).bind('hashchange', function() {
        cok_core.router(location.hash);
    });
});