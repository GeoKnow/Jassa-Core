var Class = require('../../ext/class');
var Node_Fluid = require('./fluid');

var Node_Variable = Class.create(Node_Fluid, {
    classLabel: 'Node_Variable',
    isVariable: function() {
        return true;
    },
});

module.exports = Node_Variable;
