define (["jquery", "cok_core", "cok_controller"], function ($, cok_core, cok_controller) {
    // routes
    var routes = {
        default: {
            index: cok_controller.homepage
        },
        login: {
            index: cok_controller.login
        },
        logout: {
            index: cok_controller.logout
        },
        user: {
            index: cok_controller.userIndex,
            detail: cok_controller.userDetail,
            friends: cok_controller.userFriends,
        },
        chat: {
            index: cok_controller.chatIndex,
            create: cok_controller.chatCreate,
            detail: function () {
                console.log("chat detail");
            }
        }
    };

    // initialise
    cok_core.init(routes);
    cok_core.router(location.hash);
    $(window).bind('hashchange', function() {
        cok_core.router(location.hash);
    });
});
