var th = require(__dirname + '/testHelper.js');
var userApi = require(__dirname + '/../api/user.js');
var user;

exports.userTest = function (test) {

    test.expect(4);
    th.runTest(test, [
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
                    throw new Error(err);
                }
                next();
            });
            
        },
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
                    throw new Error(err);
                }

                next();
            });
        },
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
                    throw new Error(err);
                }

                next();
            });
        },
    ]);
};


