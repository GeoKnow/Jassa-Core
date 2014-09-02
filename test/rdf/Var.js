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

var Var = require('../../lib/rdf/node/Var');

var Node_Uri = require('../../lib/rdf/node/Node_Uri');
var Node_Blank = require('../../lib/rdf/node/Node_Blank');
var Node_Literal = require('../../lib/rdf/node/Node_Literal');
var TypedValue = require('../../lib/rdf/rdf_datatype/TypedValue');
var BaseDatatype = require('../../lib/rdf/rdf_datatype/BaseDatatype');
var LiteralLabel = require('../../lib/rdf/LiteralLabel');
var AnonIdStr = require('../../lib/rdf/AnonIdStr');

describe('Node_Variable', function() {
  var varName = 'varABC';
  var nodeVar = new Var(varName);

  it('should state that it is variable', function() {
    nodeVar.isVariable().should.be.true;
  });

  it('should state that it is not a blank node', function() {
    nodeVar.isBlank().should.be.false;
  });

  it('should state that it is not a URI node', function() {
    nodeVar.isUri().should.be.false;
  });

  it('should state that it is not a literal node', function() {
    nodeVar.isLiteral().should.be.false;
  });

  it('should return its variable name correctly', function() {
    nodeVar.getName().should.equal(varName);
  });

  it('should be stringified correctly', function() {
    var expctdNodeVarStr = '?' + varName;
    nodeVar.toString().should.equal(expctdNodeVarStr);
  });

  it('should determine equality with other node variables correctly', function() {
    // equality with itself
    nodeVar.equals(nodeVar).should.be.true;

    // equality with another node var with same name
    var otherNodeVar1 = new Var(varName);
    nodeVar.equals(otherNodeVar1).should.be.true;

    // equality with another node var with different name
    var otherNodeVarName = 'variable987';
    var otherNodeVar2 = new Var(otherNodeVarName);
    nodeVar.equals(otherNodeVar2).should.be.false;
  });

  it('should determine equality with other blank nodes correctly', function() {
    // blank node with same blank node ID as var name
    var otherBNodeId1 = new AnonIdStr(varName);
    var otherBNode1 = new Node_Blank(otherBNodeId1);
    nodeVar.equals(otherBNode1).should.be.false;

    // blank node with different blank node ID
    var otherBNodeId2 = new AnonIdStr('1234');
    var otherBNode2 = new Node_Blank(otherBNodeId2);
    nodeVar.equals(otherBNode2).should.be.false;
  });

  it('should determine equality with other URI nodes correctly', function() {
    var otherUri = 'http://ex.org/other';
    var otherUriNode = new Node_Uri(otherUri);

    nodeVar.equals(otherUriNode).should.be.false;
  });

  it('should determine equality with other literal nodes correctly', function() {
    // equality with plain literal with same literal value as the node var name
    var otherLitLabel1 = new LiteralLabel(varName, varName, null, null);
    var otherLitNodePlain1 = new Node_Literal(otherLitLabel1);
    nodeVar.equals(otherLitNodePlain1).should.be.false;

    // equality with plain literal with different literal value
    var otherLitVal = 'something completely different';
    var otherLitLabel2 = new LiteralLabel(otherLitVal, otherLitVal, null, null);
    var otherLitNodePlain2 = new Node_Literal(otherLitLabel2);
    nodeVar.equals(otherLitNodePlain2).should.be.false;

    // equality with plain literal w/ language tag and same literal value as the
    // node var name
    var otherLitLang = 'pl';
    var otherLitLabelWLang1 = new LiteralLabel(varName, varName, otherLitLang, null);
    var otherLitNodeWLang1 = new Node_Literal(otherLitLabelWLang1);
    nodeVar.equals(otherLitNodeWLang1).should.be.false;

    // equality with plain literal w/ language tag and different literal value
    var otherLitLabelWLang2 = new LiteralLabel(otherLitVal, otherLitVal, otherLitLang, null);
    var otherLitNodeWLang2 = new Node_Literal(otherLitLabelWLang2);
    nodeVar.equals(otherLitNodeWLang2).should.be.false;

    // equality with typed literal with same literal value as the node var name
    var otherDTypeURI = 'http://www.w3.org/2001/XMLSchema#string';
    var otherTypedVal1 = new TypedValue(varName, otherDTypeURI);
    var otherDType = new BaseDatatype(otherDTypeURI);
    var otherLitLabelTyped1 = new LiteralLabel(otherTypedVal1, varName, null, otherDType);
    var otherLitNodeTyped1 = new Node_Literal(otherLitLabelTyped1);
    nodeVar.equals(otherLitNodeTyped1).should.be.false;

    // equality with typed literal with different literal value
    var otherTypedVal2 = new TypedValue(otherLitVal, otherDTypeURI);
    var otherLitLabelTyped2 = new LiteralLabel(otherTypedVal2, otherLitVal, null, otherDType);
    var otherLitNodeTyped2 = new Node_Literal(otherLitLabelTyped2);
    nodeVar.equals(otherLitNodeTyped2).should.be.false;
  });

  it('should state that it is not concrete', function() {
    nodeVar.isConcrete().should.be.false;
  });
});



