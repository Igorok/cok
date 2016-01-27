define ([
    "jquery", "underscore", "backbone", "dust", "io", "api", "message", "vAuth", "vBlogList", "vBlogForm", "vProfile", "vUserList", "vUserDetail", "vFriendList", "vReg", "vFriendReq", "vChatPersonal", "vChatList", "vChatRoomEdit", "vChatRoom", "vBlogDetail",
], function ($, _, Backbone, dust, io, Api, Msg, vAuth, vBlogList, vBlogForm, vProfile, vUserList, vUserDetail, vFriendList, vReg, vFriendReq, vChatPersonal, vChatList, vChatRoomEdit, vChatRoom, vBlogDetail) {
    "use strict";
    var Route = Backbone.Router.extend({
        routes:  {
            "": "blogList",
            "blog": "blogList",
            "blog/:id": "blogDetail",
            "blog-new": "blogForm",
            "blog-edit/:id": "blogForm",

            "login": "auth",
            "registration": "registration",
            "logout": "logout",
            "profile": "profile",
            "user": "userList",
            "user/:id": "userDetail",
            "friend": "friendList",
            "friend-requests": "friendReq",
            "chat/:id": "chatPersonal",
            "chat-room": "chatList",
            "chat-room/:id": "chatRoom",
            "chat-room-edit/:id": "chatRoomEdit",
            '*notFound': 'notFound',
        },

        execute: function(callback, args, name) {
            var self = this;
            self.renderMenu(function () {
                callback.apply(self, args);
            });
        },
        renderMenu: function (cb) {
            var self = this;
            self.user = Api.getUser();
            dust.render("menu", {user: self.user}, function (err, result) {
                if (err) {
                    return new Msg.showError(null, err);
                }
                $("#menu").html(result);
                cb();
            });
        },

        auth: function (options) {
            var view = new vAuth();
            $('#main').html(view.render().el);
        },
        registration: function (options) {
            var view = new vReg();
            $('#main').html(view.render().el);
        },
        logout: function () {
            var self = this;
            if (! self.user) {
                return Msg.showError(null, "403");
            }
            self.user = Api.removeUser();
            window.location.hash = "login";
        },
        blogList: function () {
            var view = new vBlogList();
            $('#main').html(view.render().el);
        },
        blogDetail: function (id) {
            var view = new vBlogDetail({_id: id});
            $('#main').html(view.render().el);
        },


        blogForm: function (id) {
            var self = this;
            if (! self.user) {
                return Msg.showError(null, "403");
            }
            var opts = null;
            if (id) {
                opts = {_id: id};
            }
            var view = new vBlogForm(opts);
            $('#main').html(view.render().el);
        },
        profile: function () {
            var self = this;
            if (! self.user) {
                return Msg.showError(null, "403");
            }
            var view = new vProfile();
            $('#main').html(view.render().el);
        },
        friendList: function () {
            var self = this;
            if (! self.user) {
                return Msg.showError(null, "403");
            }
            var view = new vFriendList();
            $('#main').html(view.render().el);
        },
        friendReq: function () {
            var self = this;
            if (! self.user) {
                return Msg.showError(null, "403");
            }
            var view = new vFriendReq();
            $('#main').html(view.render().el);
        },
        userList: function () {
            var self = this;
            if (! self.user) {
                return Msg.showError(null, "403");
            }
            var view = new vUserList();
            $('#main').html(view.render().el);
        },
        userDetail: function (options) {
            var self = this;
            if (! self.user) {
                return Msg.showError(null, "403");
            }
            var view = new vUserDetail({
                _id: options
            });
            $('#main').html(view.render().el);
        },
        chatList: function () {
            var self = this;
            if (! self.user) {
                return Msg.showError(null, "403");
            }
            var view = new vChatList();
            $('#main').html(view.render().el);
        },
        chatRoom: function (_id) {
            var self = this;
            if (! self.user) {
                return Msg.showError(null, "403");
            }
            socketClose();
            var view = new vChatRoom({
                _id: _id
            });
            $('#main').html(view.render().el);
        },
        chatRoomEdit: function (_id) {
            var self = this;
            if (! self.user) {
                return Msg.showError(null, "403");
            }
            var view = new vChatRoomEdit({
                _id: _id
            });
            $('#main').html(view.render().el);
        },
        chatPersonal: function (_id) {
            var self = this;
            if (! self.user) {
                return Msg.showError(null, "403");
            }
            socketClose();
            var view = new vChatPersonal({
                _id: _id
            });
            $('#main').html(view.render().el);
        },









        notFound: function () {
            window.location.hash = "#";
        }
    });

    var socketClose = function () {
        if (window.socket) {
            var eArr = [
                "joinPersonal",
                "joinRoom",
                "joinUser",
                "freshStatus",
                "message",
                "err",
            ];
            _.each(eArr, function (_ev) {
                window.socket.removeAllListeners(_ev);
            });
            window.socket.close();
        }
    };
    var init = function () {
        new Route({});
        Backbone.history.start();
    };
    return {init: init};
});
