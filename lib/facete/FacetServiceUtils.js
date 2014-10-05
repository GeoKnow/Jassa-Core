//var Class = require('../ext/Class');

var ConceptUtils = require('../sparql/ConceptUtils');
var FacetNode = require('./FacetNode');
var FacetConceptSupplierExact = require('./facet_concept_supplier/FacetConceptSupplierExact');
var FacetConceptSupplierMeta = require('./facet_concept_supplier/FacetConceptSupplierMeta');

var FacetServiceSparql = require('./facet_service/FacetServiceSparql');
var FacetServiceTransformConcept = require('./facet_service/FacetServiceTransformConcept');
var FacetServiceClientIndex = require('./facet_service/FacetServiceClientIndex');
var FacetServiceLookup = require('./facet_service/FacetServiceLookup');

var LabelUtils = require('../sparql/LabelUtils');
var KeywordSearchUtils = require('../sparql/search/KeywordSearchUtils');


var FacetConfig = require('./FacetConfig');
var ConstraintManager = require('./ConstraintManager');


var BestLabelConfig = require('../sparql/BestLabelConfig');
var MappedConceptUtils = require('../sponate/MappedConceptUtils');
var LookupServiceUtils = require('../sponate/LookupServiceUtils');

var LookupServiceMulti = require('../service/lookup_service/LookupServiceMulti');
var LookupServiceKeyMap = require('../service/lookup_service/LookupServiceKeyMap');
var LookupServiceTransformKey = require('../service/lookup_service/LookupServiceTransformKey');
var LookupServiceFn = require('../service/lookup_service/LookupServiceFn');
var LookupServiceConst = require('../service/lookup_service/LookupServiceConst');


var FacetUtils = require('./FacetUtils');
var LookupServiceFacetCount = require('./lookup_service/LookupServiceFacetCount');
var LookupServiceFacetPreCount = require('./lookup_service/LookupServiceFacetPreCount');
var LookupServiceFacetExactCount = require('./lookup_service/LookupServiceFacetExactCount');

var Step = require('./Step');
var Path = require('./Path');

var FacetServiceUtils = {
    /*
    initialize: function(sparqlService, baseConcept, rootFacetNode) {
        this.sparqlService = sparqlService;
        this.baseConcept = baseConcept || ConceptUtils.createSubjectConcept();
        this.rootFacetNode = rootFacetNode || FacetNode.createRoot(this.baseConcept.getVar());


        this.lookupServiceNodeLabels = null; // TODO init

        //this.baseConcept = baseConcept || ConceptUtils.createSubjectConcept();
        //this.rootFacetNode =

    },
    */

    createFacetConceptSupplier: function(facetConfig) {

        var facetConceptSupplierExact = new FacetConceptSupplierExact(facetConfig);
        var facetConceptSupplierMeta = new FacetConceptSupplierMeta(facetConceptSupplierExact);

        /*
        var isSubjectConcept = this.baseConcept.isSubjectConcept();
        var isUnconstrained = constraintManager.getConstraints().length === 0;
        if(isSubjectConcept && isUnconstrained) {
            // TODO: We could do a pre-check about whether the set of declared properties is empty

            // We could use the declared set of properties
            console.log('Detected that declared properties could be used');
            //facetConceptSupplierMeta.getPathHeadToConcept().put(new PathHead(), ConceptUtils.listDeclaredProperties);
        }*/

        var result = facetConceptSupplierMeta;

        return result;
    },

    createFacetService: function(sparqlService, facetConfig) { // , pathTaggerFn

        var facetConceptSupplier = FacetServiceUtils.createFacetConceptSupplier(facetConfig);



        // TODO: Make the search function configurable
//        var fnTransformSearch = function(searchString) {
//            var r;
//            if(searchString) {
//
//                var relation = LabelUtils.createRelationPrefLabels(bestLabelConfig);
//                r = KeywordSearchUtils.createConceptRegex(relation, searchString);
//                //var result = sparql.KeywordSearchUtils.createConceptBifContains(relation, searchString);
//            } else {
//                r = null;
//            }
//
//            return r;
//        };
//
        var result = new FacetServiceSparql(sparqlService, facetConceptSupplier);
//        result = new FacetServiceTransformConcept(result, fnTransformSearch);

        // NOTE: The client index will only activate if there are not too
        // many properties - otherwise it will disable itself, such as on freebase
        // result = new FacetServiceClientIndex(result, lookupServiceNodeLabels);


        // Up to this point, the facet service will only create list services
        // that return lists of properties
        // Now we decorate them to include label information and counts

        //var self = this;
        var createLookupService = function(pathHead) {

            //var basePath = pathHead ? pathHead.getPath() : new Path();
            //console.log('PathHead: ' + pathHead);

//            var lsTags;
//            if(pathTaggerFn) {
//                var pathTaggerLs = new LookupServiceFn(pathTaggerFn);
//
//                lsTags = new LookupServiceTransformKey(pathTaggerLs, function(property) {
//                    var path;
//                    if(pathHead) {
//                        var step = new Step(property.getUri(), pathHead.isInverse());
//                        path = pathHead.getPath().copyAppendStep(step);
//                    } else {
//                        path = new Path();
//                    }
//
//                    return path;
//                });
//            } else {
//                lsTags = null;
//            }

            var r;
            if(pathHead == null) {
                //console.log('Tagger for path ' + pathHead + ': ' + lsTags);
                r = new LookupServiceMulti({
                    id: new LookupServiceKeyMap(), // identity mapping
                    countInfo: new LookupServiceConst({count: 0, hasMoreItems: true}),
                    //labelInfo: new LookupServiceConst({displayLabel: 'root', hiddenLabels: ['root']}),
                    //tags : lsTags
                });
            } else {

                // TODO We could make lsPreCount and lsExactCount to depend on a complete path
                // rather than just a property - that would make tagging of facets much easier
                // Alternatively we could use a LookupServiceTransformKey which prepends the path
                // before passing it to a path-based lookup service


                var facetRelationIndex = FacetUtils.createFacetRelationIndex(facetConfig, pathHead);
                var lsPreCount = new LookupServiceFacetPreCount(sparqlService, facetRelationIndex);
                var lsExactCount = new LookupServiceFacetExactCount(sparqlService, facetRelationIndex);
                var lsCount = new LookupServiceFacetCount(lsPreCount, lsExactCount);

                r = new LookupServiceMulti({
                    id: new LookupServiceKeyMap(), // identity mapping
                    //countInfo: lsCount
                    valueCountInfo: lsCount
                    //labelInfo: lookupServiceNodeLabels,
                    //tags : lsTags
                });
            }

            return r;
        };


        result = new FacetServiceLookup(result, createLookupService);

        /* Counting */

        /*
        var facetRelationIndex = facete.FacetUtils.createFacetRelationIndex(facetConfig, pathHead);
        var lsPreCount = new facete.LookupServiceFacetPreCount(this.sparqlService, facetRelationIndex);
        var lsExactCount = new facete.LookupServiceFacetExactCount(this.sparqlService, facetRelationIndex);
        var ls = new facete.LookupServiceFacetCount(lsPreCount, lsExactCount);
        */


        //ListServiceConceptKeyLookup(ls,)


        // We still need to append information such as labels, counts and tags to the facets





        //var path = facete.Path.parse('http://fp7-pp.publicdata.eu/ontology/funding');
        //var pathHead = new facete.PathHead(facete.Path.parse(''), false);
        //var listService = facetService.createListService(pathHead);


        return result;
    }
};

module.exports = FacetServiceUtils;
