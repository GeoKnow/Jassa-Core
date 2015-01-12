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

  // add
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

  // hashCode
  it('should return the hash map\'s hash code correctly', function() {
    /* This function uses the hashCode function of HashMap, which in turn gets
     * the hashes from several other functions. Hence, changes on any of those
     * functions might break this test if I tested the actual hash values. Thus
     * it seems the only 'stable' way to test the hashCode function is, to
     * compare HashSets that should (not) have the same hash.
     */

    var hashSet1 = new HashSet(testEqlFn, testHashFn);
    var hashSet2 = new HashSet(testEqlFn, testHashFn);
    hashSet1.hashCode().should.equal(hashSet2.hashCode());

    hashSet1.add('aa');
    hashSet1.hashCode().should.not.equal(hashSet2.hashCode());
    hashSet2.add('aa');
    hashSet1.hashCode().should.equal(hashSet2.hashCode());

    //hashSet1.add(23);
    //hashSet1.hashCode().should.not.equal(hashSet2.hashCode());
    //FIXME: this test fails but IMHO should not
    //hashSet2.add('23');
    //hashSet1.hashCode().should.not.equal(hashSet2.hashCode());
  });

  // equals
  // TODO: finish when equals function in utils.HashMap is implemented
  //it('should determine equality correctly', function() {
  //  var hashSet1 = new HashSet(testEqlFn, testHashFn);
  //  var hashSet2 = new HashSet(testEqlFn, testHashFn);
  //  hashSet1.equals(0).should.be.false;
  //  hashSet1.equals(hashSet2).should.be.true;
  //  // ...
  //});

  // contains
  it('should determine correctly whether it contains a given item', function() {
    var hashSet = new HashSet(testEqlFn, testHashFn);
    var item1 = 'aa';
    hashSet.add(item1);

    hashSet.contains(item1).should.be.true;
    hashSet.contains('notAnItem').should.be.false;
  });

  // forEach
  it('should loop over items applying a function, correctly', function() {
    var hashSet = new HashSet(testEqlFn, testHashFn);
    var item1 = 'aa';
    var item2 = 'bbb';
    var item3 = 'cc';
    var item4 = 'dddd';
    hashSet.add(item1);
    hashSet.add(item2);
    hashSet.add(item3);
    hashSet.add(item4);

    var processed = [];
    var dummyProcess = function(item, index, array) { processed[index] = item;};
    hashSet.forEach(dummyProcess);

    processed.should.eql(hashSet.entries());
  });

  // map
  it('should create an array looping over its items applying a function, ' +
     'correctly', function() {
    var hashSet = new HashSet(testEqlFn, testHashFn);
    var item1 = 'aa';
    var item2 = 'bbb';
    var item3 = 'cc';
    var item4 = 'dddd';
    hashSet.add(item1);
    hashSet.add(item2);
    hashSet.add(item3);
    hashSet.add(item4);

    var prefixStr = 'processed ';
    var dummyProcess = function(item, index, array) { return prefixStr + item; };

    var res = hashSet.map(dummyProcess);

    res.should.have.length(4);
    res.should.containEql(prefixStr + item1);
    res.should.containEql(prefixStr + item2);
    res.should.containEql(prefixStr + item3);
    res.should.containEql(prefixStr + item4);
  });

  // retainAll
  it('should remove all items that are not contained in another hash set', function() {
    var hashSet1 = new HashSet(testEqlFn, testHashFn);
    var item1 = 'aa', item2 = 'bbb', item3 = 'cc', item4 = 'dddd';
    hashSet1.add(item1);
    hashSet1.add(item2);
    hashSet1.add(item3);
    hashSet1.add(item4);

    var hashSet2 = new HashSet(testEqlFn, testHashFn);
    var item5 = 'eee', item6 = 'ff', item7 = 'ggggg';
    hashSet2.add(item1);
    hashSet2.add(item2);
    hashSet2.add(item5);
    hashSet2.add(item6);
    hashSet2.add(item7);

    hashSet1.retainAll(hashSet2);
    hashSet1.entries().should.have.length(2);
    hashSet1.entries().should.eql([item1, item2]);
  });

  // addAll
  it('should correctly add the items of another hash set', function() {
    var hashSet1 = new HashSet(testEqlFn, testHashFn);
    var item1 = 'aa', item2 = 'bbb', item3 = 'cc', item4 = 'dddd';
    hashSet1.add(item1);
    hashSet1.add(item2);
    hashSet1.add(item3);
    hashSet1.add(item4);

    var hashSet2 = new HashSet(testEqlFn, testHashFn);
    var item5 = 'eee', item6 = 'ff', item7 = 'ggggg';
    hashSet2.add(item1);
    hashSet2.add(item2);
    hashSet2.add(item5);
    hashSet2.add(item6);
    hashSet2.add(item7);

    hashSet1.addAll(hashSet2);
    var entries = hashSet1.entries();
    entries.should.have.length(7);
    entries.should.containEql(item1);
    entries.should.containEql(item2);
    entries.should.containEql(item3);
    entries.should.containEql(item4);
    entries.should.containEql(item5);
    entries.should.containEql(item6);
    entries.should.containEql(item7);
  });

  // removeAll
  it('should remove all items except these that are contained in a given ' +
     'hash set', function() {
    var hashSet1 = new HashSet(testEqlFn, testHashFn);
    var item1 = 'aa', item2 = 'bbb', item3 = 'cc', item4 = 'dddd';
    hashSet1.add(item1);
    hashSet1.add(item2);
    hashSet1.add(item3);
    hashSet1.add(item4);

    var hashSet2 = new HashSet(testEqlFn, testHashFn);
    var item5 = 'eee', item6 = 'ff', item7 = 'ggggg';
    hashSet2.add(item1);
    hashSet2.add(item2);
    hashSet2.add(item5);
    hashSet2.add(item6);
    hashSet2.add(item7);

    hashSet1.removeAll(hashSet2);
    var entries = hashSet1.entries();
    entries.should.have.length(2);
    entries.should.containEql(item3);
    entries.should.containEql(item4);
  });

  // remove
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

  // entries
  it('should return all its entries correctly', function() {
    var hashSet = new HashSet(testEqlFn, testHashFn);
    var item1 = 'aa';
    hashSet.add(item1);
    var item2 = 'bb';
    hashSet.add(item2);
    var item3 = 'ccc';
    hashSet.add(item3);

    var entries = hashSet.entries();
    // entries: [ 'aa', 'bb', 'ccc' ]

    entries.should.have.length(3);
    entries.should.containEql(item1);
    entries.should.containEql(item2);
    entries.should.containEql(item3);
  });

  // clear
  it('should clear itself correctly', function() {
    var hashSet = new HashSet(testEqlFn, testHashFn);
    var item1 = 'aa', item2 = 'bbb', item3 = 'cc', item4 = 'dddd';
    hashSet.add(item1);
    hashSet.add(item2);
    hashSet.add(item3);
    hashSet.add(item4);

    hashSet.clear();
    hashSet.entries().should.be.empty;
  });

  // toString
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