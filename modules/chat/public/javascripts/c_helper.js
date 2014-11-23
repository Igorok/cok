define(["jquery", "handlebars", "tpl"], function ($, hbs, tpl) {
    function render (selector, view, data) {
        var _view = tpl[view](data);
        selector.html(_view);
    }
    return {
        render: render,
    }
});