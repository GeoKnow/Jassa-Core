var Class = require('../../ext/Class');
var Expr = require('./Expr');

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
