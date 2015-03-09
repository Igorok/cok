define(["dust", "dust-helpers"], function(dust, dust_helpers) {
  // modules/chat/views/admin/userDetail.dust
  (function() {
    dust.register("modules/chat/views/admin/userDetail", body_0);

    function body_0(chk, ctx) {
      return chk.w("<h3>my name: ").f(ctx.get(["login"], false), ctx, "h").w("</h3><p>email: ").f(ctx.get(["email"], false), ctx, "h").w("</p>");
    }
    body_0.__dustBody = !0;
    return body_0;
  })();
  // modules/chat/views/admin/userList.dust
  (function() {
    dust.register("modules/chat/views/admin/userList", body_0);

    function body_0(chk, ctx) {
      return chk.w("<ul>").s(ctx.get(["data"], false), ctx, {
        "block": body_1
      }, {}).w("</ul>");
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("<li><a href=\"#users/").f(ctx.get(["_id"], false), ctx, "h").w("\">").f(ctx.get(["login"], false), ctx, "h").w("</a>email: ").f(ctx.get(["email"], false), ctx, "h").w("</li>");
    }
    body_1.__dustBody = !0;
    return body_0;
  })();
  define("modules/chat/views/admin/userDetail", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("modules/chat/views/admin/userDetail", locals, function(err, result) {
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
  define("modules/chat/views/admin/userList", function() {
    return function(locals, callback) {
      var rendered;

      dust.render("modules/chat/views/admin/userList", locals, function(err, result) {
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
  return ["modules/chat/views/admin/userDetail", "modules/chat/views/admin/userList"];
});