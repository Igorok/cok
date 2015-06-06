define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "mFriend"], function ($, _, backbone, dust, tpl, Msg, mFriend) {
    'use strict';
    var view = Backbone.View.extend({
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
    });
    return view;
});
