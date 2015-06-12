define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "mFriend"], function ($, _, backbone, dust, tpl, Msg, mFriend) {
    'use strict';
    var view = Backbone.View.extend({
        events: {
            "click button.addFriendBtn": "friendAprove",
        },
        initialize: function () {
            this.model = new mFriend();
        },
        render: function () {
            this.friendReq();
            return this;
        },
        friendReq: function () {
            var self = this;
            self.model.getFriendRequests(function () {
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
        friendAprove: function (e) {
            var self = this;
            e.preventDefault();
            var _id = $(e.currentTarget).data('id');
            if (! _id) {
                return false;
            }
            self.model.addFriend(_id, function () {
                self.friendReq();
            });
        },
    });
    return view;
});
