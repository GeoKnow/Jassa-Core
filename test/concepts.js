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

// tests
describe('Concept Operations', function() {
    it('#Keyword Search Concept with Regex', function() {
/*
        var relation = sparql.KeywordSearchUtils.createConceptRegex();
        filterConcept.toString().should.equal('?s ?p ?o . Filter((?p In (<http://www.w3.org/2000/01/rdf-schema#label>))) . Filter((langMatches(lang(?o), "en") || langMatches(lang(?o), ""))); ?s');
*/
    });

    it('#Keyword Search Concept Combination', function() {
        var baseConcept = sparql.ConceptUtils.createTypeConcept('http://dbpedia.org/ontology/Person');

        var bestLabelConfig = new sparql.BestLabelConfig();

        var labelRelation = sparql.LabelUtils.createRelationPrefLabels(bestLabelConfig);
        var filterConcept = sparql.KeywordSearchUtils.createConceptRegex(labelRelation, 'Claus');

        var combinedConcept = sparql.ConceptUtils.createCombinedConcept(baseConcept, filterConcept);

        var expected = '?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Person> . Optional {?s ?y ?z . Filter((?y in (<http://www.w3.org/2000/01/rdf-schema#label>))) . Filter((langMatches(lang(?z), "en") || langMatches(lang(?z), ""))) . Filter(regex(str(?z), "Claus", "i"))} . Filter((regex(str(?s), "Claus", "i") || bound(?z))); ?s';

        combinedConcept.toString().should.equal(expected);
    });

});
