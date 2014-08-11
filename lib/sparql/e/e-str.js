var Class = require('../../ext/class');
var ExprFunction1 = require('../expr/expr-function-1');

var E_Str = Class.create(ExprFunction1, {
    initialize: function($super, subExpr) {
        $super('str', subExpr);
    },

    getVarsMentioned: function() {
        return this.subExpr.getVarsMentioned();
    },

    copy: function(args) {
        return new E_Str(args[0]);
    },

    toString: function() {
        return 'str(' + this.subExpr + ')';
    },
});

module.exports = E_Str;
