define ([
	"jquery", "underscore", "backbone", "dust", "tpl", "message", "mPost"
], function ($, _, backbone, dust, tpl, Msg, mPost) {
	'use strict';
	var view = {};
	function redirect (_id) {
		var url = 'blog/';
		if (_id) {
			url += _id;
		}
		window.location.hash = url;
	}

	// form to edit posts
	view.form = Backbone.View.extend({
		initialize: function (opts) {
			if (! opts || ! opts._bId) {
				redirect();
			}
			this._bId = opts._bId;
			if (opts._id) {
				this._id = opts._id;
			}
			this.collection = new mPost();
			this.model = new this.collection.model();
			this.model.set({'_bId': this._bId})
		},
		render: function () {
			var self = this;
			self.renderForm();
			return self;

		},
		events: {
			'submit #postForm': 'savePost',
		},

		savePost: function (e) {
			e.preventDefault();
			var self = this;
			var setObj = {
				name: self.$('#name').val(),
				description: self.$('#description').val(),
				status: self.$('#status').val(),
			};

			self.model.set(setObj);
			if (! self.model.isValid()) {
				return Msg.inputError(self.model.validationError);
			}

			var func = 'postCreate';
			if (self._id) {
				func = 'postEdit';
			}
			self.model.savePost(func, function () {
				console.log('saved');
				redirect(self._bId);
			});

		},
		renderForm: function () {
			var self = this;
			self.model.getStatuses(function (statuses) {
				if (! self._id) {
					return self.renderDust(self.model.toJSON());
				}
				var data = {
					_bId: self._bId,
					_id: self._id,
				};
				self.model.postDetail(data, function () {
					var access = self.model.get('access');
					if (! access.edit) {
						redirect();
					}
					self.renderDust(self.model.toJSON());
				});
			});
		},
		renderDust: function (data) {
			var self = this;
			dust.render("post_form", data, function (err, text) {
				if (err) {
					console.trace(err);
				}
				self.$el.html(text);
				return self;
			});
		},
	});

	// detail page for post
	view.detail = Backbone.View.extend({
		initialize: function (opts) {
			if (! opts || ! opts._bId || ! opts._id) {
				redirect();
			}
			this._id = opts._id;
			this._bId = opts._bId;
			this.collection = new mPost();
			this.model = new this.collection.model();
		},
		render: function () {
			var self = this;
			self.renderDetail();
			return self;

		},
		renderDetail: function () {
			var self = this;
			var data = {
				_bId: self._bId,
				_id: self._id,
			};
			self.model.postDetail(data, function () {
				dust.render("post_detail", {data: self.model.toJSON()}, function (err, text) {
					if (err) {
						return Msg.showError('Error', JSON.stringify(err));
					}
					self.$el.html(text);
				});
			});
		},
	});



	view.list = Backbone.View.extend({
		initialize: function (opts) {
			if (! opts || ! opts._bId) {
				redirect();
			}
			this.setElement(opts.el)
			this._bId = opts._bId;
			this.collection = new mPost();
		},
		render: function () {
			var self = this;
			self.renderList();
			return self;

		},
		renderList: function () {
			var self = this;
			self.collection.postList(this._bId, function (data) {
				dust.render("post_list", {data: self.collection.toJSON()}, function (err, text) {
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
