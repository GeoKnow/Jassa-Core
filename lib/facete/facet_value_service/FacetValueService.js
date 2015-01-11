var Class = require('../../ext/Class');

var NodeUtils = require('../../rdf/NodeUtils');

var Relation = require('../../sparql/Relation');
var RelationUtils = require('../../sparql/RelationUtils');
var FacetUtils = require('../FacetUtils.js');

var Binding = require('../../sparql/Binding');

var ElementUtils = require('../../sparql/ElementUtils');
var ConceptUtils = require('../../sparql/ConceptUtils');
var ServiceUtils = require('../../service/ServiceUtils');

var ListServiceSparqlQuery = require('../../service/list_service/ListServiceSparqlQuery');
var ListServiceTransformItem = require('../../service/list_service/ListServiceTransformItem');
var SortCondition = require('../../sparql/SortCondition');


var FacetValueService = Class.create({
    initialize: function(sparqlService, facetConfig, rowLimit) {
        this.sparqlService = sparqlService;
        this.rowLimit = rowLimit || 100000;
        this.facetConfig = facetConfig;
    },

    prepareTableService: function(path, excludeSelfConstraints) {
        var concept = FacetUtils.createConceptResources(this.facetConfig, path, excludeSelfConstraints);

        //console.log('FacetValueConcept: ' + concept + ' config: ', this.facetConfig);

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
            var countVar;
            if(canUseCounts) {
                var relation = new Relation(concept.getElement(), concept.getVar(), baseVar);

                // Create a service with counts
                countVar = ElementUtils.freshVar(relation.getElement(), 'c');
                query = RelationUtils.createQueryDistinctValueCount(relation, countVar);

                // Create a schema with two sortable columns

                query.getOrderBy().push(new SortCondition(query.getProject().getExpr(countVar), 'desc'));


                r = new ListServiceSparqlQuery(self.sparqlService, query, concept.getVar());

            } else {
                countVar = null;
                query = ConceptUtils.createQueryList(concept);
                r = new ListServiceSparqlQuery(self.sparqlService, query, concept.getVar());

                // No support of ordering by count
                // TODO: We may be able to fetch all resources at once if there are not too many

            }


            r = new ListServiceTransformItem(r, function(entry) {
                var rsp = entry.val;
                var bindings = rsp.getBindings();
                var binding = bindings[0] || new Binding();

                var count = countVar ? NodeUtils.getValue(binding.get(countVar)) : null;

                var r = {
                    key: entry.key,
                    val: {
                        node: entry.key,
                        path: path,
                        countInfo: {
                            hasMoreItems: !canUseCounts,
                            count: count
                        }
                    }
                };

                return r;
                /*
                var labelInfo = entry.val.labelInfo = {};
                labelInfo.displayLabel = '' + entry.key;
                //console.log('entry: ', entry);

                entry.val.node = entry.key;
                entry.val.path = path;

                entry.val.tags = {};

                return entry;
                */
            });

            return r;
        });

        return result;
    },

});

module.exports = FacetValueService;

