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

var HashMap = require('../../lib/util/collection/HashMap');

describe('HashMap', function() {
  // hash function that returns the string representation of the length of the
  // input's string representation: 'lala' -> '4', 'a' -> '1', 'bb' -> 2
  var testHashFn = function(key) { return key.toString().length.toString() };
  var testEqlFn = function(item1, item2) {
    return item1.toString() === item2.toString();
  };

  it('should add key value pairs correctly', function() {
    /* test strategy:
     * 1) add first item
     * 2) add second item
     * 3) update first item
     * 4) add second item to an existing hash bucket
     */
    var hashMap = new HashMap(testEqlFn, testHashFn);

    // 1)
    var key1 = 'aaa';
    var key1Hash = '3';
    var value1 = 'value 1';
    hashMap.put(key1, value1);

    // there should be a bucket for the key hash
    hashMap.hashToBucket.should.have.ownProperty(key1Hash);
    // there should be only one bucket
    hashMap.hashToBucket.should.have.keys(key1Hash);
    // the bucket should have only one entry
    hashMap.hashToBucket[key1Hash].should.have.length(1);
    // this one entry should hold key1 as key
    hashMap.hashToBucket[key1Hash][0].key.should.equal(key1);
    // this one entry should hold value1 as value
    hashMap.hashToBucket[key1Hash][0].val.should.equal(value1);

    // 2)
    var key2 = 'bb';
    var key2Hash = '2';
    var value2 = 'value 2';
    hashMap.put(key2, value2);

    // there should be a bucket for the key hash
    hashMap.hashToBucket.should.have.ownProperty(key2Hash);
    // now, there should be two buckets
    hashMap.hashToBucket.should.have.keys([key1Hash, key2Hash]);
    // the bucket should have only one entry
    hashMap.hashToBucket[key2Hash].should.have.length(1);
    // this entry should hold key2 as key
    hashMap.hashToBucket[key2Hash][0].key.should.equal(key2);
    // this entry should hold value2 as value
    hashMap.hashToBucket[key2Hash][0].val.should.equal(value2);

    // 3)
    var value3 = 'value 3';
    hashMap.put(key1, value3);

    // there should still be a bucket for the key hash
    hashMap.hashToBucket.should.have.ownProperty(key1Hash);
    // there should still be two buckets
    hashMap.hashToBucket.should.have.keys(key1Hash, key2Hash);
    // the bucket should still have only one entry
    hashMap.hashToBucket[key1Hash].should.have.length(1);
    // this one entry should hold key1 as key
    hashMap.hashToBucket[key1Hash][0].key.should.equal(key1);
    // this one entry should hold value3 as value
    hashMap.hashToBucket[key1Hash][0].val.should.equal(value3);

    // 4)
    var key4 = 'cc';
    var key4Hash = '2';
    var value4 = 'value 4';
    hashMap.put(key4, value4);

    // there should still be a bucket for the key hash
    hashMap.hashToBucket.should.have.ownProperty(key4Hash);
    // there should still be only the two buckets
    hashMap.hashToBucket.should.have.keys(key1Hash, key2Hash);
    // the bucket should now have two entries
    hashMap.hashToBucket[key4Hash].should.have.length(2);
    // the newly appended entry should hold key4 as key
    hashMap.hashToBucket[key4Hash][1].key.should.equal(key4);
    // the newly appended entry should hold value4 as value
    hashMap.hashToBucket[key4Hash][1].val.should.equal(value4);
  });

  it('should add another hash map of entries correctly', function() {
    var targetHashMap = new HashMap(testEqlFn, testHashFn);
    var key1 = 'aa';
    var val1 = 'value 1';
    targetHashMap.put(key1, val1);

    // fill hash map to add with values (there are two 'key groups' that have
    // the same key hash)
    var addHashMap = new HashMap(testEqlFn, testHashFn);
    var key2 = 'bb';
    var val2 = 'value 2';
    addHashMap.put(key2, val2);
    var key3 = 'cc';
    var val3 = 'value 3';
    addHashMap.put(key3, val3);
    var keyGroup1Hash = '2';

    var key4 = 'ddd';
    var val4 = 'value 4';
    addHashMap.put(key4, val4);
    var key5 = 'eee';
    var val5 = 'value 5';
    addHashMap.put(key5, val5);
    var keyGroup2Hash = '3';

    targetHashMap.putAll(addHashMap);
    // the hashes for both 'key groups' were added
    targetHashMap.hashToBucket.should.have.keys([keyGroup1Hash, keyGroup2Hash]);
    // the first 'key group' has 3 entries:
    // [ { key: 'aa', val: 'value 1' },
    //   { key: 'bb', val: 'value 2' },
    //   { key: 'cc', val: 'value 3' } ]
    targetHashMap.hashToBucket[keyGroup1Hash].should.have.length(3);
    targetHashMap.hashToBucket[keyGroup1Hash][0].key.should.equal(key1);
    targetHashMap.hashToBucket[keyGroup1Hash][0].val.should.equal(val1);
    targetHashMap.hashToBucket[keyGroup1Hash][1].key.should.equal(key2);
    targetHashMap.hashToBucket[keyGroup1Hash][1].val.should.equal(val2);
    targetHashMap.hashToBucket[keyGroup1Hash][2].key.should.equal(key3);
    targetHashMap.hashToBucket[keyGroup1Hash][2].val.should.equal(val3);

    // the second 'key group' has 2 entries:
    // [ { key: 'ddd', val: 'value 4' },
    //   { key: 'eee', val: 'value 5' } ]
    targetHashMap.hashToBucket[keyGroup2Hash].should.have.length(2);
    targetHashMap.hashToBucket[keyGroup2Hash][0].key.should.equal(key4);
    targetHashMap.hashToBucket[keyGroup2Hash][0].val.should.equal(val4);
    targetHashMap.hashToBucket[keyGroup2Hash][1].key.should.equal(key5);
    targetHashMap.hashToBucket[keyGroup2Hash][1].val.should.equal(val5);
  });

  it('should determine the index position of an entry within a bucket ' +
      'correctly', function() {

    var hashMap = new HashMap(testEqlFn, testHashFn);
    var keyHash = '3';  // holds for all keys used in this test
    var key1 = 'aaa';
    var val1 = 'value 1';
    hashMap.put(key1, val1);

    var key2 = 'bbb';
    var val2 = 'value 2';
    hashMap.put(key2, val2);

    var key3 = 'ccc';
    var val3 = 'value 3';
    hashMap.put(key3, val3);

    var key4 = 'ddd';
    var val4 = 'value 4';
    hashMap.put(key4, val4);

    hashMap.hashToBucket.should.have.keys(keyHash);
    var bucket = hashMap.hashToBucket[keyHash];

    // check if the keys are on the expected positions
    hashMap._indexOfKey(bucket, key1).should.equal(0);
    hashMap._indexOfKey(bucket, key2).should.equal(1);
    hashMap._indexOfKey(bucket, key3).should.equal(2);
    hashMap._indexOfKey(bucket, key4).should.equal(3);
    hashMap._indexOfKey(bucket, 'doesnotexist').should.equal(-1);
  });

  it('should return the correct values of a given key', function() {
    var hashMap = new HashMap(testEqlFn, testHashFn);
    var key1 = 'aa';
    var val1 = 'value 1';
    hashMap.put(key1, val1);

    var key2 = 'bb';
    var val2 = 'value 2';
    hashMap.put(key2, val2);

    var key3 = 'ccc';
    var val3 = 'value 3';
    hashMap.put(key3, val3);

    var key4 = 'dddd';
    var val4 = 'value 4';
    hashMap.put(key4, val4);

    hashMap.get(key1).should.equal(val1);
    hashMap.get(key2).should.equal(val2);
    hashMap.get(key3).should.equal(val3);
    hashMap.get(key4).should.equal(val4);
  });

  it('should remove values of a given key correctly', function() {
    var hashMap = new HashMap(testEqlFn, testHashFn);
    var key1and2Hash = '2';
    var key3Hash = '3';
    var key1 = 'aa';
    var val1 = 'value 1';
    hashMap.put(key1, val1);

    var key2 = 'bb';
    var val2 = 'value 2';
    hashMap.put(key2, val2);

    var key3 = 'ccc';
    var val3 = 'value 3';
    hashMap.put(key3, val3);

    // should remove nothing if there is no matching key
    hashMap.remove('xxx').should.be.false;
    hashMap.hashToBucket[key1and2Hash].should.have.length(2);
    hashMap.hashToBucket[key1and2Hash][0].key.should.equal(key1);
    hashMap.hashToBucket[key1and2Hash][0].val.should.equal(val1);
    hashMap.hashToBucket[key1and2Hash][1].key.should.equal(key2);
    hashMap.hashToBucket[key1and2Hash][1].val.should.equal(val2);
    hashMap.hashToBucket[key3Hash].should.have.length(1);
    hashMap.hashToBucket[key3Hash][0].key.should.equal(key3);
    hashMap.hashToBucket[key3Hash][0].val.should.equal(val3);

    // should only remove 'aa' and its value
    hashMap.remove('aa').should.be.true;
    hashMap.hashToBucket[key1and2Hash].should.have.length(1);
    hashMap.hashToBucket[key1and2Hash][0].key.should.equal(key2);
    hashMap.hashToBucket[key1and2Hash][0].val.should.equal(val2);
    hashMap.hashToBucket[key3Hash].should.have.length(1);
    hashMap.hashToBucket[key3Hash][0].key.should.equal(key3);
    hashMap.hashToBucket[key3Hash][0].val.should.equal(val3);
  });

  it('should determine correctly whether it contains a given key', function() {
    var hashMap = new HashMap(testEqlFn, testHashFn);
    var key1 = 'aa';
    var val1 = 'value 1';
    hashMap.put(key1, val1);

    var key2 = 'bb';
    var val2 = 'value 2';
    hashMap.put(key2, val2);

    var key3 = 'ccc';
    var val3 = 'value 3';
    hashMap.put(key3, val3);

    hashMap.containsKey(key1).should.be.true;
    hashMap.containsKey(key2).should.be.true;
    hashMap.containsKey(key3).should.be.true;
    hashMap.containsKey('notAKey').should.be.false;
  });

  it('should return its keys correctly', function() {
    var hashMap = new HashMap(testEqlFn, testHashFn);
    var key1 = 'aa';
    var val1 = 'value 1';
    hashMap.put(key1, val1);

    var key2 = 'bb';
    var val2 = 'value 2';
    hashMap.put(key2, val2);

    var key3 = 'ccc';
    var val3 = 'value 3';
    hashMap.put(key3, val3);

    var keys = hashMap.keys();
    keys.should.have.length(3);
    keys.should.containEql(key1);
    keys.should.containEql(key2);
    keys.should.containEql(key3);
  });

  it('should return its values correctly', function() {
    var hashMap = new HashMap(testEqlFn, testHashFn);
    var key1 = 'aa';
    var val1 = 'value 1';
    hashMap.put(key1, val1);

    var key2 = 'bb';
    var val2 = 'value 2';
    hashMap.put(key2, val2);

    var key3 = 'ccc';
    var val3 = 'value 2';  // --> result can contain duplicates
    hashMap.put(key3, val3);

    var vals = hashMap.values();
    vals.should.have.length(3);
    vals.should.containEql(val1);
    vals.should.containEql(val2);
    vals.should.containEql(val3);
  });

  it('should return its key-value entries correctly', function() {
    var hashMap = new HashMap(testEqlFn, testHashFn);
    var key1 = 'aa';
    var val1 = 'value 1';
    hashMap.put(key1, val1);

    var key2 = 'bb';
    var val2 = 'value 2';
    hashMap.put(key2, val2);

    var key3 = 'ccc';
    var val3 = 'value 3';
    hashMap.put(key3, val3);

    // entries: [ { key: 'aa', val: 'value 1' },
    //            { key: 'bb', val: 'value 2' },
    //            { key: 'ccc', val: 'value 3' } ]
    var entries = hashMap.entries();
    entries.should.have.length(3);
    entries.should.containEql({key: key1, val: val1});
    entries.should.containEql({key: key2, val: val2});
    entries.should.containEql({key: key3, val: val3});
  });

  it('should be stringified correctly', function() {
    var hashMap = new HashMap(testEqlFn, testHashFn);
    var key1 = 'aa';
    var val1 = 'value 1';
    hashMap.put(key1, val1);

    var key2 = 'bb';
    var val2 = 'value 2';
    hashMap.put(key2, val2);

    var key3 = 'ccc';
    var val3 = 'value 3';
    hashMap.put(key3, val3);

    var expctdStr =
      '{' + key1 + ': ' + val1 + ', ' +
            key2 + ': ' + val2 + ', ' +
            key3 + ': ' + val3 + '}';
    hashMap.toString().should.equal(expctdStr);
  });

});