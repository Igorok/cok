define(['handlebars'], function(Handlebars) {

this["chat"] = this["chat"] || {};

this["chat"]["chatCreate"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "        <div class=\"col-xs-4\">\n            <div class=\"checkbox\">\n                <label>\n                    <input type=\"checkbox\" name=\""
    + alias3(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"_id","hash":{},"data":data}) : helper)))
    + "\"> "
    + alias3(((helper = (helper = helpers.login || (depth0 != null ? depth0.login : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"login","hash":{},"data":data}) : helper)))
    + "\n                </label>\n            </div>\n        </div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "<script>\n    require([\"jquery\", \"lodash\", \"cok_core\", \"cok_controller\"], function ($, _, cok_core, cok_controller) {\n        var _user = cok_controller.checkedUser();\n        var token = _user.token;\n        $('#chatCreateForm').submit(function () {\n            var formData = $(this).serializeArray();\n            var users = [];\n            if (! _.isEmpty(formData)) {\n                _.each(formData, function (val) {\n                    users.push(val.name);\n                });\n                cok_core.call(\"index.addChat\", {token: token, users: users}, function (result) {\n                    window.location = \"#!/chat/index\";\n                });\n            } else {\n                cok_core.systemMessage($('#messageCase'), 'danger', 'Users is empty')\n            }\n            return false;\n        });\n    });\n</script>\n<br>\n<div id=\"chatCase\" class=\"sub-container\">\n    <div id=\"messageCase\"></div>\n    <form role=\"form\" id=\"chatCreateForm\">\n       <div class=\"row\">\n";
  stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"data","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.data) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "        </div>\n        <button type=\"submit\" class=\"btn btn-primary\"><span class=\"glyphicon glyphicon-floppy-disk\"></span> Save</button>\n    </form>\n</div>\n";
},"useData":true});

this["chat"]["chatDetail"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<script>\nrequire([\"jquery\", \"lodash\", \"io\", \"cok_core\", \"cok_controller\"], function ($, _, io, cok_core, cok_controller) {\n    var _user = cok_controller.checkedUser();\n    var token = _user.token;\n    var chatId = '"
    + this.escapeExpression(((helper = (helper = helpers.chatId || (depth0 != null ? depth0.chatId : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"chatId","hash":{},"data":data}) : helper)))
    + "';\n    var chatItems = [];\n\n    var resizeHistory = function () {\n        var wHeight = $(window).height();\n        $('#chatFixedItems').height(wHeight - 110);\n    };\n    resizeHistory();\n    window.onresize = function() {\n        resizeHistory();\n    };\n    // chatFixedItems\n    if (_.isEmpty(chatId)) {\n        window.location(\"#!/chat/index\");\n    }\n    if (window.socket) {\n        window.socket.destroy()\n    }\n    window.socket = new io(window.location.origin, { forceNew: true });\n\n    window.socket.connect();\n    window.socket.emit(\"join\", {token: token, chatId: chatId});\n\n\n    window.socket.on(\"err\", function (err) {\n        cok_core.error(err);\n    });\n    // add user\n    window.socket.on('join', function (jObj) {\n        if (! jObj) {\n            window.location(\"#!/chat/index\");\n        }\n        if (jObj.cHistory) {\n            chatItems = chatItems.concat(jObj.cHistory);\n            chatTable = new cok_core.tableRender(\"chatItem\", $(\"#chatItems tbody\"), chatItems, {}, chatItems.length);\n            chatTable.render();\n            var cHeight = $('#chatItems').height();\n            $('#chatFixedItems').scrollTop(cHeight);\n        }\n    });\n\n    // message\n    window.socket.on('message', function (msg) {\n        chatItems.push(msg);\n        chatTable = new cok_core.tableRender(\"chatItem\", $(\"#chatItems tbody\"), chatItems, {}, chatItems.length);\n        chatTable.render();\n        var cHeight = $('#chatItems').height();\n        $('#chatFixedItems').scrollTop(cHeight);\n    });\n\n    $('#chatMessage').submit(function () {\n        var chatText = $('#chatText').val();\n        if (! _.isEmpty(chatText)) {\n            var formData = {\n                token: token,\n                chatId: chatId,\n                chatText: chatText,\n            };\n            window.socket.emit('message', formData);\n            var chatText = $('#chatText').val('');\n        }\n        return false;\n    });\n});\n</script>\n<div id=\"chatCase\">\n    <div id=\"chatFixedItems\">\n        <div id=\"chatItems\">\n            <table class=\"table table-striped table-hover\"><tbody></tbody></table>\n        </div>\n    </div>\n    <div id=\"chatFormCase\">\n        <form id=\"chatMessage\">\n            <div class=\"input-group\">\n                <input id=\"chatText\" type=\"text\" class=\"form-control\" required>\n                <span class=\"input-group-btn\">\n                    <button class=\"btn btn-default\" type=\"submit\"><span class=\"glyphicon glyphicon-send\"></span></button>\n                </span>\n            </div>\n        </form>\n    </div>\n</div>\n";
},"useData":true});

this["chat"]["chatEdit"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, buffer = 
  "        <div class=\"col-xs-4\">\n            <div class=\"checkbox\">\n                <label>\n                    <input type=\"checkbox\" name=\""
    + alias3(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"_id","hash":{},"data":data}) : helper)))
    + "\" ";
  stack1 = ((helper = (helper = helpers.checked || (depth0 != null ? depth0.checked : depth0)) != null ? helper : alias1),(options={"name":"checked","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.checked) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "> "
    + alias3(((helper = (helper = helpers.login || (depth0 != null ? depth0.login : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"login","hash":{},"data":data}) : helper)))
    + "\n                </label>\n            </div>\n        </div>\n";
},"2":function(depth0,helpers,partials,data) {
    return "checked";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda;

  return "<script>\n    require([\"jquery\", \"lodash\", \"cok_core\", \"cok_controller\"], function ($, _, cok_core, cok_controller) {\n        var _user = cok_controller.checkedUser();\n        var token = _user.token;\n        var _id = \""
    + this.escapeExpression(alias1(((stack1 = (depth0 != null ? depth0.data : depth0)) != null ? stack1._id : stack1), depth0))
    + "\";\n        $('#chatCreateForm').submit(function () {\n            var formData = $(this).serializeArray();\n            var users = [];\n            if (! _.isEmpty(formData)) {\n                _.each(formData, function (val) {\n                    users.push(val.name);\n                });\n                cok_core.call(\"index.editChat\", {token: token, users: users, _id: _id}, function (result) {\n                    window.location = \"#!/chat/index\";\n                });\n            } else {\n                cok_core.systemMessage($('#messageCase'), 'danger', 'Users is empty')\n            }\n            return false;\n        });\n    });\n</script>\n<br>\n<div id=\"chatCase\" class=\"sub-container\">\n    <div id=\"messageCase\"></div>\n    <form role=\"form\" id=\"chatCreateForm\">\n       <div class=\"row\">\n"
    + ((stack1 = helpers.blockHelperMissing.call(depth0,alias1(((stack1 = (depth0 != null ? depth0.data : depth0)) != null ? stack1.usrArr : stack1), depth0),{"name":"data.usrArr","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\n        <button type=\"submit\" class=\"btn btn-primary\"><span class=\"glyphicon glyphicon-floppy-disk\"></span> Save</button>\n    </form>\n</div>\n";
},"useData":true});

this["chat"]["chatIndex"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<script>\n    require([\"jquery\", \"cok_core\", \"cok_controller\"], function ($, cok_core, cok_controller) {\n        $(function () {\n            var _user = cok_controller.checkedUser();\n            var token = _user.token;\n            var chatTable;\n            var chatRender = function () {\n                cok_core.call(\"index.getChatList\", {token: token}, function (result) {\n                    chatTable = new cok_core.tableRender(\"chatList\", $(\"#chatCase tbody\"), result[0], {}, 10);\n                    chatTable.render();\n                });\n            }\n\n            chatRender();\n            $('#chatCase').on('click', 'th', function () {\n                if (chatTable) {\n                    chatTable.sort($(this));\n                }\n            });\n            $('#chatCase').on('click', '.cRemove', function () {\n                var _id = $(this).attr('data-id');\n                cok_core.call(\"index.removeChat\", {token: token, _id: _id}, function (result) {\n                    if (result) {\n                        cok_core.systemMessage($('#messageCase'), 'success', 'Chat successfully removed');\n                        chatRender();\n                    }\n                });\n            });\n            $('#chatCase').on('click', '.cLeave', function () {\n                var _id = $(this).attr('data-id');\n                cok_core.call(\"index.leaveChat\", {token: token, _id: _id}, function (result) {\n                    if (result) {\n                        cok_core.systemMessage($('#messageCase'), 'success', 'Chat successfully leaved');\n                        chatRender();\n                    }\n                });\n            });\n        });\n    });\n</script>\n<div id=\"messageCase\"></div>\n<div class=\"sub-container\">\n    <div class=\"row\">\n        <div class=\"col-md-1\"><a class=\"btn btn-primary\" href=\"#!/chat/create\"><span class=\"glyphicon glyphicon-file\"></span> Add</a></div>\n        <div class=\"col-md-8\"><div class=\"cokPager\"></div></div>\n        <div class=\"col-md-3\"><div class=\"cokSearch\"></div></div>\n    </div>\n    <table id=\"chatCase\" class=\"table table-hover\">\n        <thead>\n            <tr>\n                <th data-sort=\"date\">Date</th>\n                <th>Chat</th>\n                <th  class=\"action-column\">Actions</th>\n            </tr>\n        </thead>\n        <tbody></tbody>\n    </table>\n    \n</div>\n";
},"useData":true});

this["chat"]["chatItem"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<tr>\n    <td>"
    + alias3(((helper = (helper = helpers.login || (depth0 != null ? depth0.login : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"login","hash":{},"data":data}) : helper)))
    + "</td>\n    <td>"
    + alias3(((helper = (helper = helpers.chatText || (depth0 != null ? depth0.chatText : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"chatText","hash":{},"data":data}) : helper)))
    + "</td>\n    <td>"
    + alias3(((helper = (helper = helpers.fDate || (depth0 != null ? depth0.fDate : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"fDate","hash":{},"data":data}) : helper)))
    + "</td>\n</tr>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"data","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.data) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});

this["chat"]["chatList"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, alias4=helpers.blockHelperMissing, buffer = 
  "<tr>\n    <td>"
    + alias3(((helper = (helper = helpers.fDate || (depth0 != null ? depth0.fDate : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"fDate","hash":{},"data":data}) : helper)))
    + "</td>\n    <td>\n        <strong><a href=\"#!/chat/detail/"
    + alias3(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"_id","hash":{},"data":data}) : helper)))
    + "\">";
  stack1 = ((helper = (helper = helpers.users || (depth0 != null ? depth0.users : depth0)) != null ? helper : alias1),(options={"name":"users","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.users) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "</a></strong>\n    </td>\n    <td class=\"action-column\">\n";
  stack1 = ((helper = (helper = helpers.crPermission || (depth0 != null ? depth0.crPermission : depth0)) != null ? helper : alias1),(options={"name":"crPermission","hash":{},"fn":this.program(4, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.crPermission) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.crPermission || (depth0 != null ? depth0.crPermission : depth0)) != null ? helper : alias1),(options={"name":"crPermission","hash":{},"fn":this.noop,"inverse":this.program(6, data, 0),"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.crPermission) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "    </td>\n</tr>\n";
},"2":function(depth0,helpers,partials,data) {
    var helper;

  return this.escapeExpression(((helper = (helper = helpers.login || (depth0 != null ? depth0.login : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"login","hash":{},"data":data}) : helper)))
    + "&nbsp;";
},"4":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "           <a href=\"#!/chat/edit/"
    + alias3(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"_id","hash":{},"data":data}) : helper)))
    + "\" class=\"btn btn-primary\"><span class=\"glyphicon glyphicon-edit\"></span></a>\n           <button class=\"btn btn-danger cRemove\" data-id=\""
    + alias3(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"_id","hash":{},"data":data}) : helper)))
    + "\"><span class=\"glyphicon glyphicon-remove\"></span></button>\n";
},"6":function(depth0,helpers,partials,data) {
    var helper;

  return "        <button class=\"btn btn-danger cLeave\" data-id=\""
    + this.escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"_id","hash":{},"data":data}) : helper)))
    + "\"><span class=\"glyphicon glyphicon-log-out\"></span></button>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"data","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.data) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "<br />\n";
},"useData":true});

this["chat"]["cokSearch"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"input-group\">\n    <input id=\"searchField\" type=\"text\" class=\"form-control\" placeholder=\"Search ...\">\n    <span class=\"input-group-btn\">\n        <button id=\"searchBtn\" class=\"btn btn-default\" type=\"button\"><span class=\"glyphicon glyphicon-search\"></span></button>\n    </span>\n</div>\n\n";
},"useData":true});

this["chat"]["defaultIndex"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<script>\nrequire([\"jquery\", \"lodash\", \"cok_core\", \"cok_controller\", \"bootstrap\"], function ($, _, cok_core, cok_controller) {\n    $(function () {\n        var _user = cok_controller.checkedUser();\n        var token = _user.token;\n        var renderUser = function () {\n            cok_core.call(\"user.getUserDetail\", {token: token}, function (result) {\n                cok_core.render ($(\"#defaultIndex\"), \"userDetailPartition\", {data: result[0]});\n            });\n        };\n        \n        renderUser();\n        $(\"img\").error(function () {\n            $(this).unbind(\"error\").attr(\"src\", \"/images/no-avatar.jpg\");\n        });\n\n        $(\"#defaultIndex\").on(\"click\", \"#showPicModal\", function () {\n            $(\"#picUploadModal\").modal(\"show\");\n        });\n        $(\"#picUploadBtn\").click(function () {\n            var file = document.getElementById(\"newPic\").files[0];\n            cok_core.upload(\"index.mainPicUpload\", token, file, function (err, _result) {\n                $(\"#newPic\").val(\"\");\n                $(\"#picUploadModal\").modal(\"hide\");\n                if (err) {\n                    cok_core.error(err);\n                } else {\n                    renderUser();\n                }\n            });\n            return false;\n        });\n        \n    });\n});\n</script>\n\n<div id=\"picUploadModal\" class=\"modal fade\">\n    <div class=\"modal-dialog\">\n        <div class=\"modal-content\">\n            <div class=\"modal-header\">\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n                <h4 class=\"modal-title\">Modal title</h4>\n            </div>\n            <div class=\"modal-body\">\n                <form id=\"picUploadForm\" enctype=\"multipart/form-data\">\n                    <input type=\"file\" name=\"newPic\" id=\"newPic\" />\n                </form>\n            </div>\n            <div class=\"modal-footer\">\n                <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>\n                <button id=\"picUploadBtn\" type=\"button\" class=\"btn btn-primary\">Save</button>\n            </div>\n        </div>\n    </div>\n</div>\n<div class=\"sub-container\" id=\"defaultIndex\"></div>\n";
},"useData":true});

this["chat"]["friendsIndex"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<script>\nrequire ([\"jquery\", \"lodash\", \"cok_core\", \"cok_controller\"], function ($, _, cok_core, cok_controller) {\n    $(function () {\n        var _user = cok_controller.checkedUser();\n        var token = _user.token;\n        \n        var friendListArr = [];\n        var friendReqArr = [];\n        var friendsCall = function (cb) {\n            cok_core.call(\"user.getFriendList\", {token: token}, function (result) {\n                friendListArr = result[0];\n                friendReqArr = result[1];\n                cb();\n            });\n        }\n        \n        var renderFriendList = function () {\n            friendsCall(function () {\n                $('#getFrientList').addClass('btn-primary').siblings().removeClass('btn-primary');\n                if (! _.isEmpty(friendListArr)) {\n                    cok_core.render ($(\"#friendsCase tbody\"), \"userList\", {data: friendListArr});\n                } else {\n                    $(\"#friendsCase tbody\").empty();\n                }\n            });\n        };\n        \n        var renderFriendReq = function () {\n            friendsCall(function () {\n                $('#getFrientRequests').addClass('btn-primary').siblings().removeClass('btn-primary');\n                if (! _.isEmpty(friendReqArr)) {\n                    cok_core.render ($(\"#friendsCase tbody\"), \"userList\", {data: friendReqArr});\n                } else {\n                    $(\"#friendsCase tbody\").empty();\n                }\n            });\n        };\n        \n        \n        \n        \n        \n        \n        \n        \n        $('#friendsCase').on('click', '.delFriendBtn', function () {\n            var btn = $(this);\n            var _id = btn.attr('data-id');\n            cok_core.call(\"user.deleteFriend\", {token: token, _id: _id}, function (result) {\n                renderFriendList();\n            });\n        });\n        \n        $('#friendsCase').on('click', '.addFriendBtn', function () {\n            var _id = $(this).attr('data-id');\n            cok_core.call(\"user.addFriend\", {token: token, _id: _id}, function (result) {\n                renderFriendList();\n            });\n        });\n        \n        $('#getFrientList').click(function () {\n            renderFriendList();\n        });\n        \n        $('#getFrientRequests').click(function () {\n            renderFriendReq();\n        });\n        \n        \n        renderFriendList();\n    });\n});\n</script>\n<div id=\"friendsCase\" class=\"sub-container\">\n    <div class=\"row\">\n        <div class=\"col-md-8\">\n            <button id=\"getFrientList\" class=\"btn btn-default\">\n                <span class=\"glyphicon glyphicon-star\"></span>\n                Friends\n            </button>\n            <button id=\"getFrientRequests\" class=\"btn btn-default\">\n               <span class=\"glyphicon glyphicon-star-empty\"></span>\n                Requests\n            </button>\n        </div>\n        <div class=\"col-md-4\">\n            <div class=\"cokSearch\"></div>\n        </div>\n    </div>\n    <br />\n    <table class=\"table table-striped table-hover\"><tbody></tbody></table>\n    <div class=\"cokPager\"></div>\n</div>\n";
},"useData":true});

this["chat"]["imagesIndex"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<script>\nrequire([\"jquery\", \"lodash\", \"cok_core\", \"cok_controller\", \"bootstrap\"], function ($, _, cok_core, cok_controller) {\n    $(function () {\n        var _user = cok_controller.checkedUser();\n        var token = _user.token;\n        var ownerId = \""
    + this.escapeExpression(((helper = (helper = helpers.ownerId || (depth0 != null ? depth0.ownerId : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"ownerId","hash":{},"data":data}) : helper)))
    + "\";\n        if (_.isEmpty(ownerId)) {\n            ownerId = _user._id;\n        }\n        var renderUser = function () {\n            cok_core.call(\"index.getUserPic\", {token: token, ownerId: ownerId}, function (result) {\n                cok_core.render ($(\"#imagesIndex\"), \"imagesList\", {data: result[0]});\n            });\n        };\n        var selectedPic = {};\n        renderUser();\n        $(\"img\").error(function () {\n            $(this).unbind(\"error\").attr(\"src\", \"/images/no-avatar.jpg\");\n        });\n        $(\"#imagesIndex\").on(\"click\", \"img\", function () {\n            selectedPic.src = $(this).attr(\"src\");\n            selectedPic._id = $(this).attr(\"data-id\");\n            \n            cok_core.render ($(\"#picUploadModal\"), \"imagesModal\", {imgSrc: selectedPic.src, imgId: selectedPic._id, ownerId: ownerId, userId: _user._id});\n            $(\"#picUploadModal\").modal(\"show\");\n        });\n        $(\"#picUploadModal\").on(\"click\", \"#btnRemove\", function () {\n            if (selectedPic._id) {\n                cok_core.call(\"index.deletePic\", {token: token, _id: selectedPic._id}, function (result) {\n                    $(\"#picUploadModal\").modal(\"hide\");\n                    renderUser();\n                });\n            }\n        });\n        $(\"#picUploadModal\").on(\"click\", \"#btnSetMain\", function () {\n            if (selectedPic._id) {\n                cok_core.call(\"index.setMainPic\", {token: token, _id: selectedPic._id}, function (result) {\n                    $(\"#picUploadModal\").modal(\"hide\");\n                });\n            }\n        });\n    });\n});\n</script>\n\n<div id=\"picUploadModal\" class=\"modal fade\"></div>\n<div class=\"sub-container\" id=\"imagesIndex\"></div>\n";
},"useData":true});

this["chat"]["imagesList"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return ((stack1 = (helpers.rowClose || (depth0 && depth0.rowClose) || alias1).call(depth0,(data && data.index),6,{"name":"rowClose","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.rowOpen || (depth0 && depth0.rowOpen) || alias1).call(depth0,(data && data.index),6,{"name":"rowOpen","hash":{},"fn":this.program(4, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    <div class=\"col-md-2\">\n        <img src=\"/images/users/"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" alt=\"\" class=\"img-thumbnail\" data-id=\""
    + alias3(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"_id","hash":{},"data":data}) : helper)))
    + "\" />\n    </div>\n"
    + ((stack1 = (helpers.rowClose || (depth0 && depth0.rowClose) || alias1).call(depth0,(data && data.index),6,{"name":"rowClose","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"2":function(depth0,helpers,partials,data) {
    return "        </div>\n";
},"4":function(depth0,helpers,partials,data) {
    return "        <div class=\"row\">\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.data : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true});

this["chat"]["imagesModal"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "            <button type=\"button\" class=\"btn btn-success\" id=\"btnSetMain\"><span class=\"glyphicon glyphicon-star-empty\"></span></button>\n            <button type=\"button\" class=\"btn btn-danger\" id=\"btnRemove\"><span class=\"glyphicon glyphicon-trash\"></span></button>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing;

  return "<div class=\"modal-dialog\">\n    <div class=\"modal-content imgLargeCase\">\n        <div class=\"modal-header\">\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n            <span>&nbsp;</span>\n        </div>\n        <div class=\"modal-body\">\n            <img id=\"imgLarge\" src=\""
    + this.escapeExpression(((helper = (helper = helpers.imgSrc || (depth0 != null ? depth0.imgSrc : depth0)) != null ? helper : alias1),(typeof helper === "function" ? helper.call(depth0,{"name":"imgSrc","hash":{},"data":data}) : helper)))
    + "\" alt=\"\" class=\"img-rounded\" />\n        </div>\n        <div class=\"modal-footer\">\n"
    + ((stack1 = (helpers.ifMod || (depth0 && depth0.ifMod) || alias1).call(depth0,(depth0 != null ? depth0.ownerId : depth0),"=",(depth0 != null ? depth0.userId : depth0),{"name":"ifMod","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "            <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>\n        </div>\n    </div>\n</div>";
},"useData":true});

this["chat"]["loginIndex"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<script>\n    require([\"jquery\", \"cok_controller\"], function ($, cok_controller) {\n        $(function () {\n            $(\"#loginForm\").submit(function () {\n                cok_controller.authorise({\n                    login: $('#login').val(),\n                    password: $('#password').val(),\n                });\n                return false;\n            });\n        });\n    });\n</script>\n<div class=\"sub-container\">\n    <div class=\"row\">\n        <div class=\"col-md-4 col-md-offset-4\">\n            <br><br><br><br>\n            <form role=\"form\" id=\"loginForm\">\n                <div class=\"form-group\">\n                    <label for=\"login\">Login</label>\n                    <input type=\"text\" class=\"form-control\" id=\"login\" placeholder=\"Login\" require>\n                </div>\n                <div class=\"form-group\">\n                    <label for=\"password\">Password</label>\n                    <input type=\"password\" class=\"form-control\" id=\"password\" placeholder=\"Password\" require>\n                </div>\n                <button type=\"submit\" class=\"btn btn-default btn-block\"><span class=\"glyphicon glyphicon-log-in\"></span>&nbsp;Login</button>\n                <p>\n                    <a href=\"#!/login/registration\">Registration</a>\n                </p>\n            </form>\n        </div>\n    </div>\n</div>\n";
},"useData":true});

this["chat"]["loginRegistration"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<script>\n    require([\"jquery\", \"cok_core\"], function ($, cok_core) {\n        $(function () {\n            $(\"#loginForm\").submit(function () {\n                var data = {\n                    login: $('#login').val(),\n                    email: $('#email').val(),\n                    password: $('#password').val(),\n                };\n                cok_core.call (\"user.Registration\", data, function (result) {\n                    window.location = \"#!/login/index\";\n                });\n                return false;\n            });\n        });\n    });\n</script>\n<div class=\"sub-container\">\n    <div class=\"row\">\n        <div class=\"col-md-4 col-md-offset-4\">\n            <br><br><br><br>\n            <form role=\"form\" id=\"loginForm\">\n                <div class=\"form-group\">\n                    <label for=\"login\">Login</label>\n                    <input type=\"text\" class=\"form-control\" id=\"login\" placeholder=\"Login\" require>\n                </div>\n                <div class=\"form-group\">\n                    <label for=\"login\">Email</label>\n                    <input type=\"email\" class=\"form-control\" id=\"email\" placeholder=\"Email\" require>\n                </div>\n                <div class=\"form-group\">\n                    <label for=\"password\">Password</label>\n                    <input type=\"password\" class=\"form-control\" id=\"password\" placeholder=\"Password\" require>\n                </div>\n                <button type=\"submit\" class=\"btn btn-default btn-block\"><span class=\"glyphicon glyphicon-floppy-disk\"></span>&nbsp;Registration</button>\n            </form>\n        </div>\n    </div>\n</div>\n";
},"useData":true});

this["chat"]["mainMenu"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function";

  return "    <li><a href=\""
    + this.escapeExpression(((helper = (helper = helpers.hash || (depth0 != null ? depth0.hash : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"hash","hash":{},"data":data}) : helper)))
    + "\">"
    + ((stack1 = ((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</a></li>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "<ul class=\"nav \">\n";
  stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"data","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.data) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</ul>\n";
},"useData":true});

this["chat"]["systemMessage"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"alert alert-"
    + alias3(((helper = (helper = helpers.event || (depth0 != null ? depth0.event : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"event","hash":{},"data":data}) : helper)))
    + " alert-dismissible\" role=\"alert\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"alert\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button>\n    "
    + alias3(((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"message","hash":{},"data":data}) : helper)))
    + "\n</div>";
},"useData":true});

this["chat"]["userDetail"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=helpers.blockHelperMissing, alias4=this.escapeExpression, buffer = 
  "<div class=\"sub-container\">\n    <div class=\"row\">\n        <div class=\"col-md-3\">\n            <img src=\"";
  stack1 = ((helper = (helper = helpers.picture || (depth0 != null ? depth0.picture : depth0)) != null ? helper : alias1),(options={"name":"picture","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.picture) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.picture || (depth0 != null ? depth0.picture : depth0)) != null ? helper : alias1),(options={"name":"picture","hash":{},"fn":this.noop,"inverse":this.program(4, data, 0),"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.picture) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\" alt=\"\" class=\"img-thumbnail\">\n            <a href=\"#!/images/index/"
    + alias4(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"_id","hash":{},"data":data}) : helper)))
    + "\">Images</a>\n        </div>\n        <div class=\"col-md-9\">\n            <br>\n            <p>"
    + alias4(((helper = (helper = helpers.login || (depth0 != null ? depth0.login : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"login","hash":{},"data":data}) : helper)))
    + "</p>\n            <p>"
    + alias4(((helper = (helper = helpers.email || (depth0 != null ? depth0.email : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"email","hash":{},"data":data}) : helper)))
    + "</p>\n        </div>\n    </div>\n</div>\n";
},"2":function(depth0,helpers,partials,data) {
    return "/images/users/";
},"4":function(depth0,helpers,partials,data) {
    return "/images/no-avatar.jpg";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "<script>\n    require([\"jquery\", \"cok_core\"], function ($, cok_core) {\n        $(function () {\n            $(\"img\").error(function () {\n                $(this).unbind(\"error\").attr(\"src\", \"/images/no-avatar.jpg\");\n            });\n        });\n    });\n</script>\n";
  stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"data","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.data) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});

this["chat"]["userDetailPartition"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=helpers.blockHelperMissing, alias4=this.escapeExpression, buffer = 
  "<div class=\"row\">\n    <div class=\"col-md-3\">\n        <img src=\"";
  stack1 = ((helper = (helper = helpers.picture || (depth0 != null ? depth0.picture : depth0)) != null ? helper : alias1),(options={"name":"picture","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.picture) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.picture || (depth0 != null ? depth0.picture : depth0)) != null ? helper : alias1),(options={"name":"picture","hash":{},"fn":this.noop,"inverse":this.program(4, data, 0),"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.picture) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\" alt=\"\" class=\"img-thumbnail\">\n        <br><br>\n        <button id=\"showPicModal\" class=\"btn btn-default btn-block\">\n            <span class=\"glyphicon glyphicon-arrow-up\"></span>\n            Change picture\n        </button>\n    </div>\n    <div class=\"col-md-9\">\n        <br>\n        <p>"
    + alias4(((helper = (helper = helpers.login || (depth0 != null ? depth0.login : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"login","hash":{},"data":data}) : helper)))
    + "</p>\n        <p>"
    + alias4(((helper = (helper = helpers.email || (depth0 != null ? depth0.email : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"email","hash":{},"data":data}) : helper)))
    + "</p>\n    </div>\n</div>\n";
},"2":function(depth0,helpers,partials,data) {
    return "/images/users/"
    + this.escapeExpression(this.lambda(depth0, depth0));
},"4":function(depth0,helpers,partials,data) {
    return "/images/no-avatar.jpg";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options;

  stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"data","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.data) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { return stack1; }
  else { return ''; }
},"useData":true});

this["chat"]["userIndex"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<script>\n    require ([\"jquery\", \"lodash\", \"cok_core\", \"cok_controller\"], function ($, _, cok_core, cok_controller) {\n    $(function () {\n        var _user = cok_controller.checkedUser();\n        var token = _user.token;\n        var chatTable;\n        var renderUsers = function () {\n            cok_core.call(\"user.getUserList\", {token: token}, function (result) {\n                chatTable = new cok_core.tableRender(\"userList\", $(\"#userCase tbody\"), result[0], {}, 10);\n                chatTable.render();\n            });\n        }\n\n        renderUsers();\n        // add fried\n        $('#userCase').on('click', '.addFriendBtn', function () {\n            var btn = $(this);\n            var _id = btn.attr('data-id');\n            cok_core.call(\"user.addFriendRequest\", {token: token, _id: _id}, function (result) {\n                renderUsers();\n            });\n        });\n\n        // remove friend\n        $('#userCase').on('click', '.delFriendBtn', function () {\n            var btn = $(this);\n            var _id = btn.attr('data-id');\n            cok_core.call(\"user.deleteFriend\", {token: token, _id: _id}, function (result) {\n                renderUsers();\n            });\n        });\n        \n        \n        // search\n        var userSearch = function () {\n            var searchField = $('#searchField').val();\n            if (! chatTable) {\n                return false;\n            } else {\n                chatTable.search(searchField, 'login');\n                return false;\n            }\n        }\n        $('.cokSearch').on('click', '#searchBtn', function () {\n            userSearch();\n        });\n        \n        \n    });\n});\n</script>\n<div id=\"userCase\" class=\"sub-container\">\n    <div class=\"row\">\n        <div class=\"col-md-8\">\n            <div class=\"cokPager\"></div>\n        </div>\n        <div class=\"col-md-4\">\n            <div class=\"cokSearch\"></div>\n        </div>\n    </div>\n    <table class=\"table table-striped table-hover\"><tbody></tbody></table>\n</div>";
},"useData":true});

this["chat"]["userList"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, alias4=helpers.blockHelperMissing, buffer = 
  "<tr>\n    <td>\n        <a href=\"#!/user/detail/"
    + alias3(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"_id","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3(((helper = (helper = helpers.login || (depth0 != null ? depth0.login : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"login","hash":{},"data":data}) : helper)))
    + "</a>\n    </td>\n    <td class=\"action-column\">\n";
  stack1 = ((helper = (helper = helpers.friend || (depth0 != null ? depth0.friend : depth0)) != null ? helper : alias1),(options={"name":"friend","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.friend) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.friend || (depth0 != null ? depth0.friend : depth0)) != null ? helper : alias1),(options={"name":"friend","hash":{},"fn":this.noop,"inverse":this.program(4, data, 0),"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.friend) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "    </td>\n</tr>\n";
},"2":function(depth0,helpers,partials,data) {
    var helper;

  return "            <button data-id=\""
    + this.escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"_id","hash":{},"data":data}) : helper)))
    + "\" class=\"btn btn-sm btn-danger delFriendBtn\">\n                <span class=\"glyphicon glyphicon-remove\"></span>\n                remove from friends\n            </button>\n";
},"4":function(depth0,helpers,partials,data) {
    var helper;

  return "            <button data-id=\""
    + this.escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"_id","hash":{},"data":data}) : helper)))
    + "\" class=\"btn btn-sm btn-success addFriendBtn\">\n                <span class=\"glyphicon glyphicon-plus\"></span>\n                add to friends\n            </button>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"data","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.data) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});

return this["chat"];

});