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
var jassa = require('../../lib/index')(Promise, ajax);
// namespaces
var rdf = jassa.rdf;
var vocab = jassa.vocab;
var sparql = jassa.sparql;
var service = jassa.service;

var BaseDatatype = require('../../lib/rdf/base-datatype');
var TypedValue = require('../../lib/rdf/typed-value');

describe('Base datatype', function(){
  it('should initialize correctly', function() {
    var typeUri = 'http://ex.org/uberint';
    var datatypeString = 'Datatype [' + typeUri + ']';
    var baseDatatype = new BaseDatatype(typeUri);
    baseDatatype.getUri().should.equal(typeUri);
    baseDatatype.toString().should.equal(datatypeString);
  });

  it('should unparse correctly', function() {
    var someString = 'POIU';
    var someValue = {toString: function() { return someString; }};

    var val = 23;
    var typedValue = new TypedValue(val, 'http://ex.org/uberint');

    var baseDatatype = new BaseDatatype('http://ex.org/someType');
    baseDatatype.unparse(someValue).should.equal(someString);
    baseDatatype.unparse(typedValue).should.equal(val);
  });

  it ('sould parse correctly', function() {
    var typeUri = 'http://ex.org/uberint';
    var baseDatatype = new BaseDatatype(typeUri);
    var val = 23;
    var typedVal = new TypedValue(23, typeUri);
    baseDatatype.parse(val).should.eql(typedVal);
  });
});
