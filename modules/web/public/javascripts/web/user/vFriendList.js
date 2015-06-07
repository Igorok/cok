define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "mFriend"], function ($, _, backbone, dust, tpl, Msg, mFriend) {
    'use strict';
    var view = Backbone.View.extend({
        events: {
            "click button.delFriendBtn": "deleteFriend",
        },
        initialize: function () {
            this.model = new mFriend();
        },
        render: function () {
            this.friendList();
            return this;
        },
        friendList: function (cb) {
            var self = this;
            self.model.getFriendList(function () {
                var data = self.model.toJSON();
                dust.render("user_friendList", {data: data}, function (err, text) {
                    if (err) {
                        console.trace(err);
                    }
                    self.$el.html(text);
                    return self;
                });
            });
        },
        deleteFriend: function (e) {
            e.preventDefault();
            var self = this;
            var _id = $(e.currentTarget).data('id');
            if (! _id) {
                return false;
            }
            self.model.deleteFriend(_id, function () {
                self.friendList();
            });
        },
    });
    return view;
});
