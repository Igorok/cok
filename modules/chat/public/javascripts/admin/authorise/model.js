define (["jquery", "underscore", "backbone"], function ($, _, Backbone) {
    'use strict';
    var model = Backbone.Model.extend({
        // you can set any defaults you would like here
        defaults: {
            _id: "-1",
            login: "",
            password: ""
        },
        
        idAttribute: "_id",
        
        validate: function (attrs) {
            var errors = {};
            if (! attrs.login) {
                errors.login = "Login is required";
            }
            if (! attrs.password) {
                errors.password = "Password is required";
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
