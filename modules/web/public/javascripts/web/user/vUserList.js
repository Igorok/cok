define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "mUser", "mFriend"], function ($, _, backbone, dust, tpl, Msg, mUser, mFriend) {
    'use strict';
    var view = Backbone.View.extend({
        events: {
            "click button.addFriendBtn": "addFriendRequest",
            "click button.delFriendBtn": "deleteFriend",
        },
        initialize: function () {
            this.uModel = new mUser();
            this.fModel = new mFriend();
        },
        render: function () {
            this.renderUsers();
            return this;
        },
        renderUsers: function () {
            var self = this;
            self.uModel.getUserList(function () {
                var data = self.uModel.toJSON();
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
            self.fModel.addFriendRequest(_id, function () {
                self.renderUsers();
            });
        },
        deleteFriend: function (e) {
            e.preventDefault();
            var self = this;
            var _id = $(e.currentTarget).data('id');
            if (! _id) {
                return false;
            }
            self.fModel.deleteFriend(_id, function () {
                self.renderUsers();
            });
        },
    });
    return view;
});
