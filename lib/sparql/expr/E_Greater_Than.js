var Class = require('../../ext/Class');
var ExprFunction2 = require('./ExprFunction2');
var ExprUtils = require('../ExprUtils');

var E_GreaterThan = Class.create(ExprFunction2, {
    initialize: function($super, left, right) {
        $super('>', left, right);
    },

    copySubstitute: function(fnNodeMap) {
        return new E_GreaterThan(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
    },

    copy: function(args) {
        return newBinaryExpr(E_GreaterThan, args);
    },

    toString: function() {
        return '(' + this.left + ' > ' + this.right + ')';
    },
});

module.exports = E_GreaterThan;
