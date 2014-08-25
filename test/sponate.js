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
describe('Sponate tests', function() {

    it('#Simple low mapping', function() {

//        var prefixMapping = new rdf.PrefixMappingImpl({
//            fp7o: 'http://fp7-pp.publicdata.eu/ontology/'
//        });
//
//        context = new sponate.Context(prefixMapping);
//
//        context.add({
//            name: 'projects',
//            template: [{
//                id: '?s',
//                //displayName: labelAggregator // Aggregator fields cannot be filtered server side.
//                name: '?l',
//                partners: [{
//                    id: '?o',
//                    name: '?pl',
//                    amount: '?a',
//                }]
//                //partnersTest: ['?o']
//            }],
//            from: '?s a fp7o:Project ; rdfs:label ?l ; fp7o:funding ?f . ?f fp7o:partner ?o . ?o rdfs:label ?pl . ?f fp7o:amount ?a'
//        });
//
//        var sparqlService = new service.SparqlServiceHttp('http://fp7-pp.publicdata.eu/sparql', ['http://fp7-pp.publicdata.eu/']);
//        var engine = new sponate.Engine(sparqlService);
//
//
//        var query = new sponate.Query('projects');
//        query.setLimit(10);
//
//        engine.exec(context, query).then(function(items) {
//            items.forEach(function(item) {
//                //console.log('SPONATE:\n' + JSON.stringify(item, null, 4));
//            });
//        });

    }),

    it('#Simple mapping', function() {

        var sparqlService = new service.SparqlServiceHttp('http://fp7-pp.publicdata.eu/sparql', ['http://fp7-pp.publicdata.eu/']);

        store = new sponate.StoreFacade(sparqlService, {
            fp7o: 'http://fp7-pp.publicdata.eu/ontology/'
        });

        store.addMap({
            name: 'projects',
            template: [{
                id: '?s',
                //displayName: labelAggregator // Aggregator fields cannot be filtered server side.
                name: '?l',
                partners: [{
                    id: '?o',
                    name: '?pl',
                    amount: '?a',
                }]
                //partnersTest: ['?o']
            }],
            from: '?s a fp7o:Project ; rdfs:label ?l ; fp7o:funding ?f . ?f fp7o:partner ?o . ?o rdfs:label ?pl . ?f fp7o:amount ?a'
        });

        store.projects.find().limit(10).list().then(function(items) {
            items.forEach(function(item) {
                console.log('SPONATE:\n' + JSON.stringify(item, null, 4));
            });
        });


    });
});

/*
describe('Concept Operations', function() {
    it('#Keyword A DBpedia translation service example', function() {

        var sparqlService = new service.SparqlServiceHttp('http://dbpedia.org/sparql', ['http://dbpedia.org']);
        //var sparqlService = new service.SparqlServiceHttp('http://linkedgeodata.org/vsparql', ['http://linkedgeodata.org']);
        sparqlService = new service.SparqlServiceConsoleLog(sparqlService);

        var sourceBlc = new sparql.BestLabelConfig(['de']);
        var targetBlc = new sparql.BestLabelConfig(['en']);

        var mappedConcept = sponate.MappedConceptUtils.createMappedConceptBestLabel(targetBlc);

        var ls = sponate.ListServiceUtils.createListServiceMappedConcept(sparqlService, mappedConcept);

        ls = new service.ListServiceTransformItem(ls, function(item) {
            return item.displayLabel;
        });


        ls = new service.ListServiceTransformConcept(ls, function(concept) {
            var c = sparql.ConceptUtils.createTypeConcept('http://www.w3.org/2002/07/owl#Class');
            var result = sparql.ConceptUtils.createCombinedConcept(concept, c, false);
            return result;
        });


        ls = new service.ListServiceTransformConcept(ls, function(searchString) {
            var relation = sparql.LabelUtils.createRelationPrefLabels(sourceBlc);
            var result = sparql.KeywordSearchUtils.createConceptRegex(relation, searchString);
            //var result = sparql.KeywordSearchUtils.createConceptBifContains(relation, searchString);
            return result;
        });

        ls.fetchItems('airport', 10).then(function(translations) {
            translations.forEach(function(translation) {
                console.log('Translated: ' + translation);
            });
        });

//        var relation = sparql.KeywordSearchUtils.createConceptRegex();
//        filterConcept.toString().should.equal('?s ?p ?o . Filter((?p In (<http://www.w3.org/2000/01/rdf-schema#label>))) . Filter((langMatches(lang(?o), "en") || langMatches(lang(?o), ""))); ?s');

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
*/
