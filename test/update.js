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
//    var endpoint = 'http://dbpedia.org/sparql';
//    var graphs = ['http://dbpedia.org'];
    var endpoint = 'http://linkedgeodata.org/sparql';
    var graphs = ['http://linkedgeodata.org'];
    var result = new service.SparqlServiceHttp(endpoint, graphs);
    return result;
};



// tests
describe('SPARQL update', function() {
    it('#Generate a valid SPARQL update request', function() {
        //var g = rdf.NodeFactory.createUri('http://foobar');
        var s = rdf.NodeFactory.createVar('s');
        var p = vocab.rdf.type;
        var o = rdf.NodeFactory.createUri('http://example.org/ontology/MyClass');

        //console.log('vocab: ' + JSON.stringify(vocab.rdf));
        var quad = new sparql.Quad(null, s, p, o);
        var quads = [quad];

        var element = sparql.QuadUtils.quadsToElement(quads);
        var update = new sparql.UpdateModify(o, null, null, quads, quads, element);
        console.log('' + update);
//        triple.toString().should.equal('?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/ontology/MyClass>');
//        triple.getSubject().isVariable().should.be.true;
    });
});
