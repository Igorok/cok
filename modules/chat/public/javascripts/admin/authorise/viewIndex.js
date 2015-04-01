define (["jquery", "underscore", "backbone", "dust", "api", "message", "tpl"], function ($, _, backbone, dust, Api, Msg, tpl) {
    'use strict';
    var viewIndex = Backbone.View.extend({
        // the constructor
        initialize: function (options) {
            // model is passed through
            this.model = options.model;
        },
        events: {
            "submit #loginForm": "formSubmit",
        },

        // populate the html to the dom
        render: function () {
            this.$el.html($('#main').html());
            this.index();
            return this;
        },

        index: function () {
            var self = this;
            dust.render("login", {login: "", password: ""}, function (err, result) {
                if (err) {
                    new Msg.showError(null, err);
                }
                self.$el.html(result);
            });
        },

        formSubmit: function (e) {
            var self = this;
            e.preventDefault();
            self.model.set({
                login: $("#login").val(),
                password: $("#password").val()
            });
            
            if (! self.model.isValid()) {
                Msg.inputError(self.model.validationError);
            } else {
                Api.call("user.Authorise", self.model.attributes, function (err, ret) {
                    if (!! err) {
                        Msg.showError(null, err);
                    }
                    if (!! ret) {
                        Api.setUser(ret.result[0]);
                        window.location.hash = "permissions";
                    }
                    
                });
            }
        }
    });

    return viewIndex;
});
