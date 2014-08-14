var Class = require('../../ext/Class');
var newBinaryExpr = require('../new-binary-expr');
var PatternUtils = require('../pattern-utils');

var ELangMatches = Class.create({
    initialize: function(left, right) {
        this.left = left;
        this.right = right;
    },

    copySubstitute: function(fnNodeMap) {
        return new ELangMatches(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
    },

    getArgs: function() {
        return [
            this.left,
            this.right,
        ];
    },

    copy: function(args) {
        return newBinaryExpr(ELangMatches, args);
    },

    toString: function() {
        return 'langMatches(' + this.left + ', ' + this.right + ')';
    },

    getVarsMentioned: function() {
        var result = PatternUtils.getVarsMentioned(this.getArgs());
        return result;
    },
});

module.exports = ELangMatches;
