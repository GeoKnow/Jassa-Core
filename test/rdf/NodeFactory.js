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

var NodeFactory = require('../../lib/rdf/NodeFactory');
var Node_Blank = require('../../lib/rdf/node/Node_Blank');
var Node_Uri = require('../../lib/rdf/node/Node_Uri');
var Node_Literal = require('../../lib/rdf/node/Node_Literal');
var LiteralLabel = require('../../lib/rdf/LiteralLabel');
var TypedValue = require('../../lib/rdf/rdf_datatype/TypedValue');

describe('NodeFactory', function() {
  it('should create blank nodes correctly', function() {
    var bNodeId = '23';
    var bNode = NodeFactory.createAnon(bNodeId);

    (bNode instanceof Node_Blank).should.be.true;
    bNode.isBlank().should.be.true;
    bNode.getBlankNodeId().should.equal(bNodeId);
  });

  it('should create URI nodes correctly', function() {
    var uriStr = 'http://ex.org/res23';
    var uriNode = NodeFactory.createUri(uriStr);

    (uriNode instanceof Node_Uri).should.be.true;
    uriNode.isUri().should.be.true;
    uriNode.getUri().should.equal(uriStr);
  });

  it('should create plain literals with lang tag correctly', function() {
    var value = 'twenty three';
    var lang = 'en';
    var litNode = NodeFactory.createPlainLiteral(value, lang);

    (litNode instanceof Node_Literal).should.be.true;
    litNode.isLiteral().should.be.true;
    litNode.getLiteralLexicalForm().should.equal(value);
    litNode.getLiteralLanguage().should.equal(lang);
    (litNode.getLiteral() instanceof LiteralLabel).should.be.true;
  });

  it('should create plain literals without a lang tag correctly', function() {
    var value = 'twenty three';
    var litNode = NodeFactory.createPlainLiteral(value);

    (litNode instanceof Node_Literal).should.be.true;
    litNode.isLiteral().should.be.true;
    litNode.getLiteralLexicalForm().should.equal(value);
    litNode.getLiteralLanguage().should.equal('');
    (litNode.getLiteral() instanceof LiteralLabel).should.be.true;
  });

  it('should create typed literals from a typed value object correctly', function() {
    var lexicalValue = 23;
    var datatypeUri = 'http://www.w3.org/2001/XMLSchema#int';
    var typedValue = new TypedValue(lexicalValue, datatypeUri);
    var litNode = NodeFactory.createTypedLiteralFromValue(typedValue, datatypeUri);

    (litNode instanceof Node_Literal).should.be.true;
    litNode.isLiteral().should.be.true;
    litNode.getLiteralLexicalForm().should.equal(23);
    litNode.getLiteralDatatypeUri().should.equal(datatypeUri);
  });
});