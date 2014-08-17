/* global describe */
/* global it */
var should = require('should');

// lib includes
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var ajax = function(param) {
    return request.postAsync(param.url, {
        json: true,
        form: param.data
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

var createSparqlService = function() {
    var endpoint = 'http://dbpedia.org/sparql';
    var graphs = ['http://dbpedia.org'];
    var result = new service.SparqlServiceHttp(endpoint, graphs);
    return result;
};
        

// tests
describe('Basics', function() {
    it('#Triple should be created', function() {
        var s = rdf.NodeFactory.createVar('s');
        var p = vocab.rdf.type;
        var o = rdf.NodeFactory.createUri('http://example.org/ontology/MyClass');

        var triple = new rdf.Triple(s, p, o);

        triple.toString().should.equal('?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/ontology/MyClass>');
        triple.getSubject().isVariable().should.be.true;
    });

    it('#Query.toString() should match Select * {?s ?p ?o}  Limit 10', function() {
        var query = new sparql.Query();
        var s = rdf.NodeFactory.createVar('s');
        var p = rdf.NodeFactory.createVar('p');
        var o = rdf.NodeFactory.createVar('o');

        var triple = new rdf.Triple(s, p, o);

        query.setQueryPattern(new sparql.ElementTriplesBlock([triple]));
        query.setResultStar(true);
        query.setLimit(10);

        query.toString().should.be.equal('Select * {?s ?p ?o}  Limit 10');
    });

    it('#Sparql service should get results', function(done) {
        var sparqlService = createSparqlService();

        var qe = sparqlService.createQueryExecution('Select * { ?s ?p ?o } Limit 10');
        qe.setTimeout(100); // timout in milliseconds

        qe
            .execSelect()
            .then(function(rs) {
                var s = rdf.NodeFactory.createVar('s');
                var p = rdf.NodeFactory.createVar('p');
                var o = rdf.NodeFactory.createVar('o');

                var count = 0;
                while (rs.hasNext()) {
                    count++;
                    var binding = rs.nextBinding();

                    binding.get(s).getUri().should.exist;
                    binding.get(p).getUri().should.equal('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
                    binding.get(o).should.exist;
                }

                count.should.equal(10);
                done();
            });
    });

    /*
    it('#Sparql Items should be filtered by regex', function(done) {
        var langs = ['en', 'de', ''];
        var props = ['http://www.w3.org/2000/01/rdf-schema#label'];
        
        // Maybe we want a concept transformer? Takes a concept, and returns a new concept - maybe with the filter applied
        // So the constraint manager is still useful, because it mediates between the UI and and the sparql level
        // Constraints could also be created only based on a variable
        
        var searchFilter(langs, props);
        
        searchFilter('test');
        
        var sparqlService = createSparqlService();
        var listService = 
    });
    */

});
