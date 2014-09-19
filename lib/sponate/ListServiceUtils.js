var Concept = require('../sparql/Concept');
var ConceptUtils = require('../sparql/ConceptUtils');
var ServiceUtils = require('./ServiceUtils');

var ListServiceSparqlQuery = require('../service/list_service/ListServiceSparqlQuery');
var ListServiceTransformItem = require('../service/list_service/ListServiceTransformItem');

var NodeFactory = require('../rdf/NodeFactory');
var BindingUtils = require('../sparql/BindingUtils');


var ListServiceUtils = {

    createListServiceAcc: function(sparqlService, mappedConcept, isLeftJoin) {
        isLeftJoin = !!isLeftJoin;

        var concept = mappedConcept.getConcept();
        var query = ConceptUtils.createQueryList(concept);

        var agg = mappedConcept.getAgg();

        var rowId = NodeFactory.createVar('rowId');

        // TODO Set up a projection using the grouping variable and the variables referenced by the aggregator
        query.setQueryResultStar(true);

        var ls = new ListServiceSparqlQuery(sparqlService, query, concept.getVar(), isLeftJoin);
        var result = new ListServiceTransformItem(ls, function(entry) {
            var key = entry.key;

            var bindings = entry.val.getBindings();

            // Clone the bindings to avoid corrupting caches
            bindings = BindingUtils.cloneBindings(bindings);

            // Augment them with a rowId attribute
            BindingUtils.addRowIds(bindings, rowId);

            var acc = agg.createAcc();
            bindings.forEach(function(binding) {
                acc.accumulate(binding);
            });

            var r = {key: key, val: acc};
            return r;
        });

        //var result = this.createLookupServiceAgg(sparqlService, query, concept.getVar(), mappedConcept.getAgg());
        return result;
    },

    createListServiceMappedConcept: function(sparqlService, mappedConcept, isLeftJoin) {
        var ls = this.createListServiceAcc(sparqlService, mappedConcept, isLeftJoin);

        // Add a transformer that actually retrieves the value from the acc structure
        var result = new ListServiceTransformItem(ls, function(accEntries) {
            var r = accEntries.map(function(accEntry) {
                var s = accEntry.val.getValue();
                return s;
            });

            return r;
        });

        return result;

        /*
        isLeftJoin = !!isLeftJoin;

        var concept = mappedConcept.getConcept();
        var query = ConceptUtils.createQueryList(concept);

        var agg = mappedConcept.getAgg();

        // TODO Set up a projection using the grouping variable and the variables referenced by the aggregator
        query.setQueryResultStar(true);

        var ls = new ListServiceSparqlQuery(sparqlService, query, concept.getVar(), isLeftJoin);
        var result = new ListServiceTransformItem(ls, function(entry) {
            var bindings = entry.val.getBindings();
            var acc = agg.createAcc();
            var r = ServiceUtils.processBindings(bindings, acc);

            return r;
        });

        //var result = this.createLookupServiceAgg(sparqlService, query, concept.getVar(), mappedConcept.getAgg());
        return result;
        */
    }
};

module.exports = ListServiceUtils;
