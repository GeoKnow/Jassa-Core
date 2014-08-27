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

var RdfDatatypeLabel = require('../../lib/rdf/rdf_datatype/RdfDatatypeLabel');

var DatatypeLabelInteger = require('../../lib/rdf/datatype/DatatypeLabelInteger');

describe('RdfDatatypeLabel', function() {
  var dtypeLabelInteger = new DatatypeLabelInteger();
  var dtypeUri = 'http://www.w3.org/2001/XMLSchema#integer';
  var rdfDatatypeLabel = new RdfDatatypeLabel(dtypeUri, dtypeLabelInteger);

  it('should parse values correctly', function() {
    var val = '23';
    var parsedVal = 23;
    rdfDatatypeLabel.parse(val).should.equal(parsedVal);
  });

  it('should unparse values correctly', function() {
    var val = '23';
    var parsedVal = 23;
    rdfDatatypeLabel.unparse(parsedVal).should.equal(val);
  });
});