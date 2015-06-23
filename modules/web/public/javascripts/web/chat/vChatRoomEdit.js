define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "io", "api", "mChatRoomEdit"], function ($, _, backbone, dust, tpl, Msg, io, Api, mChatRoomEdit) {
    'use strict';


    var view = Backbone.View.extend({
        events: {
            "submit #chatMessage": "message",
        },
        initialize: function (data) {
            var self = this;
            self._id = data._id;
            self.model = new mChatRoomEdit();
        },
        render: function () {
            this.renderList();
            return this;
        },

        renderList: function () {
            var self = this;
            console.log(self._id === '-1')
            dust.render("chat_roomEdit", {}, function (err, text) {
                if (err) {
                    console.trace(err);
                }
                self.$el.html(text);
                return self;
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
