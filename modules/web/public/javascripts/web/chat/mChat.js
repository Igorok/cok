define (["jquery", "underscore", "backbone", "message", "api"], function ($, _, backbone, Msg, Api) {
    'use strict';
    var model = Backbone.Model.extend({
        // you can set any defaults you would like here
        idAttribute: "_id",
        defaults: {
            _id: "-1",
            users: [],
        },
    });


    var collection = Backbone.Collection.extend({
        // Reference to this collection's model.
        model: model,
        getChatList: function (cb) {
            var self = this;
            var user = Api.getUser();
            Api.call("chat.getChatList", {uId: user._id, token: user.token}, function (ret) {
                if (! ret && ! ret.result) {
                    return cb();
                }
                self.set(ret.result[0]);
                cb();
            });
        },
        getEditRoom: function (_id, cb) {
            var self = this;
            var user = Api.getUser();
            Api.call("chat.getEditRoom", {uId: user._id, token: user.token, rId: _id}, function (ret) {
                if (! ret && ! ret.result) {
                    return cb();
                }
                self.set(ret.result[0]);
                cb();
            });
        },
    });
    return collection;
});
