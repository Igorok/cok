define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "io", "api"], function ($, _, backbone, dust, tpl, Msg, io, Api) {
    'use strict';


    var view = Backbone.View.extend({
        events: {
            "submit #chatMessage": "message",
        },
        initialize: function (data) {
            var self = this;
            self.user = Api.getUser();
        },
        render: function () {
            this.renderList();
            return this;
        },

        renderList: function () {
            var self = this;
            self.cModel.getChatList(function () {
                var data = self.cModel.toJSON();
                dust.render("chat_list", {data: data}, function (err, text) {
                    if (err) {
                        console.trace(err);
                    }
                    self.$el.html(text);
                    return self;
                });
            });
        },

    });
    return view;
});
