require.config({
    baseUrl: "/javascripts/",
//    callback: appError,
    waitSeconds: 20,
    paths: {
        "jquery": "jquery",
        "lodash": "lodash",
        "handlebars": "handlebars",
        "tpl": "tpl",
        "jsonrpcclient": "jsonrpcclient",
        "bootstrap": "bootstrap",
        "c_core": "c_core"
    },
    shim:{
        "bootstrap": {
            deps:["jquery"]
        },
        "tpl": {
            deps:["handlebars"]
        },
        "jsonrpcclient": {
            deps:["jquery"]
        }
    }
});