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
var HashMap = require('../../lib/util/collection/HashMap');
var MapUtils = require('../../lib/util/MapUtils');

describe('MapUtils', function() {
  // indexBy
  it('should index array items by key correctly', function() {
    var arrKey1 = 'one';
    var arrKey2 = 'two';
    var arrKey3 = 'three';
    var arrKey4 = 'four';

    var arrItem1 = {key: arrKey1};
    var arrItem2 = {key: arrKey2};
    var arrItem3 = {key: arrKey3};
    var arrItem4 = {key: arrKey4};

    var arr = [arrItem1, arrItem2, arrItem3, arrItem4];
    var key = 'key';

    var resHashMap = MapUtils.indexBy(arr, key);
    resHashMap.keys().should.eql([arrKey1, arrKey2, arrKey3, arrKey4]);
    resHashMap.get(arrKey1).should.equal(arrItem1);
    resHashMap.get(arrKey2).should.equal(arrItem2);
    resHashMap.get(arrKey3).should.equal(arrItem3);
    resHashMap.get(arrKey4).should.equal(arrItem4);
  });

  // indexBy
  it('should index array items by key function correctly', function() {
    var keyFn = function(obj) {return obj.val};

    var arrVal1 = 'val1';
    var arrVal2 = 'val2';
    var arrVal3 = 'val3';
    var arrVal4 = 'val4';

    var arrItem1 = {val: arrVal1};
    var arrItem2 = {val: arrVal2};
    var arrItem3 = {val: arrVal3};
    var arrItem4 = {val: arrVal4};
    var arr = [arrItem1, arrItem2, arrItem3, arrItem4];

    var resHashMap =  MapUtils.indexBy(arr, keyFn);
    resHashMap.keys().should.eql([arrVal1, arrVal2, arrVal3, arrVal4]);
    resHashMap.get(arrVal1).should.equal(arrItem1);
    resHashMap.get(arrVal2).should.equal(arrItem2);
    resHashMap.get(arrVal3).should.equal(arrItem3);
    resHashMap.get(arrVal4).should.equal(arrItem4);
  });

  // retainKeys
  it('should remove all key-value pairs that do not match a given set' +
     'of keys, correctly', function() {
    var map = new HashMap();
    map.put('one', 1);
    map.put('two', 2);
    map.put('three', 3);
    map.put('four', 4);
    map.put('five', 5);
    map.put('six', 6);

    var keySet = new HashSet();
    keySet.add('three');
    keySet.add('four');
    keySet.add('six');

    var expctdMap = {three: 3, four: 4, six: 6};

    MapUtils.retainKeys(map, keySet);
    map.keys().should.eql(['three', 'four', 'six']);
    map.values().should.eql([3, 4, 6]);
  });
});