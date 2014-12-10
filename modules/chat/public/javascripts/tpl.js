define(['handlebars'], function(Handlebars) {

this["chat"] = this["chat"] || {};

this["chat"]["chatCreate"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "        <div class=\"col-xs-4\">\n            <div class=\"checkbox\">\n                <label>\n                    <input type=\"checkbox\" name=\""
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "\"> "
    + escapeExpression(((helper = (helper = helpers.login || (depth0 != null ? depth0.login : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"login","hash":{},"data":data}) : helper)))
    + "\n                </label>\n            </div>\n        </div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "<script>\n    require([\"jquery\", \"lodash\", \"cok_core\", \"cok_controller\"], function ($, _, cok_core, cok_controller) {\n        var _user = cok_controller.checkedUser();\n        var token = _user.token;\n        $('#chatCreateForm').submit(function () {\n            var formData = $(this).serializeArray();\n            var result = [];\n            if (! _.isEmpty(formData)) {\n                _.each(formData, function (val) {\n                    result.push(val.name);\n                });\n            } else {\n                cok_core.systemMessage($('#messageCase'), 'danger', 'Users is empty')\n            }\n            return false;\n        });\n        /*cok_core.call(\"index.getChatList\", {token: token}, function (result) {\n            cok_core.render ($(\"#chatCase\"), \"chatList\", {data: result[0]});\n        });*/\n        \n        \n        \n        \n        /*var menu = [\n        {\n            title: '<span class=\"glyphicon glyphicon-file\"></span> Add',\n            hash: '#!/',\n        },\n        {\n            title: '<span class=\"glyphicon glyphicon-trash\"></span> Remove',\n            hash: '#!/',\n        },\n        ];\n        \n        cok_core.render ($(\"#secondMenu\"), \"mainMenu\", {data: menu});*/\n    });\n</script>\n<br>\n<div id=\"chatCase\" class=\"sub-container\">\n    <div id=\"messageCase\"></div>\n    <form role=\"form\" id=\"chatCreateForm\">\n       <div class=\"row\">\n";
  stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helperMissing),(options={"name":"data","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.data) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "        </div>\n        <button type=\"submit\" class=\"btn btn-default\"><span class=\"glyphicon glyphicon-floppy-disk\"></span> Save</button>\n    </form>\n</div>\n";
},"useData":true});



this["chat"]["chatIndex"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<script>\n    require([\"jquery\", \"cok_core\", \"cok_controller\"], function ($, cok_core, cok_controller) {\n        var _user = cok_controller.checkedUser();\n        var token = _user.token;\n        cok_core.call(\"index.getChatList\", {token: token}, function (result) {\n            cok_core.render ($(\"#chatCase\"), \"chatList\", {data: result[0]});\n        });\n        \n        \n        \n        \n        /*var menu = [\n        {\n            title: '<span class=\"glyphicon glyphicon-file\"></span> Add',\n            hash: '#!/',\n        },\n        {\n            title: '<span class=\"glyphicon glyphicon-trash\"></span> Remove',\n            hash: '#!/',\n        },\n        ];\n        \n        cok_core.render ($(\"#secondMenu\"), \"mainMenu\", {data: menu});*/\n    });\n</script>\n<br>\n<div class=\"sub-container\">\n    <a class=\"btn btn-default\" href=\"#!/chat/create\"><span class=\"glyphicon glyphicon-file\"></span> Add</a>\n</div>\n<br>\n<div id=\"chatCase\" class=\"sub-container\"></div>\n";
  },"useData":true});



this["chat"]["chatList"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing, buffer = "    <div class=\"row\">\n       <div class=\"col-xs-10\">\n            <strong><a href=\"#!/chat/detail/"
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "\">";
  stack1 = ((helper = (helper = helpers.users || (depth0 != null ? depth0.users : depth0)) != null ? helper : helperMissing),(options={"name":"users","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.users) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</a></strong>\n       </div>\n       <div class=\"col-xs-2\">\n           <button class=\"btn btn-default\"><span class=\"glyphicon glyphicon-edit\"></span></button>\n           <button class=\"btn btn-default\"><span class=\"glyphicon glyphicon-remove\"></span></button>\n       </div>\n    </div><br>\n";
},"2":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return escapeExpression(((helper = (helper = helpers.login || (depth0 != null ? depth0.login : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"login","hash":{},"data":data}) : helper)))
    + "&nbsp;";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "";
  stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helperMissing),(options={"name":"data","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.data) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n";
},"useData":true});



this["chat"]["defaultIndex"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"sub-container\">\n    <h1>home</h1>\n</div>\n";
  },"useData":true});



this["chat"]["friendsIndex"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<script>\nrequire ([\"jquery\", \"lodash\", \"cok_core\", \"cok_controller\"], function ($, _, cok_core, cok_controller) {\n    $(function () {\n        var _user = cok_controller.checkedUser();\n        var token = _user.token;\n\n        var renderFriends = function () {\n            cok_core.call(\"user.getFriendList\", {token: token}, function (result) {\n                cok_core.render ($(\"#friendsCase\"), \"userList\", {data: result[0]});\n            });\n        };\n\n\n\n        renderFriends();\n        $('#friendsCase').on('click', '.delFriendBtn', function () {\n            var btn = $(this);\n            var _id = btn.attr('data-id');\n            console.log('click friend')\n            cok_core.call(\"user.deleteFriend\", {token: token, _id: _id}, function (result) {\n                renderFriends();\n            });\n        });\n    });\n});\n</script>\nasd\n<div id=\"friendsCase\" class=\"sub-container\"></div>\n";
  },"useData":true});



this["chat"]["loginIndex"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<script>\n    require([\"jquery\", \"cok_controller\"], function ($, cok_controller) {\n        $(\"body\").on(\"submit\", \"#loginForm\", function () {\n            cok_controller.authorise({\n                login: $('#login').val(),\n                password: $('#password').val(),\n            });\n            return false;\n        });\n    });\n</script>\n<div class=\"sub-container\">\n    <div class=\"row\">\n        <div class=\"col-md-4 col-md-offset-4\">\n            <br><br><br><br>\n            <form role=\"form\" id=\"loginForm\">\n                <div class=\"form-group\">\n                    <label for=\"login\">Login</label>\n                    <input type=\"text\" class=\"form-control\" id=\"login\" placeholder=\"Login\" require>\n                </div>\n                <div class=\"form-group\">\n                    <label for=\"password\">Password</label>\n                    <input type=\"password\" class=\"form-control\" id=\"password\" placeholder=\"Password\" require>\n                </div>\n                <button type=\"submit\" class=\"btn btn-default\">Submit</button>\n            </form>\n        </div>\n    </div>\n</div>\n";
  },"useData":true});



this["chat"]["mainMenu"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "    <li><a href=\""
    + escapeExpression(((helper = (helper = helpers.hash || (depth0 != null ? depth0.hash : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"hash","hash":{},"data":data}) : helper)))
    + "\">";
  stack1 = ((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</a></li>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "<ul class=\"nav \">\n";
  stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helperMissing),(options={"name":"data","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.data) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</ul>\n";
},"useData":true});



this["chat"]["systemMessage"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<div class=\"alert alert-"
    + escapeExpression(((helper = (helper = helpers.event || (depth0 != null ? depth0.event : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"event","hash":{},"data":data}) : helper)))
    + " alert-dismissible\" role=\"alert\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"alert\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button>\n    "
    + escapeExpression(((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"message","hash":{},"data":data}) : helper)))
    + "\n</div>";
},"useData":true});



this["chat"]["userDetail"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    "
    + escapeExpression(((helper = (helper = helpers.login || (depth0 != null ? depth0.login : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"login","hash":{},"data":data}) : helper)))
    + "\n    <br>\n    "
    + escapeExpression(((helper = (helper = helpers.email || (depth0 != null ? depth0.email : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"email","hash":{},"data":data}) : helper)))
    + "\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "detail user\n";
  stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helperMissing),(options={"name":"data","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.data) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});



this["chat"]["userIndex"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<script>\n    require ([\"jquery\", \"lodash\", \"cok_core\", \"cok_controller\"], function ($, _, cok_core, cok_controller) {\n    $(function () {\n        var _user = cok_controller.checkedUser();\n        var token = _user.token;\n        cok_core.call(\"user.getUserList\", {token: token}, function (result) {\n            cok_core.render ($(\"#userCase\"), \"userList\", {data: result[0]});\n        });\n\n        // add fried\n        $('#userCase').on('click', '.addFriendBtn', function () {\n            var btn = $(this);\n            var _id = btn.attr('data-id');\n            cok_core.call(\"user.addFriend\", {token: token, _id: _id}, function (result) {\n                btn.remove();\n            });\n        });\n\n        // remove friend\n        $('#userCase').on('click', '.delFriendBtn', function () {\n            var btn = $(this);\n            var _id = btn.attr('data-id');\n            console.log('click user')\n            cok_core.call(\"user.deleteFriend\", {token: token, _id: _id}, function (result) {\n                btn.remove();\n            });\n        });\n    });\n});\n</script>\n<div id=\"userCase\" class=\"sub-container\"></div>\n";
  },"useData":true});



this["chat"]["userList"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing, buffer = "<div>\n    <a href=\"#!/user/detail/"
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.login || (depth0 != null ? depth0.login : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"login","hash":{},"data":data}) : helper)))
    + "</a>\n";
  stack1 = ((helper = (helper = helpers.friend || (depth0 != null ? depth0.friend : depth0)) != null ? helper : helperMissing),(options={"name":"friend","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.friend) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.friend || (depth0 != null ? depth0.friend : depth0)) != null ? helper : helperMissing),(options={"name":"friend","hash":{},"fn":this.noop,"inverse":this.program(4, data),"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.friend) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"2":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "        <button data-id=\""
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "\" class=\"btn btn-sm btn-danger delFriendBtn\"><span class=\"glyphicon glyphicon-trash\"></span></button>\n";
},"4":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "        <button data-id=\""
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "\" class=\"btn btn-sm btn-success addFriendBtn\"><span class=\"glyphicon glyphicon-plus\"></span></button>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "";
  stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helperMissing),(options={"name":"data","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.data) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});

return this["chat"];

});