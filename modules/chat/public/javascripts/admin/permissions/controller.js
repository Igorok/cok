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
            return cb(model);
        }

        mPermission.getAll({token: _user.token}, function () {
            if (mPermission.get(opt)) {
                model = mPermission._byId[opt];
            }
            cb(model);
        });
    };



    /*
    * public
    */
    controller.prototype.index = function (_user, options) {
        mPermission.getAll({token: _user.token}, function () {
            var view = new vPermissionList({
                user: _user,
                permissions: mPermission
            });
            $('#main').html(view.render().el);
        });
    };

    controller.prototype.detail = function (_user, options) {
        renderPermission(_user, options, function (_model) {
            var view = new vPermissionDetail(_user, _model);
            $('#main').html(view.render().el);
        });
    };

    return controller;
});
