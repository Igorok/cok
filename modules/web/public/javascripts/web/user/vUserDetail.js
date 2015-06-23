define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "mUser"], function ($, _, backbone, dust, tpl, Msg, mUser) {
    'use strict';
    var view = Backbone.View.extend({
        initialize: function (options) {
            var self = this;
            self._id = options._id;
            self.model = new mUser();
        },
        render: function () {
            this.renderUser();
            return this;
        },
        renderUser: function (cb) {
            var self = this;
            self.model.getUserDetail(self._id, function (_model) {
                dust.render("user_detail", _model.toJSON(), function (err, text) {
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
