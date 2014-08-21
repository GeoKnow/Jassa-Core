var Class = require('../ext/Class');

var Query = Class.create({
    initialize: function(mappingName, criteria, limit, offset, filterConcept, _isLeftJoin, nodes) {
        this.mappingName = mappingName;
        this.criteria = criteria;
        this.limit = limit;
        this.offset = offset;

        this.filterConcept = filterConcept;
        this._isLeftJoin = _isLeftJoin;

        // Note: For each element in the nodes array, corresponding data will be made available.
        // Thus, if nodes is an empty array, no results will be fetched; set to null to ignore the setting
        this.nodes = nodes;
    },

    shallowClone: function() {
        var r = new Query(this.mappingName, this.criteria, this.limit, this.offset, this.filterConcept, this._isLeftJoin, this.nodes);
        return r;
    },

    getMappingName: function() {
        return this.mappingName;
    },

    setMappingName: function(mappingName) {
        this.mappingName = mappingName;
    },

    getCriteria: function() {
        return this.criteria;
    },

    setCriteria: function(criteria) {
        this.criteria = criteria;
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

    getFilterConcept: function() {
        return this.filterConcept;
    },

    setFilterConcept: function(filterConcept) {
        this.filterConcept = filterConcept;
    },

    isLeftJoin: function() {
        return this._isLeftJoin;
    },

    setLeftJoin: function(isLeftJoin) {
        this._isLeftJoin = isLeftJoin;
    },

    getNodes: function() {
        return this.nodes;
    },

    setNodes: function(nodes) {
        this.nodes = nodes;
    },

});

module.exports = Query;
