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

var Entry = require('../../lib/util/collection/Entry');

describe('Entry', function() {
  var key = 'abc';
  var value = 234;
  var entry = new Entry(key, value);

  it('should return its key correctly', function() {
    entry.getKey().should.equal(key);
  });

  it('should return its value correctly', function() {
    entry.getValue().should.equal(value);
  });

  it('should be stringified correctly', function() {
    var entryStr = key + '->' + value;
    entry.toString().should.equal(entryStr);
  });
});