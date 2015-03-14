define (["jquery", "underscore", "backbone", "dust", "tpl", "message", ], function ($, _, backbone, dust, tpl, Msg) {
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
            console.log("formSubmit ", this.model.isValid(), this.model.validationError);



            /*var self = this;
            dust.render("permissionDetail", this.data, function (err, result) {
                if (err) {
                    new Msg.showError(null, err);
                }
                self.$el.html(result);
            });*/
        },


        userModal: function (e) {
            new Msg.showError("Error", "qweqwe");
            /*var self = this;
            var _id = $(e.currentTarget).attr("data-id");
            var currentUser = this.users._byId[_id];

            self.currentView = new viewModalDetail({
                user: currentUser
            });
            $('#main').html(self.currentView.render().el);*/
        }
    });

    return view;
});
