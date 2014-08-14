var Class = require('../../ext/Class');
/*
 * TODO ECast should be removed -
 * a cast expression should be modeled as a function taking a single argument which is the value to cast.
 *
 */

var ECast = Class.create({
    initialize: function(expr, node) {
        this.expr = expr;
        this.node = node;
    },

    copySubstitute: function(fnNodeMap) {
        return new ECast(this.expr.copySubstitute(fnNodeMap), this.node.copySubstitute(fnNodeMap));
    },
});

module.exports = ECast;
