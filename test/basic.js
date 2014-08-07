/* global describe */
/* global it */
var should = require('should');

// lib
var jassa = require('../lib');
// namespaces
var rdf = jassa.rdf;
var vocab = jassa.vocab;
var sparql = jassa.sparql;
var service = jassa.service;

// tests
describe('Basics', function(){
    it('#Triple should be created', function(){
        var s = rdf.NodeFactory.createVar('s');
        var p = vocab.rdf.type;
        var o = rdf.NodeFactory.createUri('http://example.org/ontology/MyClass');

        var triple = new rdf.Triple(s, p, o);

        triple.toString().should.equal('?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/ontology/MyClass>');
        triple.getSubject().isVariable().should.be.false;
    });

    it('#Query should be created', function() {
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

    it('#Sparql service should get results', function() {

    });
});
