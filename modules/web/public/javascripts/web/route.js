define (["jquery", "underscore", "backbone", "dust", "api", "message", "vAuth", "vIndex", "vUserList"], function ($, _, Backbone, dust, Api, Msg, vAuth, vIndex, vUserList) {
    'use strict';
    var Route = Backbone.Router.extend({
        routes: {
            "": "index",
            "login": "auth",
            "users": "users",
        },

        initialize: function (options) {
            var self = this;
        },

        checkAuth: function (cb) {
            var self = this;
            self.user = Api.getUser();
            if (! self.user) {
                return self.auth();
            } else {
                if ($("#main").length) {
                    return cb();
                }
                dust.render("layout", {}, function (err, result) {
                    if (err) {
                        new Msg.showError(null, err);
                    }
                    $("#content").html(result);
                    cb();
                });
            }
        },

        auth: function (options) {
            var view = new vAuth();
            $('#content').html(view.render().el);
        },

        index: function () {
            var self = this;
            self.checkAuth(function () {
                var view = new vIndex();
                $('#main').html(view.render().el);
            });
        },
        users: function () {
            var self = this;
            self.checkAuth(function () {
                var view = new vUserList();
                $('#main').html(view.render().el);
            });
        },

        // permissionList: function (options) {
        //     var self = this;
        //     self.checkAuth(function () {
        //         cPermission.index(self.user, options);
        //     });
        // },
        //
        // permissionDetail: function (options) {
        //     var self = this;
        //     self.checkAuth(function () {
        //         cPermission.detail(self.user, options);
        //     });
        // },
        //
        // groupList: function (options) {
        //     var self = this;
        //     self.checkAuth(function () {
        //         var view = new vGroupList({
        //             user: self.user,
        //             params: options
        //         });
        //         $('#main').html(view.render().el);
        //     });
        // },
        //
        // groupDetail: function (options) {
        //     var self = this;
        //     self.checkAuth(function () {
        //         var view = new vGroupDetail({
        //             user: self.user,
        //             params: options
        //         });
        //         $('#main').html(view.render().el);
        //     });
        // },
        // // users routes
        // userList: function (options) {
        //     var self = this;
        //     self.checkAuth(function () {
        //         var view = new vUserList({
        //             user: self.user,
        //             params: options
        //         });
        //         $('#main').html(view.render().el);
        //     });
        // },
        // userDetail: function (options) {
        //     var self = this;
        //     self.checkAuth(function () {
        //         var view = new vUserDetail({
        //             user: self.user,
        //             params: options
        //         });
        //         $('#main').html(view.render().el);
        //     });
        // },


    });


    var init = function () {
        new Route({});
        Backbone.history.start();
    };
    return {init: init};
});
