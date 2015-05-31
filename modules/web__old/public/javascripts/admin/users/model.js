define (["jquery", "underscore", "backbone", "message", "api"], function ($, _, backbone, Msg, Api) {
    'use strict';
    var UserModel = Backbone.Model.extend({
        // you can set any defaults you would like here
        defaults: {
            _id: "-1",
            login: "",
            email: "",
            group: "SimpleUser",
            status: 1,
        },
        idAttribute: "_id",
        validate: function (attrs) {
            var errors = {};
            if (! attrs._id) {
                errors._id = "_id is required!"
            }
            if (! attrs.login) {
                errors.login = "login is required!"
            }
            if (! attrs.email) {
                errors.email = "email is required!"
            }
            if (! attrs.group) {
                errors.group = "group is required!"
            }
            if (! attrs.status) {
                errors.status = "status is required!"
            }
        }
    });

    var UserCollection = Backbone.Collection.extend({
        model: UserModel,
        getAll: function (_data, cb) {
            var self = this;
            Api.call("admin.getUserList", {token: _data.token}, function (ret) {
                if (!! ret && !! ret.result) {
                    self.set(ret.result[0]);
                }

                cb();
            });
        },
        // setOne: function (_data, cb) {
        //     var self = this;
        //     Api.call("admin.editGroup", _data, function (ret) {
        //         cb(ret);
        //     });
        // },
        // removeOne: function (_data, cb) {
        //     var self = this;
        //     Api.call("admin.removeGroup", _data, function (ret) {
        //         cb(ret);
        //     });
        // }
    });

    return UserCollection;
});
