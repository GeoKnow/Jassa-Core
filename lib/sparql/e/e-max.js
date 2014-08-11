var Class = require('../../ext/class');
var E_Min = require('./e-min');

var E_Max = Class.create({
    initialize: function(subExpr) {
        this.subExpr = subExpr;
    },

    copySubstitute: function(fnNodeMap) {
        var subExprCopy = this.subExpr ? this.subExpr.copySubstitute(fnNodeMap) : null;

        return new E_Min(subExprCopy);
    },

    getArgs: function() {
        return [this.subExpr];
    },

    copy: function(args) {
        if (args.length !== 1) {
            throw 'Invalid argument';
        }

        var newSubExpr = args[0];

        var result = new E_Max(newSubExpr);
        return result;
    },

    toString: function() {
        return 'Max(' + this.subExpr + ')';
    },
});

module.exports = E_Max;
