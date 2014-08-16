var Class = require('../../ext/Class');
var Node_Fluid = require('./Node_Fluid');

var Node_Variable = Class.create(Node_Fluid, {
    classLabel: 'jassa.rdf.Node_Variable',
    isVariable: function() {
        return true;
    },
});

module.exports = Node_Variable;
