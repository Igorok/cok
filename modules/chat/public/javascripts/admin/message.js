define (["jquery", "underscore", "backbone", "vMessage"], function ($, _, Backbone, vMessage) {
    'use strict';
    var Msg = function () {
        /*
        * render message
        */
        var show = function (_type, _title, _text) {
            var view = new vMessage({
                type: (_type || "info"),
                title: _title,
                text: _text,
            });
            $('#errorCase').html(view.render().el);
        };

        /*
        * render error message
        */
        var showError = function (_title, _text) {
            return show("danger", _title, _text);
        }

        // public
        this.show = show;
        this.showError = showError;
    };

    return new Msg();
});
