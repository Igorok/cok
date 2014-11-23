var apiMain = require(__dirname + '/../api/index.js');

// routes
module.exports = function (app) {
    
    app.get('/', index);
    app.get('/users', getUserList);
}



// actions
function index (req, res) {
    res.render('index');
}

function getUserList (req, res) {
    apiMain.getUserList(function (err, _users) {
        if (err) {
            console.trace(err);
        }
        res.send(_users);
    });
}