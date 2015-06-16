define (["jquery", "underscore", "backbone", "message", "api"], function ($, _, backbone, Msg, Api) {
    'use strict';
    var model = Backbone.Model.extend({
        // you can set any defaults you would like here
        idAttribute: "_id",
        defaults: {
            _id: "",
            email: "",
            picture: "",
        },





        getUserList: function (cb) {
            var self = this;
            var user = Api.getUser();
            Api.call("user.getUserList", {token: user.token}, function (ret) {
                if (! ret && ! ret.result) {
                    return cb();
                }
                self.reset(ret.result[0]);
                cb();
            });
        },
        getPersonalChat: function (_id, cb) {
            var self = this;
            var user = Api.getUser();
            var data = {
                token: user.token,
                _id: _id,
            };
            Api.call("chat.getPersonalChat", data, function (ret) {
                if (! ret && ! ret.result) {
                    return cb();
                }
                self.set(ret.result[0]);
                cb();
            });
        },
    });

    return model;
});
