var Class = require('../ext/Class');

var SortCondition = Class.create({
    classLabel: 'jassa.sparql.SortCondition',
    initialize: function(expr, direction) {
        this.expr = expr;
        this.direction = direction;
    },

    getExpr: function() {
        return this.expr;
    },

    getDirection: function() {
        return this.direction;
    },

    toString: function() {
        var result;
        if(this.direction === 'asc') {
            result = 'Asc(' + this.expr + ')';
        } else if(this.direction === 'desc') {
            result = 'Desc(' + this.expr + ')';
        } else {
            result = '' + this.expr;
        }
        return result;
    },

    copySubstitute: function(fnNodeMap) {
        var exprCopy = this.expr.copySubstitute(fnNodeMap);
        var result = new SortCondition(exprCopy, this.direction);
        return result;
    },

});

module.exports = SortCondition;
