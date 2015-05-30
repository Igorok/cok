define(["lodash", "handlebars"], function (_, hbs) {
    hbs.registerHelper('ifMod', function(conditional, _sign, _var, cb) {
        var self = this;
        if(conditional) {
            switch (_sign) {
                case "=":
                    if (conditional == _var) {
                        return cb.fn(self);
                    } else {
                        return null;
                    }
                    break;
                case "!=":
                    if (conditional != _var) {
                        return cb.fn(self);
                    } else {
                        return null;
                    }
                    break;
                case ">":
                    if (conditional > parseFloat(_var)) {
                        return cb.fn(self);
                    } else {
                        return null;
                    }
                    break;
                case "<":
                    if (conditional < parseFloat(_var)) {
                        return cb.fn(self);
                    } else {
                        return null;
                    }
                    break;
                default:
                    return null;
            }
        } else {
            return null;
        }
    });
    
    var rowInd = -1;
    hbs.registerHelper('rowOpen', function(_index, _var, cb) {
        var self = this;
        if (_index == 0) {
            rowInd = -1;
        }
        rowInd++;
        if(_var) {
            if ((_index % _var) == 0) {
                return cb.fn(self);
            } else {
                return null;
            }
        } else {
            return null;
        }
    });
    hbs.registerHelper('rowClose', function(_index, _var, cb) {
        var self = this;
        if(_var) {
            if (((_index % _var) == 0) && (rowInd > 0) && (_index > rowInd)) {
                return cb.fn(self);
            } else {
                return null;
            }
        } else {
            return null;
        }
    });
});