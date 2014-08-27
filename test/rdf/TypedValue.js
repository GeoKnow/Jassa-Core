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

var TypedValue = require('../../lib/rdf/rdf_datatype/TypedValue');

describe('TypedValue', function() {
  var lexicalVal = '23';
  var dtypeUri = 'http://www.w3.org/2001/XMLSchema#integer';
  var typedVal = new TypedValue(lexicalVal, dtypeUri);

  it('should return its lexical value correctly', function() {
    typedVal.getLexicalValue().should.equal(lexicalVal);
  });

  it('should return its datatype URI correctly', function() {
    typedVal.getDatatypeUri().should.equal(dtypeUri);
  });
});