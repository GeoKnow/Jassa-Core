var Class = require('../../ext/Class');
var Relation = require('../../sparql/Relation');
var RelationUtils = require('../../sparql/RelationUtils');
var FacetUtils = require('../FacetUtils.js');

var ElementUtils = require('../../sparql/ElementUtils');
var ConceptUtils = require('../../sparql/ConceptUtils');
var ServiceUtils = require('../../service/ServiceUtils');

var ListServiceSparqlQuery = require('../../service/list_service/ListServiceSparqlQuery');
var SortCondition = require('../../sparql/SortCondition');

var FacetValueService = Class.create({
    initialize: function(sparqlService, facetConfig, rowLimit) {
        this.sparqlService = sparqlService;
        this.rowLimit = rowLimit || 100000;
        this.facetConfig = facetConfig;
    },

    prepareTableService: function(path, excludeSelfConstraints) {
        var concept = FacetUtils.createConceptResources(this.facetConfig, path, excludeSelfConstraints);

        console.log('FacetValueConcept: ' + concept + ' config: ', this.facetConfig);

        var baseVar = this.facetConfig.getRootFacetNode().getVar();

        var self = this;

        // If there are more rows than the threshold, we disable counting (and thus ordering by count)
        // Note that we could support fetching counts only for the currently visible page
        //

        // TODO This part should be encapsulated as a strategy (or so)
        var result = ServiceUtils.fetchCountRows(this.sparqlService, concept.getElement(), this.rowLimit).then(function(countInfo) {
            var canUseCounts = countInfo.hasMoreItems === false;

            // Check if we can fetch all data at once
            // If not, we can switch to paginated mode
            //   In this mode, for each page we check which of the items can be counted
            //   (lazy fetching of counts)

            // If we could count the items, we can also support ordering them by their aggregated value
            //var canUseOrder = canUseCounts;


            var r;
            var query;
            if(canUseCounts) {
                var relation = new Relation(concept.getElement(), concept.getVar(), baseVar);

                // Create a service with counts
                var countVar = ElementUtils.freshVar(relation.getElement(), 'c');
                query = RelationUtils.createQueryDistinctValueCount(relation, countVar);

                // Create a schema with two sortable columns

                query.getOrderBy().push(new SortCondition(query.getProject().getExpr(countVar), 'desc'));


                r = new ListServiceSparqlQuery(self.sparqlService, query, concept.getVar());

            } else {
                query = ConceptUtils.createQueryList(concept);
                r = new ListServiceSparqlQuery(self.sparqlService, query, concept.getVar());

                // No support of ordering by count
                // TODO: We may be able to fetch all resources at once if there are not too many

            }

            return r;
        });

        return result;
    },

});

module.exports = FacetValueService;

