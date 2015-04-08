define (["jquery", "underscore", "backbone", "message", "api"], function ($, _, backbone, Msg, Api) {
    'use strict';
    var model = Backbone.Model.extend({
        defaults: {
            _id : "-1",
            title : "",
            description : "",
            permission : []
        },

        idAttribute: "_id",
        
        validate: function (attrs) {
            var errors = {};
            if (! attrs.title) {
                errors.title = "Title is required";
            }
            if (! attrs.description) {
                errors.description = "Description is required";
            }
            if (! attrs.permission.length) {
                errors.permission = "Permissions is required";
            }

            if (! _.isEmpty(errors)) {
                return errors;
            }
        }
    });

    var collection = Backbone.Collection.extend({
        model: model,
        getAll: function (_data, cb) {
            var self = this;
            Api.call("admin.getGroupList", {token: _data.token}, function (ret) {
                if (!! ret && !! ret.result) {
                    self.set(ret.result[0]);
                }
                
                cb();
            });
        },
        setOne: function (_data, cb) {
            var self = this;
            Api.call("admin.editGroup", _data, function (ret) {
                cb(ret);
            });
        },
        removeOne: function (_data, cb) {
            var self = this;
            Api.call("admin.removeGroup", _data, function (ret) {
                cb(ret);
            });
        }
    });
    

    return collection;
});
