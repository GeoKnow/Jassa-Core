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

var DatatypeLabelFloat = require('../../lib/rdf/datatype/DatatypeLabelFloat');

describe('DatatypeLabelFloat', function() {
  it('should parse string values correctly', function() {
    var dtypeLabelFloat = new DatatypeLabelFloat();

    var floatStr1 = '23';
    var float1 = 23.0;

    var resFloat1 = dtypeLabelFloat.parse(floatStr1);
    resFloat1.should.equal(float1);

    var floatStr2 = '0.345678';
    var float2 = 0.345678;

    var resFloat2 = dtypeLabelFloat.parse(floatStr2);
    resFloat2.should.equal(float2);

    var notAFloatStr = 'I\'m not a float!!!';

    var resNotAFloat = dtypeLabelFloat.parse(notAFloatStr);
    resNotAFloat.should.be.NaN;
  });

  it('should unparse float values correctly', function() {
    var dtypeLabelFloat = new DatatypeLabelFloat();

    var float = 1.23456;
    var floatStr = '1.23456';

    var resFloatStr = dtypeLabelFloat.unparse(float);
    resFloatStr.should.equal(floatStr);
  });
});