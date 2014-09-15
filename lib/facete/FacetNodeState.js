var Class = require('../ext/Class');
var ListFilter = require('./ListFilter');

var FacetNodeState = Class.create({
    initialize: function(expansionState, listFilter) {
        this.expansionState = expansionState || 0;
        this.listFilter = listFilter || new ListFilter();
    },

    getExpansionState: function() {
        return this.expansionState;
    },

    setExpansionState: function(expansionState) {
        this.expansionState = expansionState;
    },

    getListFilter: function() {
        return this.listFilter;
    },

    setListFilter: function(listFilter) {
        this.listFilter = listFilter;
    },

});

module.exports = FacetNodeState;
