define ([
	"jquery", "underscore", "backbone", "dust", "io", "api", "message", "vAuth", "vBlogList", "vBlogForm", "vProfile",
	"vUserList", "vUserDetail", "vFriendList", "vReg", "vFriendReq", "vChatPersonal", "vChatList", "vChatRoomEdit",
	"vChatRoom", "vBlogDetail", "vPost",
], function ($, _, Backbone, dust, io, Api, Msg, vAuth, vBlogList, vBlogForm, vProfile, vUserList, vUserDetail, vFriendList, vReg, vFriendReq, vChatPersonal, vChatList, vChatRoomEdit, vChatRoom, vBlogDetail, vPost) {
	"use strict";
	var Route = Backbone.Router.extend({
		routes:  {
			"about": "about",
			"": "blogList",
			"blog": "blogList",
			"blog/:id": "blogDetail",
			"blog-new": "blogForm",
			"blog-edit/:id": "blogForm",

			"post-new/:_bId": "postForm",
			"post-edit/:_bId/:_id": "postForm",
			"post/:_bId/:_id": "postDetail",

			"login": "auth",
			"registration": "registration",
			"logout": "logout",
			"profile": "profile",
			"user": "userList",
			"user/:id": "userDetail",
			"friend": "friendList",
			"friend-requests": "friendReq",
			"chat/:id": "chatPersonal",
			"chat-room": "chatList",
			"chat-room/:id": "chatRoom",
			"chat-room-edit/:id": "chatRoomEdit",
			'*notFound': 'notFound',
		},

		execute: function(callback, args, name) {
			var self = this;
			self.renderMenu(function () {
				callback.apply(self, args);
			});
		},
		renderMenu: function (cb) {
			var self = this;
			self.user = Api.getUser();
			dust.render("menu", {user: self.user}, function (err, result) {
				if (err) {
					return new Msg.showError(null, err);
				}
				$("#menu").html(result);
				cb();
			});
		},

		auth: function (options) {
			var view = new vAuth();
			$('#main').html(view.render().el);
		},
		registration: function (options) {
			var view = new vReg();
			$('#main').html(view.render().el);
		},
		logout: function () {
			var self = this;
			if (! self.user) {
				return Msg.showError(null, "403");
			}
			self.user = Api.removeUser();
			self.navigate("login");
		},
		about: function () {
			dust.render("about", {}, function (err, text) {
				if (err) {
					console.trace(err);
					return Msg.showError(null, JSON.stringify(err));
				}
				$('#main').html(text);
			});
		},
		blogList: function () {
			var view = new vBlogList();
			$('#main').html(view.render().el);
		},
		blogDetail: function (id) {
			var view = new vBlogDetail({_id: id});
			$('#main').html(view.render().el);
		},


		blogForm: function (id) {
			var self = this;
			if (! self.user) {
				return Msg.showError(null, "403");
			}
			var opts = null;
			if (id) {
				opts = {_id: id};
			}
			var view = new vBlogForm(opts);
			$('#main').html(view.render().el);
		},

		postForm: function (_bId, _id) {
			var self = this;
			if (! _bId) {
				self.navigate("blog/");
			}
			if (! self.user) {
				return Msg.showError(null, "403");
			}
			var opts = {
				_bId: _bId,
			};
			if (_id) {
				opts._id = _id;
			}
			var view = new vPost.form(opts);
			$('#main').html(view.render().el);
		},
		postDetail: function (_bId, _id) {
			var self = this;
			if (! _bId || ! _id) {
				self.navigate("blog/");
			}

			var opts = {
				_bId: _bId,
				_id: _id,
			};
			var view = new vPost.detail(opts);
			$('#main').html(view.render().el);
		},

		profile: function () {
			var self = this;
			if (! self.user) {
				return Msg.showError(null, "403");
			}
			var view = new vProfile();
			$('#main').html(view.render().el);
		},
		friendList: function () {
			var self = this;
			if (! self.user) {
				return Msg.showError(null, "403");
			}
			var view = new vFriendList();
			$('#main').html(view.render().el);
		},
		friendReq: function () {
			var self = this;
			if (! self.user) {
				return Msg.showError(null, "403");
			}
			var view = new vFriendReq();
			$('#main').html(view.render().el);
		},
		userList: function () {
			var self = this;
			if (! self.user) {
				return Msg.showError(null, "403");
			}
			var view = new vUserList();
			$('#main').html(view.render().el);
		},
		userDetail: function (options) {
			var self = this;
			if (! self.user) {
				return Msg.showError(null, "403");
			}
			var view = new vUserDetail({
				_id: options
			});
			$('#main').html(view.render().el);
		},
		chatList: function () {
			var self = this;
			if (! self.user) {
				return Msg.showError(null, "403");
			}
			var view = new vChatList();
			$('#main').html(view.render().el);
		},
		chatRoom: function (_id) {
			var self = this;
			if (! self.user) {
				return Msg.showError(null, "403");
			}
			socketClose();
			var view = new vChatRoom({
				_id: _id
			});
			$('#main').html(view.render().el);
		},
		chatRoomEdit: function (_id) {
			var self = this;
			if (! self.user) {
				return Msg.showError(null, "403");
			}
			var view = new vChatRoomEdit({
				_id: _id
			});
			$('#main').html(view.render().el);
		},
		chatPersonal: function (_id) {
			var self = this;
			if (! self.user) {
				return Msg.showError(null, "403");
			}
			socketClose();
			var view = new vChatPersonal({
				_id: _id
			});
			$('#main').html(view.render().el);
		},









		notFound: function () {
			window.location.href = '#'
		}
	});

	var socketClose = function () {
		if (window.socket) {
			var eArr = [
				"joinPersonal",
				"joinRoom",
				"joinUser",
				"freshStatus",
				"message",
				"err",
			];
			_.each(eArr, function (_ev) {
				window.socket.removeAllListeners(_ev);
			});
			window.socket.close();
		}
	};
	var init = function () {
		new Route({});
		Backbone.history.start();
	};
	return {init: init};
});
