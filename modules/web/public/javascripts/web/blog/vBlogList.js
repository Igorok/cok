define ([
    "jquery", "underscore", "backbone", "dust", "tpl", "message", "mBlog",
], function ($, _, backbone, dust, tpl, Msg, mBlog) {
    'use strict';
    var view = Backbone.View.extend({
        initialize: function () {
            this.collection = new mBlog();
        },
        render: function () {
            this.renderIndex();
            return this;
        },
        renderIndex: function (cb) {
            var self = this;
            self.collection.blogList(function () {
                dust.render("blog_list", {data: self.collection.toJSON()}, function (err, text) {
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
