define (["jquery", "underscore", "backbone"], function ($, _, backbone) {
    'use strict';
    var UserModel = Backbone.Model.extend({
        // you can set any defaults you would like here
        defaults: {
            _id: "",
            login: "",
            email: ""
        },
        idAttribute: "_id",
        /*validate: function (attrs) {
            var errors = {};
            if (! attrs.title) errors.title = "Hey! Give this thing a title.";
            if (! attrs.description) errors.description = "You gotta write a description, duh!";
            if (! attrs.author) errors.author = "Put your name in dumb dumb...";

            if (! _.isEmpty(errors)) {
                return errors;
            }
        }*/
    });

    var UserCollection = Backbone.Collection.extend({
        // Reference to this collection's model.
        model: UserModel,
    });

    return UserCollection;
});
