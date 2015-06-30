define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "io", "api"], function ($, _, backbone, dust, tpl, Msg, io, Api) {
    'use strict';


    var view = Backbone.View.extend({
        events: {
            "submit #chatMessage": "message",
        },
        initialize: function (data) {
            var self = this;
            self.socket = io.connect(window.location.hostname);
            self.user = Api.getUser();
            self.room = null;
            self.personId = data._id;
            self.statuses = {
                'off': 'danger',
                'absent': 'warning',
                'on': 'success',
            };
            self.users = null;
            self.checkStatus = null;
            $(window).on("resize", self.resize);
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

        renderMessage: function (msg) {
            var self = this;
            dust.render("chat_message", {message: msg}, function (err, text) {
                if (err) {
                    return Msg.showError(null, JSON.stringify(err));
                }
                var chatItems = self.$el.find("#messages");
                chatItems.append(text);
                self.$el.find("#chatItems").scrollTop(chatItems.height());
                return self;
            });
        },

        renderUsers: function (users) {
            var self = this;
            var uArr = [];
            _.each(users, function (val) {
                var user = {
                    _id: val._id,
                    login: val.login,
                    status: self.statuses[val.status],
                };
                uArr.push(user);
            });
            dust.render("chat_users", {users: uArr}, function (err, text) {
                if (err) {
                    return Msg.showError(null, JSON.stringify(err));
                }
                self.$el.find("#uList").html(text);

                self.resize();
                return self;
            });
        },

        freshStatus: function (arr) {
            var self = this;
            _.each(arr, function (val) {
                var elem = self.$el.find("#" + val._id);
                var status = 'label-' + self.statuses[val.status];
                if (elem.hasClass(status)) {
                    return;
                }
                elem.removeClass().addClass('label ' + status);
            });
        },

        startChat: function () {
            var self = this;
            if (! self.personId) {
                return false;
            }

            console.log('startChat ', self.socket);
            self.socket.emit("joinPersonal", {
                uId: self.user._id,
                token: self.user.token,
                personId: self.personId
            });
            self.socket.on("err", function (err) {
                return Msg.showError(null, JSON.stringify(err));
            });

            self.socket.on("joinPersonal", function (data) {
                dust.render("chat_form", {}, function (err, text) {
                    if (err) {
                        return Msg.showError(null, JSON.stringify(err));
                    }
                    self.room = data._id;
                    self.$el.html(text);

                    self.users = data.users
                    self.renderMessage(data.history);
                    self.renderUsers(data.users);
                    return self;
                });
            });
            self.socket.on("joinUser", function (data) {
                var arr = [{
                    _id: _obj.uId,
                    status: 'on',
                }];
                self.freshStatus(arr);
            });


            self.socket.on("message", function (_obj) {
                self.renderMessage(_obj);
                var arr = [{
                    _id: _obj.uId,
                    status: 'on',
                }];
                self.freshStatus(arr);
            });
            self.socket.on("freshStatus", function (_obj) {
                self.freshStatus(_obj.users);
            });
            self.checkStatus = setInterval(function () {
                var data = {
                    uId: self.user._id,
                    token: self.user.token,
                    rId: self.room,
                };
                self.socket.emit("checkStatus", data);
            }, 5 * 60 * 1000);
        },
        resize: function () {
            var wHeight = $(window).height();
            var allHeight = wHeight - 15 - 17 * 2;
            var uHeight = $("#uList").height();
            var fHeight = $("#chatFormCase").height();
            var itemHeight = allHeight - uHeight - fHeight - 20;
            $("#chatCase").css({height: allHeight});
            $("#chatItems").css({height: itemHeight});
        },
    });
    return view;
});
