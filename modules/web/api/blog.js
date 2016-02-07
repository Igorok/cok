"use strict";
var safe = require('safe');
var _ = require("lodash");
var moment = require('moment');
var cokcore = require('cokcore');


/*
    begin api
*/
var Api = function () {};
Api.prototype.init = function (cb) {
    var self = this;
    safe.series([
        function (cb) {
            safe.parallel([
                function (cb) {
                    cokcore.collection("blogs", safe.sure(cb, function (coll) {
                        cb();
                    }));
                },
                function (cb) {
                    cokcore.collection("posts", safe.sure(cb, function (coll) {
                        cb();
                    }));
                },
            ], cb);
        },
        function (cb) {
            cokcore.apiLoad(__dirname + '/user.js', safe.sure(cb, function (_api) {
                cb();
            }));
        }
    ], cb);
};

/*
    access rules for blog
*/
cokcore.validate.add('access_blog_edit', function (_user, _params, cb) {
    if (_.isEmpty(_params) || _.isEmpty(_params._id)) {
        return cb(new Error('Blog not found'));
    }
    let q = {
        _id: cokcore.ObjectID(_params._id.toString()),
        uId: _user._id,
    };
    cokcore.ctx.col.blogs.find(q, {_id: 1}, {limit: 1}).count(cb);
});


/*
    validation rules for blogs
*/
cokcore.validate.add('blog_create', function (_params, cb) {
    if (_.isEmpty(_params) || _.isEmpty(_params.name) || _.isEmpty(_params.description)) {
        return cb('Name and description are required');
    }
    cokcore.ctx.col.blogs.findOne({name: _params.name.toString()}, safe.sure(cb, function (oldBlog) {
        if (oldBlog) {
            return cb('This name already exists');
        }
        cb();
    }));
});

cokcore.validate.add('blog_edit', function (_user, _params, cb) {
    if (_.isEmpty(_params) || _.isEmpty(_params._id)) {
        return cb('Blog not found');
    }
    if (_.isEmpty(_params.name) || _.isEmpty(_params.description)) {
        return cb('Name and description are required');
    }
    safe.parallel([
        function (cb) {
            cokcore.validate.check('access_blog_edit', _user, _params, safe.sure(cb, function (_a) {
                if (! _a) {
                    return cb(new Error(403));
                }
                cb();
            }));
        },
        function (cb) {
            var q = {
                name: _.escape(_params.name),
                _id: {$ne: cokcore.ObjectID(_params._id.toString())},
            }
            cokcore.ctx.col.blogs.find(q, {limit: 1}).count(safe.sure(cb, function (oldBlog) {
                if (oldBlog) {
                    return cb('This name already exists');
                }
                cb();
            }));
        },
    ], cb);

});

cokcore.validate.add('access_blog_detail', function (_params, cb) {
    if (_.isEmpty(_params) || _.isEmpty(_params._id)) {
        return cb('Id of a blog are required');
    }

    cb();
});

/**
* function to check access to post
* @param {object} user - user of aplication
* @param {object} blog - blog for post
* @param {object} post - post
* @return {object}
*         object.show - access to see the post
*         object.edit - access to edit
*/
cokcore.validate.add('access_post_detail', function (user, blog, post, cb) {
	if (! blog || ! post || (blog._id.toString() != post._bId.toString())) {
		return cb(new Error(404));
	}
	let access = {
		show: false,
		edit: false,
	};
	if (blog.public && (post.status == 'publish')) {
		access.show = true;
	}

	if (user) {
		if (user._id.toString() == post.uId.toString()) {
			access.show = true;
			access.edit = true;
		} else if (post.status == 'publish') {
			access.show = true;
		}
	}

	cb(null, access);
});



/*
    access rules for post
*/
cokcore.validate.add('access_post_edit', function (_user, _params, cb) {
    if (
        _.isEmpty(_params) ||
         _.isEmpty(_params._id) ||
         _.isEmpty(_params._bId)
     ) {
        return cb(new Error(404));
    }
    let _id = cokcore.ObjectID(_params._id.toString());
    let _bId = cokcore.ObjectID(_params._bId.toString());
    safe.parallel([
        function (cb) {
            let p = {_id: _bId};
            cokcore.validate.check('access_blog_edit', _user, p, cb);
        },
        function (cb) {
            let q = {
                _id: _id,
                _bId: _bId,
                uId: _user._id,
            };
            cokcore.ctx.col.posts.find(q, {_id: 1}, {limit: 1}).count(cb);
        },
    ], safe.sure(cb, function (exists) {
        let _a = (exists[0] && exists[1]);
        cb(null, _a);
    }));

});




/*
    validation for posts
*/
cokcore.validate.add('post_create', function (_user, _params, cb) {
    if (
        _.isEmpty(_params) ||
        _.isEmpty(_params._bId)
    ) {
        return cb(new Error('Blog not found'));
    }
    if (
        _.isEmpty(_params.name) ||
        _.isEmpty(_params.description) ||
        _.isEmpty(_params.status)
    ) {
        return cb(new Error('Name, description and status are required'));
    }
    var statuses = _.pluck(cokcore.ctx.cfg.app.postStatus, '_id');
    if (! _.includes(statuses, _params.status)) {
        return cb(new Error('Status is not exists'));
    }

    let _bId = cokcore.ObjectID(_params._bId.toString());
    safe.parallel([
        function (cb) {
            let p = {_id: _bId};
            cokcore.validate.check('access_blog_edit', _user, p, safe.sure(cb, function (_a) {
                if (! _a) {
                    return cb(new Error(403));
                }
                cb();
            }));
        },
        function (cb) {
            var q = {
                name: _.escape(_params.name),
            };
            cokcore.ctx.col.posts.findOne(q, {_id: 1}, safe.sure(cb, function (exists) {
                if (exists) {
                    return cb(new Error('This name already exists'));
                }
                cb();
            }));
        },
    ], cb);
});

cokcore.validate.add('post_edit', function (_user, _params, cb) {
    if (
        _.isEmpty(_params) ||
        _.isEmpty(_params._bId) ||
        _.isEmpty(_params._id)
    ) {
        return cb(new Error(404));
    }
    if (
        _.isEmpty(_params.name) ||
        _.isEmpty(_params.description) ||
        _.isEmpty(_params.status)
    ) {
        return cb(new Error('Name, description and status are required'));
    }
    var statuses = _.pluck(cokcore.ctx.cfg.app.postStatus, '_id');
    if (! _.includes(statuses, _params.status)) {
        return cb(new Error('Status is not exists'));
    }


    let _bId = cokcore.ObjectID(_params._bId.toString());
    let _id = cokcore.ObjectID(_params._id.toString());
    safe.parallel([
        function (cb) {
            let p = {
				_id: _id,
				_bId: _bId,
			};
            cokcore.validate.check('access_post_edit', _user, p, safe.sure(cb, function (_a) {
                if (! _a) {
                    return cb(new Error(403));
                }
                cb();
            }));
        },
        function (cb) {
            var q = {
                _id: {$ne: _id},
                name: _params.name.toString(),
            };
            cokcore.ctx.col.posts.findOne(q, safe.sure(cb, {_id: 1}, function (exists) {
                if (exists) {
                    return cb('This name already exists');
                }
                cb();
            }));
        },
    ], cb);
});








/*
    blogs
*/
Api.prototype.blogListPublic = function (cb) {
    cokcore.ctx.col.blogs.find({public: true}).toArray(safe.sure(cb, function (_arr) {
        cb(null, _arr);
    }));
};

Api.prototype.blogList = function (_data, cb) {
    let self = this;
    if (! _data.params[0] || ! _data.params[0].token || ! _data.params[0].uId) {
        return Api.prototype.blogListPublic(cb);
    }
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_user, _params) {
        cokcore.ctx.col.blogs.find().toArray(safe.sure(cb, function (_arr) {
            cb(null, _arr);
        }));
    }));
};


Api.prototype.blogDetailPublic = function (_data, cb) {
    let self = this;
    if (! _data || ! _data.params[0] || ! _data.params[0]._id) {
        return cb('Blog not found');
    }
    let q = {
        _id: cokcore.ObjectID(_data.params[0]._id.toString()),
        public: true,
    };
    cokcore.ctx.col.blogs.findOne(q, safe.sure(cb, function (obj) {
        if (! obj) {
            return cb('Blog not found');
        }
        cb(null, obj, {});
    }));
};


Api.prototype.blogDetail = function (_data, cb) {
    let self = this;
    if (! _data.params[0] || ! _data.params[0]._id) {
        return cb('Blog not found');
    }
    if (! _data.params[0].token || ! _data.params[0].uId) {
        return Api.prototype.blogDetailPublic(_data, cb);
    }

    let user = null;
    let param = null;
    let blog = null;
    let access = {
        edit: false,
    };
    safe.series([
        function (cb) {
            cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_u, _p) {
                user = _u;
                param = _p;
                cb();
            }));
        },
        function (cb) {
            cokcore.validate.check('access_blog_detail', param, cb);
        },
        function (cb) {
            let _id = cokcore.ObjectID(param._id.toString());
            cokcore.ctx.col.blogs.findOne({_id: _id}, safe.sure(cb, function (obj) {
                blog = obj;
                cb();
            }));
        },
        function (cb) {
            cokcore.validate.check('access_blog_edit', user, blog, safe.sure(cb, function (_a) {
                access.edit = !! _a;
                cb();
            }));
        },
    ], safe.sure(cb, function () {
        cb(null, blog, access);
    }));
};

/*
    create new blog
*/
Api.prototype.blogCreate = function (_data, cb) {
    let user = null;
    let param = null;
    let newBlog = null;
    safe.series([
        function (cb) {
            cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_u, _p) {
                user = _u;
                param = _p ? _p.data : null;
                cb();
            }));
        },
        function (cb) {
            cokcore.validate.check('blog_create', param, cb)
        },
        function (cb) {
            let iObj = {
                name: _.escape(param.name),
                description:  _.escape(param.description),
                uId: user._id,
                created: new Date(),
            };
            if (param.public) {
                iObj.public = true;
            }
            cokcore.ctx.col.blogs.insert(iObj, safe.sure(cb, function (info) {
                newBlog = info.ops[0];
                cb();
            }));
        },
    ], safe.sure(cb, function () {
        cb(null, newBlog);
    }));
};
/*
    edit old blog
*/
Api.prototype.blogEdit = function (_data, cb) {
    let user = null;
    let param = null;
    let blog = null;
    safe.series([
        function (cb) {
            cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_u, _p) {
                user = _u;
                param = _p ? _p.data : null;
                cb();
            }));
        },
        function (cb) {
            cokcore.validate.check('blog_edit', user, param, cb);
        },
        function (cb) {
            cokcore.ctx.col.blogs.findOne({_id: cokcore.ObjectID(param._id.toString())}, safe.sure(cb, function (info) {
                blog = info;
                cb();
            }));
        },
        function (cb) {
            // set params if something changed
            let setObj = {};
            let unsetObj = {};
            if (param.name != blog.name) {
                setObj.name = _.escape(param.name);
            }
            if (param.description != blog.description) {
                setObj.description = _.escape(param.description);
            }
            if ((!! param.public) != (!! blog.public)) {
                if (param.public) {
                    setObj.public = true;
                } else {
                    unsetObj.public = '';
                }
            }

            if (_.isEmpty(setObj) && _.isEmpty(unsetObj)) {
                return cb('Nothing to update');
            }
            // create object for update
            let upObj = {};
            setObj.updated = new Date();
            if (! _.isEmpty(setObj)) {
                upObj.$set = setObj;
            }
            if (! _.isEmpty(unsetObj)) {
                upObj.$unset = unsetObj;
            }
            cokcore.ctx.col.blogs.update({_id: blog._id}, upObj, cb);
        },
    ], safe.sure(cb, function () {
        cb();
    }));
};


















/**
* function to show public post
* @param { string } _data._id - id of the post
* @param { string } _data._bId - id of the blog
* @return {object, object} - return data of post and access to this
*/
Api.prototype.postDetailPublic = function (_data, cb) {
	let self = this;
	if (! _data.params[0] || ! _data.params[0]._bId || ! _data.params[0]._id) {
        return cb(new Error(404));
    }
	let q = {
		_id: cokcore.ObjectID( _data.params[0]._bId.toString()),
		public: true,
	};
	// find blog
	cokcore.ctx.col.blogs.findOne(q, safe.sure(cb, function (blog) {
		if (! blog) {
			return cb(new Error(404));
		}
		let pq = {
			_id: cokcore.ObjectID(_data.params[0]._id.toString()),
			_bId: blog._id,
			status: 'publish',
		};
		// find post
		cokcore.ctx.col.posts.findOne(pq, safe.sure(cb, function (post) {
			if (! post) {
				return cb(new Error(404));
			}
			cb(null, post, {});
		}));
	}));
};
/**
* function to show public post
* @param { string } _data._id - id of the post
* @param { string } _data._bId - id of the blog
* @return {object, object} - return data of post and access to this
*/
Api.prototype.postDetail = function (_data, cb) {
	let self = this;
	if (! _data.params[0] || ! _data.params[0]._bId || ! _data.params[0]._id) {
        return cb(new Error(404));
    }
    if (! _data.params[0].token || ! _data.params[0].uId) {
        return Api.prototype.postDetailPublic(_data, cb);
    }
	let user = null;
    let param = null;
    let blog = null;
    let post = null;
    let access = {
        show: false,
        edit: false,
    };

	let _bId = cokcore.ObjectID(_data.params[0]._bId.toString());
	let _id = cokcore.ObjectID(_data.params[0]._id.toString());

    safe.series([
        function (cb) {
            cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_u, _p) {
                user = _u;
                param = _p;
                cb();
            }));
        },
        function (cb) {
            cokcore.ctx.col.blogs.findOne({_id: _bId}, safe.sure(cb, function (obj) {
                blog = obj;
                cb();
            }));
        },
		function (cb) {
            cokcore.ctx.col.posts.findOne({_id: _id, _bId: _bId}, safe.sure(cb, function (obj) {
                post = obj;
                cb();
            }));
        },
        function (cb) {
            cokcore.validate.check('access_post_detail', user, blog, post, safe.sure(cb, function (_a) {
                access = _a;
				if (! access.show) {
					return cb(new Error(404));
				}
                cb();
            }));
        },
    ], safe.sure(cb, function () {
        cb(null, post, access);
    }));
};


Api.prototype.getStatuses = function (_data, cb) {
    cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_u, _p) {
        var stat = cokcore.ctx.cfg.app.postStatus;
        cb(null, stat);
    }));

};


Api.prototype.postListPublic = function (_data, cb) {
	let self = this;
	if (! _data.params[0] || ! _data.params[0]._bId) {
        return cb(new Error(404));
    }
	let q = {
		_id: cokcore.ObjectID( _data.params[0]._bId.toString()),
		public: true,
	};
	cokcore.ctx.col.blogs.findOne(q, safe.sure(cb, function (blog) {
		if (! blog) {
			return cb(new Error(404));
		}
		let pq = {
			_bId: blog._id,
			status: 'publish',
		};
		cokcore.ctx.col.posts.find(pq, {sort: {date: -1}}).toArray(safe.sure(cb, function (posts) {
			cb(null, posts);
		}));
	}));
};

/**
* list of posts for a blog
* @param { string } _data._bId id of the blog
*/
Api.prototype.postList = function (_data, cb) {
	let self = this;
	if (! _data.params[0] || ! _data.params[0]._bId) {
        return cb(new Error(404));
    }
    if (! _data.params[0].token || ! _data.params[0].uId) {
        return Api.prototype.postListPublic(_data, cb);
    }

	let user = null;
	let query = {};
	let pArr = [];
	let access = false;
	safe.series([
		// check user
		function (cb) {
			cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (u, p) {
		        user = u;
				query._bId = cokcore.ObjectID(p._bId);
				cb();
		    }));
		},
		// check access
		function (cb) {
			cokcore.validate.check('access_blog_edit', user, {_id: query._bId}, safe.sure(cb, function (check) {
				access = !! check;
				cb();
			}));
		},
		// find posts
		function (cb) {
			if (! access) {
				query.status = 'publish';
			}
			cokcore.ctx.col.posts.find(query, {sort: {date: -1}}).toArray(safe.sure(cb, function (_arr) {
	            pArr = _arr;
				cb();
	        }));
		},
	], safe.sure(cb, function () {
		cb(null, pArr);
	}));
};
/*
    create new post
*/
Api.prototype.postCreate = function (_data, cb) {
    let user = null;
    let param = null;
    let newPost = null;
    safe.series([
        function (cb) {
            cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_u, _p) {
                user = _u;
                param = _p ? _p.data : null;
                cb();
            }));
        },
        function (cb) {
            cokcore.validate.check('post_create', user, param, cb);
        },
        function (cb) {
            let iObj = {
                name: _.escape(param.name),
                description:  _.escape(param.description),
                uId: user._id,
                created: new Date(),
                _bId: cokcore.ObjectID(param._bId.toString()),
                status: param.status,
            };

            cokcore.ctx.col.posts.insert(iObj, safe.sure(cb, function (info) {
                newPost = info.ops[0];
                cb();
            }));
        },
    ], safe.sure(cb, function () {
        cb(null, newPost);
    }));
};
/*
    edit post
*/
Api.prototype.postEdit = function (_data, cb) {
    let user = null;
    let param = null;
    let post = null;

    safe.series([
        function (cb) {
            cokcore.ctx.api.user.checkAuth (_data, safe.sure(cb, function (_u, _p) {
                user = _u;
                param = _p ? _p.data : null;
                cb();
            }));
        },
        function (cb) {
            cokcore.validate.check('post_edit', user, param, cb);
        },
        function (cb) {
            cokcore.ctx.col.posts.findOne({_id: cokcore.ObjectID(param._id.toString())}, safe.sure(cb, function (info) {
                post = info;
                cb();
            }));
        },
        function (cb) {
            // set params if something changed
            let setObj = {};
            if (param.name != post.name) {
                setObj.name = _.escape(param.name);
            }
            if (param.description != post.description) {
                setObj.description = _.escape(param.description);
            }
            if (param.status != post.status) {
                setObj.status = _.escape(param.status);
            }

            if (_.isEmpty(setObj)) {
                return cb('Nothing to update');
            }
            // create object for update
            let upObj = {};
            setObj.updated = new Date();
            upObj.$set = setObj;

            cokcore.ctx.col.posts.update({_id: post._id}, upObj, cb);
        },
    ], safe.sure(cb, function () {
        cb();
    }));
};



 /**
  * init function
  */
 module.exports.init = function (cb) {
     let api = new Api();
     console.time('init blog api');
     api.init(safe.sure(cb, function () {
         console.timeEnd('init blog api');
         cb(null, api);
     }));
 };
