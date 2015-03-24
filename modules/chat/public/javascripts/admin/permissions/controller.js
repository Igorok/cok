define (["jquery", "underscore", "backbone", "api", "message", "mPermission", "vPermissionList", "vPermissionDetail"], function ($, _, Backbone, Api, Msg, _mPermission, vPermissionList, vPermissionDetail) {
    'use strict';
    var controller = function () {};
    var mPermission = new _mPermission();
    // get permissions from server and return model;
    var renderPermission = function (opt, cb) {
        var model = null;
        var user = Api.getUser();
        if (opt == "-1") {
            mPermission.add({_id: "-1"});
            model = mPermission._byId[opt];
            return cb(null, model);
        }

        Api.call("admin.getPermissionList", {token: user.token}, function (err, ret) {
            if (ret) {
                mPermission.set(ret.result[0]);
                if (mPermission._byId[opt]) {
                    model = mPermission._byId[opt];
                }
            }
            cb(err, model);
        });
    };



    /*
    * public
    */
    controller.prototype.index = function (options) {
        var user = Api.getUser();
        Api.call("admin.getPermissionList", {token: user.token}, function (err, ret) {
            if (err) {
                new Msg.showError(null, err);
            }
            if (ret) {
                mPermission.set(ret.result[0]);
                var view = new vPermissionList({
                    permissions: mPermission
                });
                $('#main').html(view.render().el);
            }
        });
    };

    controller.prototype.detail = function (options) {
        var view = null;
        renderPermission(options, function (err, _model) {
            if (err) {
                new Msg.showError(null, err);
            }
            view = new vPermissionDetail(_model);
            $('#main').html(view.render().el);
        });
    };

    return controller;
});
