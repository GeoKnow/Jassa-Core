var Class = require('../../ext/class');
var Expr = require('./expr');

var ExprFunction = Class.create(Expr, {
    getName: function() {
        console.log('Implement me');
        throw 'Implement me';
    },

    isFunction: function() {
        return true;
    },

    getFunction: function() {
        return this;
    },
});

module.exports = ExprFunction;