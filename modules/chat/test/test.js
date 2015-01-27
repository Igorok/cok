var _ = require('lodash');
var th = require(__dirname + '/testHelper.js');
var userApi = require(__dirname + '/../api/user.js');
var user;

exports.chatUserTest = function (test) {

    test.expect(6);
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
        * userApi.deleteUser
        */
        function deleteUser (next) {
            console.log('userApi.deleteUser');
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

                next();
            });
        },
    ]);
};


