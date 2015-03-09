define (["jquery", "underscore", "backbone", "marionette", "app", "appController"], function ($, _, backbone, marionette, app, appController) {
    'use strict';
    app.module("appController", {
        startWithParent: true,
        define: function(appController, app, backbone, marionette, $, _) {
            // Mail Router
            // -----------
            var Router = backbone.Router.extend({
                routes: {
                    "permissions": "permissionList",
                    "mail": "showInbox",
                    "mail/categories/:id": "showMailByCategory",
                    "mail/inbox/:id": "showMailById"
                },

                // route filter before method
                // https://github.com/boazsender/backbone.routefilter
                before: function () {
                    console.log("appController");
                    app.startSubApp("appController", {
                        mainRegion: app.main,
                        navRegion: app.nav,
                        appSelectorRegion: app.appSelector
                    });
                },

                permissionList: function () {
                    //app.appController.controller.showInbox();
                    console.log("permissionList");
                },

                showMailById: function (id) {
                    app.appController.controller.showMailById(id);
                },

                showMailByCategory: function (category) {
                    app.appController.controller.showMailByCategory(category);
                }
            });

            // Initializer
            // -----------
            //
            // The router must always be alive with the app, so that it can
            // respond to route changes and start up the right sub-app
            app.addInitializer(function () {
                var router = new Router();
            });
        }
    });
});
