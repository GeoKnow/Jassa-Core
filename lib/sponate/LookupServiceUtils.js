var ConceptUtils = require('../sparql/ConceptUtils');
var LookupServiceSparqlQuery = require('../service/lookup_service/LookupServiceSparqlQuery');
var LookupServiceTransform = require('../service/lookup_service/LookupServiceTransform');
//var HashMap = require('../util/collection/HashMap');

var AccUtils = require('./AccUtils');


var LookupServiceUtils = {

        /*
    createTransformAggResultSetPart: function(agg) {
        //var fn = LookupServiceUtils.createTransformAccResultSetPart(agg);

        var result = function(resultSetPart) {
            var acc = fn(resultSetPart);

            var r = acc.getValue();
            return r;
        };

        return result;
    },
    */

    createTransformAccResultSetPart: function(agg) {

        var result = function(resultSetPart) {
            // AccMap expected here
            var acc = agg.createAcc();
            //console.log('resultSetPart', resultSetPart);

            var bindings = resultSetPart.getBindings();
            bindings.forEach(function(binding) {
                acc.accumulate(binding);
            });

            //console.log('LSVAL: ' + JSON.stringify(agg));
            //var r = acc.getState();
            //return r;
            return acc;
        };

        return result;
    },


    /**
     * public static <T> LookupService<Node, T> createLookupService(QueryExecutionFactory sparqlService, MappedConcept<T> mappedConcept)
     */
    createLookupServiceMappedConcept: function(sparqlService, mappedConcept) {
        var ls = this.createLookupServiceMappedConceptAcc(sparqlService, mappedConcept);

        var result = new LookupServiceTransform(ls, function(acc) {
            var r = acc.getValue();
            return r;
        });

        return result;
        /*
        var concept = mappedConcept.getConcept();
        var query = ConceptUtils.createQueryList(concept);

        // TODO Set up a projection using the grouping variable and the variables referenced by the aggregator
        query.setQueryResultStar(true);

        var result = this.createLookupServiceAgg(sparqlService, query, concept.getVar(), mappedConcept.getAgg());

        return result;
*/
//        var ls = new LookupServiceSparqlQuery(sparqlService, query, concept.getVar());
//        var agg = mappedConcept.getAgg();
//        var fnTransform = this.createTransformAggResultSetPart(agg);
//
//        var result = new LookupServiceTransform(ls, fnTransform);
//        return result;
    },

    /*
    createLookupServiceAgg: function(sparqlService, query, groupVar, agg) {
        var ls = new LookupServiceSparqlQuery(sparqlService, query, groupVar);
        var fnTransform = this.createTransformAggResultSetPart(agg);

        var result = new LookupServiceTransform(ls, fnTransform);
        return result;
    },
    */


    createLookupServiceMappedConceptAcc: function(sparqlService, mappedConcept) {
        var concept = mappedConcept.getConcept();
        var query = ConceptUtils.createQueryList(concept);
        var groupVar = concept.getVar();

        // TODO Set up a projection using the grouping variable and the variables referenced by the aggregator
        query.setQueryResultStar(true);

        var aggMap = mappedConcept.getAgg();
        var subAgg = aggMap.getSubAgg();

        var ls = new LookupServiceSparqlQuery(sparqlService, query, groupVar);
        //var ls = this.createLookupServiceAcc(sparqlService, query, concept.getVar(), mappedConcept.getAgg());
        var fnTransform = this.createTransformAccResultSetPart(subAgg);

        var result = new LookupServiceTransform(ls, fnTransform);
        return result;
    }

};

module.exports = LookupServiceUtils;
