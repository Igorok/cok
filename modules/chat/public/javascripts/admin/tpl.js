define(["dust", "dust-helpers"], function(dust, dust_helpers) {
  // modules/chat/views/admin/login.dust
  (function() {
    dust.register("login", body_0);

    function body_0(chk, ctx) {
      return chk.w("<form id=\"loginForm\"><div class=\"form-group\"><label for=\"login\" class=\"control-label\">Login</label><input type=\"text\" class=\"form-control\" id=\"login\" placeholder=\"Login\" value=\"").f(ctx.get(["login"], false), ctx, "h").w("\" /></div><div class=\"form-group\"><label for=\"password\" class=\"control-label\">Title</label><input type=\"text\" class=\"form-control\" id=\"password\" placeholder=\"Password\" value=\"").f(ctx.get(["password"], false), ctx, "h").w("\" /></div><button type=\"submit\" class=\"btn btn-default\">Login</button></form>");
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
      return chk.w("<form id=\"permissionForm\"><div class=\"form-group\"><label for=\"key\" class=\"control-label\">Key</label><input type=\"text\" class=\"form-control\" id=\"key\" placeholder=\"Key\" value=\"").f(ctx.get(["key"], false), ctx, "h").w("\" /></div><div class=\"form-group\"><label for=\"title\" class=\"control-label\">Title</label><input type=\"text\" class=\"form-control\" id=\"title\" placeholder=\"Title\" value=\"").f(ctx.get(["title"], false), ctx, "h").w("\" /></div><button type=\"submit\" class=\"btn btn-default\">Submit</button></form>");
    }
    body_0.__dustBody = !0;
    return body_0;
  })();
  // modules/chat/views/admin/permissionList.dust
  (function() {
    dust.register("permissionList", body_0);

    function body_0(chk, ctx) {
      return chk.w("<ul>").s(ctx.get(["data"], false), ctx, {
        "block": body_1
      }, {}).w("</ul><a href=\"#permissions/-1\" class=\"btn btn-default\">New permission</a>");
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("<li><a href=\"#permissions/").f(ctx.get(["_id"], false), ctx, "h").w("\">").f(ctx.get(["key"], false), ctx, "h").w("</a><span> ").f(ctx.get(["title"], false), ctx, "h").w("</span></li>");
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
  return ["login", "message", "permissionDetail", "permissionList", "userDetail", "userList", "userModalDetail"];
});