var Class = require('../../ext/class');
var Node = require('./node');

var Node_Fluid = Class.create(Node, {
    classLabel: 'Node_Fluid',
    isConcrete: function() {
        return false;
    },
});

module.exports = Node_Fluid;
