var Class = require('../../ext/Class');
var ExprFunction1 = require('../expr/expr-function-1');

var EStr = Class.create(ExprFunction1, {
    initialize: function($super, subExpr) {
        $super('str', subExpr);
    },

    getVarsMentioned: function() {
        return this.subExpr.getVarsMentioned();
    },

    copy: function(args) {
        return new EStr(args[0]);
    },

    toString: function() {
        return 'str(' + this.subExpr + ')';
    },
});

module.exports = EStr;
