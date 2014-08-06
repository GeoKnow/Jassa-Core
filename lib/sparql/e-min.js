var E_Min = function(subExpr) {
    this.subExpr = subExpr;
};

E_Min.prototype.copySubstitute = function(fnNodeMap) {
    var subExprCopy = this.subExpr ? this.subExpr.copySubstitute(fnNodeMap) : null;
    
    return new E_Min(subExprCopy);
};

E_Min.prototype.getArgs = function() {
    return [this.subExpr];
};

E_Min.prototype.copy = function(args) {
    if(args.length !== 1) {
        throw 'Invalid argument';
    }

    var newSubExpr = args[0];

    var result = new E_Min(newSubExpr);
    return result;
};

E_Min.prototype.toString = function() {      
    return 'Min(' + this.subExpr + ')';
};

module.exports = E_Min;
