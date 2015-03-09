define (["jquery", "underscore", "backbone", "marionette", "app", "permissionsApp"], function ($, _, backbone, marionette, app, permissionsApp) {
    'use strict';
    app.module("permissionsApp", {
        startWithParent: false,
        define: function (permissionsApp, App) {
            App.startSubApp("permissionsApp", {
                mainRegion: App.main,
                navRegion: App.nav,
                appSelectorRegion: App.appSelector
            });

            // Contacts Router
            // -----------

            var Router = Backbone.Router.extend({
                //controller: myController,
                routes: {
                    "permissions": "showContacts",
                },
                showContacts: function(){
                    console.log("Backbone.Router");
                    App.permissionsApp.controller._showMail();
                }
            });

            // Initializer
            // -----------
            //
            // The router must always be alive with the app, so that it can
            // respond to route changes and start up the right sub-app
            App.addInitializer( function () {
                var router = new Router();

            });
        }
    });
});
