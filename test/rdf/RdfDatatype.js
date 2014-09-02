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

var RdfDatatype = require('../../lib/rdf/rdf_datatype/RdfDatatype');

describe('RdfDatatype', function() {
  var rdfDatatype = new RdfDatatype();

  it('should throw an error if its getUri method is called', function() {
    rdfDatatype.getUri.bind(rdfDatatype).should.throw('Not implemented');
  });

  it('should throw an error if its unparse method is called', function() {
    rdfDatatype.unparse.bind(rdfDatatype).should.throw('Not implemented');
  });

  it('should throw an error if its parse function is called', function() {
    rdfDatatype.parse.bind(rdfDatatype).should.throw('Not implemented');
  });
});