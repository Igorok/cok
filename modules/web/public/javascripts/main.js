require.config({
    baseUrl: "/javascripts/",
//    callback: appError,
    waitSeconds: 20,
    paths: {
        "jquery": "jquery",
        "storageapi": "storageapi",
        "lodash": "lodash",
        "handlebars": "handlebars",
        "hbHelper": "hbHelper",
        "tpl": "tpl",
        "jsonrpcclient": "jsonrpcclient",
        "io": "io",
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
        "hbHelper": {
            deps:["lodash", "handlebars"]
        },
        "jsonrpcclient": {
            deps:["jquery"]
        },
        "storageapi": {
            deps:["jquery"]
        }
    },
    urlArgs: { 'bust': Date.now() }
});
