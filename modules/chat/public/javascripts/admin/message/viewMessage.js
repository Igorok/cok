define (["jquery", "underscore", "backbone", "dust", "tpl"], function ($, _, backbone, dust, tpl) {
    'use strict';
    var viewMessage = Backbone.View.extend({
        // the constructor
        initialize: function (options) {
            // model is passed through
            this.type = options.type;
            this.title = options.title;
            this.text = options.text;
        },

        tagName: "div",
        className: "container",

        events: {
            "click .close": "close",
        },

        // populate the html to the dom
        render: function () {
            this.$el.html();
            this.showMsg();
            return this;
        },

        showMsg: function () {
            var self = this;
            dust.render("message", {type: self.type, title: self.title, text: self.text}, function (err, result) {
                if (err) {
                    console.trace(err);
                }
                self.$el.html(result);
            });
        },

        close: function () {
            this.$el.empty();
            return this;
        }
    });

    return viewMessage;
});
