var Class = require('../../ext/class');
var Node = require('./node');

var NodeFluid = Class.create(Node, {
    classLabel: 'Node_Fluid',
    isConcrete: function() {
        return false;
    },
});

module.exports = NodeFluid;
