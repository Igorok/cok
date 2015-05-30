define (["jquery", "underscore", "backbone", "api", "message", "mAuth", "vAuth"], function ($, _, Backbone, Api, Msg, _mAuth, vAuth) {
    'use strict';

    var mAuth = new _mAuth();
    mAuth.add({_id: "-1"});
    var controller = function () {
        this.index = function (options) {
            var view = new vAuth({
                model: mAuth._byId["-1"],
            });
            $('#content').html(view.render().el);
        };
    };

    return controller;
});
