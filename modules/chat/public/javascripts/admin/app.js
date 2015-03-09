define (["jquery", "backbone"], function ($, Backbone) {
    'use strict';
    var App = {
        call: function() {
            if (arguments.length < 2) {
                return false;
            }
            var _method = arguments[0].toString();
            var cb = arguments[arguments.length - 1];
            var _params = Array.prototype.slice.call(arguments, 1, arguments.length - 1);
            var data = JSON.stringify({
                jsonrpc: "2.0",
                method: _method,
                params: _params,
                id: 1
            });
            $.ajax({
                type: 'POST',
                url: '/jsonrpc',
                contentType: 'application/json',
                data: data,
                dataType: 'json',
                cache: false,
                success: function (ret) {
                    cb(null, ret);
                },
                error: function (ret) {
                    cb(ret);
                }
            });
        },
        models: {}
    };


    App.MainRouter = Backbone.Router.extend({
        routes: {
            "users": "userList",
            "users/:id": "userDetail"
        },

        initialize: function (options) {
            //this.notes = options.notes;
            //// this is debug only to demonstrate how the backbone collection / models work
            //this.notes.bind('reset', this.updateDebug, this);
            //this.notes.bind('add', this.updateDebug, this);
            //this.notes.bind('remove', this.updateDebug, this);
            //this.userList();
        },

        userList: function (options) {
            var self = this;
            if (! App.models.users) {
                App.models.users = new App.UserCollection();
            }
            App.call("admin.getUserList", function (err, ret) {
                if (err) {
                    console.trace(err);
                }
                if (ret) {
                    App.models.users.reset(ret.result[0]);

                    self.currentView = new App.viewUserList({
                        users: App.models.users
                    });

                    $('#main').html(self.currentView.render().el);
                }



            });
        },

        userDetail: function (options) {
            var self = this;
            if (! App.models.users) {
                App.models.users = new App.UserCollection();
            }
            App.call("admin.getUserList", function (err, ret) {
                if (err) {
                    console.trace(err);
                }
                if (ret) {
                    App.models.users.reset(ret.result[0]);
                    var currentUser = App.models.users._byId[options];

                    self.currentView = new App.viewUserDetail({
                        user: currentUser
                    });
                    $('#main').html(self.currentView.render().el);
                }
            });
        },

        /*
        updateDebug: function () {
            //$('#output').text(JSON.stringify(this.notes.toJSON(), null, 4));
        },

        create: function () {
            this.currentView = new App.viewUserList({
                notes: this.notes, note: new App.NoteModel()
            });

            $('#primary-content').html(this.currentView.render().el);
        },

        edit: function (id) {
            var note = this.notes.get(id);
            this.currentView = new App.viewUserList({note: note});
            $('#primary-content').html(this.currentView.render().el);
        },

        show: function (id) {
            var note = this.notes.get(id);
            this.currentView = new App.viewUserList({
                note: note
            });
            $('#primary-content').html(this.currentView.render().el);
        },

        index: function () {
            this.currentView = new App.viewUserList({
                notes: this.notes
            });
            $('#primary-content').html(this.currentView.render().el);
            // we would call to the index with
            // this.notes.fetch()
            // to pull down the index json response to populate our collection initially
        }
        */
    });
    return App;
});
