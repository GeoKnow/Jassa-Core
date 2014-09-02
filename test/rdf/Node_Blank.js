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

var Node_Blank = require('../../lib/rdf/node/Node_Blank');

var Node_Uri = require('../../lib/rdf/node/Node_Uri');
var Node_Literal = require('../../lib/rdf/node/Node_Literal');
var TypedValue = require('../../lib/rdf/rdf_datatype/TypedValue');
var BaseDatatype = require('../../lib/rdf/rdf_datatype/BaseDatatype');
var LiteralLabel = require('../../lib/rdf/LiteralLabel');
var Var = require('../../lib/rdf/node/Var');
var AnonIdStr = require('../../lib/rdf/AnonIdStr');

describe('Node_Blank', function() {
  var bNodeIdStr = '23';
  var bNodeId = new AnonIdStr(bNodeIdStr);
  var bNode = new Node_Blank(bNodeId);

  it('should state that it is a blank node', function() {
    bNode.isBlank().should.be.true;
  });

  it('should state that it is not a URI node', function() {
    bNode.isUri().should.be.false;
  });

  it('should state that it is not a literal node', function() {
    bNode.isLiteral().should.be.false;
  });

  it('should state that it is not variable', function() {
    bNode.isVariable().should.be.false;
  });

  it('should return the correct blank node id', function() {
    bNode.getBlankNodeId().should.equal(bNodeId);
  });

  it('should be stringified correctly', function() {
    var bNodeStr = '_:' + bNodeIdStr;
    bNode.toString().should.equal(bNodeStr);
  });

  it('should determine equality with other blank nodes correctly', function() {
    // equality with itself
    bNode.equals(bNode).should.be.true;

    // equality with another blank node with same blank node identifier
    var otherBNode1 = new Node_Blank(bNodeId);
    bNode.equals(otherBNode1).should.be.true;

    // equality with another blank node with same blank node identifier value
    var otherBNodeId2 = new AnonIdStr(bNodeIdStr);
    var otherBNode2 = new Node_Blank(otherBNodeId2);
    bNode.equals(otherBNode2).should.be.true;

    // equality with blank node with differing blank node id
    var otherBNodeIdStr3 = '42';
    var otherBNodeId3 = new AnonIdStr(otherBNodeIdStr3);
    var otherBNode3 = new Node_Blank(otherBNodeId3);
    bNode.equals(otherBNode3).should.be.false;
  });

  it('should determine equality with other URI nodes correctly', function() {
    var uriNode = new Node_Uri('http://ex.org/sth');
    bNode.equals(uriNode).should.be.false;
  });

  it('should determine equality with other literal nodes correctly', function() {
    // equality with plain literal with same literal value as blank node id
    var otherLitLabelPlain1 = new LiteralLabel(bNodeIdStr, bNodeIdStr, null, null);
    var otherLitNodePlain1 = new Node_Literal(otherLitLabelPlain1);
    bNode.equals(otherLitNodePlain1).should.be.false;

    // equality with plain literal with different literal value
    var otherLitVal = 'value';
    var otherLitLabelPlain2 = new LiteralLabel(otherLitVal, otherLitVal, null, null);
    var otherLitNodePlain2 = new Node_Literal(otherLitLabelPlain2);
    bNode.equals(otherLitNodePlain2).should.be.false;

    // equality with plain literal with language tag and same literal value as
    // blank node id
    var otherLitLang = 'pl';
    var otherLitLabelWLang1 = new LiteralLabel(bNodeIdStr, bNodeIdStr, otherLitLang, null);
    var otherLitNodeWLang1 = new Node_Literal(otherLitLabelWLang1);
    bNode.equals(otherLitNodeWLang1).should.be.false;

    // equality with plain literal with language tag and different literal value
    var otherLitLabelWLang2 = new LiteralLabel(otherLitVal, otherLitVal, otherLitLang, null);
    var otherLitNodeWLang2 = new Node_Literal(otherLitLabelWLang2);
    bNode.equals(otherLitNodeWLang2).should.be.false;

    // equality with typed literal with same literal value as blank node id
    var otherDTypeURI = 'http://www.w3.org/2001/XMLSchema#string';
    var otherDType = new BaseDatatype(otherDTypeURI);
    var otherTypedVal1 = new TypedValue(bNodeIdStr, otherDTypeURI);
    var otherLitLabelTyped1 = new LiteralLabel(otherTypedVal1, bNodeIdStr, null, otherDType);
    var otherLitNodeTyped1 = new Node_Literal(otherLitLabelTyped1);
    bNode.equals(otherLitNodeTyped1).should.be.false;

    // typed literal
    var otherTypedVal2 = new TypedValue(otherLitVal, otherDType);
    var otherLitLabelTyped2 = new LiteralLabel(otherTypedVal2, otherLitVal, null, otherDType);
    var otherLitNodeTyped2 = new Node_Literal(otherLitLabelTyped2);
    bNode.equals(otherLitNodeTyped2).should.be.false;
  });

  it('should determine equality with other node variables correctly', function() {
    var varNode = new Var(bNodeIdStr);
    bNode.equals(varNode).should.be.false;
  });

  it('should state, that it is a concrete node', function() {
    bNode.isConcrete().should.be.true;
  })
});

