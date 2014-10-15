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

var JsonUtils = require('../../lib/util/JsonUtils');
var JSONCanonical = require('../../lib/ext/JSONCanonical');

describe('JsonUtils', function() {
  it('should stringify an object correctly', function() {
    var someObj = {foo: 'bar'};
    var expctdStr = JSONCanonical.stringify(someObj);
    someObj.baz = someObj;

    JsonUtils.stringifyCyclic(someObj).should.equal(expctdStr);
  });
});