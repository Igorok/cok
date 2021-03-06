define (["jquery", "underscore", "backbone", "message", "api"], function ($, _, backbone, Msg, Api) {
    'use strict';
    var model = Backbone.Model.extend({
        // you can set any defaults you would like here
        idAttribute: "_id",
        defaults: {
            login: "",
            email: "",
            picture: "",
        },
    });


    var collection = Backbone.Collection.extend({
        // Reference to this collection's model.
        model: model,
        getUserList: function (cb) {
            var self = this;
            var user = Api.getUser();
            Api.call("user.getUserList", {uId: user._id, token: user.token}, function (ret) {
                if (! ret && ! ret.result) {
                    return cb();
                }
                self.reset(ret.result[0]);
                cb();
            });
        },
        getUserDetail: function (_id, cb) {
            var self = this;
            var user = Api.getUser();
            var data = {
                uId: user._id,
                token: user.token,
                _id: (_id || user._id),
            };

            Api.call("user.getUserDetail", data, function (ret) {
                if (! ret && ! ret.result) {
                    return cb();
                }
                var model = new self.model();
                model.set(ret.result[0]);
                cb(model);
            });
        },
    });
    return collection;
});
