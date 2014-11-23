var crypto = require('crypto');
var async = require('async');
var _ = require('lodash');
var redis = require("redis");
clientRedis = redis.createClient();
//model require
var UserModel = require(__dirname + '/../models/user.js');
var UserGroupModel = require(__dirname + '/../models/usergroup.js');
var PermissionModel = require(__dirname + '/../models/permission.js');
var UserHelper = require(__dirname + '/../helpers/userhelper.js');
var user_helper = new UserHelper();

/**
* login check
*/
exports.isLogin = function(req, res, cb) {
    clientRedis.hgetall(req.query.token, function (err, _user)
    {
        if (err) {
            console.log(err);
        }
        if (! _user) {
            res.json({
                authorize: false,
            });
        } else {
            cb();
        }
    });
}

/**
* registration action
*/
exports.registration = function(req, res) {
    var newUser = new UserModel({
        login: req.body.login.trim(),
        email: req.body.email.trim(),
        password: req.body.password.trim(),
        group: "SimpleUser",
        created: new Date(),
        status: 1
    });
    newUser.save(function (err) {
        if (err) {
            console.log(err)
        }
        res.json({
            err: err,
            authorize: false
        });
    });
}
/**
* login action
*/
exports.login = function(req, res) {
    var user;
    var redisStorage = null;
    var localStorage = null;
    var userToken = crypto.createHash('sha1').digest('hex');
    var login = req.body.login ? req.body.login.toString().trim() : "";
    var password = req.body.password ? req.body.password.toString().trim() : "";

    async.waterfall([
        function getUser (cb) {
            UserModel.findOne({login: login, password: password, status: 1}, cb)
        },
        function getGroup (_user, cb) {
            user = _user;
            if (_user) {
                redisStorage = {
                    id: _user._id,
                    login: _user.login,
                    group: _user.group,
                    token: userToken
                }
                localStorage = {
                    id: _user._id,
                    login: _user.login,
                    token: userToken,
                }
                UserGroupModel.findOne({title: redisStorage.group}, cb)
            } else {
                cb(null, null);
            }
        },
        function setStorage (_group, cb) {
            if (_group) {
                redisStorage.permission = localStorage.permission = _group.permission;
                clientRedis.hmset(userToken, redisStorage, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    clientRedis.expire(userToken, 24*60*60, cb);
                });
            } else {
                cb();
            }
        }],
        function (err) {
            if (err) {
                console.log('err redis')
                console.log(err)
            }
            if ( ! redisStorage || ! localStorage ) {
                err = err ? err : "Please re-enter your password";
                res.json({
                    authorize: false,
                    err: err
                });
            } else {
                res.json({
                    authorize: true,
                    user: localStorage,
                    err: err
                });
            }
        }
    )
}

/**
* logout action
*/
exports.logout = function(req, res) {
    clientRedis.hdel(req.query.token, function (err) {
        res.json({authorize: false});
    });
}

/**
* users list action
*/
exports.user_list = function (req, res) {
    clientRedis.hgetall(req.query.token, function (err, _user)
    {
        if (err) {
            console.log(err);
        }
        var id = _user.id;
        UserModel.find({_id: {'$ne': id }, status: {'$ne' : 0}}, {_id: 1, created: 1, email: 1, login: 1, picture: 1}).sort({created: -1}).exec(
            function (err, users) {
                if (err) {
                    console.log(err);
                }
                resObj = {};
                if (! _.isEmpty(users)) {
                    _.forEach(users, function (val) {
                        resObj[val._id] = val;
                    });
                }
                res.json({
                    authorize: true,
                    users: resObj
                });
            }
        );
    });
    
}

// user detail action
exports.user_detail = function(req, res) {
    if (req.method == "POST") {
        clientRedis.hgetall(req.body.token, function (err, _user)
        {
            if (err) {
                console.log(err);
            }
            var id;
            if (! req.body.user) {
                res.json({
                    authorize: false
                });
            } else {
                id = req.body.user.id.toString();
            }
            if (user_helper.checkChange(id, _user)) {
                async.waterfall([
                    function (cb) {
                        UserModel.findById(id, cb);
                    },
                    function (oldModel, cb) {
                        var group = "SimpleUser";
                        var status = 1;
                        if (user_helper.checkAdminPermission(_user)) {
                            group = req.body.user.group ? req.body.user.group.trim() : "SimpleUser";
                            status = req.body.user.status ? req.body.user.status : 1;
                        }
                        var reqUser = req.body.user;
                        reqUser.group = group;
                        reqUser.status = status;
                        reqUser.updated = new Date();
                        // check old value
                        /*_.forEach(reqUser, function (val, key) {
                            if (reqUser[key] && reqUser[key] != oldModel[key])
                            {
                                oldModel[key] = reqUser[key];
                            }
                        });*/
                        UserModel.findByIdAndUpdate(id, { $set: reqUser}, cb);
                    }
                ], function (err) {
                    if (err) {
                        console.log(err);
                    }
                    res.json({
                        authorize: true,
                        result: true
                    });
                })
            } else {
                res.json({
                    authorize: false
                });
            }
        });
    }
    // get
    else {
        clientRedis.hgetall(req.query.token, function (err, _user)
        {
            if (err) {
                console.log(err);
            }
            var id;
            if (req.query.id) {
                id = req.query.id;
            } else {
                id = _user.id;
            }
            UserModel.findById(id, {_id: 1, created: 1, email: 1, login: 1, picture: 1, status: 1, group: 1}, function (err, userData)
            {
                if (err) {
                    console.log(err);
                }
                res.json({
                    authorize: true,
                    user: userData
                });
            });
        });
    }
}

exports.user_delete = function(req, res) {
    clientRedis.hgetall(req.query.token, function (err, _user)
    {
        if (err) {
            console.log(err);
        }
        if ((user_helper.checkAdminPermission(_user)) && req.body.id) {
            var id;
            id = req.body.id;
            UserModel.findByIdAndUpdate(id, { $set: { status: 0 }}, function (err) {
                if (err) console.log(err)
                res.json({
                    authorize: true
                });
            });
        } else {
            res.json({
                authorize: false,
            });
        }
    });
}

// usergroup list
exports.usergroup_list = function (req, res) {
    UserGroupModel.find({}, function (err, result) {
        if (err) {
            console.log(err);
        }
        res.json({
            authorize: true,
            group: result
        });
    });
}



// usergroup detail action
exports.usergroup_detail = function(req, res){
    // post
    if (req.method == "POST") {
        clientRedis.hgetall(req.body.token, function (err, _user)
        {
            if (err) {
                console.log(err);
            }
            if (! _user || ! user_helper.checkAdminPermission(_user)) {
                res.json({
                    authorize: false,
                });
            } else {
                if (! req.body.group) {
                    res.json({result: false});
                } else {
                    id = req.body.group.id;
                    if (id == -1) {
                        var usergroup = new UserGroupModel({
                            title: req.body.group.title,
                            description: req.body.group.description,
                            permission: req.body.group.permission
                        });
                        usergroup.save(function (err) {
                            if (err) {
                                console.log(err)
                            }
                            res.json({
                                authorize: true,
                                result: true
                            });
                        });
                    }
                    else {
                        var usergroup = {
                            title: req.body.group.title,
                            description: req.body.group.description,
                            permission: req.body.group.permission
                        };
                        UserGroupModel.findByIdAndUpdate(id, { $set: usergroup}, function (err) {
                            if (err) {
                                console.log(err)
                            }
                            res.json({
                                authorize: true,
                                result: true
                            });
                        })
                    }
                }
            }
        });
    }
    // get
    else {
        clientRedis.hgetall(req.query.token, function (err, _user)
        {
            if (err) console.log(err);
            if (! _user || ! user_helper.checkAdminPermission(_user) || ! req.query.id) {
                res.json({
                    authorize: false,
                });
            } else {
                id = req.query.id;
                UserGroupModel.findById(id, function (err, result)
                {
                    if (err) console.log(err);
                    res.json({
                        authorize: true,
                        result: result
                    });
                });
            }
        });
    }
}

// usergroup delete
exports.usergroup_delete = function(req, res){
    clientRedis.hgetall(req.body.token, function (err, _user)
    {
        if (err) {
            console.log(err);
        }
        if (! _user || ! user_helper.checkAdminPermission(_user)) {
            res.json({
                authorize: false,
            });
        } else {
            id = req.body.id;
            UserGroupModel.findByIdAndRemove(id, function (err)
            {
                if (err) {
                    console.log(err)
                }
                res.json({
                    authorize: true,
                });
            });
        }
    });
}


/**
* permissions actions
*/

// permission list
exports.permission_list = function (req, res) {
    clientRedis.hgetall(req.query.token, function (err, _user)
    {
        if (err) {
            console.log(err);
        }
        if (user_helper.checkAdminPermission(_user)) {
            PermissionModel.find({}, function (err, result)
            {
                if (err) {
                    console.log(err);
                }
                res.json({
                    authorize: true,
                    result: result
                });
            });
        } else {
            res.json({
                authorize: false,
            });
        }
    });
    
}

// permission detail action
exports.permission_detail = function(req, res) {
    // post
    if (req.method == "POST") {
        clientRedis.hgetall(req.body.token, function (err, _user)
        {
            if (err) {
                console.log(err);
            }
            if (! _user || ! user_helper.checkAdminPermission(_user) || ! req.body.permission.id) {
                res.json({
                    authorize: false,
                });
            } else {
                var id = req.body.permission.id;
                if (id == -1) {
                    var permission = new PermissionModel({
                        key: req.body.permission.key,
                        title: req.body.permission.title,
                        description: req.body.permission.description
                    });
                    permission.save(function (err) {
                        if (err) console.log(err)
                        res.json({
                            authorize: true,
                            result: true
                        });
                    });
                } else {
                    var permission = {
                        key: req.body.permission.key,
                        title: req.body.permission.title,
                        description: req.body.permission.description
                    };
                    PermissionModel.findByIdAndUpdate(id, { $set: permission}, function (err) {
                        if (err) console.log(err);
                        res.json({
                            authorize: true,
                            result: true
                        });
                    })
                }
            }
        });
    } else {
        clientRedis.hgetall(req.query.token, function (err, _user)
        {
            if (err) console.log(err);
            if (! _user || ! user_helper.checkAdminPermission(_user) || ! req.query.id) {
                res.json({
                    authorize: false,
                    result: false,
                });
            } else {
                var id = req.query.id;
                PermissionModel.findById(id, function (err, result) {
                    if (err) {
                        console.log(err)
                    }
                    res.json({
                        authorize: true,
                        result: result
                    });
                });
            }
        });
    }
}

// permission_delete
exports.permission_delete = function (req, res) {
    clientRedis.hgetall(req.body.token, function (err, _user)
    {
        if (err) {
            console.log(err);
        }
        if (! _user || ! user_helper.checkAdminPermission(_user) || ! req.body.id) {
            res.json({
                authorize: false,
            });
        } else {
            var id = req.body.id;
            PermissionModel.findByIdAndRemove(id, function (err) {
                if (err) {
                    console.log(err)
                }
                res.json({
                    authorize: true,
                    result: true
                });
            });
        }
    });
}
