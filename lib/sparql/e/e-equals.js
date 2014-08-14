var Class = require('../../ext/Class');
var ExprFunction2 = require('../expr/expr-function-2');

var EEquals = Class.create(ExprFunction2, {
    initialize: function($super, left, right) {
        $super('=', left, right);
    },

    copySubstitute: function(fnNodeMap) {
        return new EEquals(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
    },

    $copy: function(left, right) {
        return new EEquals(left, right);
    },

    toString: function() {
        return '(' + this.left + ' = ' + this.right + ')';
    },

    eval: function() { // binding) {
        // TODO Evaluate the expression
    },
});

module.exports = EEquals;
