define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "mUser"], function ($, _, backbone, dust, tpl, Msg, mUser) {
    'use strict';
    var view = Backbone.View.extend({
        events: {
            "submit #loginForm": "submitForm"
        },
        initialize: function () {
            this.model = new mUser();
        },
        render: function () {
            this.renderIndex();
            return this;
        },
        renderIndex: function (cb) {
            var self = this;
            self.model.getUserDetail(null, function (_model) {
                var data = {
                    login: _model.get('login'),
                    email: _model.get('email'),
                    picture: _model.get('picture'),
                };
                dust.render("user_index", data, function (err, text) {
                    if (err) {
                        console.trace(err);
                    }
                    self.$el.html(text);
                    return self;
                });
            });
        },
    });
    return view;
});
