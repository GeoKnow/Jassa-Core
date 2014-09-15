var Class = require('../ext/Class');

var ListFilter = Class.create({
    initialize: function(limit, offset, filter) {
        this.limit = limit;
        this.offset = offset;
        this.filter = filter;
        // Note: If a filter mode is needed, than filter should be an object that comprises it
        //this.filterMode = filterMode;
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

    getFilter: function() {
        return this.filter;
    },

    setFilter: function(filter) {
        this.filter = filter;
    },

//    getFilterMode: function() {
//        return this.filterMode;
//    },
//
//    setFilterMode: function(filterMode) {
//        this.filterMode = filterMode;
//    },

});

module.exports = ListFilter;
