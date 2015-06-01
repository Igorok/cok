define (["jquery", "lodash", "cok_core"], function ($, _, cok_core) {
    function cok_controller () {}
    // main menu for app
    var menu = [
        {
            title: '<span class="glyphicon glyphicon-home"></span>&nbsp;&nbsp;Home',
            hash: '#!/',
        },
        {
            title: '<span class="glyphicon glyphicon-picture"></span>&nbsp;&nbsp;Images',
            hash: '#!/images/index',
        },
        {
            title: '<span class="glyphicon glyphicon-star"></span>&nbsp;&nbsp;Friends',
            hash: '#!/user/friends',
        },
        {
            title: '<span class="glyphicon glyphicon-comment"></span>&nbsp;&nbsp;Chats',
            hash: '#!web/index',
        },
        {
            title: '<span class="glyphicon glyphicon-user"></span>&nbsp;&nbsp;Users',
            hash: '#!/user/index',
        },
        {
            title: '<span class="glyphicon glyphicon-off"></span>&nbsp;&nbsp;Logout',
            hash: '#!/logout',
        },
    ];



    // check user login
    var checkedUser = cok_controller.prototype.checkedUser = function () {
        var _user = cok_core.getUser();
        if (_.isEmpty(_user)) {
            return window.location = "#!/login/index";
        } else {
            return _user;
        }
    };

    // check user login
    var menuRender = cok_controller.prototype.menuRender = function () {
        console.log('menuRender', menu);
        var _user = cok_core.getUser();
        if (! _.isEmpty(_user)) {
            $("#navPanel").show();
            cok_core.render ($("#leftMenu"), "mainMenu", {data: menu});
        } else {
            return false;
        }
    };

    // authorise
    cok_controller.prototype.authorise = function (data) {
        cok_core.call ("user.Authorise", data, function (result) {
            if (_.isUndefined(result) || _.isEmpty(result)) {
                return false;
            } else {
                cok_core.setUser(result[0], function () {
                    menuRender();
                    return window.location = "#!/";
                });
            }
        });
    };


    // logout
    var logout = cok_controller.prototype.logout = function () {
        /*var _user = checkedUser();
        var token = _user.token;
        cok_core.call("user.logout", {token: token}, function (result) {
            cok_core.removeUser();
            $("#mainMenu").empty();
            window.location = "#!/login";
        });*/
        cok_core.removeUser();
        $("#navPanel").hide();
        $("#mainMenu").animate({'left': '-200px'}, 200).empty();
        $("#body").animate({'padding': '0'}, 200);
        return window.location = "#!/login/index";
    };

    // loin page
    cok_controller.prototype.login = function () {
        var _user = cok_core.getUser();
        if (! _.isEmpty(_user)) {
            return window.location = "#!/";
        } else {
            cok_core.render ($("#body"), "loginIndex");
        }
    };
    // loin page
    cok_controller.prototype.registrationRender = function () {
        var _user = cok_core.getUser();
        if (! _.isEmpty(_user)) {
            return window.location = "#!/";
        } else {
            cok_core.render ($("#body"), "loginRegistration");
        }
    };

    // home page
    cok_controller.prototype.homepage = function () {
        cok_core.render ($("#body"), "defaultIndex", {});
    };

    // user index page
    cok_controller.prototype.userIndex = function () {
        cok_core.render ($("#body"), "userIndex", {});
    };

    // picture index page
    cok_controller.prototype.imagesIndex = function (ownerId) {
        cok_core.render ($("#body"), "imagesIndex", {ownerId: ownerId});
    };
    /**
    * friends list
    */
    cok_controller.prototype.userFriendsRender = function () {
        cok_core.render ($("#body"), "friendsIndex", {});
    }
















    // user detail page
    cok_controller.prototype.userDetail = function (_id) {
        var _user = checkedUser();
        var token = _user.token;
        cok_core.call("user.getUserDetail", {token: token, _id: _id}, function (result) {
            cok_core.render ($("#body"), "userDetail", {data: result[0]});
        });
    };


    /*
    * chat
    */
    cok_controller.prototype.chatIndex = function () {
        cok_core.render ($("#body"), "chatIndex");
    };
    cok_controller.prototype.chatDetail = function (_id) {
        cok_core.render ($("#body"), "chatDetail", {chatId: _id});
    };
    cok_controller.prototype.chatCreate = function () {
        var _user = checkedUser();
        var token = _user.token;
        cok_core.call("user.getFriendList", {token: token}, function (result) {
            cok_core.render ($("#body"), "chatCreate", {data: result[0]});
        });
    };
    cok_controller.prototype.chatEdit = function (_id) {
        var _user = checkedUser();
        var token = _user.token;
        cok_core.call("index.getEditChat", {token: token, _id: _id}, function (result) {
            cok_core.render ($("#body"), "chatEdit", {data: result[0]});
        });
    };

    menuRender();
    return new cok_controller();

});