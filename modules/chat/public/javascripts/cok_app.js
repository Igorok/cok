define (["jquery", "cok_core", "cok_controller"], function ($, cok_core, cok_controller) {
    // routes
    var routes = {
        default: {
            index: cok_controller.homepage
        },
        login: {
            index: cok_controller.login
        },
        user: {
            index: cok_controller.userIndex,
            detail: cok_controller.userDetail,
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
    
    // main menu for app
    var menu = [
        {
            title: "home",
            hash: "#/",
        },
        {
            title: "user list",
            hash: "#/user/index",
        },
        {
            title: "chat list",
            hash: "#/chat/index",
        },
    ];
    
    // initialise
    cok_core.init(routes, menu, function () {
        cok_core.router(location.hash);
    });
    $(window).bind('hashchange', function() {
        cok_core.router(location.hash);
    });
});