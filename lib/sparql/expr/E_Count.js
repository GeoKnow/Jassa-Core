var Class = require('../../ext/Class');
/**
 * If null, '*' will be used
 *
 * TODO Not sure if modelling aggregate functions as exprs is a good thing to do.
 *
 * @param subExpr
 * @returns {ns.ECount}
 */
var E_Count = Class.create({
    initialize: function(subExpr, isDistinct) {
        this.subExpr = subExpr;
        this.isDistinct = isDistinct ? isDistinct : false;
    },

    copySubstitute: function(fnNodeMap) {
        var subExprCopy = this.subExpr ? this.subExpr.copySubstitute(fnNodeMap) : null;

        return new E_Count(subExprCopy, this.isDistinct);
    },

    toString: function() {
        return 'Count(' + (this.isDistinct ? 'Distinct ' : '') + (this.subExpr ? this.subExpr : '*') + ')';
    },
});

module.exports = E_Count;
