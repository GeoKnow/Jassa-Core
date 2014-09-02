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

var DatatypeLabelInteger = require('../../lib/rdf/datatype/DatatypeLabelInteger');

describe('DatatypeLabelInteger', function() {
  it('should parse string values correctly', function() {
    var dtypeLabelInt = new DatatypeLabelInteger();

    var intValStr1 = '23';
    var intVal1 = 23;
    var resVal1 = dtypeLabelInt.parse(intValStr1);
    resVal1.should.equal(intVal1);

    var floatValStr = '123.456';
    var intVal2 = 123;
    var resVal2 = dtypeLabelInt.parse(floatValStr);
    resVal2.should.equal(intVal2);

    var notAnIntValStr = 'I\'m an integer value';
    var resVal3 = dtypeLabelInt.parse(notAnIntValStr);
    resVal3.should.be.NaN;
  });

  it('should unparse integer values correctly', function() {
    var dtypeLabelInt = new DatatypeLabelInteger();

    var intVal = 23;
    var intValStr = '23';

    var resValStr = dtypeLabelInt.unparse(intVal);
    resValStr.should.equal(intValStr);
  })
});