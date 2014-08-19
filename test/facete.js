/* global describe */
/* global it */
var should = require('should');

// lib includes
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var ajax = function(param) {
    return request.postAsync(param.url, {
        json: true,
        form: param.data,
    }).then(function(res) {
        return new Promise(function(resolve) {
            resolve(res[0].body);
        });
    });
};

// lib
var jassa = require('../lib')(Promise, ajax);
// namespaces
var rdf = jassa.rdf;
var vocab = jassa.vocab;
var sparql = jassa.sparql;
var service = jassa.service;
var sponate = jassa.sponate;
var facete = jassa.facete;

// tests
describe('Facete Basics', function() {
    it('#Service test', function() {
        var facetConfig = new facete.FacetConfig();
        
        
        if(false) {
            var p = facete.Path.parse('http://fp7-pp.publicdata.eu/ontology/address http://fp7-pp.publicdata.eu/ontology/city');
            var nv = rdf.NodeFactory.createUri('http://fp7-pp.publicdata.eu/resource/city/Austria-VIENNA');
            facetConfig.getConstraintManager().addConstraint(new facete.ConstraintEquals(p, nv));
        }

        
        var sparqlService = new service.SparqlServiceHttp('http://fp7-pp.publicdata.eu/sparql', ['http://fp7-pp.publicdata.eu/']);
        sparqlService = new service.SparqlServiceConsoleLog(sparqlService);
        
        
        var bestLabelConfig = new sparql.BestLabelConfig();
        
        // Transform functions from searchStrings into sparql concepts
        var fnTransformSearch = function(searchString) {
            
            var result;
            if(searchString) {
            
                var relation = sparql.LabelUtils.createRelationPrefLabels(bestLabelConfig);
                var result = sparql.KeywordSearchUtils.createConceptRegex(relation, searchString);
                //var result = sparql.KeywordSearchUtils.createConceptBifContains(relation, searchString);
            }
            else {
                result = null;
            }
            return result;
        };
        
        //ListServicecreateListServiceMappedConcept
        var mappedConcept = sponate.MappedConceptUtils.createMappedConceptBestLabel(bestLabelConfig);
        var lsBestLabel = sponate.LookupServiceUtils.createLookupServiceMappedConcept(sparqlService, mappedConcept);
        
        
        var facetConceptSupplierExact = new facete.FacetConceptSupplierExact(facetConfig);
        var facetConceptSupplierMeta = new facete.FacetConceptSupplierMeta(facetConceptSupplierExact);

        // TODO: Use the set of declared properties for the root
        //facetConceptSupplierMeta.getPathHeadToConcept().put(new facete.Path(), );
        
        var facetService = new facete.FacetServiceSparql(sparqlService, facetConceptSupplierMeta);
        facetService = new facete.FacetServiceTransformConcept(facetService, fnTransformSearch);
        
        //var path = facete.Path.parse('http://fp7-pp.publicdata.eu/ontology/funding');
        var pathHead = new facete.PathHead(facete.Path.parse(''), false);
        var listService = facetService.createListService(pathHead);
        
        
        listService.fetchItems(null, 10).then(function(properties) {
            console.log('Got facets', properties);
            
            var facetRelationIndex = facete.FacetUtils.createFacetRelationIndex(facetConfig, pathHead);
            
            var lsPreCount = new facete.LookupServiceFacetPreCount(sparqlService, facetRelationIndex);
            var lsExactCount = new facete.LookupServiceFacetExactCount(sparqlService, facetRelationIndex);
            var ls = new facete.LookupServiceFacetCount(lsPreCount, lsExactCount);

            ls = lsBestLabel;
            var promise = ls.lookup(properties);
            return promise;
            
            
            /*
            var properties = [];
            entries.forEach(function(entry) {
                properties.push(entry.key);
            });

            console.log('here');
            var stepRelations = facete.FacetUtils.createStepRelationsProperties(facetConfig, path, false, [], true);
            stepRelations.forEach(function(sr) {
                console.log('StepRelation: ' + sr);
                console.log('  -- Relation: ' + sparql.RelationUtils.createQueryDistinctValueCount(sr.getRelation(), sparql.VarUtils.c));
            });
            */
        }).then(function(map) {
            console.log('FINAL' + JSON.stringify(map.entries()));
        });

        listService.fetchItems(null, null).then(function(items) {
            console.log('got everything', items.length);
        });
    });


});
