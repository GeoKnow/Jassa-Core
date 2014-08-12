var Class = require('../../ext/class');
var NodeFluid = require('./fluid');

var NodeVariable = Class.create(NodeFluid, {
    classLabel: 'Node_Variable',
    isVariable: function() {
        return true;
    },
});

module.exports = NodeVariable;
