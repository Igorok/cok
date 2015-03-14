define (["jquery", "underscore", "backbone", "message"], function ($, _, Backbone, Msg) {
    'use strict';
    var Api = function () {};

    /*
    * ajax rest api
    */
    Api.prototype.call = function() {
        if (arguments.length < 2) {
            return false;
        }
        var _method = arguments[0].toString();
        var cb = arguments[arguments.length - 1];
        var _params = Array.prototype.slice.call(arguments, 1, arguments.length - 1);
        var data = JSON.stringify({
            jsonrpc: "2.0",
            method: _method,
            params: _params,
            id: 1
        });
        $.ajax({
            type: 'POST',
            url: '/jsonrpc',
            contentType: 'application/json',
            data: data,
            dataType: 'json',
            cache: false,
            success: function (ret) {
                if (ret.error) {
                    console.log("ret.error", JSON.stringify(ret.error));
                    var err = ret.error.message ? ret.error.message : JSON.stringify(ret.error);
                    new Msg.showError(null, err);
                } else {
                    cb(null, ret);
                }
            },
            error: function (err) {
                new Msg.showError(null, JSON.stringify(err));
            }
        });
    };

    Api.prototype.models = {};


    return new Api();
});
