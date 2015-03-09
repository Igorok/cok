define (["jquery", "underscore", "backbone", "dust", "tpl", "app"], function ($, _, backbone, dust, tpl, App) {
    'use strict';
    App.viewUserDetail = Backbone.View.extend({
        // the constructor
        initialize: function (options) {
            // model is passed through
            this.user = options.user;
        },

        // populate the html to the dom
        render: function () {
            this.$el.html($('#main').html());
            this.addOne();
            return this;
        },

        addOne: function (cb) {
            var self = this;
            console.log(self.user.attributes);
            dust.render("modules/chat/views/admin/userDetail", self.user.attributes, function (err, result) {
                if (err) {
                    console.trace(err);
                }
                self.$el.html(result);
            });
        }
    });
});
