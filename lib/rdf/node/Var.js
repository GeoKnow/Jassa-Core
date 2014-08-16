var Class = require('../../ext/Class');
var Node_Variable = require('./Node_Variable');

var Var = Class.create(Node_Variable, {
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
