/**
 * If null, '*' will be used
 * 
 * TODO Not sure if modelling aggregate functions as exprs is a good thing to do.
 * 
 * @param subExpr
 * @returns {ns.E_Count}
 */
var E_Count = function(subExpr, isDistinct) {
    this.subExpr = subExpr;
    this.isDistinct = isDistinct ? isDistinct : false;
};

E_Count.prototype.copySubstitute = function(fnNodeMap) {
    var subExprCopy = this.subExpr ? this.subExpr.copySubstitute(fnNodeMap) : null;
    
    return new E_Count(subExprCopy, this.isDistinct);
};

E_Count.prototype.toString = function() {        
    return 'Count(' + (this.isDistinct ? 'Distinct ' : '') + (this.subExpr ? this.subExpr : '*') +')';
};

module.exports = E_Count;