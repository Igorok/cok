define (["jquery", "underscore", "backbone", "message", "api"], function ($, _, backbone, Msg, Api) {
    'use strict';
    var model = Backbone.Model.extend({
        // you can set any defaults you would like here
        idAttribute: "_id",
        defaults: {
            _id: "-1",
            name: null,
            description: null,
            uId: null,
            created: null,
            updated: null,
        },
        validate: function (attrs) {
            var errors = {};
            if (! attrs.name || ! attrs.name.length) {
                errors.name = "Name is required!"
            }
            if (! attrs.description || ! attrs.description.length) {
                errors.description = "Description is required!"
            }
            if (! _.isEmpty(errors)) {
                return errors;
            }
        },
        saveBlog: function (func, cb) {
            if ((func != 'blogCreate') && (func != 'blogEdit')) {
                return;
            }
            var self = this;
            var user = Api.getUser();
            func = "blog." + func;
            Api.call(func, {uId: user._id, token: user.token, data: self.toJSON()}, function (ret) {
                cb();
            });
        },
        blogDetail: function (_id, cb) {
            var self = this;
            if (! _id) {
                return false;
            }
            var user = Api.getUser();
            var param = {
                _id: _id,
            };
            if (user) {
                param.uId = user._id;
                param.token = user.token;
            }
            Api.call("blog.blogDetail", param, function (ret) {
                if (! ret && ! ret.result) {
                    return cb();
                }
                self.set(ret.result[0]);
                self.set({access: ret.result[1]});
                cb();
            });
        },
    });


    var collection = Backbone.Collection.extend({
        // Reference to this collection's model.
        model: model,
        blogList: function (cb) {
            var self = this;
            var user = Api.getUser();
            var param = {};
            if (user) {
                param.uId = user._id;
                param.token = user.token;
            }
            Api.call("blog.blogList", param, function (ret) {
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
