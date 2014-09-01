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

var ListMap = require('../../lib/util/collection/ListMap');

describe('ListMap', function() {
  // hash function that returns the string representation of the length of the
  // input's string representation: 'lala' -> '4', 'a' -> '1', 'bb' -> 2
  var testHashFn = function(key) { return key.toString().length.toString() };
  var testEqlFn = function(item1, item2) {
    return item1.toString() === item2.toString();
  };

  it('should add new values correctly', function() {
    var listMap = new ListMap(testEqlFn, testHashFn);

    listMap.map.hashToBucket.should.be.empty;

    var key1 = 'aaa';
    var key1Hash = '3';
    var val1 = 'value 1';

    listMap.put(key1, val1);
    listMap.map.hashToBucket[key1Hash].should.have.length(1);
    listMap.map.hashToBucket[key1Hash][0].key.should.equal(key1);
    listMap.map.hashToBucket[key1Hash][0].val.should.equal(val1);

    var key2 = 'bbb';
    var key2Hash = '3';
    var val2 = 'value 2';

    listMap.put(key2, val2);
    listMap.map.hashToBucket[key2Hash].should.have.length(2);
    listMap.map.hashToBucket[key2Hash][1].key.should.equal(key2);
    listMap.map.hashToBucket[key2Hash][1].val.should.equal(val2);

    // throw error when key already exists
    listMap.put.bind(listMap, key1, val1).should.throw('Key ' + key1 +
        ' already inserted');
  });

  it('should return the correct value of a given key', function() {
    var listMap = new ListMap(testEqlFn, testHashFn);

    var key1 = 'aaa';
    var val1 = 'value 1';
    listMap.put(key1, val1);

    var key2 = 'bbb';
    var val2 = 'value 2';
    listMap.put(key2, val2);

    listMap.get(key1).should.equal(val1);
    listMap.get(key2).should.equal(val2);
  });

  it('should return the correct value of a given index', function() {
    var listMap = new ListMap(testEqlFn, testHashFn);

    var key1 = 'aaa';
    var val1 = 'value 1';
    listMap.put(key1, val1);

    var key2 = 'bbb';
    var val2 = 'value 2';
    listMap.put(key2, val2);

    listMap.getByIndex(0).should.equal(val1);
    listMap.getByIndex(1).should.equal(val2);
  });

  it('should return its entries correctly', function() {
    var listMap = new ListMap(testEqlFn, testHashFn);

    var key1 = 'aaa';
    var val1 = 'value 1';
    listMap.put(key1, val1);

    var key2 = 'bbb';
    var val2 = 'value 2';
    listMap.put(key2, val2);

    var entries = listMap.entries();
    entries.should.have.length(2);
    entries[0].key.should.equal(key1);
    entries[0].val.should.equal(val1);

    entries[1].key.should.equal(key2);
    entries[1].val.should.equal(val2);
  });

  it('should remove entries correctly', function() {
    var listMap = new ListMap(testEqlFn, testHashFn);

    var keyHash = '3';
    var key1 = 'aaa';
    var val1 = 'value 1';
    listMap.put(key1, val1);

    var key2 = 'bbb';
    var val2 = 'value 2';
    listMap.put(key2, val2);

    listMap.map.hashToBucket[keyHash].should.have.length(2);
    listMap.map.hashToBucket[keyHash][0].key.should.equal(key1);
    listMap.map.hashToBucket[keyHash][0].val.should.equal(val1);
    listMap.map.hashToBucket[keyHash][1].key.should.equal(key2);
    listMap.map.hashToBucket[keyHash][1].val.should.equal(val2);

    listMap.remove(key1);
    listMap.map.hashToBucket[keyHash].should.have.length(1);
    listMap.map.hashToBucket[keyHash][0].key.should.equal(key2);
    listMap.map.hashToBucket[keyHash][0].val.should.equal(val2);

    listMap.remove(key2);
    listMap.map.hashToBucket[keyHash].should.be.empty;
  });

  it('should remove entries by index correctly', function() {
    var listMap = new ListMap(testEqlFn, testHashFn);

    var keyHash = '3';
    var key1 = 'aaa';
    var val1 = 'value 1';
    listMap.put(key1, val1);

    var key2 = 'bbb';
    var val2 = 'value 2';
    listMap.put(key2, val2);

    listMap.map.hashToBucket[keyHash].should.have.length(2);
    listMap.map.hashToBucket[keyHash][0].key.should.equal(key1);
    listMap.map.hashToBucket[keyHash][0].val.should.equal(val1);
    listMap.map.hashToBucket[keyHash][1].key.should.equal(key2);
    listMap.map.hashToBucket[keyHash][1].val.should.equal(val2);

    listMap.removeByIndex(0);
    listMap.map.hashToBucket[keyHash].should.have.length(1);
    listMap.map.hashToBucket[keyHash][0].key.should.equal(key2);
    listMap.map.hashToBucket[keyHash][0].val.should.equal(val2);

    listMap.removeByIndex(0);
    listMap.map.hashToBucket[keyHash].should.be.empty;
  });

  it('should return its correct key list', function() {
    var listMap = new ListMap(testEqlFn, testHashFn);

    var key1 = 'aaa';
    var val1 = 'value 1';
    listMap.put(key1, val1);

    var key2 = 'bbb';
    var val2 = 'value 2';
    listMap.put(key2, val2);

    var keyList = listMap.keyList();
    keyList.should.have.length(2);
    keyList[0].should.equal(key1);
    keyList[1].should.equal(key2);
  });

  it('should return its correct size', function() {
    var listMap = new ListMap(testEqlFn, testHashFn);

    var key1 = 'aaa';
    var val1 = 'value 1';
    listMap.put(key1, val1);

    var key2 = 'bbb';
    var val2 = 'value 2';
    listMap.put(key2, val2);

    listMap.size().should.equal(2);
  });
});