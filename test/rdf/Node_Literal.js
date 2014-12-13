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

var Node_Literal = require('../../lib/rdf/node/Node_Literal');

var LiteralLabel = require('../../lib/rdf/LiteralLabel');
var TypedValue = require('../../lib/rdf/rdf_datatype/TypedValue');
var BaseDatatype = require('../../lib/rdf/rdf_datatype/BaseDatatype');
var Node_Blank = require('../../lib/rdf/node/Node_Blank');
var Node_Uri = require('../../lib/rdf/node/Node_Uri');
var Var = require('../../lib/rdf/node/Var');
var AnonIdStr = require('../../lib/rdf/AnonIdStr');

describe('Node_Literal', function() {
  var litVal = 'plain';
  var litLabel = new LiteralLabel(litVal, litVal, null, null);
  var litNode = new Node_Literal(litLabel);

  it('should state that it is a literal node', function() {
    litNode.isLiteral().should.be.true;
  });

  it('should state that it is not a URI node', function() {
    litNode.isUri().should.be.false;
  });

  it('should state that it is not a blank node', function() {
    litNode.isBlank().should.be.false;
  });

  it('should state that it is not variable', function() {
    litNode.isVariable().should.be.false;
  });

  it('should return its literal correctly', function() {
    litNode.getLiteral().should.equal(litLabel);
  });

  it('should return its literal value correctly', function() {
    // plain literal
    var litLabelPlain = new LiteralLabel(litVal, litVal, null, null);
    var litNodePlain = new Node_Literal(litLabelPlain);
    litNodePlain.getLiteralValue().should.equal(litVal);

    // plain literal with language tag
    var litLang = 'pl';
    var litLabelWLang = new LiteralLabel(litVal, litVal, litLang, null);
    var litNodeWLang = new Node_Literal(litLabelWLang);
    litNodeWLang.getLiteralValue().should.equal(litVal);

    // typed literal
    var dtypeURI = 'http://www.w3.org/2001/XMLSchema#string';
    var typedVal = new TypedValue(litVal, dtypeURI);
    var dtype = new BaseDatatype(dtypeURI);
    var litLabelTyped = new LiteralLabel(typedVal, litVal, null, dtype);
    var litNodeTyped = new Node_Literal(litLabelTyped);
    litNodeTyped.getLiteralValue().should.equal(typedVal);
  });

  it('should return its lexical value correctly', function() {
    // plain literal
    var litVal = 23;
    var litValLex = '23';
    var litLabelPlain = new LiteralLabel(litVal, litVal, null, null);
    var litNodePlain = new Node_Literal(litLabelPlain);
    litNodePlain.getLiteralLexicalForm().should.equal(litValLex);

    // plain literal with lang tag
    var litLang = 'en';
    var litLabelLang = new LiteralLabel(litVal, litVal, litLang, null);
    var litNodeLang = new Node_Literal(litLabelLang);
    litNodeLang.getLiteralLexicalForm().should.equal(litValLex);

    // typed literal
    var dtypeURI = 'http://www.w3.org/2001/XMLSchema#string';
    var dtype = new BaseDatatype(dtypeURI);
    var typedVal = new TypedValue(litVal, dtypeURI);
    var litLabelTyped = new LiteralLabel(typedVal, litVal, null, dtype);
    var litNodeTyped = new Node_Literal(litLabelTyped);
    litNodeTyped.getLiteralLexicalForm().should.equal(litValLex);
  });

  it('should return its datatype correctly', function() {
    // plain literal
    var litVal = 'value';
    var litLabelPlain = new LiteralLabel(litVal, litVal, null, null);
    var litNodePlain = new Node_Literal(litLabelPlain);
    (litNodePlain.getLiteralDatatype() === null).should.be.true;

    // plain literal with lang tag
    var litLang = 'en';
    var litLabelLang = new LiteralLabel(litVal, litVal, litLang, null);
    var litNodeLang = new Node_Literal(litLabelLang);
    (litNodeLang.getLiteralDatatype() === null).should.be.true;

    // typed literal
    var dtypeURI = 'http://www.w3.org/2001/XMLSchema#string';
    var dtype = new BaseDatatype(dtypeURI);
    var typedVal = new TypedValue(litVal, dtypeURI);
    var litLabelTyped = new LiteralLabel(typedVal, litVal, null, dtype);
    var litNodeTyped = new Node_Literal(litLabelTyped);
    litNodeTyped.getLiteralDatatype().should.equal(dtype);
  });

  it('should return its datatype URI correctly', function() {
    // plain literal
    var litVal = 'value';
    var litLabelPlain = new LiteralLabel(litVal, litVal, null, null);
    var litNodePlain = new Node_Literal(litLabelPlain);
    (litNodePlain.getLiteralDatatypeUri() === null).should.be.true;

    // plain literal with lang tag
    var litLang = 'en';
    var litLabelLang = new LiteralLabel(litVal, litVal, litLang, null);
    var litNodeLang = new Node_Literal(litLabelLang);
    (litNodeLang.getLiteralDatatypeUri() === null).should.be.true;

    // typed literal
    var dtypeURI = 'http://www.w3.org/2001/XMLSchema#string';
    var dtype = new BaseDatatype(dtypeURI);
    var typedVal = new TypedValue(litVal, dtypeURI);
    var litLabelTyped = new LiteralLabel(typedVal, litVal, null, dtype);
    var litNodeTyped = new Node_Literal(litLabelTyped);
    litNodeTyped.getLiteralDatatypeUri().should.equal(dtypeURI);
  });

  it('should return its language correctly', function() {
    // plain literal
    var litVal = 'value';
    var litLabelPlain = new LiteralLabel(litVal, litVal, null, null);
    var litNodePlain = new Node_Literal(litLabelPlain);
    (litNodePlain.getLiteralLanguage() === null).should.be.true;

    // plain literal with language tag
    var litLang = 'en';
    var litLabelLang = new LiteralLabel(litVal, litVal, litLang, null);
    var litNodeLang = new Node_Literal(litLabelLang);
    litNodeLang.getLiteralLanguage().should.equal(litLang);

    // typed literal
    var dtypeURI = 'http://www.w3.org/2001/XMLSchema#string';
    var typedVal = new TypedValue(litVal, dtypeURI);
    var dtype = new BaseDatatype(dtypeURI);
    var litLabelTyped = new LiteralLabel(typedVal, litVal, null, dtype);
    var litNodeTyped = new Node_Literal(litLabelTyped);
    (litNodeTyped.getLiteralLanguage() === null).should.be.true;
  });

  it('should stringify correctly', function() {
    // plain literal
    var litVal = 'value';
    var litLabelPlain = new LiteralLabel(litVal, litVal, null, null);
    var litNodePlain = new Node_Literal(litLabelPlain);
    var expctdStr = '"' + litVal + '"';
    litNodePlain.toString().should.equal(expctdStr);

    // plain literal with language tag
    var litLang = 'en';
    var litLabelLang = new LiteralLabel(litVal, litVal, litLang, null);
    var litNodeLang = new Node_Literal(litLabelLang);
    expctdStr = '"' + litVal + '"@' + litLang;
    litNodeLang.toString().should.equal(expctdStr);

    // typed literal
    var dtypeURI = 'http://www.w3.org/2001/XMLSchema#string';
    var typedVal = new TypedValue(litVal, dtypeURI);
    var dtype = new BaseDatatype(dtypeURI);
    var litLabelTyped = new LiteralLabel(typedVal, litVal, null, dtype);
    var litNodeTyped = new Node_Literal(litLabelTyped);
    expctdStr = '"' + litVal + '"^^<' + dtypeURI + '>';
    litNodeTyped.toString().should.equal(expctdStr);
  });

  it('should determine equality with other nodes correctly in case it is plain', function() {
    var litVal = 'value';
    var litLabelPlain = new LiteralLabel(litVal, litVal, null, null);
    var thisLitNode = new Node_Literal(litLabelPlain);

    // equality with itself
    thisLitNode.equals(thisLitNode).should.be.true;

    // equality with other plain literal node with same literal value
    var otherLitLabelPlain1 = new LiteralLabel(litVal, litVal, null, null);
    var otherNodePlain1 = new Node_Literal(otherLitLabelPlain1);
    thisLitNode.equals(otherNodePlain1).should.be.true;

    // equality with other plain literal node with different literal value
    var otherLitVal = 'something completely different';
    var otherLitLabelPlain2 = new LiteralLabel(otherLitVal, otherLitVal, null, null);
    var otherNodePlain2 = new Node_Literal(otherLitLabelPlain2);
    thisLitNode.equals(otherNodePlain2).should.be.false;

    // equality with other plain literal node with language tag and same
    // literal value
    var otherLitLang = 'en';
    var otherLitLabelWLang1 = new LiteralLabel(litVal, litVal, otherLitLang, null);
    var otherNodeWLang1 = new Node_Literal(otherLitLabelWLang1);
    thisLitNode.equals(otherNodeWLang1).should.be.false;

    // equality with other plain literal node with language tag and different
    // literal value
    var otherLitLabelWLang2 = new LiteralLabel(otherLitVal, otherLitVal, otherLitLang, null);
    var otherNodeWLang2 = new  Node_Literal(otherLitLabelWLang2);
    thisLitNode.equals(otherNodeWLang2).should.be.false;

    // equality with other typed literal node with same literal value
    var otherDTypeUri = 'http://www.w3.org/2001/XMLSchema#string';
    var otherDType = new BaseDatatype(otherDTypeUri);
    var otherTypedVal1 = new TypedValue(litVal, otherDTypeUri);
    var otherLitLabelTyped1 = new LiteralLabel(otherTypedVal1, litVal, null, otherDType);
    var otherNodeTyped1 = new Node_Literal(otherLitLabelTyped1);
    thisLitNode.equals(otherNodeTyped1).should.be.false;

    // equality with other typed literal node with different literal value
    var otherTypedVal2 = new TypedValue(otherLitVal, otherDType);
    var otherLitLabelTyped2 = new LiteralLabel(otherTypedVal2, otherLitVal, null, otherDType);
    var otherNodeTyped2 = new Node_Literal(otherLitLabelTyped2);
    thisLitNode.equals(otherNodeTyped2).should.be.false;

    // equality with other blank node
    var otherbNode = new Node_Blank(new AnonIdStr(litVal));
    thisLitNode.equals(otherbNode).should.be.false;

    // equality with other URI node
    var otherUriStr = 'http://ex.org/other';
    var otherUriNode = new Node_Uri(otherUriStr);
    thisLitNode.equals(otherUriNode).should.be.false;

    // equality with other node variable
    var otherNodeVar = new Var(litVal);
    thisLitNode.equals(otherNodeVar).should.be.false;
  });

  it('should determine equality with other nodes correctly in case it has a language tag', function() {
    var litVal = 'value';
    var litLang = 'pl';
    var litLabelPlain = new LiteralLabel(litVal, litVal, litLang, null);
    var thisNode = new Node_Literal(litLabelPlain);

    // equality with itself
    thisNode.equals(thisNode).should.be.true;

    // equality with other plain literal node wo/ lang tag with same literal value
    var otherLitLabelPlain1 = new LiteralLabel(litVal, litVal, null, null);
    var otherNodePlain1 = new Node_Literal(otherLitLabelPlain1);
    thisNode.equals(otherNodePlain1).should.be.false;

    // equality with other plain literal node with different literal value
    var otherLitVal = 'something completely different';
    var otherLitLabelPlain2 = new LiteralLabel(otherLitVal, otherLitVal, null, null);
    var otherNodePlain2 = new Node_Literal(otherLitLabelPlain2);
    thisNode.equals(otherNodePlain2).should.be.false;

    // equality with other plain literal node with same language tag and same
    // literal value
    var otherLitLabelWLang1 = new LiteralLabel(litVal, litVal, litLang, null);
    var otherNodeWLang1 = new Node_Literal(otherLitLabelWLang1);
    thisNode.equals(otherNodeWLang1).should.be.true;

    // equality with other plain literal node with different language tag and
    // same literal value
    var otherLitLang = 'en';
    var otherLitLabelWLang2 = new LiteralLabel(litVal, litVal, otherLitLang, null);
    var otherNodeWLang2 = new Node_Literal(otherLitLabelWLang2);
    thisNode.equals(otherNodeWLang2).should.be.false;

    // equality with other plain literal node with different language tag and different
    // literal value
    var otherLitLabelWLang3 = new LiteralLabel(otherLitVal, otherLitVal, otherLitLang, null);
    var otherNodeWLang3 = new  Node_Literal(otherLitLabelWLang3);
    thisNode.equals(otherNodeWLang3).should.be.false;

    // equality with other typed literal node with same literal value
    var otherDTypeUri = 'http://www.w3.org/2001/XMLSchema#string';
    var otherDType = new BaseDatatype(otherDTypeUri);
    var otherTypedVal1 = new TypedValue(litVal, otherDTypeUri);
    var otherLitLabelTyped1 = new LiteralLabel(otherTypedVal1, litVal, null, otherDType);
    var otherNodeTyped1 = new Node_Literal(otherLitLabelTyped1);
    thisNode.equals(otherNodeTyped1).should.be.false;

    // equality with other typed literal node with different literal value
    var otherTypedVal2 = new TypedValue(otherLitVal, otherDType);
    var otherLitLabelTyped2 = new LiteralLabel(otherTypedVal2, otherLitVal, null, otherDType);
    var otherNodeTyped2 = new Node_Literal(otherLitLabelTyped2);
    thisNode.equals(otherNodeTyped2).should.be.false;

    // equality with other blank node
    var otherbNode = new Node_Blank(new AnonIdStr(litVal));
    thisNode.equals(otherbNode).should.be.false;

    // equality with other URI node
    var otherUriStr = 'http://ex.org/other';
    var otherUriNode = new Node_Uri(otherUriStr);
    thisNode.equals(otherUriNode).should.be.false;

    // equality with other node variable
    var otherNodeVar = new Var(litVal);
    thisNode.equals(otherNodeVar).should.be.false;
  });

  it('should determine equality with other nodes correctly in case it is typed', function() {
    var litVal = 'value';
    var dtypeURI = 'http://ex.org/dtype#string';
    var typedVal = new TypedValue(litVal, dtypeURI);
    var dtype = new BaseDatatype(dtypeURI);
    var litLabeltyped = new LiteralLabel(typedVal, litVal, null, dtype);
    var thisNode = new Node_Literal(litLabeltyped);

    // equality with itself
    thisNode.equals(thisNode).should.be.true;

    // equality with other plain literal node with same literal value
    var otherLitLabelPlain1 = new LiteralLabel(litVal, litVal, null, null);
    var otherNodePlain1 = new Node_Literal(otherLitLabelPlain1);
    thisNode.equals(otherNodePlain1).should.be.false;

    // equality with other plain literal node with different literal value
    var otherLitVal = 'something completely different';
    var otherLitLabelPlain2 = new LiteralLabel(otherLitVal, otherLitVal, null, null);
    var otherNodePlain2 = new Node_Literal(otherLitLabelPlain2);
    thisNode.equals(otherNodePlain2).should.be.false;

    // equality with other plain literal node with language tag and same
    // literal value
    var otherLitLang = 'en';
    var otherLitLabelWLang1 = new LiteralLabel(litVal, litVal, otherLitLang, null);
    var otherNodeWLang1 = new Node_Literal(otherLitLabelWLang1);
    thisNode.equals(otherNodeWLang1).should.be.false;

    // equality with other plain literal node with language tag and different
    // literal value
    var otherLitLabelWLang2 = new LiteralLabel(otherLitVal, otherLitVal, otherLitLang, null);
    var otherNodeWLang2 = new  Node_Literal(otherLitLabelWLang2);
    thisNode.equals(otherNodeWLang2).should.be.false;

    // equality with other typed literal node with same literal value and same dtype
    var otherTypedVal1 = new TypedValue(litVal, dtype);
    var otherLitLabelTyped1 = new LiteralLabel(otherTypedVal1, litVal, null, dtype);
    var otherNodeTyped1 = new Node_Literal(otherLitLabelTyped1);
    thisNode.equals(otherNodeTyped1).should.be.true;

    // equality with other typed literal node with same literal value but
    // different dtype
    var otherDTypeUri = 'http://www.w3.org/2001/XMLSchema#string';
    var otherDType = new BaseDatatype(otherDTypeUri);
    var otherTypedVal2 = new TypedValue(litVal, otherDTypeUri);
    var otherLitLabelTyped2 = new LiteralLabel(otherTypedVal2, litVal, null, otherDType);
    var otherNodeTyped2 = new Node_Literal(otherLitLabelTyped2);
    thisNode.equals(otherNodeTyped2).should.be.false;

    // equality with other typed literal node with different literal value and
    // different dtype
    var otherTypedVal3 = new TypedValue(otherLitVal, otherDType);
    var otherLitLabelTyped3 = new LiteralLabel(otherTypedVal3, otherLitVal, null, otherDType);
    var otherNodeTyped3 = new Node_Literal(otherLitLabelTyped3);
    thisNode.equals(otherNodeTyped3).should.be.false;

    // equality with other blank node
    var otherbNode = new Node_Blank(new AnonIdStr(litVal));
    thisNode.equals(otherbNode).should.be.false;

    // equality with other URI node
    var otherUriStr = 'http://ex.org/other';
    var otherUriNode = new Node_Uri(otherUriStr);
    thisNode.equals(otherUriNode).should.be.false;

    // equality with other node variable
    var otherNodeVar = new Var(litVal);
    thisNode.equals(otherNodeVar).should.be.false;
  });

  it('should state that it is concrete', function() {
    litNode.isConcrete().should.be.true;
  });
});

