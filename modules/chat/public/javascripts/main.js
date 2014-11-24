require.config({
    baseUrl: "/javascripts/",
//    callback: appError,
    waitSeconds: 20,
    paths: {
        "jquery": "jquery",
        "lodash": "lodash",
        "handlebars": "handlebars",
        "tpl": "tpl",
        "bootstrap": "bootstrap",
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