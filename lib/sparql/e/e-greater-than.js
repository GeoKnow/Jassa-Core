var Class = require('../../ext/Class');
var ExprFunction2 = require('../expr/expr-function-2');
var newBinaryExpr = require('../new-binary-expr');

var EGreaterThan = Class.create(ExprFunction2, {
    initialize: function($super, left, right) {
        $super('>', left, right);
    },

    copySubstitute: function(fnNodeMap) {
        return new EGreaterThan(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
    },

    copy: function(args) {
        return newBinaryExpr(EGreaterThan, args);
    },

    toString: function() {
        return '(' + this.left + ' > ' + this.right + ')';
    },
});

module.exports = EGreaterThan;
