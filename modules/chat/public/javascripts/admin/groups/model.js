define (["jquery", "underscore", "backbone", "message", "api"], function ($, _, backbone, Msg, Api) {
    'use strict';
    var model = Backbone.Model.extend({
        defaults: {
            _id : -1,
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
        getGroupList: function (_data, cb) {
            Api.call("admin.getGroupList", {token: _data.token}, cb);
        }
    });
    

    return collection;
});
