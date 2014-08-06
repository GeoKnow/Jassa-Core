var newUnaryExpr = require('./new-unary-expr');

var E_Like = function(expr, pattern) {
    this.expr = expr;
    this.pattern = pattern;
};
    
E_Like.prototype = {
        copySubstitute: function(fnNodeMap) {
            return new E_Like(this.expr.copySubstitute(fnNodeMap), this.pattern);
        },

        getVarsMentioned: function() {
            return this.expr.getVarsMentioned();
        },

        getArgs: function() {
            return [this.expr];
        },

        copy: function(args) {

            var result = newUnaryExpr(E_Like, args);
            return result;
        },


    toString: function() {      
        var patternStr = this.pattern.replace('\'', '\\\'');

        
        return '(' + this.expr + ' Like \'' + patternStr + '\')'; 
    }
};

module.exports = E_Like;