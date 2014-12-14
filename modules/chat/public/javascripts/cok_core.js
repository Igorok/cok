define(["jquery", "jsonrpcclient", "storageapi", "lodash", "handlebars", "tpl"], function ($, jsonrpc, storageapi, _, hbs, tpl) {
    function cok_core () {}
    var routes;
    var menu;
    var user;
    var storage = $.localStorage;
    // get current user
    var getUser = cok_core.prototype.getUser = function () {
        if (! user) {
            user = storage.get('user');
        }
        return user;
    };

    cok_core.prototype.setUser = function (_user, cb) {
        if (_user) {
            storage.set('user', _user);
            user = _user
        }
        cb();
    };
    cok_core.prototype.removeUser = function (_user) {
        user = storage.remove('user');
    };

    // set vars
    cok_core.prototype.init = function (_routes, cb) {
        if (! routes) {
            routes = _routes;
        }
        getUser();
    };



    // render views
    var render = cok_core.prototype.render = function (selector, view, data) {
        /*var _view = tpl[view](data);
        selector.html(_view);*/
        var _view = tpl[view](data);
        return selector.html(_view);
    };

    var systemMessage = cok_core.prototype.systemMessage = function (selector, event, message) {
        if (! selector.length) {
            selector = $('#body');
        }
        render(selector, 'systemMessage', {event: event, message: message})
    };


    // parse hash
    cok_core.prototype.router = function (alias) {
        var curentController;
        var curentAction;
        var params;
        alias = alias.toString().split("/");
        alias.shift();
        if (_.isEmpty(alias) || _.isEmpty(alias[0])) {
            curentController = "default";
            curentAction = "index";
            routes[curentController][curentAction].apply(this, params);
        } else if (! _.isEmpty(alias[0]) && ! _.contains(_.keys(routes), alias[0])) {
            window.location = "#!/";
        } else if (_.isEmpty(alias[1]) || ! routes[alias[0]][alias[1]]) {
            window.location = "#!/" + alias[0] + "/index";
        } else {
            curentController = alias[0];
            curentAction = alias[1];
            if (alias.length > 2) {
                params = alias.slice(2, alias.length);
            }
            routes[curentController][curentAction].apply(this, params);
        }
    };

    // error
    var selfError = cok_core.prototype.error = function (error) {
        if ((error == 403) || (error.err == 403)) {
            return window.location = "#!/logout";
        } else if (error.err === 404) {
            return  window.location = "#!/";
        }

        var msg = error.err ? error.err : error;
        systemMessage($('#body'), 'danger', msg);
        console.log("error ", error);
    };

    // ajax request
    cok_core.prototype.call = function () {
        if (arguments.length < 2) {
            return false;
        }
        var _method = arguments[0];
        var cb = arguments[arguments.length - 1];
        var data = Array.prototype.slice.call(arguments, 1, arguments.length - 1);
        var rpc = new $.JsonRpcClient({ ajaxUrl: '/jsonrpc' });
        rpc.call(
            _method,
            data,
            function (result) {
                cb(result);
            },
            function(error) {
                selfError(error);
            }
        );
    };

    cok_core.prototype.tableRender = function (_view, _selector, _data, _option, _rowCount, _pagerSelector) {
        var selfView = _view;
        var selfSelector = _selector;
        var selfData = _data;
        var selfOption = _option;
        var selfRowCount = _rowCount ? _rowCount : 10;
        var selfCurentPage = 1;
        var selfPagerSelector = _pagerSelector;

        var selfRender = function (cb) {
            var pageCount = selfData.length / selfRowCount;
            if (selfData.length % selfRowCount != 0) {
                pageCount = parseInt(pageCount) + 1;
            }
            var startRenderIndex = (selfCurentPage -1) * selfRowCount;
            if (startRenderIndex > selfData.length) {
                startRenderIndex = selfData.length - selfRowCount;
            }
            var endRenderIndex = selfCurentPage * selfRowCount;
            if (endRenderIndex > selfData.length) {
                endRenderIndex = selfData.length;
            }
            var renderData = selfData.slice(startRenderIndex, endRenderIndex);
            var pagerTemplate = '<ul class="pagination">';
            if (pageCount > 1) {
                for (var i = 1; i <= pageCount; i++) {
                    var active = '';
                    if (i == selfCurentPage) {
                        active += 'class="active"';
                    }
                    pagerTemplate += '<li '+ active +'><a href="#">'+ i +'</a></li>';
                }
            }
            pagerTemplate += '</ul>';

            render(selfSelector, selfView, {data: renderData, option: selfOption});

            if (selfPagerSelector) {
                selfPagerSelector.html(pagerTemplate);
            }
            if (cb) {
                cb();
            }
        }
        var sort = function (key, asc) {
            var self = this;
            selfData = _.sortBy(selfData, key);
            if (! asc) {
                selfData.reverse();
            }
            selfRender();
        }
        // public method
        this.render = function (cb) {
            return selfRender(cb);
        }
        this.pageChange = function (_pageNum) {
            if (_pageNum) {
                selfCurentPage = _pageNum;
            }
            return selfRender();
        }
        this.sort = function (th) {
            if (! th.attr('data-sort')) {
                return false;
            }
            var asc = 0;
            var key = th.attr("data-sort");
            if (th.hasClass("sorted-desc")) {
                asc = 1;
            }
            th.removeClass("sorted-desc sorted-asc");
            th.addClass((asc ? "sorted-asc" : "sorted-desc"));
            sort(key, asc);
        };
        this.fixedSort = function (th) {
            if (! th.attr('data-sort')) {
                return false;
            }
            var asc = 0;
            var key = th.attr("data-sort");
            if (th.hasClass("sorted-asc")) {
                asc = 1;
            }
            sort(key, asc)
        };
    };







    // shared functions
    return new cok_core();
});
