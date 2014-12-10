define (["jquery", "lodash", "cok_core"], function ($, _, cok_core) {
    function cok_controller () {}
    // main menu for app
    var menu = [
        {
            title: '<span class="glyphicon glyphicon-home"></span> Home',
            hash: '#!/',
        },
        {
            title: '<span class="glyphicon glyphicon-user"></span> Users',
            hash: '#!/user/index',
        },
        {
            title: '<span class="glyphicon glyphicon-star"></span> Friends',
            hash: '#!/user/friends',
        },
        {
            title: '<span class="glyphicon glyphicon-envelope"></span> Chats',
            hash: '#!/chat/index',
        },
        {
            title: '<span class="glyphicon glyphicon-off"></span> Logout',
            hash: '#!/logout',
        },
    ];
    


    // check user login
    var checkedUser = cok_controller.prototype.checkedUser = function () {
        var _user = cok_core.getUser();
        if (_.isEmpty(_user)) {
            window.location = "#!/login";
        } else {
            return _user;
        }
    };

    // check user login
    var menuRender = cok_controller.prototype.menuRender = function () {
        var _user = cok_core.getUser();
        if (! _.isEmpty(_user)) {
            $("#navPanel").show();
            cok_core.render ($("#mainMenu"), "mainMenu", {data: menu});
        } else {
            return false;
        }
    };

    // authorise
    cok_controller.prototype.authorise = function (data) {
        cok_core.call ("user.Authorise", data, function (result) {
            if (_.isUndefined(result) || _.isUndefined(result)) {
                return false;
            } else {
                cok_core.setUser(result[0], function () {
                    menuRender();
                    window.location = "#!/";
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
        window.location = "#!/login";
    };
    
    // loin page
    cok_controller.prototype.login = function () {
        var _user = cok_core.getUser();
        if (! _.isEmpty(_user)) {
            window.location = "#!/";
        } else {
            cok_core.render ($("#body"), "loginIndex");
        }
    }
    
    // home page
    cok_controller.prototype.homepage = function () {
        var _user = checkedUser();
        var token = _user.token;
        cok_core.render ($("#body"), "defaultIndex");
    }
    
    // user index page
    cok_controller.prototype.userIndex = function () {
        cok_core.render ($("#body"), "userIndex", {});
    }
    /**
    * friends list
    */
    cok_controller.prototype.userFriends = function () {
        cok_core.render ($("#body"), "friendsIndex", {});
    };
    // user detail page
    cok_controller.prototype.userDetail = function (_id) {
        var _user = checkedUser();
        var token = _user.token;
        cok_core.call("user.getUserDetail", {token: token, _id: _id}, function (result) {
            cok_core.render ($("#body"), "userDetail", {data: result[0]});
        });
    }
    

    /*
    * chat index
    */
    cok_controller.prototype.chatIndex = function () {
        cok_core.render ($("#body"), "chatIndex");
    }
    cok_controller.prototype.chatCreate = function () {
        var _user = checkedUser();
        var token = _user.token;
        cok_core.call("user.getFriendList", {token: token}, function (result) {
            cok_core.render ($("#body"), "chatCreate", {data: result[0]});
        });
    }
    menuRender();
    return new cok_controller();
    
});
