define (["jquery", "underscore", "backbone", "message", "api"], function ($, _, backbone, Msg, Api) {
    'use strict';
    var model = Backbone.Model.extend({
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
    });


    var collection = Backbone.Collection.extend({
        // Reference to this collection's model.
        model: model,
        getAll: function (_data, cb) {
            var self = this;
            Api.call("user.getUserList", _data, function (ret) {
                if (!! ret && !! ret.result) {
                    self.set(ret.result[0]);
                }

                cb();
            });
        },
        getUserDetail: function (_id, cb) {
            var self = this;
            var user = Api.getUser();
            var data = {
                token: user.token,
                _id: (_id || user._id),
            };
            Api.call("user.getUserDetail", data, function (ret) {
                var result = null;
                if (ret && ret.result) {
                    result = ret.result[0];
                }
                cb(result);
            });
        },
    });
    return collection;
});
