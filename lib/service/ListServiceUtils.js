var ConceptUtils = require('../sparql/ConceptUtils');
var ListServiceSparqlQuery = require('./list_service/ListServiceSparqlQuery');

var ListServiceUtils = {
    /**
     * Creates a ListService for the target of a given sourceConcept and a relation
     *
     * Useful for enumerating resources related to a given concept.
     *
     * @param sourceConcept
     * @param relation
     * @returns {service.ListServiceSparqlQuery}
     */
    createTargetListService: function(sparqlService, sourceConcept, relation) {

        //var relation = facete.PathUtils.createRelation(path);
        var targetConcept = ConceptUtils.createTargetConcept(sourceConcept, relation);

        var query = ConceptUtils.createQueryList(targetConcept);
        var listService = new ListServiceSparqlQuery(sparqlService, query, targetConcept.getVar());

        return listService;
    },

};

module.exports = ListServiceUtils;
