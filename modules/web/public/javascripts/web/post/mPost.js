define (["jquery", "underscore", "backbone", "message", "api"], function ($, _, backbone, Msg, Api) {
	'use strict';
	var model = Backbone.Model.extend({
		// you can set any defaults you would like here
		idAttribute: "_id",
		defaults: {
			_id: "-1",
			name: null,
			description: null,
			uId: null,
			created: null,
			updated: null,
			_bId: null,
			status: "write",
			statuses: [],
			access: {},
		},
		validate: function (attrs) {
			var errors = {};
			if (! attrs.name || ! attrs.name.length) {
				errors.name = "Name is required!"
			}
			if (! attrs.description || ! attrs.description.length) {
				errors.description = "Description is required!"
			}
			if (! attrs.status || ! attrs.status.length) {
				errors.status = "Status is required!"
			}
			if (! _.isEmpty(errors)) {
				return errors;
			}
			return null;
		},
		getStatuses: function (cb) {
			var self = this;
			var user = Api.getUser();
			Api.call('blog.getStatuses', {uId: user._id, token: user.token}, function (ret) {
				if (! ret && ! ret.result) {
					return cb();
				}
				self.set({statuses: ret.result[0]});
				cb();
			});
		},
		savePost: function (func, cb) {
			if ((func != 'postCreate') && (func != 'postEdit')) {
				return;
			}
			var self = this;
			var user = Api.getUser();
			func = "blog." + func;
			Api.call(func, {uId: user._id, token: user.token, data: self.toJSON()}, function (ret) {
				if (! ret && ! ret.result) {
					return cb();
				}

				cb(ret.result[0]);
			});
		},
		postDetail: function (opts, cb) {
			var self = this;
			if (! opts._id || ! opts._bId) {
				return false;
			}
			var user = Api.getUser();
			if (user) {
				opts.uId = user._id;
				opts.token = user.token;
			}

			Api.call("blog.postDetail", opts, function (ret) {
				console.log('ret ', ret);
				if (! ret && ! ret.result) {
					return cb();
				}
				self.set(ret.result[0]);
				self.set({access: ret.result[1]});
				cb();
			});
		},
	});


	var collection = Backbone.Collection.extend({
		// Reference to this collection's model.
		model: model,
		postList: function (_bId, cb) {
			var self = this;
			var user = Api.getUser();
			var param = {
				_bId: _bId,
			};
			if (user) {
				param.uId = user._id;
				param.token = user.token;
			}
			Api.call("blog.postList", param, function (ret) {
				if (! ret && ! ret.result) {
					return cb();
				}
				self.set(ret.result[0]);
				cb();
			});
		},
	});


	return collection;
});
