var Class = require('../ext/Class');
var ListFilter = require('../service/ListFilter');

// @Deprecated - DON'T USE!
var FacetNodeState = Class.create({
    initialize: function(isExpanded, isInverse, listFilter) {
        this._isExpanded = !!isExpanded;
        this._isInverse = !!isInverse;
        this.listFilter = listFilter || new ListFilter();
    },

    getListFilter: function() {
        return this.listFilter;
    },

    setListFilter: function(listFilter) {
        this.listFilter = listFilter;
    },

    isExpanded: function() {
        return this._isExpanded;
    },

    setExpanded: function(isExpanded) {
        this._isExpanded = isExpanded;
    },

    isInverse: function() {
        return this._isInverse;
    },

    setInverse: function(isInverse) {
        this._isInverse = isInverse;
    }

});

module.exports = FacetNodeState;
