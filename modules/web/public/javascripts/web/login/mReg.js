define (["jquery", "underscore", "backbone", "message", "api"], function ($, _, backbone, Msg, Api) {
    'use strict';
    var AuthModel = Backbone.Model.extend({
        // you can set any defaults you would like here
        defaults: {
            login: "",
            password: "",
            passwordConf: "",
        },
        validate: function (attrs) {
            var errors = {};
            if (! attrs.login || ! attrs.login.length) {
                errors.login = "Login is required!"
            }
            if (! attrs.email || ! attrs.email.length) {
                errors.email = "Email is required!"
            }
            if (! attrs.password || ! attrs.password.length) {
                errors.password = "Password is required!"
            }
            if (
                ! attrs.passwordConf ||
                ! attrs.passwordConf.length ||
                (attrs.passwordConf !== attrs.password)
            ) {
                errors.passwordConf = "Please ensure that your password and your confirm password are the same!"
            }

            if (! _.isEmpty(errors)) {
                return errors;
            }
        },
        registration: function (cb) {
            var self = this;
            Api.call("user.Registration", self.attributes, function (ret) {
                cb();
            });
        },
    });

    return AuthModel;
});
