var nodeunit  = require('nodeunit');
var nodeunitAsync  = require('nodeunit-async');

var doubled = require('./double');
var userApi = require(__dirname + '/../api/user.js');

var th = require(__dirname + '/testHelper.js');

//var userApi = require(__dirname + '/user.js');
var user;

exports.asyncAutoTest = function(test) {

    test.expect(2);
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
                next(null);
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
                    console.log(user)
                    test.ok(true);
                } else {
                    throw new Error(err);
                }

                next();
            });
        },
    ]);
};

/*

exports.asyncWaterfallTest = function(test) {

    test.expect(1);

    th.runTest(test, [
        function(next) {
            console.log('Test Method');
            next(null, 2);
        },
        function(result, next) {
            console.log('Assertions');
            test.equal(2, result);
            next();
        }
    ]);

};
*/


