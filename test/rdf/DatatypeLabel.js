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

var DatatypeLabel = require('../../lib/rdf/datatype/DatatypeLabel');

describe('DatatypeLabel', function() {
  it('should throw an error if its parse method is called', function() {
    var dtypeLabel = new DatatypeLabel();
    dtypeLabel.parse.bind(dtypeLabel).should.throw('Not implemented');
  });

  it('should throw an error if its unparse method is called', function() {
    var dtypeLabel = new DatatypeLabel();
    dtypeLabel.unparse.bind(dtypeLabel).should.throw('Not implemented');
  });
});