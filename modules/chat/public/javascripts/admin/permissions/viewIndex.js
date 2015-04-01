define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "api"], function ($, _, backbone, dust, tpl, Msg, Api) {
    'use strict';
    var viewIndex = Backbone.View.extend({
        // the constructor
        initialize: function (options) {
            // model is passed through
            this.user = options.user;
            this.permissions = options.permissions;
            this.permissions.bind('reset', this.renderAll, this);
        },

        events: {
            "click .removePermission": "removePermission",
        },

        // populate the html to the dom
        render: function () {
            this.$el.html($('#main').html());
            this.renderAll();
            return this;
        },

        renderAll: function () {
            var self = this;
            var data = _.pluck(self.permissions.models, "attributes");
            dust.render("permissionList", {data: data}, function (err, result) {
                if (err) {
                    new Msg.showError(null, err);
                }
                self.$el.html(result);
            });
        },

        removePermission: function (e) {
            var self = this;
            e.preventDefault();
            var _id = $(e.currentTarget).attr("data-id");
            if (_id) {
                Api.call("admin.removePermission", {token: self.user.token, _id: _id}, function (err, ret) {
                    if (err) {
                        new Msg.showError(null, err);
                    }
                    self.permissions.remove(_id);
                    self.renderAll();
                });
            }
        },
    });

    return viewIndex;
});
