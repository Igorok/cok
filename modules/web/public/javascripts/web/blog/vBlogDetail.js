define ([
	"jquery", "underscore", "backbone", "dust", "tpl", "message", "mBlog", "vPost", "dust-filters"
], function ($, _, backbone, dust, tpl, Msg, mBlog, vPost, df) {
	'use strict';
	var view = Backbone.View.extend({
		initialize: function (opts) {
			this._id = opts._id;
			this.collection = new mBlog();
			this.model = new this.collection.model();
		},
		render: function () {
			this.renderBlog();
			return this;
		},
		events: {
			// 'submit #blogForm': 'saveBlog',
		},
		renderBlog: function (cb) {
			var self = this;
			self.model.blogDetail(self._id, function () {
				dust.render("blog_detail", {data: self.model.toJSON()}, function (err, text) {
					if (err) {
						console.trace(err);
					}
					self.$el.html(text);
					self.renderPosts();
				});
			});
		},

		renderPosts: function () {
			var self = this;
			var opts = {
				el: self.$('#postList'),
				_bId: self._id,
			};
			self.vPost = new vPost.list(opts);
			self.vPost.render();
		},
	});
	return view;
});
