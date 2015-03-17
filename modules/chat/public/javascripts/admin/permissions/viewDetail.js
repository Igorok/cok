define (["jquery", "underscore", "backbone", "dust", "tpl", "api", "message", ], function ($, _, backbone, dust, tpl, Api, Msg) {
    'use strict';
    var view = Backbone.View.extend({
        // the constructor
        initialize: function (options) {
            // model is passed through
            this.model = options;
        },

        events: {
            "submit #permissionForm": "formSubmit",
//            "click .btn": "formSubmit",
        },

        // populate the html to the dom
        render: function () {
            this.$el.html($('#main').html());
            this.formRender();
            return this;
        },

        formRender: function () {
            // e.preventDefault();
            var self = this;
            dust.render("permissionDetail", this.model.attributes, function (err, result) {
                if (err) {
                    new Msg.showError(null, err);
                }
                self.$el.html(result);
            });
        },

        formSubmit: function (e) {
            e.preventDefault();
            this.model.set({
                key: $("#key").val(),
                title: $("#title").val()
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

    return view;
});
