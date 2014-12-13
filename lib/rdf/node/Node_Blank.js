var Class = require('../../ext/Class');
var Node_Concrete = require('./Node_Concrete');

var ObjectUtils = require('../../util/ObjectUtils');

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

    getBlankNodeLabel: function() {
        // Convenience override
        return this.anonId.getLabelString();
    },


    hashCode: function() {
        if(this.hash == null) {
            var str = this.anonId.getLabelString();
            this.hash = ObjectUtils.hashCodeStr(str);
        }

        return this.hash;
    },

    equals: function(that) {
        var result =
            that != null &&
            that.anonId != null &&
            that.anonId.getLabelString != null &&
            this.anonId.getLabelString() === that.anonId.getLabelString()
        ;

        return result;
    },

    toString: function() {
        return '_:' + this.anonId;
    }
});

module.exports = Node_Blank;
