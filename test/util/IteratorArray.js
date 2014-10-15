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

var IteratorArray = require('../../lib/util/collection/IteratorArray');

describe('IteratorArray', function() {
  it('should initialize correctly', function() {
    var arr = [1, 2, 3, 4, 5];
    var offset = 4;
    var arrIt = new IteratorArray(arr, offset);

    arrIt.array.should.equal(arr);
    arrIt.offset.should.equal(offset);
  });

  it('should return its array correctly', function() {
    var arr = [1, 2, 3, 4, 5];
    var offset = 4;
    var arrIt = new IteratorArray(arr, offset);

    arrIt.getArray().should.equal(arr);
  });

  it('should determine whether it has a next value, correctly', function() {
    var arr = [1, 2, 3, 4];
    var offset1 = 2;
    var arrIt1 = new IteratorArray(arr, offset1);
    arrIt1.hasNext().should.be.true;

    var offset2 = 4;
    var arrIt2 = new IteratorArray(arr, offset2);
    arrIt2.hasNext().should.be.false;
  });

  it('should return its correct next value', function() {
    var arr = [1, 2, 3, 4];
    var offset = 2;
    var arrIt = new IteratorArray(arr, offset);

    arrIt.next().should.equal(3);
    arrIt.next().should.equal(4);
    (arrIt.next() == null).should.be.true;
  })
});