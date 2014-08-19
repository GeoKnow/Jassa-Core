var Class = require('../ext/Class');

var FacetRelationIndex = Class.create({
    initialize: function(sourceVar, defaultRelation, propertyToRelation) {
        this.sourceVar = sourceVar;
        this.defaultRelation = defaultRelation;
        this.propertyToRelation = propertyToRelation;
    },
    
    getSourceVar: function() {
        return this.sourceVar;
    },

    getDefaultRelation: function() {
        return this.defaultRelation;
    },

    getPropertyToRelation: function() {
        return this.propertyToRelation;
    },
    
});


module.exports = FacetRelationIndex;
