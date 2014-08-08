var Class = require('../../ext/class');
var ExprFunction2 = require('../expr/expr-function-2');

var E_Equals = Class.create(ExprFunction2, {
    initialize: function($super, left, right) {
        $super('=', left, right);
    },

    copySubstitute: function(fnNodeMap) {
        return new E_Equals(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
    },

    $copy: function(left, right) {
        return new E_Equals(left, right);
    },

    toString: function() {
        return '(' + this.left + ' = ' + this.right + ')';
    },

    eval: function() { //binding) {
        // TODO Evaluate the expression
    }
});

module.exports = E_Equals;