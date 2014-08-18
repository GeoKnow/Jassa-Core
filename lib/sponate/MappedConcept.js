var Class = require('../ext/Class');

/**
 * Combines a concept with an aggregator
 */
var MappedConcept = Class.create({
    initialize: function(concept, agg) {
        this.concept = concept;
        this.agg = agg;
    },
    
    getConcept: function() {
        return this.concept;
    },
    
    getAgg: function() {
        return this.agg;
    },

});

module.exports = MappedConcept;