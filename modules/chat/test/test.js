var _ = require('lodash');
var async = require('async');
var th = require(__dirname + '/testHelper.js');
var userApi = require(__dirname + '/../api/user.js');
var user;
var userFriend;

exports.chatUserTest = function (test) {

    test.expect(12);
    th.runTest(test, [
        /*
        * userApi.Registration
        */
        function registration (next) {
            console.log('userApi.Registration');
            var params = {
                login: 'unittest',
                email: 'unittest@unittest.ru',
                password: 'unittest',
            };
            var data = {
                params:[params]
            };
            userApi.Registration(data, function(err, result) {
                if (! err) {
                    test.ok(true);
                } else {
                    test.fail(err);
                }
                next();
            });
            
        },
        /*
        * userApi.Authorise
        */
        function authorise (next) {
            console.log('userApi.Authorise');
            var params = {
                login: 'unittest',
                password: 'unittest',
            };
            var data = {
                params:[params]
            };

            userApi.Authorise(data, function(err, result) {
                if (! err) {
                    user = result;
                    test.ok(true);
                } else {
                    test.fail(err);
                }

                next();
            });
        },
        /*
        * userApi.checkAuth
        */
        function checkAuth (next) {
            console.log('userApi.checkAuth');
            var params = {
                token: 'spam',
                login: 'spam',
                password: 'spam',
            };
            var data = {
                params:[params]
            };
            userApi.checkAuth(data, function(err, result) {
                if (! err) {
                    test.fail(result);
                } else {
                    test.throws(
                        function() {
                            throw new Error(err);
                        },
                        Error
                    );
                }
                next();
            });
        },
        /*
        * userApi.getUserList
        */
        function getUserList (next) {
            console.log('userApi.getUserList');
            var params = {
                token: user.token,
            };
            var data = {
                params: [params]
            };
            userApi.getUserList(data, function(err, result) {
                if (! err && _.isArray(result) && result[0].login && result[0].email) {
                    test.ok(true);
                } else {
                    test.fail(err);
                }
                next();
            });
        },
        /*
        * userApi.getUserDetail
        */
        function getUserDetail (next) {
            console.log('userApi.getUserDetail');
            var params = {
                token: user.token,
                _id: user._id.toHexString(),
            };
            var data = {
                params: [params]
            };
            userApi.getUserDetail(data, function(err, result) {
                if (! err && result && (result.login == 'unittest') && (result.email == 'unittest@unittest.ru')) {
                    test.ok(true);
                } else {
                    test.fail(err);
                }
                next();
            });
        },
        
        /*
        * test friends
        */
        function getUserDetail (next) {
            async.waterfall([
                function registration (cb) {
                    var params = {
                        login: 'unitfriend',
                        email: 'unitfriend@unitfriend.ru',
                        password: 'unitfriend',
                    };
                    var data = {
                        params:[params]
                    };
                    userApi.Registration(data, function(err, result) {
                        if (err) {
                            test.fail(err);
                        } else {
                            test.ok(true);
                        }
                        cb();
                    });

                },
                function authorise (cb) {
                    var params = {
                        login: 'unitfriend',
                        password: 'unitfriend',
                    };
                    var data = {
                        params:[params]
                    };

                    userApi.Authorise(data, function(err, result) {
                        if (err) {
                            test.fail(err);
                        } else {
                            userFriend = result;
                            test.ok(true);
                        }

                        cb();
                    });
                },
                function addFriendRequest (cb) {
                    console.log('userApi.addFriendRequest');
                    var params = {
                        token: user.token,
                        _id: userFriend._id.toHexString(),
                    };
                    var data = {
                        params: [params]
                    };
                    userApi.addFriendRequest(data, function(err, result) {
                        if (err) {
                            test.fail(err);
                        } else {
                            test.ok(true);
                        }
                        cb();
                    });
                },
                function addFriend (cb) {
                    console.log('userApi.addFriend');
                    var params = {
                        token: userFriend.token,
                        _id: user._id.toHexString(),
                    };
                    var data = {
                        params: [params]
                    };
                    userApi.addFriend(data, function(err, result) {
                        if (err) {
                            test.fail(err);
                        } else {
                            test.ok(true);
                        }
                        cb();
                    });
                },
                function checkUsers (cb) {
                    async.parallel([
                        function (cb) {
                            var params = {
                                token: user.token,
                                _id: user._id.toHexString(),
                            };
                            var data = {
                                params: [params]
                            };
                            userApi.getUserDetail(data, cb);
                        },
                        function (cb) {
                            var params = {
                                token: userFriend.token,
                                _id: userFriend._id.toHexString(),
                            };
                            var data = {
                                params: [params]
                            };
                            userApi.getUserDetail(data, cb);
                        },
                    ], function (err, _result) {
                        if (err || ! _result[0] || ! _result[0].friends || ! _result[1] || ! _result[1].friends) {
                            test.fail(err || 'users not found');
                        } else {
                            var uFriends = _.pluck(_result[0].friends, "_id");
                            var ufFriends = _.pluck(_result[1].friends, "_id");
                            
                            if (! _.contains(uFriends, userFriend._id.toString()) || ! _.contains(ufFriends, user._id.toString())) {
                                test.fail(new Error('wrong friends'));
                            } else {
                                test.ok(true);
                            }
                        }
                        cb();
                    });
                },
            ], next);
        },
        
        
        
        /*
        * userApi.deleteUser
        */
        function deleteUser (next) {
            console.log('userApi.deleteUser');
            async.parallel([
                function (cb) {
                    var params = {
                        token: user.token,
                        _id: user._id.toHexString(),
                    };
                    var data = {
                        params:[params]
                    };
                    userApi.deleteUser(data, function(err, result) {
                        if (! err) {
                            test.ok(true);
                        } else {
                            test.fail(err);
                        }

                        cb();
                    });
                },
                function (cb) {
                    var params = {
                        token: userFriend.token,
                        _id: userFriend._id.toHexString(),
                    };
                    var data = {
                        params:[params]
                    };
                    userApi.deleteUser(data, function(err, result) {
                        if (! err) {
                            test.ok(true);
                        } else {
                            test.fail(err);
                        }

                        cb();
                    });
                },
            ], next);
            
        },
    ]);
};

