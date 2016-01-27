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
                    cokcore.collection("users", safe.sure(cb, function (coll) {
                        cb();
                    }));
                },
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
    add access rules
*/
cokcore.validate.add('access_blog_edit', function (_user, _params, cb) {
    if (_.isEmpty(_params) || _.isEmpty(_params._id)) {
        return cb('Blog not found');
    }
    let q = {
        _id: cokcore.ObjectID(_params._id.toString()),
        uId: _user._id,
    };
    cokcore.ctx.col.blogs.find(q, {limit: 1}).count(cb);
});


/*
    validation rules
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
                    return cb(403);
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

cokcore.validate.add('blog_detail', function (_params, cb) {
    if (_.isEmpty(_params) || _.isEmpty(_params._id)) {
        return cb('Id of a blog are required');
    }

    cb();
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
        cb(null, obj);
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
            cokcore.validate.check('blog_detail', param, cb);
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
                created: user._id,
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

            console.log(
                'setObj ', setObj,
                'unsetObj ', unsetObj
            );

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
