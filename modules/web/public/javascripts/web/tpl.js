define(["dust", "dust-helpers"], function(dust, dust_helpers) {
  // modules/web/views/web/blog/detail.dust
  (function() {
    dust.register("blog_detail", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"widget\">").s(ctx.get(["data"], false), ctx, {
        "block": body_1
      }, {}).w("</div>");
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("<p class=\"h4\">").s(ctx.getPath(false, ["access", "edit"]), ctx, {
        "block": body_2
      }, {}).f(ctx.get(["name"], false), ctx, "h").w("</p><p>").f(ctx.get(["description"], false), ctx, "h").w("</p>");
    }
    body_1.__dustBody = !0;

    function body_2(chk, ctx) {
      return chk.w("<a href=\"#blog-edit/").f(ctx.get(["_id"], false), ctx, "h").w("\">edit</a>&nbsp;");
    }
    body_2.__dustBody = !0;
    return body_0;
  })();
  // modules/web/views/web/blog/form.dust
  (function() {
    dust.register("blog_form", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"widget\"><form id=\"blogForm\"><div class=\"form-group\"><label for=\"name\">Blog name</label><input type=\"text\" class=\"form-control\" id=\"name\" placeholder=\"Blog name\" name=\"name\" ").s(ctx.get(["name"], false), ctx, {
        "block": body_1
      }, {}).w(" /></div><div class=\"form-group\"><label for=\"description\">Blog description</label><textarea class=\"form-control\" id=\"description\"  name=\"description\" rows=\"8\" cols=\"40\" placeholder=\"Blog description\">").s(ctx.get(["description"], false), ctx, {
        "block": body_2
      }, {}).w("</textarea></div><div class=\"checkbox\"><label for=\"public\" class=\"control-label\"><input type=\"checkbox\" id=\"public\" ").s(ctx.get(["public"], false), ctx, {
        "block": body_3
      }, {}).w(" /> Make public</label></div><button type=\"submit\" class=\"btn btn-success\"><span class=\"glyphicon glyphicon-floppy-disk\"></span>&nbsp;Save</button>&nbsp;&nbsp;<a href=\"#\" class=\"btn btn-warning\"><span class=\"glyphicon glyphicon-remove\"></span>&nbsp;Cancel</a></form></div>");
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("value=\"").f(ctx.getPath(true, []), ctx, "h").w("\"");
    }
    body_1.__dustBody = !0;

    function body_2(chk, ctx) {
      return chk.f(ctx.getPath(true, []), ctx, "h");
    }
    body_2.__dustBody = !0;

    function body_3(chk, ctx) {
      return chk.w("checked=\"true\"");
    }
    body_3.__dustBody = !0;
    return body_0;
  })();
  // modules/web/views/web/blog/list.dust
  (function() {
    dust.register("blog_list", body_0);

    function body_0(chk, ctx) {
      return chk.w("<h1>main page</h1><div class=\"row\">").s(ctx.get(["data"], false), ctx, {
        "block": body_1
      }, {}).w("</div>");
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("<div class=\"col-md-4\"><div class=\"widget\"><p class=\"h4\"><span class=\"glyphicon glyphicon-info-sign\"></span>&nbsp;<a href=\"#blog/").f(ctx.get(["_id"], false), ctx, "h").w("\">").f(ctx.get(["name"], false), ctx, "h").w("</a></p><p>").f(ctx.get(["description"], false), ctx, "h").w("</p></div></div>");
    }
    body_1.__dustBody = !0;
    return body_0;
  })();
  // modules/web/views/web/chat/form.dust
  (function() {
    dust.register("chat_form", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div id=\"chatCase\" class=\"widget\"><div id=\"uList\"></div><div id=\"chatItems\"><div id=\"messages\"></div></div><div id=\"chatFormCase\"><form id=\"chatMessage\"><div class=\"input-group\"><input id=\"chatText\" type=\"text\" class=\"form-control\" required autofocus /><span class=\"input-group-btn\"><button class=\"btn btn-default\" type=\"submit\"><span class=\"glyphicon glyphicon-send\"></span></button></span></div></form></div></div>");
    }
    body_0.__dustBody = !0;
    return body_0;
  })();
  // modules/web/views/web/chat/list.dust
  (function() {
    dust.register("chat_list", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"widget\"><a href=\"#chat-room-edit/-1\">New room</a>").s(ctx.get(["data"], false), ctx, {
        "block": body_1
      }, {}).w("</div>");
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("<div class=\"row\"><div class=\"col-xs-8\"><a href=\"#chat-room/").f(ctx.get(["_id"], false), ctx, "h").w("\">").s(ctx.get(["users"], false), ctx, {
        "block": body_2
      }, {}).w("</a></div><div class=\"col-xs-2\">").f(ctx.get(["fcDate"], false), ctx, "h").w("<br />").f(ctx.get(["fuDate"], false), ctx, "h").w("</div><div class=\"col-xs-2\"><a href=\"#chat-room-edit/").f(ctx.get(["_id"], false), ctx, "h").w("\" class=\"btn btn-default\"><span class=\"glyphicon glyphicon-pencil\"></span></a></div></div><br />");
    }
    body_1.__dustBody = !0;

    function body_2(chk, ctx) {
      return chk.w("<span>").f(ctx.get(["login"], false), ctx, "h").w("</span>&nbsp;");
    }
    body_2.__dustBody = !0;
    return body_0;
  })();
  // modules/web/views/web/chat/message.dust
  (function() {
    dust.register("chat_message", body_0);

    function body_0(chk, ctx) {
      return chk.s(ctx.get(["message"], false), ctx, {
        "block": body_1
      }, {});
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("<div class=\"row\"><div class=\"col-xs-10\"><a href=\"#/user/").f(ctx.get(["uId"], false), ctx, "h").w("\">").f(ctx.get(["login"], false), ctx, "h").w("</a><br />").f(ctx.get(["msg"], false), ctx, "h").w("</div><div class=\"col-xs-2\">").f(ctx.get(["date"], false), ctx, "h").w("</div></div>");
    }
    body_1.__dustBody = !0;
    return body_0;
  })();
  // modules/web/views/web/chat/personal.dust
  (function() {
    dust.register("chat_personal", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div id=\"chatCase\" class=\"widget\"><div id=\"uList\"></div><div id=\"chatItems\"><div id=\"messages\"></div></div><div id=\"chatFormCase\"><form id=\"chatMessage\"><div class=\"input-group\"><input id=\"chatText\" type=\"text\" class=\"form-control\" required autofocus /><span class=\"input-group-btn\"><button class=\"btn btn-default\" type=\"submit\"><span class=\"glyphicon glyphicon-send\"></span></button></span></div></form></div></div>");
    }
    body_0.__dustBody = !0;
    return body_0;
  })();
  // modules/web/views/web/chat/roomEdit.dust
  (function() {
    dust.register("chat_roomEdit", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"widget\">room edit<form id=\"chatRoomEdit\"><div class=\"row\"><div class=\"col-md-11\"><input type=\"text\" class=\"form-control\" id=\"users\" placeholder=\"users\" list=\"browsers\" /></div><div class=\"col-md-1\"><button type=\"submit\" class=\"btn btn-default\"><span class=\"glyphicon glyphicon-floppy-disk\"></span></button></div></div></form></div>");
    }
    body_0.__dustBody = !0;
    return body_0;
  })();
  // modules/web/views/web/chat/users.dust
  (function() {
    dust.register("chat_users", body_0);

    function body_0(chk, ctx) {
      return chk.s(ctx.get(["users"], false), ctx, {
        "block": body_1
      }, {});
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("<span class=\"label label-").f(ctx.get(["status"], false), ctx, "h").w("\" id=\"").f(ctx.get(["_id"], false), ctx, "h").w("\">").f(ctx.get(["login"], false), ctx, "h").w("</span>&nbsp;");
    }
    body_1.__dustBody = !0;
    return body_0;
  })();
  // modules/web/views/web/layout.dust
  (function() {
    dust.register("layout", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"row\"><div class=\"col-md-2\"><ul id=\"navigation\" class=\"nav nav-pills nav-stacked\"><li><a data-toggle=\"collapse\" href=\"#blog\"  aria-expanded=\"false\" aria-controls=\"blogs\" class=\"menuItem collapsed\"><span class=\"glyphicon glyphicon-home\"></span>&nbsp;Blogs</a><ul id=\"blog\" class=\"nav nav-pills nav-stacked collapse nav-child\"><li><a href=\"#\">List</a></li><li><a href=\"#\">My blogs</a></li><li><a href=\"#\">New blog</a></li></ul></li><li><a data-toggle=\"collapse\" href=\"#user\"  aria-expanded=\"false\" aria-controls=\"users\" class=\"menuItem collapsed\"><span class=\"glyphicon glyphicon-user\"></span>Users</a><ul id=\"user\" class=\"nav nav-pills nav-stacked collapse nav-child\"><li><a href=\"#profile\">Profile</a></li><li><a href=\"#user\">Users List</a></li><li><a href=\"#friend\">Friends List</a></li><li><a href=\"#friend-requests\">Friends Requests</a></li></ul></li><li><a data-toggle=\"collapse\" href=\"#chat\"  aria-expanded=\"false\" aria-controls=\"chat\" class=\"menuItem collapsed\"><span class=\"glyphicon glyphicon-envelope\"></span>Chats</a><ul id=\"chat\" class=\"nav nav-pills nav-stacked collapse nav-child\"><li><a href=\"#chat-room\">Chats List</a></li><li><a href=\"#chat-room-edit/-1\">New chat</a></li></ul></li><li><a href=\"#logout\"><span class=\"glyphicon glyphicon-log-out\"></span>&nbsp;Logout</a></li></ul></div><div id=\"main\" class=\"col-md-10\"></div></div>");
    }
    body_0.__dustBody = !0;
    return body_0;
  })();
  // modules/web/views/web/login/auth.dust
  (function() {
    dust.register("login_auth", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"col-md-offset-4 col-md-4\"><div class=\"widget\"><form id=\"loginForm\"><br /><p class=\"center\">Login to your account</p><div class=\"form-group\"><label for=\"login\" class=\"control-label\">Login</label><div class=\"input-group\"><div class=\"input-group-addon\"><span class=\"glyphicon glyphicon-user\"></span></div><input type=\"text\" class=\"form-control\" id=\"login\" placeholder=\"Login\" value=\"\" /></div></div><div class=\"form-group\"><label for=\"password\" class=\"control-label\">Password</label><div class=\"input-group\"><div class=\"input-group-addon\"><span class=\"glyphicon glyphicon glyphicon-lock\"></span></div><input type=\"password\" class=\"form-control\" id=\"password\" placeholder=\"Password\" value=\"\" /></div></div><button type=\"submit\" class=\"btn btn-danger btn-block\"><span class=\"glyphicon glyphicon-log-in\"></span>&nbsp;&nbsp;Login</button><br /><p class=\"center\"><a href=\"#registration\">Registration</a></p></form></div></div>");
    }
    body_0.__dustBody = !0;
    return body_0;
  })();
  // modules/web/views/web/login/registration.dust
  (function() {
    dust.register("login_registration", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"col-md-offset-4 col-md-4\"><div class=\"widget\"><form id=\"loginForm\"><br /><p class=\"center\">Registration a new account</p><div class=\"form-group\"><label for=\"login\" class=\"control-label\">Login</label><div class=\"input-group\"><div class=\"input-group-addon\"><span class=\"glyphicon glyphicon-user\"></span></div><input type=\"text\" class=\"form-control\" id=\"login\" placeholder=\"Login\" value=\"\" /></div></div><div class=\"form-group\"><label for=\"email\" class=\"control-label\">Email</label><div class=\"input-group\"><div class=\"input-group-addon\"><span class=\"glyphicon glyphicon-envelope\"></span></div><input type=\"email\" class=\"form-control\" id=\"email\" placeholder=\"Email\" value=\"\" /></div></div><div class=\"form-group\"><label for=\"password\" class=\"control-label\">Password</label><div class=\"input-group\"><div class=\"input-group-addon\"><span class=\"glyphicon glyphicon glyphicon-lock\"></span></div><input type=\"password\" class=\"form-control\" id=\"password\" placeholder=\"Password\" value=\"\" /></div></div><div class=\"form-group\"><label for=\"passwordConf\" class=\"control-label\">Confirm password</label><div class=\"input-group\"><div class=\"input-group-addon\"><span class=\"glyphicon glyphicon-ok\"></span></div><input type=\"password\" class=\"form-control\" id=\"passwordConf\" placeholder=\"Confirm password\" value=\"\" /></div></div><button type=\"submit\" class=\"btn btn-danger btn-block\">&nbsp;&nbsp;Registration</button></form></div></div>");
    }
    body_0.__dustBody = !0;
    return body_0;
  })();
  // modules/web/views/web/menu.dust
  (function() {
    dust.register("menu", body_0);

    function body_0(chk, ctx) {
      return chk.w("<ul id=\"navigation\" class=\"nav nav-pills nav-stacked\"><li><a data-toggle=\"collapse\" href=\"#blog\"  aria-expanded=\"false\" aria-controls=\"blogs\" class=\"menuItem collapsed\"><span class=\"glyphicon glyphicon-home\"></span>&nbsp;Blogs</a><ul id=\"blog\" class=\"nav nav-pills nav-stacked collapse nav-child\"><li><a href=\"#\">List</a></li>").s(ctx.get(["user"], false), ctx, {
        "block": body_1
      }, {}).w("</ul></li>").s(ctx.get(["user"], false), ctx, {
        "block": body_2
      }, {}).w("</ul>");
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("<li><a href=\"#\">My blogs</a></li><li><a href=\"#blog-new\">New blog</a></li>");
    }
    body_1.__dustBody = !0;

    function body_2(chk, ctx) {
      return chk.w("<li><a data-toggle=\"collapse\" href=\"#user\"  aria-expanded=\"false\" aria-controls=\"users\" class=\"menuItem collapsed\"><span class=\"glyphicon glyphicon-user\"></span>Users</a><ul id=\"user\" class=\"nav nav-pills nav-stacked collapse nav-child\"><li><a href=\"#profile\">Profile</a></li><li><a href=\"#user\">Users List</a></li><li><a href=\"#friend\">Friends List</a></li><li><a href=\"#friend-requests\">Friends Requests</a></li></ul></li><li><a data-toggle=\"collapse\" href=\"#chat\"  aria-expanded=\"false\" aria-controls=\"chat\" class=\"menuItem collapsed\"><span class=\"glyphicon glyphicon-envelope\"></span>Chats</a><ul id=\"chat\" class=\"nav nav-pills nav-stacked collapse nav-child\"><li><a href=\"#chat-room\">Chats List</a></li><li><a href=\"#chat-room-edit/-1\">New chat</a></li></ul></li><li><a href=\"#logout\"><span class=\"glyphicon glyphicon-log-out\"></span>&nbsp;Logout</a></li>");
    }
    body_2.__dustBody = !0;
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
  // modules/web/views/web/user/detail.dust
  (function() {
    dust.register("user_detail", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"row widget\"><div class=\"col-md-3\"><img src=\"").s(ctx.get(["picture"], false), ctx, {
        "block": body_1
      }, {}).nx(ctx.get(["picture"], false), ctx, {
        "block": body_2
      }, {}).w("\" alt=\"\" class=\"img-thumbnail\"><br /><a href=\"#/chat/").f(ctx.get(["_id"], false), ctx, "h").w("\">Write a message</a></div><div class=\"col-md-9\"><br><p>").f(ctx.get(["login"], false), ctx, "h").w("</p><p>").f(ctx.get(["email"], false), ctx, "h").w("</p></div></div>");
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
  // modules/web/views/web/user/friendList.dust
  (function() {
    dust.register("user_friendList", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"widget\">").s(ctx.get(["data"], false), ctx, {
        "block": body_1
      }, {}).w("</div>");
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("<div class=\"row\"><div class=\"col-xs-1\"><img src=\"").s(ctx.get(["picture"], false), ctx, {
        "block": body_2
      }, {}).nx(ctx.get(["picture"], false), ctx, {
        "block": body_3
      }, {}).w("\" alt=\"\" class=\"img-thumbnail\"></div><div class=\"col-xs-9\"><a href=\"#user/").f(ctx.get(["_id"], false), ctx, "h").w("\">").f(ctx.get(["login"], false), ctx, "h").w("</a><br /><a href=\"#chat/").f(ctx.get(["_id"], false), ctx, "h").w("\">Send a message</a></div><div class=\"col-xs-2\"><button data-id=\"").f(ctx.get(["_id"], false), ctx, "h").w("\" class=\"btn btn-sm btn-danger delFriendBtn\"><span class=\"glyphicon glyphicon-remove\"></span></button></div></div><br />");
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
    return body_0;
  })();
  // modules/web/views/web/user/index.dust
  (function() {
    dust.register("user_index", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"widget\"><div class=\"row\"><div class=\"col-md-3\"><img src=\"").s(ctx.get(["picture"], false), ctx, {
        "block": body_1
      }, {}).nx(ctx.get(["picture"], false), ctx, {
        "block": body_2
      }, {}).w("\" alt=\"\" class=\"img-thumbnail\"></div><div class=\"col-md-9\"><br><p>").f(ctx.get(["login"], false), ctx, "h").w("</p><p>").f(ctx.get(["email"], false), ctx, "h").w("</p></div></div></div>");
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
      return chk.w("<div class=\"widget\">").s(ctx.get(["data"], false), ctx, {
        "block": body_1
      }, {}).w("</div>");
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("<div class=\"row\"><div class=\"col-xs-1\"><img src=\"").s(ctx.get(["picture"], false), ctx, {
        "block": body_2
      }, {}).nx(ctx.get(["picture"], false), ctx, {
        "block": body_3
      }, {}).w("\" alt=\"\" class=\"img-thumbnail\"></div><div class=\"col-xs-9\"><a href=\"#user/").f(ctx.get(["_id"], false), ctx, "h").w("\">").f(ctx.get(["login"], false), ctx, "h").w("</a><br /><a href=\"#chat/").f(ctx.get(["_id"], false), ctx, "h").w("\">Send a message</a></div><div class=\"col-xs-2\">").h("eq", ctx, {
        "else": body_4,
        "block": body_5
      }, {
        "key": ctx.get(["friend"], false),
        "value": 1
      }).w("</div></div><br />");
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
      return chk.w("<button data-id=\"").f(ctx.get(["_id"], false), ctx, "h").w("\" class=\"btn btn-sm btn-success addFriendBtn\"><span class=\"glyphicon glyphicon-plus\"></span></button>");
    }
    body_4.__dustBody = !0;

    function body_5(chk, ctx) {
      return chk.w("<button data-id=\"").f(ctx.get(["_id"], false), ctx, "h").w("\" class=\"btn btn-sm btn-danger delFriendBtn\"><span class=\"glyphicon glyphicon-remove\"></span></button>");
    }
    body_5.__dustBody = !0;
    return body_0;
  })();
  define("blog_detail", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("blog_detail", locals, function(err, result) {
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
  define("blog_form", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("blog_form", locals, function(err, result) {
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
  define("blog_list", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("blog_list", locals, function(err, result) {
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
  define("chat_form", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("chat_form", locals, function(err, result) {
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
  define("chat_list", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("chat_list", locals, function(err, result) {
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
  define("chat_message", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("chat_message", locals, function(err, result) {
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
  define("chat_personal", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("chat_personal", locals, function(err, result) {
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
  define("chat_roomEdit", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("chat_roomEdit", locals, function(err, result) {
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
  define("chat_users", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("chat_users", locals, function(err, result) {
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
  define("login_registration", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("login_registration", locals, function(err, result) {
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
  define("menu", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("menu", locals, function(err, result) {
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
  define("user_detail", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("user_detail", locals, function(err, result) {
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
  define("user_friendList", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("user_friendList", locals, function(err, result) {
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
  return ["blog_detail", "blog_form", "blog_list", "chat_form", "chat_list", "chat_message", "chat_personal", "chat_roomEdit", "chat_users", "layout", "login_auth", "login_registration", "menu", "message", "user_detail", "user_friendList", "user_index", "user_list"];
});