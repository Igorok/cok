define (["jquery", "lodash", "cok_core"], function ($, _, cok_core) {
    function cok_controller () {}
    // main menu for app
    var menu = [
        {
            title: "home",
            hash: "#!/",
        },
        {
            title: "user list",
            hash: "#!/user/index",
        },
        {
            title: "chat list",
            hash: "#!/chat/index",
        },
        {
            title: "logout",
            hash: "#!/logout",
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
        cok_core.removeUser();
        $("#mainMenu").empty();
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
        var _user = cok_core.getUser();
        var token = _user.token;
        cok_core.render ($("#body"), "defaultIndex");
    }
    
    // user index page
    cok_controller.prototype.userIndex = function () {
        var _user = checkedUser();
        var token = _user.token;
        cok_core.call("user.getUserList", {token: token}, function (result) {
            cok_core.render ($("#body"), "userIndex", {data: result[0]});
        });
    }
    
    // user detail page
    cok_controller.prototype.userDetail = function (_id) {
        var _user = checkedUser();
        var token = _user.token;
        cok_core.call("user.getUserDetail", {token: token, _id: _id}, function (result) {
            cok_core.render ($("#body"), "userDetail", {data: result[0]});
        });
    }
    
    menuRender();
    return new cok_controller();
    
});
