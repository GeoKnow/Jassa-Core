var Class = require('../../ext/class');
var ExprFunctionN = require('../expr/expr-function-n');

var EFunction = Class.create(ExprFunctionN, {
    initialize: function($super, name, args) {
        $super(name, args);
    },

    copy: function(newArgs) {
        var result = new EFunction(this.name, newArgs);
        return result;
    },
});

module.exports = EFunction;
