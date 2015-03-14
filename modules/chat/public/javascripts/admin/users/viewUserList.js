define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "vModalDetail", ], function ($, _, backbone, dust, tpl, Msg, vModalDetail) {
    'use strict';
    var viewUserList = Backbone.View.extend({
        // the constructor
        initialize: function (options) {
            console.log("options ", options.users);
            // model is passed through
            this.users = options.users;
            this.users.bind('reset', this.addAll, this);
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
            var usrData = _.pluck(this.users.models, "attributes");
            dust.render("userList", {data: usrData}, function (err, result) {
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

            self.currentView = new vModalDetail({
                user: currentUser
            });
            $('#main').html(self.currentView.render().el);*/
        }
    });

    return viewUserList;
});
