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

var Node_Uri = require('../../lib/rdf/node/Node_Uri');

var Node_Blank = require('../../lib/rdf/node/Node_Blank');
var Node_Literal = require('../../lib/rdf/node/Node_Literal');
var TypedValue = require('../../lib/rdf/rdf_datatype/TypedValue');
var BaseDatatype = require('../../lib/rdf/rdf_datatype/BaseDatatype');
var LiteralLabel = require('../../lib/rdf/LiteralLabel');
var Var = require('../../lib/rdf/node/Var');
var AnonIdStr = require('../../lib/rdf/AnonIdStr');

describe('Node_Uri', function() {
  var uriStr = 'http://ex.org/sth';
  var uriNode = new Node_Uri(uriStr);

  it('should state that it is a URI node', function() {
    uriNode.isUri().should.be.true;
  });

  it('should state that it is not a blank node', function() {
    uriNode.isBlank().should.be.false;
  });

  it('should state that it is not a literal node', function() {
    uriNode.isLiteral().should.be.false;
  });

  it('should state that it is not variable', function() {
    uriNode.isVariable().should.be.false;
  });

  it('should return the correct URI string', function() {
    uriNode.getUri().should.equal(uriStr);
  });

  it('should be stringified correctly', function() {
    var expctdNodeStr = '<' + uriStr + '>';
    uriNode.toString().should.equal(expctdNodeStr);
  });

  it('should determine equality with other blank nodes correctly', function() {
    var otherBNodeId = new AnonIdStr('1234');
    var otherBNode = new Node_Blank(otherBNodeId);
    uriNode.equals(otherBNode).should.be.false;
  });

  it('should determine equality with other URI nodes correctly', function() {
    // equality with itself
    uriNode.equals(uriNode).should.be.true;

    // other node object with same URI string
    var otherUriNode1 = new Node_Uri(uriStr);
    uriNode.equals(otherUriNode1).should.be.true;

    // other node object with different URI string
    var otherUriStr = 'http://ex.org/other';
    var otherUriNode2 = new Node_Uri(otherUriStr);
    uriNode.equals(otherUriNode2).should.be.false;
  });

  it('should determine equality with other literal nodes correctly', function() {
    // plain literal with same value as node URI
    var otherLitLabelPlain1 = new LiteralLabel(uriStr, uriStr, null, null);
    var otherLitNodePlain1 = new Node_Literal(otherLitLabelPlain1);
    uriNode.equals(otherLitNodePlain1).should.be.false;

    // plain literal with different value
    var otherLitVal = 'something completely different';
    var otherLitLabelPlain2 = new LiteralLabel(otherLitVal, otherLitVal, null, null);
    var otherLitNodePlain2 = new Node_Literal(otherLitLabelPlain2);
    uriNode.equals(otherLitNodePlain2).should.be.false;

    // plain literal with language tag and same value as node URI
    var otherLitLangTag = 'pl';
    var otherLitLabelWLang1 = new LiteralLabel(uriStr, uriStr, otherLitLangTag, null);
    var otherLitNodeWLang1 = new Node_Literal(otherLitLabelWLang1);
    uriNode.equals(otherLitNodeWLang1).should.be.false;

    // plain literal with language tag and different value
    var otherLitLabelWLang2 = new LiteralLabel(otherLitVal, otherLitVal, otherLitLangTag, null);
    var otherLitNodeWLang2 = new Node_Literal(otherLitLabelWLang2);
    uriNode.equals(otherLitNodeWLang2).should.be.false;

    // typed literal with same value as node URI
    var otherDTypeURI = 'http://www.w3.org/2001/XMLSchema#string';
    var otherDType = new BaseDatatype(otherDTypeURI);
    var otherTypedVal1 = new TypedValue(uriStr, otherDTypeURI);
    var otherLitLabelTyped1 = new LiteralLabel(otherTypedVal1, uriStr, null, otherDType);
    var otherLitNodeTyped1 = new Node_Literal(otherLitLabelTyped1);
    uriNode.equals(otherLitNodeTyped1).should.be.false;

    // typed literal with different value
    var otherTypedVal2 = new TypedValue(otherLitVal, otherDTypeURI);
    var otherLitLabelTyped2 = new LiteralLabel(otherTypedVal2, otherLitVal, null, otherDType);
    var otherLitNodeTyped2 = new Node_Literal(otherLitLabelTyped2);
    uriNode.equals(otherLitNodeTyped2).should.be.false;
  });

  it('should determine equality with other node variable', function() {
    var otherNodeVar = new Var('varxyz');
    uriNode.equals(otherNodeVar).should.be.false;
  });

  it('should state that it is concrete', function() {
    uriNode.isConcrete().should.be.true;
  });
});

