var Class = require('../../ext/Class');
var ExprFunctionN = require('./ExprFunctionN');

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
