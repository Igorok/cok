define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "io", "api"], function ($, _, backbone, dust, tpl, Msg, io, Api) {
    'use strict';


    var view = Backbone.View.extend({
        events: {
            "submit #chatMessage": "message",
        },
        initialize: function (data) {
            this.socket = null
            this.user = Api.getUser();
            this.room = null;
            this.personId = data._id;
            this.statuses = {
                'off': 'danger',
                'absent': 'warning',
                'on': 'success',
            };
            this.users = null;
        },
        render: function () {
            this.startChat();
            return this;
        },
        message: function () {
            var self = this;
            var msg = self.$el.find('#chatText').val();
            if (! msg || ! msg.length) {
                return false;
            }
            self.$el.find('#chatText').val('');

            self.socket.emit("message", {
                uId: self.user._id,
                token: self.user.token,
                rId: self.room,
                message: msg,
            });
            return false;
        },

        renderUsers: function (users) {
            var self = this;
            var uArr = [];
            _.each(users, function (val) {
                var user = {
                    _id: val._id,
                    status: self.statuses[val.status],
                };
                if (val._id === self.user._id) {
                    user.login = 'I';
                } else {
                    user.login = val.login;
                }
                uArr.push(user);
            });
            dust.render("chat_users", {users: uArr}, function (err, text) {
                if (err) {
                    return Msg.showError(null, JSON.stringify(err));
                }
                self.$el.find("#uList").html(text);
                return self;
            });
        },

        startChat: function () {
            var self = this;
            if (! self.personId) {
                return false;
            }

            self.socket = new io(window.location.origin);
            console.log('startChat');
            self.socket.emit("joinPersonal", {
                uId: self.user._id,
                token: self.user.token,
                personId: self.personId
            });
            self.socket.on("err", function (err) {
                return Msg.showError(null, JSON.stringify(err));
            });

            self.socket.on("joinPersonal", function (data) {
                console.log(data);
                dust.render("chat_personal", {history: data.history}, function (err, text) {
                    if (err) {
                        return Msg.showError(null, JSON.stringify(err));
                    }
                    self.room = data._id;
                    self.$el.html(text);

                    self.users = data.users
                    self.renderUsers(data.users);
                    return self;
                });
            });
            self.socket.on("joinUser", function (data) {
                console.log('joinUser ', data);
            });


            self.socket.on("message", function (_obj) {
                console.log('msg ', _obj);
                self.$el.find('#chatItems').append(
                    '<p>' +
                    self.users[_obj.uId].login + ' ' + _obj.date + ' '+ _obj.msg +
                    '</p>'
                );
            });
            self.socket.on("freshStatuses", function (_obj) {
                self.renderUsers(_obj.users);
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
