define (["jquery", "underscore", "backbone", "api", "message", "mUser", "vUserList"], function ($, _, Backbone, Api, Msg, _mUser, vUserList) {
    'use strict';
    var controller = function () {};
    var mUser = new _mUser();

    controller.prototype.userIndex = function (options) {
        Api.call("admin.getUserList", function (err, ret) {
            if (err) {
                new Msg.showError(null, err);
            }
            if (ret) {
                mUser.set(ret.result[0]);
                var view = new vUserList({
                    users: mUser
                });
                $('#main').html(view.render().el);
            }
        });
    };

    return controller;
});
