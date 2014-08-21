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
describe('Services', function() {
    it('#Service layers should work', function() {

        var attrQuery = new sparql.Query();

        attrQuery.getProject().add(sparql.VarUtils.s);
        attrQuery.getProject().add(sparql.VarUtils.c, new sparql.ExprAggregator(null, new sparql.AggCount()));
        attrQuery.setQueryPattern(new sparql.ElementTriplesBlock([new rdf.Triple(sparql.VarUtils.s, vocab.rdfs.label, sparql.VarUtils.o)]));

        var filterConcept = sparql.ConceptUtils.createTypeConcept('http://linkedgeodata.org/ontology/Amenity');


        // Sparql layers: http, caching, fixes, pagination and page-expansion
        var sparqlService = new service.SparqlServiceHttp('http://linkedgeodata.org/sparql', ['http://linkedgeodata.org']);
        sparqlService = new service.SparqlServiceCache(sparqlService);
        sparqlService = new service.SparqlServiceVirtFix(sparqlService);
        sparqlService = new service.SparqlServicePaginate(sparqlService, 1000);
        sparqlService = new service.SparqlServicePageExpand(sparqlService, 100);

        // List layers:
        var useKeyLookupStrategy = false;
        var ls;

        if(useKeyLookupStrategy) {
            var l = new service.LookupServiceSparqlQuery(sparqlService, attrQuery, s);
            l = new service.LookupServiceChunker(l, 30);
            l = new service.LookupServiceCache(l);

            var subLs = new service.ListServiceConcept(sparqlService);
            ls = new service.ListServiceConceptKeyLookup(subLs, l, false);
        }
        else {
            ls = new service.ListServiceSparqlQuery(sparqlService, attrQuery, sparql.VarUtils.s, true);
        }
        ls = new service.ListServicePageExpand(ls, 100);


        /*
        ls.fetchItems(filterConcept, 10, 20).pipe(function(items) {
            alert(JSON.stringify(items).length);
           //console.log('Items: ', items);
        });*/


        ls.fetchCount(filterConcept, 50).then(function(countInfo) {
            //console.log('Count info:' + JSON.stringify(countInfo));
        });

/*
        var s = rdf.NodeFactory.createVar('s');
        var p = vocab.rdf.type;
        var o = rdf.NodeFactory.createUri('http://example.org/ontology/MyClass');

        var triple = new rdf.Triple(s, p, o);

        triple.toString().should.equal('?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/ontology/MyClass>');
        triple.getSubject().isVariable().should.be.true;
*/
    });

});
