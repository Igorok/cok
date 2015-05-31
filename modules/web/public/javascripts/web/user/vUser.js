define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "mAuth"], function ($, _, backbone, dust, tpl, Msg, mAuth) {
    'use strict';
    var viewAuth = Backbone.View.extend({
        events: {
            "submit #loginForm": "submitForm"
        },
        initialize: function () {
            this.model = new mAuth();
        },
        render: function () {
            this.renderForm();
            return this;
        },
        renderForm: function (cb) {
            var self = this;
            dust.render("login_auth", {}, function (err, result) {
                if (err) {
                    console.trace(err);
                }
                self.$el.html(result);
                return self;
            });
        },
        submitForm: function (cb) {
            var self = this;
            self.model.set('login', self.$el.find('#login').val());
            self.model.set('password', self.$el.find('#password').val());
            if (! self.model.isValid()) {
                Msg.inputError(self.model.validationError);
            } else {
                self.model.call(function () {
                    window.location.hash = '#';
                });
            }
            return false;
        },
    });
    return viewAuth;
});
