var Class = require('../../ext/Class');
var Node = require('./Node');

var Node_Fluid = Class.create(Node, {
    classLabel: 'jassa.rdf.Node_Fluid',
    isConcrete: function() {
        return false;
    },
});

module.exports = Node_Fluid;
