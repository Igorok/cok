define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "mReg"], function ($, _, backbone, dust, tpl, Msg, mReg) {
    'use strict';
    var viewAuth = Backbone.View.extend({
        events: {
            "submit #loginForm": "submitForm"
        },
        initialize: function () {
            this.model = new mReg();
        },
        render: function () {
            this.renderForm();
            return this;
        },
        renderForm: function (cb) {
            var self = this;
            dust.render("login_registration", {}, function (err, result) {
                if (err) {
                    console.trace(err);
                }
                self.$el.html(result);
                return self;
            });
        },
        submitForm: function (cb) {
            var self = this;
            self.model.set('login', self.$('#login').val());
            self.model.set('email', self.$('#email').val());
            self.model.set('password', self.$('#password').val());
            self.model.set('passwordConf', self.$('#passwordConf').val());
            if (! self.model.isValid()) {
                Msg.inputError(self.model.validationError);
            } else {
                self.model.registration(function () {
                    window.location.hash = 'login';
                });
            }
            return false;
        },
    });
    return viewAuth;
});
