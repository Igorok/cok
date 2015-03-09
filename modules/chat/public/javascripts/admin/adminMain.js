require.config({
    paths: {
        jquery: "../../../../../../jquery.js",
    }
});

/*

require.config({
    baseUrl: "/javascripts/admin",
    waitSeconds: 20,
    paths: {
        '../jquery': "../jquery",
        storageapi: "../storageapi",
        lodash: "../lodash",
        bootstrap: "../bootstrap",
        backbone: "../backbone",
        marionette: "../backbone.marionette"
    },
    shim: {
        lodash: {
            exports: '_'
        },
        backbone: {
            exports: 'Backbone',
            deps: ['jquery', 'lodash']
        },
        marionette: {
            exports: 'Backbone.Marionette',
            deps: ['backbone']
        },
        bootstrap: {
            deps:["jquery"]
        },
        storageapi: {
            deps:["jquery"]
        }
    },
    deps: ['jquery', 'lodash'],
    urlArgs: { 'bust': Date.now() }
});
*/
