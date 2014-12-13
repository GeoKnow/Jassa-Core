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

var HashSet = require('../../lib/util/collection/HashSet');

describe('HashSet', function() {
  // hash function that returns the string representation of the length of the
  // input's string representation: 'lala' -> '4', 'a' -> '1', 'bb' -> 2
  var testHashFn = function(key) { return key.toString().length.toString() };
  var testEqlFn = function(item1, item2) {
    return item1.toString() === item2.toString();
  };

  it('should add new items correctly', function() {
    var hashSet = new HashSet(testEqlFn, testHashFn);
    var itemHash = '2';

    var item1 = 'aa';
    hashSet.add(item1);
    hashSet._map.hashToBucket.should.have.keys(itemHash);
    hashSet._map.hashToBucket[itemHash].should.have.length(1);
    hashSet._map.hashToBucket[itemHash][0].key.should.equal(item1);
    hashSet._map.hashToBucket[itemHash][0].val.should.equal(true);

    var item2 = 'bb';
    hashSet.add(item2);
    hashSet._map.hashToBucket[itemHash].should.have.length(2);
    hashSet._map.hashToBucket[itemHash][1].key.should.equal(item2);
    hashSet._map.hashToBucket[itemHash][1].val.should.equal(true);
  });

  it('should determine correctly whether it contains a given item', function() {
    var hashSet = new HashSet(testEqlFn, testHashFn);
    var item1 = 'aa';
    hashSet.add(item1);

    hashSet.contains(item1).should.be.true;
    hashSet.contains('notAnItem').should.be.false;
  });

  it('should remove an item correctly', function() {
    var hashSet = new HashSet(testEqlFn, testHashFn);
    var item1and2Hash = '2';
    var item1 = 'aa';
    hashSet.add(item1);
    var item2 = 'bb';
    hashSet.add(item2);
    var item3Hash = '3';
    var item3 = 'ccc';
    hashSet.add(item3);

    // briefly check if items are added correctly
    hashSet._map.hashToBucket.should.have.keys(item1and2Hash, item3Hash);
    hashSet._map.hashToBucket[item1and2Hash].should.have.length(2);
    hashSet._map.hashToBucket[item3Hash].should.have.length(1);

    // nothing should be deleted
    hashSet.remove('notAnItem');

    hashSet._map.hashToBucket.should.have.keys(item1and2Hash, item3Hash);
    hashSet._map.hashToBucket[item1and2Hash].should.have.length(2);
    hashSet._map.hashToBucket[item3Hash].should.have.length(1);

    // delete item1
    hashSet.remove(item1);
    hashSet._map.hashToBucket.should.have.keys(item1and2Hash, item3Hash);
    hashSet._map.hashToBucket[item1and2Hash].should.have.length(1);
    hashSet._map.hashToBucket[item1and2Hash][0].key.should.equal(item2);
    hashSet._map.hashToBucket[item1and2Hash][0].val.should.equal(true);
    hashSet._map.hashToBucket[item3Hash].should.have.length(1);
    hashSet._map.hashToBucket[item3Hash][0].key.should.equal(item3);
    hashSet._map.hashToBucket[item3Hash][0].val.should.equal(true);

    // delete item2
    hashSet.remove(item2);
    hashSet._map.hashToBucket.should.have.keys(item3Hash);
    //hashSet._map.hashToBucket[item1and2Hash].should.have.length(0);
    hashSet._map.hashToBucket[item3Hash].should.have.length(1);
    hashSet._map.hashToBucket[item3Hash][0].key.should.equal(item3);
    hashSet._map.hashToBucket[item3Hash][0].val.should.equal(true);

    // delete item3
    hashSet.remove(item3);
    //hashSet._map.hashToBucket.should.have.keys(item1and2Hash, item3Hash);
    //hashSet._map.hashToBucket[item1and2Hash].should.have.length(0);
    //hashSet._map.hashToBucket[item3Hash].should.have.length(0);
  });

  it('should return all its entries correctly', function() {
    var hashSet = new HashSet(testEqlFn, testHashFn);
    var item1 = 'aa';
    hashSet.add(item1);
    var item2 = 'bb';
    hashSet.add(item2);
    var item3 = 'ccc';
    hashSet.add(item3);

    var entries = hashSet.entries();
    entries.should.have.length(3);
    entries.should.containEql(item1);
    entries.should.containEql(item2);
    entries.should.containEql(item3);
  });

  it('should be stringified correctly', function() {
    var hashSet = new HashSet(testEqlFn, testHashFn);
    var item1and2Hash = '2';
    var item1 = 'aa';
    hashSet.add(item1);
    var item2 = 'bb';
    hashSet.add(item2);
    var item3Hash = '3';
    var item3 = 'ccc';
    hashSet.add(item3);

    var expctdStr = '{' + item1 + ', ' + item2 + ', ' + item3 + '}';
    hashSet.toString().should.equal(expctdStr);
  });
});