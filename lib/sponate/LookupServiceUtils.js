var ConceptUtils = require('../sparql/ConceptUtils');
var LookupServiceSparqlQuery = require('../service/lookup_service/LookupServiceSparqlQuery');
var LookupServiceTransform = require('../service/lookup_service/LookupServiceTransform');
//var HashMap = require('../util/collection/HashMap');

var LookupServiceUtils = {

    createTransformAggResultSetPart: function(agg) {

        var result = function(resultSetPart) {
            var acc = agg.createAcc();

            var bindings = resultSetPart.getBindings();
            bindings.forEach(function(binding) {
                acc.accumulate(binding);
            });

            var r = acc.getValue();
            return r;
        };
        
        return result;
    },

    
    /**
     * public static <T> LookupService<Node, T> createLookupService(QueryExecutionFactory sparqlService, MappedConcept<T> mappedConcept)
     */
    createLookupServiceMappedConcept: function(sparqlService, mappedConcept) {
        var concept = mappedConcept.getConcept();
        var query = ConceptUtils.createQueryList(concept);

        // TODO Set up a projection using the grouping variable and the variables referenced by the aggregator
        query.setQueryResultStar(true);


        var ls = new LookupServiceSparqlQuery(sparqlService, query, concept.getVar());
        var agg = mappedConcept.getAgg();
        var fnTransform = this.createTransformAggResultSetPart(agg);

        var result = new LookupServiceTransform(ls, fnTransform);
        return result;
    },

};

module.exports = LookupServiceUtils;
