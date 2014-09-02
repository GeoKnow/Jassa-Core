var Class = require('../../ext/Class');
var Node = require('./Node');

var Node_Concrete = Class.create(Node, {
    classLabel: 'jassa.rdf.Node_Concrete',
    isConcrete: function() {
        return true;
    }
});

module.exports = Node_Concrete;
