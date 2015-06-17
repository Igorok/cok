define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "mChatPersonal", "io", "api"], function ($, _, backbone, dust, tpl, Msg, mChatPersonal, io, Api) {
    'use strict';


    var view = Backbone.View.extend({
        events: {
            "submit #chatMessage": "message",
        },
        initialize: function (data) {
            if (window.socket) {
                window.socket.destroy();
            }
            this.user = Api.getUser();
            this.room = null;
            this.personId = data._id;
            this.model = new mChatPersonal();
        },
        render: function () {
            this.startChat();
            return this;
        },
        message: function () {
            var self = this;
            window.socket.emit("message", {
                user: {
                    token: self.user.token,
                    _id: self.user._id,
                },
                room: self.room,
                message: 'this.personId',
            });
            return false;
        },
        startChat: function () {
            var self = this;
            if (! self.personId) {
                return false;
            }

            window.socket = new io(window.location.origin, { forceNew: true });
            // window.socket.connect();
            window.socket.emit("joinPersonal", {
                token: self.user.token,
                personId: this.personId
            });
            window.socket.on("err", function (err) {
                return Msg.showError(null, JSON.stringify(err));
            });

            window.socket.on("joinPersonal", function (data) {
                dust.render("chat_personal", {data: data}, function (err, text) {
                    if (err) {
                        return Msg.showError(null, JSON.stringify(err));
                    }
                    self.room = data._id;
                    console.log('data ', data);
                    self.$el.html(text);
                    return self;
                });
            });
            window.socket.on("message", function (msg) {
                console.log('msg ', msg);
            });

            //  window.socket.emit("joinPersonal", {
            //     user: {
            //         _id: self.user._id,
            //         token: self.user.token,
            //     },
            //     personId: this.personId
            // });


            // var formData = {
            //     token: token,
            //     chatId: chatId,
            //     chatText: chatText,
            // };
            // window.socket.emit('message', formData);
            // var chatText = $('#chatText').val('');

            //
            // attributes: {
            //     _id: "557c8030499e89a2260cba82",
            //     creator: "54f2f627b87d9dae196238a5",
            //     date: "2015-06-13T19:10:40.561Z",
            //     email: "",
            //     picture: "",
            //     type: "personal",
            //     users: [
            //         "54f2f627b87d9dae196238a5",
            //         "54f8a9344b0baf021614f8a9",
            //     ],
            // }
            //

            // self.model.getPersonalChat(self.personId, function () {
            //     console.log('self.model ', self.model.toJSON());
            //
            //     self.chatGroup = self.model.toJSON();
            //
            //
            //     dust.render("chat_personal", {data: self.model}, function (err, text) {
            //         if (err) {
            //             return Msg.showError(null, JSON.stringify(err));
            //         }
            //
            //         window.socket = new io(window.location.origin, { forceNew: true });
            //         window.socket.connect();
            //         window.socket.emit("join", {token: self.user.token, chatId: self.chatGroup._id});
            //
            //
            //
            //
            //         window.socket.on("err", function (err) {
            //             return Msg.showError(null, JSON.stringify(err));
            //         });
            //         // add user
            //         window.socket.on('join', function (jObj) {
            //             if (! jObj) {
            //                 window.location("#!web/index");
            //             }
            //             if (jObj.cHistory) {
            //                 chatItems = chatItems.concat(jObj.cHistory);
            //                 chatTable = new cok_core.tableRender("chatItem", $("#chatItems tbody"), chatItems, {}, chatItems.length);
            //                 chatTable.render();
            //                 var cHeight = $('#chatItems').height();
            //                 $('#chatFixedItems').scrollTop(cHeight);
            //             }
            //         });
            //
            //         // message
            //         window.socket.on('message', function (msg) {
            //             chatItems.push(msg);
            //             chatTable = new cok_core.tableRender("chatItem", $("#chatItems tbody"), chatItems, {}, chatItems.length);
            //             chatTable.render();
            //             var cHeight = $('#chatItems').height();
            //             $('#chatFixedItems').scrollTop(cHeight);
            //         });
            //
            //         $('#chatMessage').submit(function () {
            //             var chatText = $('#chatText').val();
            //             if (! _.isEmpty(chatText)) {
            //                 var formData = {
            //                     token: token,
            //                     chatId: chatId,
            //                     chatText: chatText,
            //                 };
            //                 window.socket.emit('message', formData);
            //                 var chatText = $('#chatText').val('');
            //             }
            //             return false;
            //         });
            //
            //
            //         self.$el.html(text);
            //         return self;
            //     });
            // });
        },
        // friendAprove: function (e) {
        //     var self = this;
        //     e.preventDefault();
        //     var _id = $(e.currentTarget).data('id');
        //     if (! _id) {
        //         return false;
        //     }
        //     self.model.addFriend(_id, function () {
        //         self.friendReq();
        //     });
        // },
    });
    return view;
});
