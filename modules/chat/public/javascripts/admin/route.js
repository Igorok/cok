define (["jquery", "underscore", "backbone", "dust", "api", "message", "cUser", "cPermission", "cAuth"], function ($, _, Backbone, dust, Api, Msg, _cUser, _cPermission, _cAuth) {
    'use strict';
    var cUser = new _cUser();
    var cPermission = new _cPermission();
    var cAuth = new _cAuth();

    var Route = Backbone.Router.extend({
        routes: {
            "": "permissionList",
            "login": "auth",
            "users": "userList",
            "users/:id": "userDetail",
            "permissions": "permissionList",
            "permissions/:id": "permissionDetail",
        },

        initialize: function (options) {
            var self = this;
            //this.notes = options.notes;
            //// this is debug only to demonstrate how the backbone collection / models work
            //this.notes.bind('reset', this.updateDebug, this);
            //this.notes.bind('add', this.updateDebug, this);
            //this.notes.bind('remove', this.updateDebug, this);
        },


        auth: function (options) {
            cAuth.index(options);
        },

        permissionList: function (options) {
            var self = this;
            self.checkAuth(function () {
                cPermission.index(self.user, options);
            });
        },

        permissionDetail: function (options) {
            var self = this;
            self.checkAuth(function () {
                cPermission.detail(self.user, options);
            });
        },

        checkAuth: function (cb) {
            var self = this;
            self.user = Api.getUser();
            if (! self.user) {
                self.user = Api.getUser();
            } else {
                if (! $("#main").length) {
                    dust.render("adminLayout", {}, function (err, result) {
                        if (err) {
                            new Msg.showError(null, err);
                        }
                        $("#content").html(result);
                    });
                }
                cb();
            }
        }

        /*
        userList: function (options) {
            Controller.cUser(options);
        },
        userDetail: function (options) {
            var self = this;
            if (! Api.models.users) {
                Api.models.users = new Api.UserCollection();
            }
            Api.call("admin.getUserList", function (err, ret) {
                if (err) {
                    console.trace(err);
                }
                if (ret) {
                    Api.models.users.reset(ret.result[0]);
                    var currentUser = Api.models.users._byId[options];

                    self.currentView = new Api.viewUserDetail({
                        user: currentUser
                    });
                    $('#main').html(self.currentView.render().el);
                }
            });
        },
        */
    });


    var init = function () {
        new Route({});
        Backbone.history.start();
    };
    return {init: init};
});
