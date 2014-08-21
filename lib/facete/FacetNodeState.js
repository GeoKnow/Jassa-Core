var Class = require('../ext/Class');

var FacetNodeState = Class.create({
    initialize: function(expansionState, limit, offset, filter) {
        this.expansionState = expansionState || 0;
        this.limit = limit || 10;
        this.offset = offset;
        this.filter = filter;
    },

    getExpansionState: function() {
        return this.expansionState;
    },

    getLimit: function() {
        return this.limit;
    },

    getOffset: function() {
        return this.offset;
    },

    getFilter: function() {
        return this.filter;
    },

    setExpansionState: function(expansionState) {
        this.expansionState = expansionState;
    },

    setLimit: function(limit) {
        this.limit = limit;
    },

    setOffset: function(offset) {
        this.offset = offset;
    },

});

module.exports = FacetNodeState;
