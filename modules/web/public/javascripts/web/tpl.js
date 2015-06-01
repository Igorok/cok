define(["dust", "dust-helpers"], function(dust, dust_helpers) {
  // modules/web/views/web/layout.dust
  (function() {
    dust.register("layout", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"col-md-2\"><ul id=\"navigation\" class=\"nav nav-pills nav-stacked\"><li><a href=\"#\"><span class=\"glyphicon glyphicon-home\"></span>&nbsp;Account</a></li><li><a data-toggle=\"collapse\" href=\"#users\"  aria-expanded=\"false\" aria-controls=\"users\" class=\"menuItem collapsed\"><span class=\"glyphicon glyphicon-user\"></span>Users</a><ul id=\"users\" class=\"nav nav-pills nav-stacked collapse nav-child\"><li><a href=\"#users\">Users List</a></li><li><a href=\"#friends\">Friends List</a></li></ul></li><li><a data-toggle=\"collapse\" href=\"#chat\"  aria-expanded=\"false\" aria-controls=\"chat\" class=\"menuItem collapsed\"><span class=\"glyphicon glyphicon-envelope\"></span>Chats</a><ul id=\"chat\" class=\"nav nav-pills nav-stacked collapse nav-child\"><li><a href=\"#chat\">Chats List</a></li><li><a href=\"#chat/-1\">New chat</a></li></ul></li></ul></div><div id=\"main\" class=\"col-md-10\"></div>");
    }
    body_0.__dustBody = !0;
    return body_0;
  })();
  // modules/web/views/web/login/auth.dust
  (function() {
    dust.register("login_auth", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"col-md-offset-4 col-md-4\"><div class=\"widget\"><form id=\"loginForm\"><div class=\"form-group\"><label for=\"login\" class=\"control-label\">Login</label><div class=\"input-group\"><div class=\"input-group-addon\"><span class=\"glyphicon glyphicon-user\"></span></div><input type=\"text\" class=\"form-control\" id=\"login\" placeholder=\"Login\" value=\"\" /></div></div><div class=\"form-group\"><label for=\"password\" class=\"control-label\">Password</label><div class=\"input-group\"><div class=\"input-group-addon\"><span class=\"glyphicon glyphicon glyphicon-lock\"></span></div><input type=\"password\" class=\"form-control\" id=\"password\" placeholder=\"Password\" value=\"\" /></div></div><button type=\"submit\" class=\"btn btn-default btn-block\">Login</button></form></div></div>");
    }
    body_0.__dustBody = !0;
    return body_0;
  })();
  // modules/web/views/web/message.dust
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
  // modules/web/views/web/user/index.dust
  (function() {
    dust.register("user_index", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"row widget\"><div class=\"col-md-3\"><img src=\"").s(ctx.get(["picture"], false), ctx, {
        "block": body_1
      }, {}).nx(ctx.get(["picture"], false), ctx, {
        "block": body_2
      }, {}).w("\" alt=\"\" class=\"img-thumbnail\"></div><div class=\"col-md-9\"><br><p>").f(ctx.get(["login"], false), ctx, "h").w("</p><p>").f(ctx.get(["email"], false), ctx, "h").w("</p></div></div>");
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("/images/users/");
    }
    body_1.__dustBody = !0;

    function body_2(chk, ctx) {
      return chk.w("/images/no-avatar.jpg");
    }
    body_2.__dustBody = !0;
    return body_0;
  })();
  // modules/web/views/web/user/list.dust
  (function() {
    dust.register("user_list", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"widget\"><div class=\"row\">").s(ctx.get(["data"], false), ctx, {
        "block": body_1
      }, {}).w("</div></div>");
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("<div class=\"col-xs-2\"><img src=\"").s(ctx.get(["picture"], false), ctx, {
        "block": body_2
      }, {}).nx(ctx.get(["picture"], false), ctx, {
        "block": body_3
      }, {}).w("\" alt=\"\" class=\"img-thumbnail\"></div><div class=\"col-xs-8\"><a href=\"#users/").f(ctx.get(["_id"], false), ctx, "h").w("\">").f(ctx.get(["login"], false), ctx, "h").w("</a></div><div class=\"col-xs-2\">").s(ctx.get(["friend"], false), ctx, {
        "block": body_4
      }, {}).nx(ctx.get(["friend"], false), ctx, {
        "block": body_5
      }, {}).w("</div>");
    }
    body_1.__dustBody = !0;

    function body_2(chk, ctx) {
      return chk.w("/images/users/");
    }
    body_2.__dustBody = !0;

    function body_3(chk, ctx) {
      return chk.w("/images/no-avatar.jpg");
    }
    body_3.__dustBody = !0;

    function body_4(chk, ctx) {
      return chk.w("<button data-id=\"").f(ctx.get(["_id"], false), ctx, "h").w("\" class=\"btn btn-sm btn-danger delFriendBtn\"><span class=\"glyphicon glyphicon-remove\"></span>&nbsp; remove from friends</button>");
    }
    body_4.__dustBody = !0;

    function body_5(chk, ctx) {
      return chk.w("<button data-id=\"").f(ctx.get(["_id"], false), ctx, "h").w("\" class=\"btn btn-sm btn-success addFriendBtn\"><span class=\"glyphicon glyphicon-plus\"></span>&nbsp; add to friends</button>");
    }
    body_5.__dustBody = !0;
    return body_0;
  })();
  define("layout", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("layout", locals, function(err, result) {
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
  define("login_auth", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("login_auth", locals, function(err, result) {
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
  define("user_index", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("user_index", locals, function(err, result) {
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
  define("user_list", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("user_list", locals, function(err, result) {
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
  return ["layout", "login_auth", "message", "user_index", "user_list"];
});