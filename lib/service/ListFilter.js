var Class = require('../ext/Class');

var ListFilter = Class.create({
    initialize: function(concept, limit, offset) {
        this.concept = concept;
        this.limit = limit;
        this.offset = offset;
    },

    getConcept: function() {
        return this.concept;
    },

    setConcept: function(concept) {
        this.concept = concept;
    },

    getLimit: function() {
        return this.limit;
    },

    setLimit: function(limit) {
        this.limit = limit;
    },

    getOffset: function() {
        return this.offset;
    },

    setOffset: function(offset) {
        this.offset = offset;
    },
});

module.exports = ListFilter;
