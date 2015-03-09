define (["jquery", "underscore", "backbone", "marionette", "app"], function ($, _, backbone, marionette, app) {
    'use strict';
    app.module("permissionsApp", function(permissionsApp, App) {
        // Controller
        // ----------

        permissionsApp.Controller = app.AppController.extend({
            initialize: function () {
                console.log("permissionsApp initialize");
                //_.bindAll(this, "_showMail");
            },
            _showMail: function(){
                console.log("_showMail");
                Backbone.history.navigate("permissions");

            },

        });

        // Initializers
        // ------------
        permissionsApp.addInitializer(function(args){
            permissionsApp.controller = new permissionsApp.Controller({
                mainRegion: args.mainRegion,
                navRegion: args.navRegion,
                appSelectorRegion: args.appSelectorRegion
            });

            //permissionsApp.controller.show();
            //App.vent.trigger("app:started", "permissions");
        });

        permissionsApp.addFinalizer(function(){
            if (permissionsApp.controller){
                //permissionsApp.controller.close();
                delete permissionsApp.controller;
            }
        });






    });
});
