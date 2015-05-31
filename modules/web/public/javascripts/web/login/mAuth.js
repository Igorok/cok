define (["jquery", "underscore", "backbone", "message", "api"], function ($, _, backbone, Msg, Api) {
    'use strict';
    var AuthModel = Backbone.Model.extend({
        // you can set any defaults you would like here
        defaults: {
            login: "",
            password: ""
        },
        validate: function (attrs) {
            var errors = {};
            if (! attrs.login || ! attrs.login.length) {
                errors.login = "login is required!"
            }
            if (! attrs.password || ! attrs.password.length) {
                errors.password = "password is required!"
            }
            if (! _.isEmpty(errors)) {
                return errors;
            }
        },
        call: function (cb) {
            var self = this;
            Api.call("user.Authorise", self.attributes, function (ret) {
                if (!! ret && !! ret.result) {
                    console.log(ret.result[0]);
                    Api.setUser(ret.result[0]);
                }
                cb();
            });
        },
    });

    return AuthModel;
});
