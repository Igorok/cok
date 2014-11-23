require.config({
    baseUrl: "/javascripts/",
//    callback: appError,
    waitSeconds: 20,
    paths: {
        "jquery": "jquery",
        "bootstrap": "bootstrap",
        "handlebars": "handlebars",
        "tpl": "tpl",
        "c_helper": "c_helper"
    },
    shim:{
        "bootstrap": {
            deps:["jquery"]
        },
        "tpl": {
            deps:["handlebars"]
        }
    }
});