define (["jquery", "underscore", "backbone", "dust", "tpl", "app"], function ($, _, backbone, dust, tpl, App) {
    'use strict';
    //console.log("dust ", dust, "tpl ", tpl);
    App.viewUserList = Backbone.View.extend({
        // the constructor
        initialize: function (options) {
            // model is passed through
            this.users = options.users;
            this.users.bind('reset', this.addAll, this);
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
            dust.render("modules/chat/views/admin/userList", {data: usrData}, function (err, result) {
                if (err) {
                    console.trace(err);
                }
                console.log("user list", result);
                self.$el.html(result);
            });
        }
    });
});
