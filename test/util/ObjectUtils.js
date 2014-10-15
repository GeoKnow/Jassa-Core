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

var ObjectUtils = require('../../lib/util/ObjectUtils');

describe('ObjectUtils', function() {
  var someObj = {};
  var someFunc = function() {};
  var someNumber = 23;
  var someString = 'some string';

  it('should determine correctly whether an input object is of object ' +
      'type', function() {
    ObjectUtils.isObject(someObj).should.be.true;
    ObjectUtils.isObject(someFunc).should.be.true;
    ObjectUtils.isObject(someNumber).should.be.false;
    ObjectUtils.isObject(someString).should.be.false;
  });

  it('should determine correctly whether an input object is a function', function() {
    ObjectUtils.isFunction(someObj).should.be.false;
    ObjectUtils.isFunction(someFunc).should.be.true;
    ObjectUtils.isFunction(someNumber).should.be.false;
    ObjectUtils.isFunction(someString).should.be.false;
  });

  it('should determine correctly whether an input object is a string', function() {
    ObjectUtils.isString(someObj).should.be.false;
    ObjectUtils.isString(someFunc).should.be.false;
    ObjectUtils.isString(someNumber).should.be.false;
    ObjectUtils.isString(someString).should.be.true;
  });

  it('should extend an input object correctly', function() {
    var prop1Val = 'property one';
    var prop2Val = 'property two';
    var func1Val = 'function 1';
    var func2Val = 'function 2';

    var sourceObj = {
      prop1: prop1Val,
      prop2: prop2Val,
      func1: function() {
        return func1Val;
      },
      func2: function() {
        return func2Val;
      }
    };

    var targetObj = {};

    ObjectUtils.extend(targetObj, sourceObj);
    targetObj.should.have.keys('prop1', 'prop2', 'func1', 'func2');
    targetObj.prop1.should.equal(prop1Val);
    targetObj.prop2.should.equal(prop2Val);
    targetObj.func1().should.equal(func1Val);
    targetObj.func2().should.equal(func2Val);
  });

  it('should determine correctly whether two objects are equal', function() {
    // empty objects and constants
    ObjectUtils.isEqual(null, null).should.be.true;
    ObjectUtils.isEqual([], []).should.be.true;
    ObjectUtils.isEqual({}, {}).should.be.true;
    ObjectUtils.isEqual('', '').should.be.true;
    ObjectUtils.isEqual(0, 0).should.be.true;

    ObjectUtils.isEqual(someFunc, someFunc).should.be.true;

    // combinations of things that should not be equal
    ObjectUtils.isEqual(null, '').should.be.false;
    ObjectUtils.isEqual(null, 0).should.be.false;
    ObjectUtils.isEqual(null, []).should.be.false;
    ObjectUtils.isEqual({}, []).should.be.false;
    ObjectUtils.isEqual(5, '5').should.be.false;
    ObjectUtils.isEqual(someFunc, someObj).should.be.false;
    ObjectUtils.isEqual(someObj, someString).should.be.false;
  });

  it('should calculate an object\'s default hash correctly', function() {
    var objHashVal = '23';
    var objWHashFunc = {
      hashCode: function() {
        return objHashVal;
      }
    };
    ObjectUtils.defaultHashCode(objWHashFunc).should.equal(objHashVal);

    var objToStrVal = 'just a string';
    var objWOHashFunc = {
      toString: function() {
        return objToStrVal;
      }
    };
    ObjectUtils.defaultHashCode(objWOHashFunc).should.equal(objToStrVal);
  });

  it('should return an input object correctly', function() {
    var someObj = {};
    ObjectUtils.identity(someObj).should.equal(someObj);
    ObjectUtils.identity(5).should.equal(5);
  });

  it('should return the hash code of an input object correctly', function() {
    var childObj = {hashCode: function() {return '23'}};
    // "23"
    childObj.hashCode().should.equal('23');

    var parentObj = {a: 23, foo: 'bar', tt: childObj};
    // "{\"a\":23,\"foo\":\"bar\",\"tt\":\"23\"}"
    var expectedHash = '{\"a\":23,\"foo\":\"bar\",\"tt\":\"23\"}';
    ObjectUtils.hashCode(parentObj).should.equal(expectedHash);
  });
});