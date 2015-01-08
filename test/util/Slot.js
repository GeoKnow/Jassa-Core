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

var Slot = require('../../lib/util/Slot');

describe('Slot', function() {
  // initialize
  it('should initialize correctly', function() {
    var obj = {};
    var attr = 'foo';
    var meta = 123;

    var slot = new Slot(obj, attr, meta);
    slot.should.have.ownProperty('obj').equal(obj);
    slot.should.have.ownProperty('attr').equal(attr);
    slot.should.have.ownProperty('meta').equal(meta);
  });

  // setValue
  it('should set an attribute value correctly', function() {
    var obj = {};
    var attr = 'foo';
    var attrVal1 = 'val1';
    var attrVal2 = 'val2';
    var meta = 123;

    var slot = new Slot(obj, attr, meta);
    slot.setValue(attrVal1);
    slot.obj.should.have.ownProperty(attr).equal(attrVal1);

    slot.setValue(attrVal2);
    slot.obj.should.have.ownProperty(attr).equal(attrVal2);
  });

  // getValue
  it('should return the object\'s value correctly', function() {
    var obj = {};
    var attr = 'foo';
    var attrVal1 = 'val1';
    var attrVal2 = 'val2';
    var meta = 123;

    var slot = new Slot(obj, attr, meta);
    (slot.getValue() === undefined).should.be.true;

    slot.setValue(attrVal1);
    slot.getValue().should.equal(attrVal1);

    slot.setValue(attrVal2);
    slot.getValue().should.equal(attrVal2);
  });

  // getMeta
  it('should return the object\'s meta information correctly', function() {
    var obj = {};
    var attr = 'foo';
    var meta = 123;

    var slot = new Slot(obj, attr, meta);
    slot.getMeta().should.equal(meta);
  });

  // toString
  it('should serialize itself correctly', function() {
    var obj = {};
    var attr = 'foo';
    var attrVal = 'bar';
    var meta = 123;

    var expctdJSONStr1 = '{"obj":{},"attr":"foo","meta":123}';
    var expctdJSONStr2 = '{"obj":{"foo":"bar"},"attr":"foo","meta":123}';

    var slot = new Slot(obj, attr, meta);
    slot.toString().should.equal(expctdJSONStr1);

    slot.setValue(attrVal);
    slot.toString().should.equal(expctdJSONStr2);
  });
});