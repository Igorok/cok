define (["jquery", "underscore", "backbone", "api", "message", "mAuth", "vAuth"], function ($, _, Backbone, Api, Msg, _mAuth, vAuth) {
    'use strict';

    var mAuth = new _mAuth();
    var controller = function () {
        this.index = function (options) {
            var view = new vAuth({
                model: mAuth,
            });
            $('#main').html(view.render().el);
        };
    };

    return controller;
});
