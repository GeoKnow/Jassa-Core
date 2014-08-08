var Class = require('../../ext/class');
var Node = require('./node');

var Node_Concrete = Class.create(Node, {
    classLabel: 'Node_Concrete',
    isConcrete: function() {
        return true;
    },
});

module.exports = Node_Concrete;