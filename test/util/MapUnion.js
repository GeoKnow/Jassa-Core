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

var MapUnion = require('../../lib/util/collection/MapUnion');
var HashMap = require('../../lib/util/collection/HashMap');

describe('MapUnion', function() {
  var hashMap1 = new HashMap();
  var key1 = 'Key 1', val1 = 'Value 1';
  var key2 = 'Key 2', val2 = 'Value 2';
  var key3 = 'Key 3', val3 = 'Value 3';
  hashMap1.put(key1, val1);
  hashMap1.put(key2, val2);
  hashMap1.put(key3, val3);

  var hashMap2 = new HashMap();
  var key4 = 'Key 4', val4 = 'Value 4';
  var val5 = 'Value 5';  // will be added with key2
  var key6 = 'Key 6', val6 = 'Value 6';
  hashMap2.put(key4, val4);
  hashMap2.put(key2, val5);  // val5 added with key2!!!
  hashMap2.put(key6, val6);

  var mapUnion = new MapUnion([hashMap1, hashMap2]);

  // get
  it('should return all items of a map union correctly', function() {

    mapUnion.get(key1).should.equal(val1);

    /* returns only val2 since this is the first hit when searching the sub
     * hash maps in the order they were given in the constructor */
    mapUnion.get(key2).should.equal(val2);

    mapUnion.get(key3).should.equal(val3);
    mapUnion.get(key4).should.equal(val4);
    mapUnion.get(key6).should.equal(val6);
  });

  // containsKey
  it('should determine correctly whether it contains a given key', function() {
    mapUnion.containsKey(key1).should.be.true;
    mapUnion.containsKey(key2).should.be.true;
    mapUnion.containsKey(key3).should.be.true;
    mapUnion.containsKey(key4).should.be.true;
    mapUnion.containsKey(key6).should.be.true;
    mapUnion.containsKey('not a key').should.be.false;
  });

  // entries
  it('should return all its entries correctly', function() {
    var entries = mapUnion.entries();

    /* will be 5, not 6 because the val5 of hashMap2 will not be part of the
     * result since only the first value of a given key will be returned where
     * the search order is given by the order of hash maps in the constructor */
    entries.should.have.length(5);

    entries.should.containEql({key: key1, val: val1});
    entries.should.containEql({key: key2, val: val2});
    entries.should.containEql({key: key3, val: val3});
    entries.should.containEql({key: key4, val: val4});
    entries.should.containEql({key: key6, val: val6});
  });
});
