var Class = require('../../ext/class');

var EMin = Class.create({
    initialize: function(subExpr) {
        this.subExpr = subExpr;
    },

    copySubstitute: function(fnNodeMap) {
        var subExprCopy = this.subExpr ? this.subExpr.copySubstitute(fnNodeMap) : null;

        return new EMin(subExprCopy);
    },

    getArgs: function() {
        return [
            this.subExpr,
        ];
    },

    copy: function(args) {
        if (args.length !== 1) {
            throw 'Invalid argument';
        }

        var newSubExpr = args[0];

        var result = new EMin(newSubExpr);
        return result;
    },

    toString: function() {
        return 'Min(' + this.subExpr + ')';
    },
});

module.exports = EMin;
