var Class = require('../../ext/Class');
var ExprUtils = require('../ExprUtils');
var Element = require('./Element');

var ElementFilter = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementFilter',
    initialize: function(expr) {
        if (Array.isArray(expr)) {
            console.log('[WARN] Array argument for filter is deprecated');
            expr = ExprUtils.andify(expr);
        }

        this.expr = expr;
    },

    getArgs: function() {
        return [];
    },

    copy: function(args) {
        if (args.length !== 0) {
            throw 'Invalid argument';
        }

        //  FIXME: Should we clone the attributes too?
        var result = new ElementFilter(this.expr);
        return result;
    },

    copySubstitute: function(fnNodeMap) {
        var newExpr = this.expr.copySubstitute(fnNodeMap);
        return new ElementFilter(newExpr);
    },

    getVarsMentioned: function() {
        return this.expr.getVarsMentioned();
    },

    flatten: function() {
        return this;
    },

    toString: function() {
        // var expr = ns.andify(this.exprs);
        return 'Filter(' + this.expr + ')';
    },
});

module.exports = ElementFilter;
