var Class = require('../../ext/Class');
var ExprUtils = require('../ExprUtils');
var PatternUtils = require('../PatternUtils');

var E_LangMatches = Class.create({
    initialize: function(left, right) {
        this.left = left;
        this.right = right;
    },

    copySubstitute: function(fnNodeMap) {
        return new E_LangMatches(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
    },

    getArgs: function() {
        return [
            this.left,
            this.right,
        ];
    },

    copy: function(args) {
        return ExprUtils.newBinaryExpr(E_LangMatches, args);
    },

    toString: function() {
        return 'langMatches(' + this.left + ', ' + this.right + ')';
    },

    getVarsMentioned: function() {
        var result = PatternUtils.getVarsMentioned(this.getArgs());
        return result;
    },
});

module.exports = E_LangMatches;
