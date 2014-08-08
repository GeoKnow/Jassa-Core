var Class = require('../ext/class');
var ExprFunctionN = require('./expr-function-n');

var E_Function = Class.create(ExprFunctionN, {
    initialize: function($super, name, args) {
        $super(name, args);
    },

    copy: function(newArgs) {
        var result = new E_Function(this.name, newArgs);
        return result;
    },
});

module.exports = E_Function;