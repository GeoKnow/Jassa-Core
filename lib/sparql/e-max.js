var E_Min = require('./e-min');

var E_Max = function(subExpr) {
    this.subExpr = subExpr;
};

E_Max.prototype.copySubstitute = function(fnNodeMap) {
    var subExprCopy = this.subExpr ? this.subExpr.copySubstitute(fnNodeMap) : null;
    
    return new E_Min(subExprCopy);
};

E_Max.prototype.getArgs = function() {
    return [this.subExpr];
};

E_Max.prototype.copy = function(args) {
    if(args.length !== 1) {
        throw 'Invalid argument';
    }

    var newSubExpr = args[0];

    var result = new E_Max(newSubExpr);
    return result;
};

E_Max.prototype.toString = function() {      
    return 'Max(' + this.subExpr + ')';
};

module.exports = E_Max;