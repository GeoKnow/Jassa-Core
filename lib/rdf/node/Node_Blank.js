var Class = require('../../ext/Class');
var Node_Concrete = require('./Node_Concrete');

var Node_Blank = Class.create(Node_Concrete, {
    classLabel: 'jassa.rdf.Node_Blank',
    // Note: id is expected to be an instance of AnonId
    // PW: to make the toString method work it should actually be an instance
    // of AnonIdStr (or of any other future subclass of this fancy, feature
    // rich AnonId class or any sub class of such a sub class...)
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
