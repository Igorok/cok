var _ = require('lodash')

// object helper
function userHelper () {}

// check admin permission
userHelper.prototype.checkAdminPermission = function (_user)
{
    return _user.permission.indexOf("ChangeAllAccount") != -1;
}

// check permission to change post or account
userHelper.prototype.checkChange = function (id_user, _user)
{
    var ret, changeThisAccount;
    var changeAllAccount = (_user.permission.indexOf("ChangeAllAccount") != -1);
    var changeAccount = (_user.permission.indexOf("ChangeAccount") != -1);
    // check users permission to change his account
    if(changeAccount && (id_user == _user.id)) {
        changeThisAccount = true;
    } else {
        changeThisAccount = false;
    }
    // if change user is this user or user can change all of the account
    if (changeAllAccount || changeThisAccount) {
        ret = true;
    } else {
        ret = false;
    }
    return ret;
}
/*
// check permission to change post or account
userHelper.prototype.checkChange = function (id_user, _session)
{
    var ret, changeThisAccount;
    var changeAllAccount = _.contains(_session.permission, "ChangeAllAccount");
    var changeAccount = _.contains(_session.permission, "ChangeAccount");
    // check users permission to change his account
    if(changeAccount && (id_user == _session.id)) {
        changeThisAccount = true;
    } else {
        changeThisAccount = false;
    }
    // if change user is this user or user can change all of the account
    if (changeAllAccount || changeThisAccount) {
        ret = true;
    } else {
        ret = false;
    }
    return ret;
}*/

module.exports = userHelper;