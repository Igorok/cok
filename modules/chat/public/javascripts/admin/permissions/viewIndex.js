define (["jquery", "underscore", "backbone", "dust", "tpl", "message", ], function ($, _, backbone, dust, tpl, Msg) {
    'use strict';
    var viewIndex = Backbone.View.extend({
        // the constructor
        initialize: function (options) {
            // model is passed through
            this.permissions = options.permissions;
            this.permissions.bind('reset', this.addAll, this);
        },

        events: {
            "click .detailView": "userModal",
        },

        // populate the html to the dom
        render: function () {
            this.$el.html($('#main').html());
            this.addAll();
            return this;
        },

        addAll: function () {
            var self = this;
            var data = _.pluck(this.permissions.models, "attributes");
            dust.render("permissionList", {data: data}, function (err, result) {
                if (err) {
                    new Msg.showError(null, err);
                }
                self.$el.html(result);
            });
        },

        userModal: function (e) {
            new Msg.showError("Error", "qweqwe");
            /*var self = this;
            var _id = $(e.currentTarget).attr("data-id");
            var currentUser = this.users._byId[_id];

            self.currentView = new viewModalDetail({
                user: currentUser
            });
            $('#main').html(self.currentView.render().el);*/
        }
    });

    return viewIndex;
});
