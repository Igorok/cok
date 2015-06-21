define (["jquery", "underscore", "backbone", "message", "api"], function ($, _, backbone, Msg, Api) {
    'use strict';
    var model = Backbone.Model.extend({
        // you can set any defaults you would like here
        idAttribute: "_id",
        defaults: {
            users: [],
        },
    });


    var collection = Backbone.Collection.extend({
        // Reference to this collection's model.
        model: model,
        getUserList: function (cb) {
            var self = this;
            var user = Api.getUser();
            Api.call("user.getChatList", {uId: user._id, token: user.token}, function (ret) {
                if (! ret && ! ret.result) {
                    return cb();
                }
                self.reset(ret.result[0]);
                cb();
            });
        },
    });
    return collection;
});
