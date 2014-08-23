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
var Node_Variable = require('../../lib/rdf/node/Node_Variable');
var Node_Literal = require('../../lib/rdf/node/Node_Literal');
var LiteralLabel = require('../../lib/rdf/LiteralLabel');
var TypedValue = require('../../lib/rdf/rdf_datatype/TypedValue');

describe('NodeFactory', function() {
  it('should create blank nodes correctly', function() {
    var bNodeId = '23';
    var bNode = NodeFactory.createAnon(bNodeId);

    (bNode instanceof Node_Blank).should.be.true;
    bNode.getBlankNodeId().should.equal(bNodeId);
  });

  it('should create URI nodes correctly', function() {
    var uriStr = 'http://ex.org/res23';
    var uriNode = NodeFactory.createUri(uriStr);

    (uriNode instanceof Node_Uri).should.be.true;
    uriNode.getUri().should.equal(uriStr);
  });

  it('should create variable nodes correctly', function() {
    var varName = 'var23';
    var varNode = NodeFactory.createVar(varName);

    (varNode instanceof Node_Variable).should.be.true;
    varNode.getName().should.equal(varName);
  });

  it('should create plain literals with lang tag correctly', function() {
    var value = 'twenty three';
    var lang = 'en';
    var litNode = NodeFactory.createPlainLiteral(value, lang);

    (litNode instanceof Node_Literal).should.be.true;
    litNode.getLiteralLexicalForm().should.equal(value);
    litNode.getLiteralLanguage().should.equal(lang);
    (litNode.getLiteral() instanceof LiteralLabel).should.be.true;
  });

  it('should create plain literals without a lang tag correctly', function() {
    var value = 'twenty three';
    var litNode = NodeFactory.createPlainLiteral(value);

    (litNode instanceof Node_Literal).should.be.true;
    litNode.getLiteralLexicalForm().should.equal(value);
    litNode.getLiteralLanguage().should.equal('');
    (litNode.getLiteral() instanceof LiteralLabel).should.be.true;
  });

  it('should create typed literals from a typed value object correctly', function() {
    var value = 23;
    var datatypeUri = 'http://www.w3.org/2001/XMLSchema#int';
    var litNode = NodeFactory.createTypedLiteralFromValue(value, datatypeUri);

    litNode.isLiteral().should.be.true;
    litNode.getLiteralLexicalForm().should.equal('23');
    litNode.getLiteralDatatypeUri().should.equal(datatypeUri);
  });

  it('should create typed literals from string correctly', function() {
    var valStr = '23';
    var typeUriStr = 'http://www.w3.org/2001/XMLSchema#int';
    var litNode = NodeFactory.createTypedLiteralFromString(valStr, typeUriStr);

    (litNode instanceof Node_Literal).should.be.true;
    litNode.getLiteralLexicalForm().should.equal(valStr);
    litNode.getLiteralDatatypeUri().should.equal(typeUriStr);
  });

  it('should create blank nodes from talis JSON correctly', function() {
    var talisJSON = {
      value : '_:anna',
      type : 'bnode'
    };
    var bNode = NodeFactory.createFromTalisRdfJson(talisJSON);

    (bNode instanceof Node_Blank).should.be.true;
    // FIXME: #18
//    bNode.getBlankNodeId().should.equal(talisJSON.value);
    // vs
//    bNode.getBlankNodeId().getLabelString().should.equal(talisJSON.value);
  });

  it('should create URI nodes from talis JSON correctly', function() {
    var talisJSON = {
      value : 'http://example.org/anna',
      type : 'uri'
    };
    var uriNode = NodeFactory.createFromTalisRdfJson(talisJSON);

    (uriNode instanceof Node_Uri).should.be.true;
    uriNode.getUri().should.equal(talisJSON.value);
  });

  it('should create plain literals without language tag from talis JSON correctly', function() {
    var talisJSON = {
      value : 'Anna',
      type : 'literal'
    };
    var plainLit = NodeFactory.createFromTalisRdfJson(talisJSON);

    (plainLit instanceof Node_Literal).should.be.true;
    plainLit.getLiteralLexicalForm().should.equal(talisJSON.value);
    plainLit.getLiteralLanguage().should.equal('');
  });

  it('should create plain literals with language tag from talis JSON correctly', function() {
    var talisJSON = {
      value : 'Annas hjemmeside',
      type : 'literal',
      lang : 'da'
    };
    var plainLit = NodeFactory.createFromTalisRdfJson(talisJSON);

    (plainLit instanceof Node_Literal).should.be.true;
    plainLit.getLiteralLexicalForm().should.equal(talisJSON.value);
    plainLit.getLiteralLanguage().should.equal(talisJSON.lang);
  });

  it('should create typed literals from talis JSON correctly', function() {
    var talisJSON = {
      value : '23',
      type : 'literal',
      datatype : 'http://www.w3.org/2001/XMLSchema#int'
    };
    var typedLit = NodeFactory.createFromTalisRdfJson(talisJSON);

    (typedLit instanceof Node_Literal).should.be.true;
    typedLit.getLiteralLexicalForm().should.equal(talisJSON.value);
    // FIXME: #19
//    typedLit.getLiteralDatatypeUri().should.equal(talisJSON.datatype);
  });

  it('should parse blank node strings correctly', function() {
    var bNodeId = '_:23';
    var blankNode = NodeFactory.parseRdfTerm(bNodeId);

    (blankNode instanceof Node_Blank).should.be.true;
    blankNode.getBlankNodeId().label.should.equal(bNodeId);
  });

  it('should parse URI strings correctly', function() {
    var uriStr = 'http://ex.org/sth';
    var resStr = '<' + uriStr + '>';
    var node = NodeFactory.parseRdfTerm(resStr);

    (node instanceof Node_Uri).should.be.true;
    node.getUri().should.equal(uriStr)
  });

  it('should parse plain literal strings wo/ language tag correctly', function() {
    var litStr = 'plain plain plain';
    var valStr = '"' + litStr + '"';
    var node = NodeFactory.parseRdfTerm(valStr);

    (node instanceof Node_Literal).should.be.true;
    node.getLiteralValue().should.equal(litStr);
    node.getLiteralLanguage().should.equal('');
  });

  it('should parse plain literals w/ language tag correctly', function() {
    var litStr = 'plain plain plain';
    var langStr = 'en';
    var valStr = '"' + litStr + '"@' + langStr;
    var node = NodeFactory.parseRdfTerm(valStr);

    (node instanceof Node_Literal).should.be.true;
    node.getLiteralValue().should.equal(litStr);
    node.getLiteralLanguage().should.equal(langStr);
  });

  it('should parse typed literal strings correctly', function() {
    var litStr = 'typed typed typed';
    var typeUriStr = 'http://www.w3.org/2001/XMLSchema#string';
    var valStr = '"' + litStr + '"^^<' + typeUriStr + '>';
    var node = NodeFactory.parseRdfTerm(valStr);

    (node instanceof Node_Literal).should.be.true;
    node.getLiteralValue().should.equal(litStr);
    node.getLiteralDatatypeUri().should.equal(typeUriStr);
  });
});
