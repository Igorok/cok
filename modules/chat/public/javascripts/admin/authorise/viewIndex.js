define (["jquery", "underscore", "backbone", "dust", "api", "message", "tpl"], function ($, _, backbone, dust, Api, Msg, tpl) {
    'use strict';
    var viewIndex = Backbone.View.extend({
        // the constructor
        initialize: function (options) {
            // model is passed through
            this.model = options.model;
        },

        events: {
            "submit #loginForm": "formSubmit",
        },

        // populate the html to the dom
        render: function () {
            this.$el.html($('#main').html());
            this.index();
            return this;
        },

        index: function () {
            var self = this;
            dust.render("login", {}, function (err, result) {
                if (err) {
                    new Msg.showError(null, err);
                }
                self.$el.html(result);
            });
        },

        formSubmit: function (e) {
            e.preventDefault();
            this.model.set({
                login: $("#login").val(),
                password: $("#password").val()
            });

            Api.call("user.Authorise", this.model.attributes, function (err, ret) {
                if (ret) {
                    mPermission.set(ret.result[0]);
                    if (mPermission._byId[opt]) {
                        model = mPermission._byId[opt];
                    }
                }
                cb(err, model);
            });




            if (! this.model.isValid()) {
                Msg.inputError(this.model.validationError);
            } else {
                return window.location.hash = "permissions";

                /*Api.call("admin.editPermission", this.model.get("_id"), this.model.get("key"), this.model.get("title"), function (err, ret) {
                    if (err) {
                        new Msg.showError(null, err);
                    }
                    return window.location.hash = "permissions";
                });*/
            }
        }
    });

    return viewIndex;
});
