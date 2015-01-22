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

var SetUtils = require('../../lib/util/SetUtils');
var HashSet = require('../../lib/util/collection/HashSet');

describe('SetUtils', function() {
  // arrayToSet
  it('should convert an array to set correctly', function() {
    var arr = [1, 2, 3, 4, 4, 5];
    var set = SetUtils.arrayToSet(arr);
    set.size().should.equal(5);
    set.should.containEql(1);
    set.should.containEql(2);
    set.should.containEql(3);
    set.should.containEql(4);
    set.should.containEql(5);
    set.should.be.instanceOf(HashSet);
  });
});