define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "io", "api", "mChat", "typeahead", "tagsinput"], function ($, _, backbone, dust, tpl, Msg, io, Api, mChat) {
    'use strict';


    var view = Backbone.View.extend({
        events: {
            "submit #chatRoomEdit": "chatRoomEdit",
        },
        initialize: function (data) {
            var self = this;
            self._id = data._id;
            self.model = new mChat();
        },
        render: function () {
            this.renderList();
            return this;
        },

        renderList: function () {
            var self = this;
            self.model.getEditRoom(self._id, function () {
                var data = self.model.get(self._id);
                dust.render("chat_roomEdit", data, function (err, text) {
                    if (err) {
                        console.trace(err);
                    }
                    self.$el.html(text);
                    self.$('#users').tagsinput({
                        itemValue: '_id',
                        itemText: 'login',
                        typeahead :{
                            name: 'users',
                            items: 4,
                            displayText: function (val) {
                                return val;
                            },
                            source: data.get('friends'),
                        },
                        freeInput: false,
                    });

                    var users = data.get('users');
                    _.each(users, function (val) {
                        if (! val) {
                            return;
                        }
                        self.$('#users').tagsinput('add', val);
                    });
                    return self;
                });
            });
        },
        chatRoomEdit: function (e) {
            var self = this;
            e.preventDefault();
            var uIds = self.$("#users").val();
            if (! uIds) {
                return false;
            }
            self.model.chatRoomEdit(self._id, uIds, function () {
                window.location.href = '#chat-room';
            });
            return false
        },

    });
    return view;
});
