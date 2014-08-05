/*
 * TODO E_Cast should be removed -
 * a cast expression should be modeled as a function taking a single argument which is the value to cast.
 * 
 */
 
 var E_Cast = function(expr, node) {
     this.expr = expr;
     this.node = node;
 };
 
 E_Cast.prototype.copySubstitute = function(fnNodeMap) {
     return new E_Cast(this.expr.copySubstitute(fnNodeMap), this.node.copySubstitute(fnNodeMap));     
 };

 module.exports = E_Cast;
 
 