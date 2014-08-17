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
        var sparqlService = new service.SparqlServiceHttp('http://fp7-pp.publicdata.eu/sparql', ['http://fp7-pp.publicdata.eu/']);

        var bestLabelConfig = new sparql.BestLabelConfig();
        
        // Transform functions from searchStrings into sparql concepts
        var fnTransformSearch = function(searchString) {
            var relation = sparql.LabelUtils.createRelationPrefLabels(bestLabelConfig);
            var concept = sparql.KeywordSearchUtils.createConceptRegex(relation, searchString);
            return concept;
        };
        
        var facetService = new facete.FacetServiceSparql(sparqlService, facetConfig);
        facetService = new facete.FacetServiceTransformConcept(facetService, fnTransformSearch);
        var listService = facetService.createListService(new facete.Path());
        
        listService.fetchItems('seeAlso', 10).then(function(items) {
            console.log(items);
        });
        
    });


});
