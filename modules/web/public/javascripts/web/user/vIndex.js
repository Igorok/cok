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
            self.model.getUserDetail(null, function (_obj) {
                dust.render("user_index", _obj, function (err, text) {
                    if (err) {
                        console.trace(err);
                    }
                    console.log('_obj ', _obj);
                    self.$el.html(text);
                    return self;
                });
            });
        },
    });
    return view;
});
