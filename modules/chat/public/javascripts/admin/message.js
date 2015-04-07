define (["jquery", "underscore", "backbone", "vMessage"], function ($, _, Backbone, vMessage) {
    'use strict';
    var Msg = function () {
        /*
        * render message
        */
        var show = function (_type, _title, _text) {
            console.log(_type, _title, _text);
            var view = new vMessage({
                type: (_type || "info"),
                title: _title,
                text: _text,
            });
            if ($('#errorCase').length) {
                $('#errorCase').html(view.render().el);
            } else {
                $('body').prepend(view.render().el);
            }
        };

        /*
        * render error message
        */
        var showError = function (_title, _text) {
            if (_text.toString() == "403") {
                return window.location.hash = "login";
            }
            return show("danger", _title, _text);
        };

        /*
        * show errors for inputs
        */
        var inputError = function (_errArr) {
            _.each(_errArr, function (_val, _key) {
                var elem = $("#" + _key).parent(".form-group");
                var errCount = elem.find("span.control-label").length;
                if (errCount == 0) {
                    var val ='<span class="control-label">' + _val + '</span>';
                    elem.append(val).addClass("has-error");
                }
            });
        };

        // public
        this.show = show;
        this.showError = showError;
        this.inputError = inputError;
    };

    return new Msg();
});
