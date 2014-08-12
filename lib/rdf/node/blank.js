var Class = require('../../ext/class');
var NodeConcrete = require('./concrete');

var NodeBlank = Class.create(NodeConcrete, {
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

module.exports = NodeBlank;
