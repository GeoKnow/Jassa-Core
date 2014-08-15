var Class = require('../../ext/Class');
var TableServiceNodeLabels = require('./table-service-node-labels');
var TableServiceUtils = require('./table-service-utils');

var TableServiceFacet = Class.create(TableServiceNodeLabels, {
    /**
     * So the issue is: actually we need a lookup service to get the column headings
     * The lookup service would need the sparqlService
     *
     *
     */
    // ns.TableServiceFacet = Class.create(ns.TableService, {
    initialize: function($super, tableServiceQuery, tableConfigFacet, lookupServiceNodeLabels, lookupServicePathLabels) {
        $super(tableServiceQuery, lookupServiceNodeLabels);
        // this.tableServiceQuery = tableServiceQuery;
        this.tableConfigFacet = tableConfigFacet;
        // this.lookupServiceNodeLabels = lookupServiceNodeLabels;
        this.lookupServicePathLabels = lookupServicePathLabels;
    },

    fetchSchema: function() {
        // Ignores the schema of the underlying table Service
        var result = TableServiceUtils.fetchSchemaTableConfigFacet(this.tableConfigFacet, this.lookupServicePathLabels);
        return result;
    },
});

module.exports = TableServiceFacet;
