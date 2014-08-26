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

var TypeMapper = require('../../lib/rdf/TypeMapper');

var DatatypeLabelInteger = require('../../lib/rdf/datatype/DatatypeLabelInteger');
var DatatypeLabelString = require('../../lib/rdf/datatype/DatatypeLabelString');
var DatatypeLabelFloat = require('../../lib/rdf/datatype/DatatypeLabelFloat');
var BaseDatatype = require('../../lib/rdf/rdf_datatype/BaseDatatype');
var DefaultRdfDatatypes = require('../../lib/rdf/rdf_datatype/DefaultRdfDatatypes');

describe('TypeMapper', function() {
  var uriToDT = {};

  var intUri = 'http://www.w3.org/2001/XMLSchema#int';
  var intDType = new DatatypeLabelInteger();
  uriToDT[intUri] = intDType;

  var strUri = 'http://www.w3.org/2001/XMLSchema#string';
  var strDType = new DatatypeLabelString();
  uriToDT[strUri] = strDType;

  it('should return the correct type given a datatype URI', function() {
    var typeMapper = new TypeMapper(uriToDT);

    var dtype = typeMapper.getSafeTypeByName(intUri);
    dtype.should.equal(intDType);

    dtype = typeMapper.getSafeTypeByName(strUri);
    dtype.should.equal(strDType);
  });

  it('should generate a new basic datatype if configured so', function() {
    var unknwnUri = 'http://ex.org/someType';
    var unknwnDType = new BaseDatatype(unknwnUri);
    var typeMapper = new TypeMapper(uriToDT);

    /*
     * TODO: this behaviour depends on the boolean
     * JenaParameters.enableSilentAcceptanceOfUnknownDatatypes which is not
     * exposed and thus *assumed* to be set to true
     */
    var dtype = typeMapper.getSafeTypeByName(unknwnUri);
    dtype.should.eql(unknwnDType);
    uriToDT.should.have.ownProperty(unknwnUri).eql(unknwnDType);
  });

  it('should register new datatypes correctly', function() {
    var floatUri = 'http://www.w3.org/2001/XMLSchema#float';
    var floatDType = new BaseDatatype(floatUri);
    var typeMapper = new TypeMapper(uriToDT);

    typeMapper.registerDatatype(floatDType);
    uriToDT.should.have.ownProperty(floatUri).eql(floatDType);
    typeMapper.getSafeTypeByName(floatUri).should.equal(floatDType);
  });

  it('should be retrievable as singleton', function() {
    var typeMapper1 = TypeMapper.getInstance();
    var typeMapper2 = TypeMapper.getInstance();
    typeMapper1.should.equal(typeMapper2);

    var typeMapper3 = new TypeMapper(DefaultRdfDatatypes);
    typeMapper3.should.not.equal(typeMapper2);
  })
});