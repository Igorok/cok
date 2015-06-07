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
        addFriendRequest: function (_id, cb) {
            var self = this;
            var user = Api.getUser();
            var data = {
                token: user.token,
                _id: _id,
            };
            Api.call("user.addFriendRequest", data, function (ret) {
                cb();
            });
        },
        addFriend: function (_id, cb) {
            var self = this;
            var user = Api.getUser();
            var data = {
                token: user.token,
                _id: _id,
            };
            Api.call("user.addFriend", data, function (ret) {
                cb();
            });
        },
        deleteFriend: function (_id, cb) {
            var self = this;
            var user = Api.getUser();
            var data = {
                token: user.token,
                _id: _id,
            };

            console.log();
            Api.call("user.deleteFriend", data, function (ret) {
                cb();
            });
        },
        getFriendList: function (cb) {
            var self = this;
            var user = Api.getUser();
            Api.call("user.getFriendList", {token: user.token}, function (ret) {
                if (! ret && ! ret.result) {
                    return cb();
                }
                self.reset(ret.result[0]);
                cb();
            });
        },
        getFriendRequests: function (cb) {
            var self = this;
            var user = Api.getUser();
            Api.call("user.getFriendRequests", {token: user.token}, function (ret) {
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
