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

var RdfDatatypeBase = require('../../lib/rdf/rdf_datatype/RdfDatatypeBase');

describe('RdfDatatypeBase', function() {
  var dtypeUri = 'http://www.w3.org/2001/XMLSchema#integer';
  var rdfDatatypeBase = new RdfDatatypeBase(dtypeUri);

  it('should return its URI correctly', function() {
    rdfDatatypeBase.getUri().should.equal(dtypeUri);
  })
});