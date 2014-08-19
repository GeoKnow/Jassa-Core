var Concept = require('../sparql/Concept');
var ConceptUtils = require('../sparql/ConceptUtils');
var ServiceUtils = require('./ServiceUtils'); 

var ListServiceSparqlQuery = require('../service/list_service/ListServiceSparqlQuery');
var ListServiceTransformItem = require('../service/list_service/ListServiceTransformItem');

var ListServiceUtils = {
    createListServiceMappedConcept: function(sparqlService, mappedConcept) {
        var concept = mappedConcept.getConcept();
        var query = ConceptUtils.createQueryList(concept);
        
        var agg = mappedConcept.getAgg();
        
        // TODO Set up a projection using the grouping variable and the variables referenced by the aggregator
        query.setQueryResultStar(true);

        var ls = new ListServiceSparqlQuery(sparqlService, query, concept.getVar(), false);
        var result = new ListServiceTransformItem(ls, function(entry) {
            var bindings = entry.val.getBindings();
            var acc = agg.createAcc();
            var r = ServiceUtils.processBindings(bindings, acc);
            //console.log('yaay' + r, r);

            return r;
        });

        //var result = this.createLookupServiceAgg(sparqlService, query, concept.getVar(), mappedConcept.getAgg());
        return result;
    }
};

module.exports = ListServiceUtils;
