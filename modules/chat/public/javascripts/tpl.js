define(['handlebars'], function(Handlebars) {

this["chat"] = this["chat"] || {};

this["chat"]["chatIndex"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<script>\n    require([\"jquery\", \"cok_core\", \"cok_controller\"], function ($, cok_core, cok_controller) {\n        var _user = cok_controller.checkedUser();\n        var token = _user.token;\n        cok_core.call(\"index.getChatList\", {token: token}, function (result) {\n            cok_core.render ($(\"#body\"), \"chatList\", {data: result[0]});\n        });\n    });\n</script>";
  },"useData":true});



this["chat"]["chatList"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing, buffer = "    <li>\n        <strong><a href=\"#!/chat/detail/"
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "\">";
  stack1 = ((helper = (helper = helpers.users || (depth0 != null ? depth0.users : depth0)) != null ? helper : helperMissing),(options={"name":"users","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.users) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</a></strong>\n        </li>\n";
},"2":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return escapeExpression(((helper = (helper = helpers.login || (depth0 != null ? depth0.login : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"login","hash":{},"data":data}) : helper)))
    + "&nbsp;";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "<ul>\n";
  stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helperMissing),(options={"name":"data","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.data) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</ul>";
},"useData":true});



this["chat"]["defaultIndex"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<h1>home</h1>";
  },"useData":true});



this["chat"]["loginIndex"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<script>\n    require([\"jquery\", \"cok_controller\"], function ($, cok_controller) {\n        $(\"body\").on(\"submit\", \"#loginForm\", function () {\n            cok_controller.authorise({\n                login: $('#login').val(),\n                password: $('#password').val(),\n            });\n            return false;\n        });\n    });\n</script>\n<div class=\"container\">\n    <div class=\"row\">\n        <div class=\"col-md-4 col-md-offset-4\">\n            <br><br><br><br>\n            <form role=\"form\" id=\"loginForm\">\n                <div class=\"form-group\">\n                    <label for=\"login\">Login</label>\n                    <input type=\"text\" class=\"form-control\" id=\"login\" placeholder=\"Login\" require>\n                </div>\n                <div class=\"form-group\">\n                    <label for=\"password\">Password</label>\n                    <input type=\"password\" class=\"form-control\" id=\"password\" placeholder=\"Password\" require>\n                </div>\n                <button type=\"submit\" class=\"btn btn-default\">Submit</button>\n            </form>\n        </div>\n    </div>\n</div>\n";
  },"useData":true});



this["chat"]["mainMenu"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    <li><a href=\""
    + escapeExpression(((helper = (helper = helpers.hash || (depth0 != null ? depth0.hash : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"hash","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "</a></li>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "<ul class=\"nav \">\n";
  stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helperMissing),(options={"name":"data","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.data) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</ul>";
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



this["chat"]["userIndex"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    <div>\n        <a href=\"#!/user/detail/"
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.login || (depth0 != null ? depth0.login : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"login","hash":{},"data":data}) : helper)))
    + "</a>\n        <button id=\"addFriendBtn\" data-id=\""
    + escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"_id","hash":{},"data":data}) : helper)))
    + "\" class=\"btn btn-sm btn-success\"><span class=\"glyphicon glyphicon-plus\"></span></button>\n    </div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing;
  stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helperMissing),(options={"name":"data","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.data) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { return stack1; }
  else { return ''; }
  },"useData":true});

return this["chat"];

});
