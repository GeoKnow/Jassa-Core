var Class = require('../../ext/Class');

/**
 * If null, '*' will be used
 *
 * TODO Not sure if modelling aggregate functions as exprs is a good thing to do.
 *
 * @param subExpr
 * @returns {ns.ECount}
 */
var AggCount = Class.create({
    initialize: function() {
    },

    copySubstitute: function(fnNodeMap) {
        return new AggCount();
    },

    getVarsMentioned: function() {
        return [];
    },

    toString: function() {
        return 'Count(*)';
    },

});

module.exports = AggCount;
