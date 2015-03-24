define (["jquery", "underscore", "backbone", "message", "storageapi"], function ($, _, Backbone, Msg, storageapi) {
    'use strict';
    var Api = function () {};
    var Storage = $.localStorage;
    var user = null;
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

    Api.prototype.setUser = function (_user) {
        user = _user;
        Storage.set('user', _user);
        return user;
    };
    
    Api.prototype.getUser = function () {
        if (! user) {
            user = Storage.get('user');
        }
        if (! user) {
            return new Msg.showError(null, "403");
        } else {
            return user;
        }
    };

    return new Api();
});
