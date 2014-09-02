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

var DatatypeLabelString = require('../../lib/rdf/datatype/DatatypeLabelString');

describe('DatatypeLabelString', function() {
  it('should \'parse\' string values correctly', function() {
    // even though this test is completely stupid...
    var dtypeLabelString = new DatatypeLabelString();

    var strVal = 'a string value';
    var resVal = dtypeLabelString.parse(strVal);
    resVal.should.equal(strVal);
  });

  it('should unparse string values correctly', function() {
    var dtypeLabelString = new DatatypeLabelString();

    var strVal = 'string value';
    var unparsedStrVal = 'string value';

    var resVal = dtypeLabelString.unparse(strVal);
    resVal.should.equal(unparsedStrVal);
  });
});