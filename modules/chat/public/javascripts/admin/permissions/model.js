define (["jquery", "underscore", "backbone"], function ($, _, backbone) {
    'use strict';
    var model = Backbone.Model.extend({
        // you can set any defaults you would like here
        defaults: {
            _id: "-1",
            title: "",
            key: ""
        },

        idAttribute: "_id",

        validate: function (attrs) {
            var errors = {};
            if (! attrs.title) {
                errors.title = "Title is required";
            }
            if (! attrs.key) {
                errors.key = "Key is required";
            }

            if (! _.isEmpty(errors)) {
                return errors;
            }
        }
    });

    var collection = Backbone.Collection.extend({
        // Reference to this collection's model.
        model: model,
    });

    return collection;
});
