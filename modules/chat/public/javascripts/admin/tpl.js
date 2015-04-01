define(["dust", "dust-helpers"], function(dust, dust_helpers) {
  // modules/chat/views/admin/adminLayout.dust
  (function() {
    dust.register("adminLayout", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"col-md-2\"><ul id=\"navigation\" class=\"nav nav-pills nav-stacked\"><li><a data-toggle=\"collapse\" href=\"#permMenu\" aria-expanded=\"false\" aria-controls=\"permMenu\" class=\"menuItem collapsed\"><span class=\"glyphicon glyphicon-tower\"></span>&nbsp;&nbsp;Permissions</a><ul id=\"permMenu\" class=\"nav nav-pills nav-stacked collapse\"><li><a href=\"#permissions\">Permission List</a></li><li><a href=\"#permissions/-1\">New permission</a></li></ul></li><li><a data-toggle=\"collapse\" href=\"#groups\" aria-expanded=\"false\" aria-controls=\"permMenu\" class=\"menuItem collapsed\"><span class=\"glyphicon glyphicon-folder-open\"></span>&nbsp;&nbsp;Groups</a><ul id=\"groups\" class=\"nav nav-pills nav-stacked collapse\"><li><a href=\"#permissions\">Permission List</a></li><li><a href=\"#permissions/-1\">New permission</a></li></ul></li><li><a data-toggle=\"collapse\" href=\"#users\"  aria-expanded=\"false\" aria-controls=\"permMenu\" class=\"menuItem collapsed\"><span class=\"glyphicon glyphicon-user\"></span>&nbsp;&nbsp;Users</a><ul id=\"users\" class=\"nav nav-pills nav-stacked collapse\"><li><a href=\"#permissions\">Permission List</a></li><li><a href=\"#permissions/-1\">New permission</a></li></ul></li></ul></div><div id=\"main\" class=\"col-md-10\"><div id=\"errorCase\"></div></div>");
    }
    body_0.__dustBody = !0;
    return body_0;
  })();
  // modules/chat/views/admin/login.dust
  (function() {
    dust.register("login", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"col-md-offset-4 col-md-4\"><div class=\"widget\"><form id=\"loginForm\"><div class=\"form-group\"><label for=\"login\" class=\"control-label\">Login</label><div class=\"input-group\"><div class=\"input-group-addon\"><span class=\"glyphicon glyphicon-user\"></span></div><input type=\"text\" class=\"form-control\" id=\"login\" placeholder=\"Login\" value=\"").f(ctx.get(["login"], false), ctx, "h").w("\" /></div></div><div class=\"form-group\"><label for=\"password\" class=\"control-label\">Password</label><div class=\"input-group\"><div class=\"input-group-addon\"><span class=\"glyphicon glyphicon glyphicon-lock\"></span></div><input type=\"password\" class=\"form-control\" id=\"password\" placeholder=\"Password\" value=\"").f(ctx.get(["password"], false), ctx, "h").w("\" /></div></div><button type=\"submit\" class=\"btn btn-default btn-block\">Login</button></form></div></div>");
    }
    body_0.__dustBody = !0;
    return body_0;
  })();
  // modules/chat/views/admin/message.dust
  (function() {
    dust.register("message", body_0);

    function body_0(chk, ctx) {
      return chk.w("<br><div class=\"alert alert-").f(ctx.get(["type"], false), ctx, "h").w(" alert-dismissible fade in\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">×</span></button>").s(ctx.get(["title"], false), ctx, {
        "block": body_1
      }, {}).w("<p>").f(ctx.get(["text"], false), ctx, "h").w("</p></div>");
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("<h4>").f(ctx.getPath(true, []), ctx, "h").w("</h4>");
    }
    body_1.__dustBody = !0;
    return body_0;
  })();
  // modules/chat/views/admin/permissionDetail.dust
  (function() {
    dust.register("permissionDetail", body_0);

    function body_0(chk, ctx) {
      return chk.w("<br /><div class=\"widget\"><form id=\"permissionForm\"><div class=\"form-group\"><label for=\"key\" class=\"control-label\">Key</label><input type=\"text\" class=\"form-control\" id=\"key\" placeholder=\"Key\" value=\"").f(ctx.get(["key"], false), ctx, "h").w("\" /></div><div class=\"form-group\"><label for=\"title\" class=\"control-label\">Title</label><input type=\"text\" class=\"form-control\" id=\"title\" placeholder=\"Title\" value=\"").f(ctx.get(["title"], false), ctx, "h").w("\" /></div><button type=\"submit\" class=\"btn btn-default\">Submit</button></form></div>");
    }
    body_0.__dustBody = !0;
    return body_0;
  })();
  // modules/chat/views/admin/permissionList.dust
  (function() {
    dust.register("permissionList", body_0);

    function body_0(chk, ctx) {
      return chk.w("<br /><div class=\"widget\"><table class=\"table table-striped table-hover\">").s(ctx.get(["data"], false), ctx, {
        "block": body_1
      }, {}).w("</table></div>");
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("<tr><td><a href=\"#permissions/").f(ctx.get(["_id"], false), ctx, "h").w("\">").f(ctx.get(["key"], false), ctx, "h").w("</a></td><td><span> ").f(ctx.get(["title"], false), ctx, "h").w("</span></td><td><a href=\"#\" class=\"removePermission\" data-id=\"").f(ctx.get(["_id"], false), ctx, "h").w("\"><span class=\"glyphicon glyphicon-trash\"></span></a></td></tr>");
    }
    body_1.__dustBody = !0;
    return body_0;
  })();
  // modules/chat/views/admin/userDetail.dust
  (function() {
    dust.register("userDetail", body_0);

    function body_0(chk, ctx) {
      return chk.w("<h3>my name: ").f(ctx.get(["login"], false), ctx, "h").w("</h3><p>email: ").f(ctx.get(["email"], false), ctx, "h").w("</p>");
    }
    body_0.__dustBody = !0;
    return body_0;
  })();
  // modules/chat/views/admin/userList.dust
  (function() {
    dust.register("userList", body_0);

    function body_0(chk, ctx) {
      return chk.w("<ul>").s(ctx.get(["data"], false), ctx, {
        "block": body_1
      }, {}).w("</ul>");
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("<li><!-- a href=\"#users/").f(ctx.get(["_id"], false), ctx, "h").w("\">").f(ctx.get(["login"], false), ctx, "h").w("</a--><span class=\"detailView\" data-id=\"").f(ctx.get(["_id"], false), ctx, "h").w("\">").f(ctx.get(["login"], false), ctx, "h").w(" </span><span> email: ").f(ctx.get(["email"], false), ctx, "h").w("</span></li>");
    }
    body_1.__dustBody = !0;
    return body_0;
  })();
  // modules/chat/views/admin/userModalDetail.dust
  (function() {
    dust.register("userModalDetail", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"modal fade in\" aria-hidden=\"false\" style=\"display: block;\"><div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">×</span></button><h4 class=\"modal-title\">Modal title</h4></div><div class=\"modal-body\">фвфыв</div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button></div></div></div></div>");
    }
    body_0.__dustBody = !0;
    return body_0;
  })();
  define("adminLayout", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("adminLayout", locals, function(err, result) {
        if (typeof callback === "function") {
          try {
            callback(err, result);
          } catch (e) {}
        }

        if (err) {
          throw err
        } else {
          rendered = result;
        }
      });

      return rendered;
    }
  });
  define("login", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("login", locals, function(err, result) {
        if (typeof callback === "function") {
          try {
            callback(err, result);
          } catch (e) {}
        }

        if (err) {
          throw err
        } else {
          rendered = result;
        }
      });

      return rendered;
    }
  });
  define("message", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("message", locals, function(err, result) {
        if (typeof callback === "function") {
          try {
            callback(err, result);
          } catch (e) {}
        }

        if (err) {
          throw err
        } else {
          rendered = result;
        }
      });

      return rendered;
    }
  });
  define("permissionDetail", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("permissionDetail", locals, function(err, result) {
        if (typeof callback === "function") {
          try {
            callback(err, result);
          } catch (e) {}
        }

        if (err) {
          throw err
        } else {
          rendered = result;
        }
      });

      return rendered;
    }
  });
  define("permissionList", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("permissionList", locals, function(err, result) {
        if (typeof callback === "function") {
          try {
            callback(err, result);
          } catch (e) {}
        }

        if (err) {
          throw err
        } else {
          rendered = result;
        }
      });

      return rendered;
    }
  });
  define("userDetail", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("userDetail", locals, function(err, result) {
        if (typeof callback === "function") {
          try {
            callback(err, result);
          } catch (e) {}
        }

        if (err) {
          throw err
        } else {
          rendered = result;
        }
      });

      return rendered;
    }
  });
  define("userList", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("userList", locals, function(err, result) {
        if (typeof callback === "function") {
          try {
            callback(err, result);
          } catch (e) {}
        }

        if (err) {
          throw err
        } else {
          rendered = result;
        }
      });

      return rendered;
    }
  });
  define("userModalDetail", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("userModalDetail", locals, function(err, result) {
        if (typeof callback === "function") {
          try {
            callback(err, result);
          } catch (e) {}
        }

        if (err) {
          throw err
        } else {
          rendered = result;
        }
      });

      return rendered;
    }
  });
  return ["adminLayout", "login", "message", "permissionDetail", "permissionList", "userDetail", "userList", "userModalDetail"];
});