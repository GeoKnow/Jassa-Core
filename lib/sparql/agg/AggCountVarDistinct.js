var Class = require('../../ext/Class');

var AggCountVarDistinct = Class.create({
    initialize: function(expr) {
        this.expr = expr;
    },

    copySubstitute: function(fnNodeMap) {
        var subExprCopy = this.expr.copySubstitute(fnNodeMap);

        var result = new AggCountVarDistinct(subExprCopy);
        return result;
    },

    getVarsMentioned: function() {
        return [];
    },

    toString: function() {
        var result = 'Count(Distinct ' + this.expr + ')';
        return result;
    },

});

module.exports = AggCountVarDistinct;
