define (["jquery", "cok_core", "cok_controller"], function ($, cok_core, cok_controller) {

    // routes
    var routes = {
        default: {
            index: cok_controller.homepage
        },
        images: {
            index: cok_controller.imagesIndex
        },
        login: {
            index: cok_controller.login,
            registration: cok_controller.registrationRender
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
            edit: cok_controller.chatEdit,
            detail: cok_controller.chatDetail,
        }
    };

    // initialise
    cok_core.init(routes);
    cok_core.router(location.hash);
    $(function () {
        $(window).bind('hashchange', function() {
            cok_core.router(location.hash);
        });
    });
});
