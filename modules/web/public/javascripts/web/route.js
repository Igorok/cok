define (["jquery", "underscore", "backbone", "dust", "io", "api", "message", "vAuth", "vIndex", "vUserList", "vUserDetail", "vFriendList", "vReg", "vFriendReq", "vChatPersonal", "vChatList", "vChatRoomEdit", "vChatRoom"], function ($, _, Backbone, dust, io, Api, Msg, vAuth, vIndex, vUserList, vUserDetail, vFriendList, vReg, vFriendReq, vChatPersonal, vChatList, vChatRoomEdit, vChatRoom) {
    "use strict";
    var Route = Backbone.Router.extend({
        routes:  {
            "": "index",
            "login": "auth",
            "registration": "registration",
            "logout": "logout",
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
        // initialize: function (options) {
        //     var self = this;
        // },
        execute: function(callback, args, name) {
            var self = this;
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
        friendReq: function () {
            var view = new vFriendReq();
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
        chatList: function () {
            var view = new vChatList();
            $('#main').html(view.render().el);
        },
        chatRoom: function (_id) {
            var view = new vChatRoom({
                _id: _id
            });
            $('#main').html(view.render().el);
        },
        chatRoomEdit: function (_id) {
            var view = new vChatRoomEdit({
                _id: _id
            });
            $('#main').html(view.render().el);
        },
        chatPersonal: function (_id) {
            var view = new vChatPersonal({
                _id: _id
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
