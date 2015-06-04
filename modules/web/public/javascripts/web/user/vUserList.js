define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "mUser"], function ($, _, backbone, dust, tpl, Msg, mUser) {
    'use strict';
    var view = Backbone.View.extend({
        events: {
            "submit #loginForm": "submitForm",
            "click button.addFriendBtn": "addFriendRequest",
        },
        initialize: function () {
            this.model = new mUser();
        },
        render: function () {
            this.renderUsers();
            return this;
        },
        renderUsers: function () {
            var self = this;
            self.model.getUserList(function () {
                var data = self.model.toJSON();
                dust.render("user_list", {data: data}, function (err, text) {
                    if (err) {
                        console.trace(err);
                    }
                    self.$el.html(text);
                    return self;
                });
            });
        },
        addFriendRequest: function (e) {
            e.preventDefault();
            var self = this;
            var _id = $(e.currentTarget).data('id');
            if (! _id) {
                return false;
            }
            self.model.addFriendRequest(_id, function () {
                self.renderUsers();
            });
        },
    });
    return view;
});
