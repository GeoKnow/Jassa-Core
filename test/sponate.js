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

// tests
describe('Concept Operations', function() {
    it('#Keyword Search Concept with Regex', function() {
/*
        var relation = sparql.KeywordSearchUtils.createConceptRegex();
        filterConcept.toString().should.equal('?s ?p ?o . Filter((?p In (<http://www.w3.org/2000/01/rdf-schema#label>))) . Filter((langMatches(lang(?o), "en") || langMatches(lang(?o), ""))); ?s');
*/
    });

    it('#Label aggregation', function() {
        var baseConcept = sparql.ConceptUtils.createTypeConcept('http://dbpedia.org/ontology/Castle');

        var bestLabelConfig = new sparql.BestLabelConfig();
        var mappedConcept = sponate.MappedConceptUtils.createMappedConceptBestLabel(bestLabelConfig);
        
        var sparqlService = new service.SparqlServiceHttp('http://dbpedia.org/sparql', ['http://dbpedia.org']);
        //sparqlService = new service.SparqlServicePaginate(sparqlService, 1000);
        
        var labelService = sponate.LookupServiceUtils.createLookupServiceMappedConcept(sparqlService, mappedConcept);
        var itemService = new service.ListServiceConcept(sparqlService);

        // Retrieve 10 items and fetch their labels
        itemService.fetchItems(mappedConcept.getConcept(), 10).then(function(items) {
            return labelService.lookup(items);
        }).then(function(map) {
            //var node = rdf.NodeFactory.createUri('http://www.ontologyportal.org/WordNet#WN30-106831819');
            //var node = rdf.NodeFactory.createUri('http://www.ontologyportal.org/WordNet#WN30-106831819');
            //var moo = map.get(node);
            //console.log('Result Map', map.values());
            console.log('TODO verify output in this test case');
        });
        

        //console.log(itemToLabel);
        //combinedConcept.toString().should.equal(expected);
    });

});
