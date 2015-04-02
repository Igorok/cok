define (["jquery", "underscore", "backbone", "dust", "tpl", "message", "api", "mGroup"], function ($, _, backbone, dust, tpl, Msg, Api, mGroup) {
    'use strict';
    var viewIndex = Backbone.View.extend({
        // the constructor
        initialize: function (options) {
            this.user = options.user;
            this.params = options.params;
            this.mGroup = new mGroup();
//            this.permissions.bind('reset', this.renderAll, this);
        },

        events: {
            "click .removePermission": "removePermission",
        },

        // populate the html to the dom
        render: function () {
            this.$el.html($('#main').html());
            this.renderAll();
            return this;
        },

        renderAll: function () {
            var self = this;
            self.mGroup.getGroupList({token: self.user.token}, function (err, ret) {
                if (err) {
                    new Msg.showError(null, err);
                }
                if (!! ret && !! ret.result) {
                    self.mGroup.set(ret.result[0]);
                }
                
                var data = _.pluck(self.mGroup.models, "attributes");
                dust.render("groupList", {data: data}, function (err, result) {
                    if (err) {
                        new Msg.showError(null, err);
                    }
                    self.$el.html(result);
                });
            });
        },

//        removePermission: function (e) {
//            var self = this;
//            e.preventDefault();
//            var _id = $(e.currentTarget).attr("data-id");
//            if (_id) {
//                Api.call("admin.removePermission", {token: self.user.token, _id: _id}, function (err, ret) {
//                    if (err) {
//                        new Msg.showError(null, err);
//                    }
//                    self.permissions.remove(_id);
//                    self.renderAll();
//                });
//            }
//        },
        
        
        
        
        
    });

    return viewIndex;
});
