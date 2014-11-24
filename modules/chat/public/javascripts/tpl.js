define(['handlebars'], function(Handlebars) {

this["chat"] = this["chat"] || {};

this["chat"]["index"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<h1>main page</h1>\n<div id=\"test\"></div>\n<ul>\n    <li><a href=\"#/user\">users</a></li>\n    <li><a href=\"#/chat/index\">chat</a></li>\n    <li><a href=\"#/chat/detail/123\">123</a></li>\n</ul>\n<script>\n    require([\"jquery\", \"c_helper\", \"app\"], function ($, c_helper) {\n        $.get(\"/users\", function (data) {\n            c_helper.render($(\"#test\"), \"userList\", {data: data});\n        });\n        \n    });\n</script>";
  },"useData":true});



this["chat"]["layout"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, buffer = "<!DOCTYPE html>\n<html lang=\"en\">\n    <head>\n        <link href=\"/stylesheets/chat.css\" rel=\"stylesheet\">\n        <script data-main=\"javascripts/main\" src=\"/javascripts/require.js\"></script>\n    </head>\n    <body>\n        ";
  stack1 = ((helper = (helper = helpers.body || (depth0 != null ? depth0.body : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"body","hash":{},"data":data}) : helper));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n    </body>\n</html>";
},"useData":true});



this["chat"]["userList"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    <li><strong>"
    + escapeExpression(((helper = (helper = helpers.login || (depth0 != null ? depth0.login : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"login","hash":{},"data":data}) : helper)))
    + "</strong> "
    + escapeExpression(((helper = (helper = helpers.email || (depth0 != null ? depth0.email : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"email","hash":{},"data":data}) : helper)))
    + "</li>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "<ul>\n";
  stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helperMissing),(options={"name":"data","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.data) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</ul>\n<script>\n    require([\"jquery\"], function ($) {\n        $('body').css({\"background\": \"blue\"});\n    });\n</script>";
},"useData":true});

return this["chat"];

});