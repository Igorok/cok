define (["jquery", "c_core"], function ($, c_core) {
    var routes = {
        default: {
            index: homepage
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
    
    function homepage () {
        console.log("home page")
        $('body').css({"background": "green"});
        $('body').append("home page");
    }
    c_core.init(routes, function () {
        c_core.router(location.hash)
    });
    $(window).bind('hashchange', function() {
        c_core.router(location.hash);
    });
});