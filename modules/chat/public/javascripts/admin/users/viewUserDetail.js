define (["jquery", "underscore", "backbone", "dust", "tpl"], function ($, _, backbone, dust, tpl) {
    'use strict';
    var viewUserDetail = Backbone.View.extend({
        // the constructor
        initialize: function (options) {
            // model is passed through
            this.user = options.user;
        },

        // populate the html to the dom
        render: function () {
            this.$el.html($('#main').html());
            this.showModal();
            return this;
        },

        showModal: function (cb) {
            var self = this;
            console.log(self.user.attributes);
            dust.render("userDetail", self.user.attributes, function (err, result) {
                if (err) {
                    console.trace(err);
                }
                self.$el.html(result);
            });
        }
    });
});
