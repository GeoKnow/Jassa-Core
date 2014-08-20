var Class = require('../../ext/Class');

var ConceptUtils = require('../../sparql/ConceptUtils');
var FacetNode = require('../FacetNode');
var FacetConceptSupplierExact = require('../facet_concept_supplier/FacetConceptSupplierExact');
var FacetConceptSupplierMeta = require('../facet_concept_supplier/FacetConceptSupplierMeta');

var FacetServiceSparql = require('../facet_service/FacetServiceSparql');
var FacetServiceTransformConcept = require('../facet_service/FacetServiceTransformConcept');
var FacetServiceClientIndex = require('../facet_service/FacetServiceClientIndex');

var LabelUtils = require('../../sparql/LabelUtils');
var KeywordSearchUtils = require('../../sparql/search/KeywordSearchUtils');


var FacetConfig = require('../FacetConfig');
var ConstraintManager = require('../ConstraintManager');


var BestLabelConfig = require('../../sparql/BestLabelConfig');
var MappedConceptUtils = require('../../sponate/MappedConceptUtils');
var LookupServiceUtils = require('../../sponate/LookupServiceUtils');


var FacetSystemSparql = Class.create({
    initialize: function(sparqlService, baseConcept, rootFacetNode) {
        this.sparqlService = sparqlService;
        this.baseConcept = baseConcept || ConceptUtils.createSubjectConcept();
        this.rootFacetNode = rootFacetNode || FacetNode.createRoot(this.baseConcept.getVar());


        this.lookupServiceNodeLabels = null; // TODO init

        //this.baseConcept = baseConcept || ConceptUtils.createSubjectConcept();
        //this.rootFacetNode =

    },

    createFacetService: function(constraintManager) {
        var isSubjectConcept = this.baseConcept.isSubjectConcept();
        var isUnconstrained = constraintManager.getConstraints().length === 0;

        // TODO Maybe the facet config itself should be provided as the argument
        var facetConfig = new FacetConfig(this.baseConcept, this.rootFacetNode, constraintManager);

        var facetConceptSupplierExact = new FacetConceptSupplierExact(facetConfig);
        var facetConceptSupplierMeta = new FacetConceptSupplierMeta(facetConceptSupplierExact);

        if(isSubjectConcept && isUnconstrained) {
            // We could use the declared set of properties
            console.log('Detected that declared properties could be used');
            //facetConceptSupplierMeta.getPathHeadToConcept().put(new PathHead(), ConceptUtils.listDeclaredProperties);
        }

        var bestLabelConfig = new BestLabelConfig();
        // Label service init
        var mappedConcept = MappedConceptUtils.createMappedConceptBestLabel(bestLabelConfig);
        var lookupServiceNodeLabels = LookupServiceUtils.createLookupServiceMappedConcept(this.sparqlService, mappedConcept);



        // TODO: Make the search function configurable
        var fnTransformSearch = function(searchString) {
            var r;
            if(searchString) {

                var relation = LabelUtils.createRelationPrefLabels(bestLabelConfig);
                r = KeywordSearchUtils.createConceptRegex(relation, searchString);
                //var result = sparql.KeywordSearchUtils.createConceptBifContains(relation, searchString);
            } else {
                r = null;
            }

            return r;
        };

        var result = new FacetServiceSparql(this.sparqlService, facetConceptSupplierMeta);
        result = new FacetServiceTransformConcept(result, fnTransformSearch);

        // NOTE: The client index won't work if there are too many properties - such as on freebase
        result = new FacetServiceClientIndex(result, lookupServiceNodeLabels);

        //var path = facete.Path.parse('http://fp7-pp.publicdata.eu/ontology/funding');
        //var pathHead = new facete.PathHead(facete.Path.parse(''), false);
        //var listService = facetService.createListService(pathHead);


        return result;
    }
});

module.exports = FacetSystemSparql;
