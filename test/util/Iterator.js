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

var Iterator = require('../../lib/util/collection/Iterator');

describe('Iterator', function() {
  var iterator = new Iterator();

  it('should throw an error if next method is called', function() {
    iterator.next.bind(iterator).should.throw('Not overridden');
  });

  it('should throw an error if hasNext method is called', function() {
    iterator.hasNext.bind(iterator).should.throw('Not overridden');
  });
});