define (["jquery", "underscore", "backbone", "dust", "api", "message", "vAuth", "vIndex", "vUserList", "vUserDetail", "vFriendList", "vReg"], function ($, _, Backbone, dust, Api, Msg, vAuth, vIndex, vUserList, vUserDetail, vFriendList, vReg) {
    "use strict";
    var Route = Backbone.Router.extend({
        routes:  {
            "": "index",
            "login": "auth",
            "registration": "registration",
            "logout": "logout",
            "user": "userList",
            "friend": "friendList",
            "user/:id": "userDetail",
            '*notFound': 'notFound',
        },
        // initialize: function (options) {
        //     var self = this;
        // },
        execute: function(callback, args, name) {
            var self = this;
            if ((name === 'auth') || (name === 'registration')) {
                callback.apply(this, args);
            } else {
                self.user = Api.getUser();
                if ($("#main").length) {
                    return callback.apply(this, args);
                } else {
                    dust.render("layout", {}, function (err, result) {
                        if (err) {
                            new Msg.showError(null, err);
                        }
                        $("#content").html(result);
                        callback.apply(this, args);
                    });
                }
            }
        },


        auth: function (options) {
            var view = new vAuth();
            $('#content').html(view.render().el);
        },
        registration: function (options) {
            var view = new vReg();
            $('#content').html(view.render().el);
        },
        logout: function () {
            self.user = Api.removeUser();
            window.location.hash = "login";
        },
        index: function () {
            var view = new vIndex();
            $('#main').html(view.render().el);
        },
        friendList: function () {
            var view = new vFriendList();
            $('#main').html(view.render().el);
        },
        userList: function () {
            var view = new vUserList();
            $('#main').html(view.render().el);
        },
        userDetail: function (options) {
            var view = new vUserDetail({
                _id: options
            });
            $('#main').html(view.render().el);
        },
        notFound: function () {
            window.location.hash = "#";
        }
    });


    var init = function () {
        new Route({});
        Backbone.history.start();
    };
    return {init: init};
});
