var newBinaryExpr = require('./new-binary-expr');
var PatternUtils = require('./pattern-utils');

var E_LangMatches = function(left, right) {
    this.left = left;
    this.right = right;     
};

E_LangMatches.prototype = {
        copySubstitute: function(fnNodeMap) {
            return new E_LangMatches(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
        },

        getArgs: function() {
            return [this.left, this.right];
        },
        
        copy: function(args) {
            return newBinaryExpr(E_LangMatches, args);
        },
        
        toString: function() {
            return 'langMatches(' + this.left + ', ' + this.right + ')';
        },
        
        getVarsMentioned: function() {
            var result = PatternUtils.getVarsMentioned(this.getArgs());
            return result;
        }
};

module.exports = E_LangMatches;
