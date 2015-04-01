define (["jquery", "underscore", "backbone", "api", "message", "mPermission", "vPermissionList", "vPermissionDetail"], function ($, _, Backbone, Api, Msg, _mPermission, vPermissionList, vPermissionDetail) {
    'use strict';
    var controller = function () {};
    var mPermission = new _mPermission();
    var user = null;
    // get permissions from server and return model;
    var renderPermission = function (_user, opt, cb) {
        var model = null;
        if (opt == "-1") {
            mPermission.add({_id: "-1"});
            model = mPermission._byId[opt];
            return cb(null, model);
        }

        Api.call("admin.getPermissionList", {token: _user.token}, function (err, ret) {
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
    controller.prototype.index = function (_user, options) {
        Api.call("admin.getPermissionList", {token: _user.token}, function (err, ret) {
            if (err) {
                new Msg.showError(null, err);
            }
            if (ret) {
                mPermission.set(ret.result[0]);
                var view = new vPermissionList({
                    user: _user,
                    permissions: mPermission
                });
                $('#main').html(view.render().el);
            }
        });
    };

    controller.prototype.detail = function (_user, options) {
        renderPermission(_user, options, function (err, _model) {
            if (err) {
                new Msg.showError(null, err);
            }
            var view = new vPermissionDetail(_user, _model);
            $('#main').html(view.render().el);
        });
    };

    return controller;
});
