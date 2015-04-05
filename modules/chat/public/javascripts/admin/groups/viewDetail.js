define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "api", "mGroup", "mPermission"], function ($, _, backbone, dust, tpl, Msg, Api, _mGroup, _mPermission) {
    'use strict';
    var mGroup = new _mGroup();
    var mPermission = new _mPermission();
    var viewIndex = Backbone.View.extend({
        // the constructor
        initialize: function (options) {
            var self = this;
            self.user = options.user;
            self.params = options.params;
            self.model = null;
        },

        events: {
            "submit #groupForm": "saveOne",
        },

        // populate the html to the dom
        render: function () {
            this.$el.html($('#main').html());
            this.renderOne();
            return this;
        },

        renderOne: function () {
            var self = this;
            mPermission.getAll({token: self.user.token}, function () {
            mGroup.getAll({token: self.user.token}, function () {
                if (self.params == "-1") {
                    self.model = new mGroup.model();
                } else {
                    self.model = mGroup.get(self.params);
                }
                var allPerm = mPermission.pluck("key");
                var modelPerm = self.model.get("permission");
                var formPermission = [];
                _.each(allPerm, function (val) {
                    if (_.include(modelPerm, val)) {
                        formPermission.push({
                            key: val,
                            checked: true,
                        });
                    } else {
                        formPermission.push({
                            key: val,
                            checked: false,
                        });
                    }
                });
                self.model.set("formPermission", formPermission);
                dust.render("groupDetail", {data: self.model.attributes}, function (err, result) {
                    if (err) {
                        return Msg.showError(null, err);
                    }
                    self.$el.html(result);
                });
            });
            });
        },

        saveOne: function (e) {
            e.preventDefault();
            var self = this;
            var title = $("#title").val();
            var description = $("#description").val();
            var permission = [];
            $("input:checked").each(function (i) {
                permission.push($(this).attr("id"));
            });
            self.model.set("title", title);
            self.model.set("description", description);
            self.model.set("permission", permission);
            if (! self.model.isValid()) {
                Msg.inputError(self.model.validationError);
            } else {
                console.log(self.model);
            }
        },
    });

    return viewIndex;
});
