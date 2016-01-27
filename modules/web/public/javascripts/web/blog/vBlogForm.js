define ([
    "jquery", "underscore", "backbone", "dust", "tpl", "message", "mBlog"
], function ($, _, backbone, dust, tpl, Msg, mBlog) {
    'use strict';
    function redirect () {
        window.location.hash = '';
    }
    var view = Backbone.View.extend({
        initialize: function (opts) {
            if (opts && opts._id) {
                this._id = opts._id;
            }
            this.collection = new mBlog();
            this.model = new this.collection.model();
        },
        render: function () {
            this.renderForm();
            return this;
        },
        events: {
            'submit #blogForm': 'saveBlog',
        },

        saveBlog: function (e) {
            e.preventDefault();
            var self = this;
            var setObj = {
                name: self.$('#name').val(),
                description: self.$('#description').val(),
            };
            var checked = self.$('#public').prop('checked');
            setObj.public = !! checked;

            self.model.set(setObj);
            if (! self.model.isValid()) {
                return Msg.inputError(self.model.validationError);
            }

            var func = 'blogCreate';
            if (self._id) {
                func = 'blogEdit';
            }
            self.model.saveBlog(func, redirect);

        },
        renderForm: function () {
            var self = this;
            if (! self._id) {
                return self.renderDust({});
            }
            self.model.blogDetail(self._id, function () {
                var access = self.model.get('access');
                if (! access.edit) {
                    redirect();
                }
                self.renderDust(self.model.toJSON());
            });

        },
        renderDust: function (data) {
            var self = this;
            dust.render("blog_form", data, function (err, text) {
                if (err) {
                    console.trace(err);
                }
                self.$el.html(text);
                return self;
            });
        },
    });
    return view;
});
