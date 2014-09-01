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

var HashBidiMap = require('../../lib/util/collection/HashBidiMap');

describe('HashBidiMap', function() {
  // hash function that returns the string representation of the length of the
  // input's string representation: 'lala' -> '4', 'a' -> '1', 'bb' -> 2
  var testHashFn = function(key) { return key.toString().length.toString() };
  var testEqlFn = function(item1, item2) {
    return item1.toString() === item2.toString();
  };

  it('should return its inverse map correctly', function() {
    var inverseBidiMap = new HashBidiMap(testEqlFn, testHashFn);
    var bidiMap = new HashBidiMap(testEqlFn, testHashFn, inverseBidiMap);

    bidiMap.getInverse().should.equal(inverseBidiMap);
  });

  it('should add new items correctly', function() {
    var inverseBidiMap = new HashBidiMap(testEqlFn, testHashFn);
    var bidiMap = new HashBidiMap(testEqlFn, testHashFn, inverseBidiMap);
    var key1 = 'aaa';
    var key1Hash = '3';
    var val1 = 'value 1';
    var val1Hash = '7';

    bidiMap.put(key1, val1);
    bidiMap.forward.hashToBucket[key1Hash].should.have.length(1);
    bidiMap.forward.hashToBucket[key1Hash][0].key.should.equal(key1);
    bidiMap.forward.hashToBucket[key1Hash][0].val.should.equal(val1);

    inverseBidiMap.forward.hashToBucket[val1Hash].should.have.length(1);
    inverseBidiMap.forward.hashToBucket[val1Hash][0].key.should.equal(val1);
    inverseBidiMap.forward.hashToBucket[val1Hash][0].val.should.equal(key1);

    var key2 = 'bbb';
    var key2Hash = '3';
    var val2 = 'value two';
    var val2Hash = '9';

    bidiMap.put(key2, val2);
    bidiMap.forward.hashToBucket[key2Hash].should.have.length(2);
    bidiMap.forward.hashToBucket[key2Hash][1].key.should.equal(key2);
    bidiMap.forward.hashToBucket[key2Hash][1].val.should.equal(val2);

    inverseBidiMap.forward.hashToBucket[val2Hash].should.have.length(1);
    inverseBidiMap.forward.hashToBucket[val2Hash][0].key.should.equal(val2);
    inverseBidiMap.forward.hashToBucket[val2Hash][0].val.should.equal(key2);
  });

  it('should remove items correctly', function() {
    var inverseBidiMap = new HashBidiMap(testEqlFn, testHashFn);
    var bidiMap = new HashBidiMap(testEqlFn, testHashFn, inverseBidiMap);
    var key1 = 'aaa';
    var key1Hash = '3';
    var val1 = 'value 1';
    var val1Hash = '7';

    bidiMap.put(key1, val1);
    bidiMap.forward.hashToBucket[key1Hash].should.have.length(1);
    inverseBidiMap.forward.hashToBucket[val1Hash].should.have.length(1);

    var key2 = 'bbb';
    var key2Hash = '3';
    var val2 = 'value two';
    var val2Hash = '9';

    bidiMap.put(key2, val2);
    bidiMap.forward.hashToBucket[key2Hash].should.have.length(2);
    inverseBidiMap.forward.hashToBucket[val2Hash].should.have.length(1);

    bidiMap.remove(key1);
    bidiMap.forward.hashToBucket[key2Hash].should.have.length(1);
    bidiMap.forward.hashToBucket[key2Hash][0].key.should.equal(key2);
    bidiMap.forward.hashToBucket[key2Hash][0].val.should.equal(val2);
    inverseBidiMap.forward.hashToBucket[val1Hash].should.be.empty;
    inverseBidiMap.forward.hashToBucket[val2Hash].should.have.length(1);
    inverseBidiMap.forward.hashToBucket[val2Hash][0].key.should.equal(val2);
    inverseBidiMap.forward.hashToBucket[val2Hash][0].val.should.equal(key2);

    bidiMap.remove(key2);
    bidiMap.forward.hashToBucket[key2Hash].should.be.empty;
    inverseBidiMap.forward.hashToBucket[val1Hash].should.be.empty;
    inverseBidiMap.forward.hashToBucket[val2Hash].should.be.empty;
  });

  it('should return its forward map correctly', function() {
    var inverseBidiMap = new HashBidiMap(testEqlFn, testHashFn);
    var bidiMap = new HashBidiMap(testEqlFn, testHashFn, inverseBidiMap);
    bidiMap.getMap().should.equal(bidiMap.forward);
  });

  it('should return the correct value given a key', function() {
    var inverseBidiMap = new HashBidiMap(testEqlFn, testHashFn);
    var bidiMap = new HashBidiMap(testEqlFn, testHashFn, inverseBidiMap);

    var key1 = 'aaa';
    var val1 = 'value 1';
    bidiMap.put(key1, val1);

    var key2 = 'bbb';
    var val2 = 'value two';
    bidiMap.put(key2, val2);

    bidiMap.get(key1).should.equal(val1);
    bidiMap.get(key2).should.equal(val2);
  });

  it('should return the correct set of keys', function() {
    var inverseBidiMap = new HashBidiMap(testEqlFn, testHashFn);
    var bidiMap = new HashBidiMap(testEqlFn, testHashFn, inverseBidiMap);

    var key1 = 'aaa';
    var val1 = 'value 1';
    bidiMap.put(key1, val1);

    var key2 = 'bbb';
    var val2 = 'value two';
    bidiMap.put(key2, val2);

    var keyList = bidiMap.keyList();
    keyList.should.have.length(2);
    keyList.should.containEql(key1);
    keyList.should.containEql(key2);
  });
});