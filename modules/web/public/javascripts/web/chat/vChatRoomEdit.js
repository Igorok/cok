define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "io", "api", "mChat", "typeahead", "tagsinput"], function ($, _, backbone, dust, tpl, Msg, io, Api, mChat) {
    'use strict';


    var view = Backbone.View.extend({
        events: {
            "submit #chatMessage": "message",
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
                            source: data.get('users'),
                        },
                        freeInput: false,
                    });
                    return self;
                });
            });

            // self.model.getChatList(function () {
            //     var data = self.model.toJSON();
            //     dust.render("chat_list", {data: data}, function (err, text) {
            //         if (err) {
            //             console.trace(err);
            //         }
            //         self.$el.html(text);
            //         return self;
            //     });
            // });
        },

    });
    return view;
});
