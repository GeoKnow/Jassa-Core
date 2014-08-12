var Class = require('../../ext/class');
var Node = require('./node');

var NodeConcrete = Class.create(Node, {
    classLabel: 'Node_Concrete',
    isConcrete: function() {
        return true;
    },
});

module.exports = NodeConcrete;
