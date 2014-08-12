var Class = require('../ext/class');
var NodeVariable = require('./node/variable');

var Var = Class.create(NodeVariable, {
    classLabel: 'Var',
    initialize: function(name) {
        this.name = name;
    },
    getName: function() {
        return this.name;
    },
    toString: function() {
        return '?' + this.name;
    },
});

module.exports = Var;
