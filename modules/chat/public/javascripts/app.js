define (["jquery", "c_helper"], function ($, c_helper) {
    var routes = {
        default: {
            index: function () {
                console.log("home")
            }
        },
        user: {
            index: function () {
                console.log("user index")
            },
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
    
    c_helper.init(routes, function () {
        c_helper.router(location.hash)
    });
    $(window).bind('hashchange', function() {
        c_helper.router(location.hash);
    });
});