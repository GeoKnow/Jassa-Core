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
var jassa = require('../../lib')(Promise, ajax);
// namespaces
var rdf = jassa.rdf;
var vocab = jassa.vocab;
var sparql = jassa.sparql;
var service = jassa.service;

var NodeUtils = require('../../lib/rdf/NodeUtils');

var NodeFactory = require('../../lib/rdf/NodeFactory');

describe('NodeUtils', function() {
  it('should return correct node substitutes', function() {
    var nodeAUriStr = 'http://ex.org/a';
    var nodeA = NodeFactory.createUri(nodeAUriStr);

    var nodeBUriStr = 'http://ex.org/b';
    var nodeB = NodeFactory.createUri(nodeBUriStr);

    var nodeCUriStr = 'http://ex.org/c';
    var nodeC = NodeFactory.createUri(nodeCUriStr);

    /*
     * Dummy fnNodeMap function that maps nodeA --> nodeB  and returns the
     * input node in all other cases.
     */
    var fnNodeMap = function(node) {
      if (node === nodeA) { return nodeB; }
      else { return node; }
    };

    var res1Node = NodeUtils.getSubstitute(nodeA, fnNodeMap);
    res1Node.should.equal(nodeB);

    var res2Node = NodeUtils.getSubstitute(nodeC, fnNodeMap);
    res2Node.should.equal(nodeC);
  });

  it('should push variable nodes into an array correctly', function() {
    var nonVarNode = NodeFactory.createUri('http://ex.org/sth');
    var varNode = NodeFactory.createVar('varXYZ');
    var varArray = [];

    NodeUtils.pushVar(varArray, nonVarNode);
    varArray.should.be.empty;

    NodeUtils.pushVar(varArray, varNode);
    varArray.should.containEql(varNode);
    varArray.length.should.equal(1);
  });

  it('should return the correct language of an input plain literal node', function() {
    var litVal = 'plain plain plain';
    var litLang = 'pl';
    var litNode = NodeFactory.createPlainLiteral(litVal, litLang);
    var nonLitNode = NodeFactory.createAnon();

    var lang1 = NodeUtils.getLang(litNode);
    lang1.should.equal(litLang);

    var lang2 = NodeUtils.getLang(nonLitNode);
    (lang2 === null).should.be.true;
  });

  it('should return the correct URI of a given input node', function() {
    var uriStr = 'http://ex.org/sth';
    var uriNode = NodeFactory.createUri(uriStr);
    var nonUriNode = NodeFactory.createAnon();

    var uri1 = NodeUtils.getUri(uriNode);
    uri1.should.equal(uriStr);

    var uri2 = NodeUtils.getUri(nonUriNode);
    (uri2 === null).should.be.true;
  });

  it('should return the correct value of a given input blank node', function() {
    var value = '23';
    var node = NodeFactory.createAnon(value)

    var resValue = NodeUtils.getValue(node);
    resValue.should.equal('_:' + value);
  });

  it('should return the correct value of a given input URI node', function() {
    var value = 'http://ex.org/sth';
    var node = NodeFactory.createUri(value);

    var resValue = NodeUtils.getValue(node);
    resValue.should.equal(value);
  });

  it('should return the correct value of a given input plain literal node', function() {
    var value = 'plain plain plain';
    var node = NodeFactory.createPlainLiteral(value);

    var resValue = NodeUtils.getValue(node);
    resValue.should.equal(value);
  });

  it('should return the correct value of a given input plain literal node ' +
      'with language tag', function() {
    var value = 'plain plain plain';
    var lang = 'pl';
    var node = NodeFactory.createPlainLiteral(value, lang);

    var resValue = NodeUtils.getValue(node);
    resValue.should.equal(value);
  });

  it('should return the correct value of a given input typed literal node', function() {
    var value = 'typed typed typed';
    var dtypeUri = 'http://www.w3.org/2001/XMLSchema#string';
    var node = NodeFactory.createTypedLiteralFromString(value, dtypeUri);

    var resValue = NodeUtils.getValue(node);
    resValue.should.equal(value);
  });
});