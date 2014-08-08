var Class = require('../../ext/class');
var Node_Concrete = require('./concrete');

var Node_Blank = Class.create(Node_Concrete, {
    classLabel: 'Node_Blank',
    // Note: id is expected to be an instance of AnonId
    initialize: function(anonId) {
        this.anonId = anonId;
    },

    isBlank: function() {
        return true;
    },

    getBlankNodeId: function() {
        return this.anonId;
    },

    toString: function() {
        return '_:' + this.anonId;
    },
});

module.exports = Node_Blank;