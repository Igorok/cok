define(["jquery", "underscore", "backbone", "dust", "tpl", "message", "api", "mUser"], function ($, _, Backbone, dust, tpl, Msg, Api, User) {
    'use strict';
    var viewIndex = Backbone.View.extend({
        // the constructor
        initialize: function (options) {
            this.user = options.user;
            this.mUser = new User();
        },

        events: {
            "click .removeGroup": "removeGroup"
        },

        // populate the html to the dom
        render: function () {
            this.$el.html($('#main').html());
            this.renderAll();
            return this;
        },

        renderAll: function () {
            var self = this;
            self.mUser.getAll({token: self.user.token}, function () {
                var data = _.pluck(self.mUser.models, "attributes");
                dust.render("userList", {data: data}, function (err, result) {
                    if (err) {
                        new Msg.showError(null, err);
                    }
                    self.$el.html(result);
                });
            });
        },

        removeGroup: function (e) {
            var self = this;
            e.preventDefault();
            var _id = $(e.currentTarget).attr("data-id");
            if (_id) {
                self.mUser.removeOne({token: self.user.token, _id: _id}, function () {
                    self.renderAll();
                });
            }
        },


//        removePermission: function (e) {
//            var self = this;
//            e.preventDefault();
//            var _id = $(e.currentTarget).attr("data-id");
//            if (_id) {
//                Api.call("admin.removePermission", {token: self.user.token, _id: _id}, function (err, ret) {
//                    if (err) {
//                        new Msg.showError(null, err);
//                    }
//                    self.permissions.remove(_id);
//                    self.renderAll();
//                });
//            }
//        },





    });

    return viewIndex;
});
