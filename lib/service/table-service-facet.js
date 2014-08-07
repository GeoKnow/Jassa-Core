var TableServiceNodeLabels = require('./table-service-node-labels');
var TableServiceUtils = require('./table-service-utils');

var TableServiceFacet = function(tableServiceQuery, tableConfigFacet, lookupServiceNodeLabels, lookupServicePathLabels) {
    TableServiceNodeLabels.call(this, tableServiceQuery, lookupServiceNodeLabels);

    this.initialize(tableServiceQuery, tableConfigFacet, lookupServiceNodeLabels, lookupServicePathLabels);
};
// inherit
TableServiceFacet.prototype = Object.create(TableServiceNodeLabels.prototype);
// hand back the constructor
TableServiceFacet.prototype.constructor = TableServiceFacet;


/**
 * So the issue is: actually we need a lookup service to get the column headings
 * The lookup service would need the sparqlService
 *
 *
 */
//ns.TableServiceFacet = Class.create(ns.TableService, {
TableServiceFacet.prototype.initialize = function(tableServiceQuery, tableConfigFacet, lookupServiceNodeLabels, lookupServicePathLabels) {
    //this.tableServiceQuery = tableServiceQuery;
    this.tableConfigFacet = tableConfigFacet;
    //this.lookupServiceNodeLabels = lookupServiceNodeLabels;
    this.lookupServicePathLabels = lookupServicePathLabels;
};

TableServiceFacet.prototype.fetchSchema = function() {
    // Ignores the schema of the underlying table Service
    var result = TableServiceUtils.fetchSchemaTableConfigFacet(this.tableConfigFacet, this.lookupServicePathLabels);
    return result;
};


module.exports = TableServiceFacet;
