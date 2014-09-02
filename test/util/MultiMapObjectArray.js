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

var MultiMapObjectArray = require('../../lib/util/collection/MultiMapObjectArray');

describe('MultiMapObjectArray', function() {
  it('should add new items correctly', function() {
    var mmoa = new MultiMapObjectArray();

    var key1 = 'aaa';
    var val1 = 'value 1';

    mmoa.entries.should.be.empty;
    mmoa.put(key1, val1);
    // mmoa.entries: { aaa: [ 'value 1' ] }
    mmoa.entries.should.have.keys(key1);
    mmoa.entries[key1].should.have.length(1);
    mmoa.entries[key1][0].should.equal(val1);

    var val2 = 'value 2';
    mmoa.put(key1, val2);
    // mmoa: { aaa: [ 'value 1', 'value 2' ] }
    mmoa.entries.should.have.keys(key1);
    mmoa.entries[key1].should.have.length(2);
    mmoa.entries[key1][0].should.equal(val1);
    mmoa.entries[key1][1].should.equal(val2);

    var key3 = 'bbb';
    var val3 = 'value 3';
    mmoa.put(key3, val3);
    // mmoa: { aaa: [ 'value 1', 'value 2' ], bbb: [ 'value 3' ] }
    mmoa.entries.should.have.keys([key1, key3]);
    mmoa.entries[key1].should.have.length(2);
    mmoa.entries[key1][0].should.equal(val1);
    mmoa.entries[key1][1].should.equal(val2);
    mmoa.entries[key3].should.have.length(1);
    mmoa.entries[key3][0].should.equal(val3);
  });

  it('should return the correct values of a given key', function() {
    var mmoa = new MultiMapObjectArray();

    var key1 = 'aaa';
    var val1 = 'value 1';
    mmoa.put(key1, val1);

    var val2 = 'value 2';
    mmoa.put(key1, val2);

    var key3 = 'bbb';
    var val3 = 'value 3';
    mmoa.put(key3, val3);

    mmoa.get(key1).should.eql([val1, val2]);
    mmoa.get(key3).should.eql([val3]);
    mmoa.get('notAKey').should.eql([]);
  });

  it('should delete items with a given key correctly', function() {
    var mmoa = new MultiMapObjectArray();

    var key1 = 'aaa';
    var val1 = 'value 1';
    mmoa.put(key1, val1);

    var val2 = 'value 2';
    mmoa.put(key1, val2);

    var key3 = 'bbb';
    var val3 = 'value 3';
    mmoa.put(key3, val3);

    mmoa.entries.should.have.keys([key1, key3]);
    mmoa.entries[key1].should.have.length(2);
    mmoa.entries[key3].should.have.length(1);

    mmoa.removeKey(key1);
    mmoa.entries.should.have.keys([key3]);
    mmoa.entries[key3].should.have.length(1);

    mmoa.removeKey(key3);
    mmoa.entries.should.be.empty;
  });

  it('should clone correctly', function() {
    var mmoa = new MultiMapObjectArray();

    var key1 = 'aaa';
    var val1 = 'value 1';
    mmoa.put(key1, val1);

    var val2 = 'value 2';
    mmoa.put(key1, val2);

    var key3 = 'bbb';
    var val3 = 'value 3';
    mmoa.put(key3, val3);

    var mmoa_clone = mmoa.clone();
    mmoa_clone.should.eql(mmoa);
  });

  it('should clear the array content correctly', function() {
    var mmoa = new MultiMapObjectArray();

    var key1 = 'aaa';
    var val1 = 'value 1';
    mmoa.put(key1, val1);

    var val2 = 'value 2';
    mmoa.put(key1, val2);

    var key3 = 'bbb';
    var val3 = 'value 3';
    mmoa.put(key3, val3);

    mmoa.entries.should.have.keys([key1, key3]);

    mmoa.clear();
    mmoa.entries.should.be.empty;
  });

  it('should add another multi map correctly', function() {
    var targetMmoa = new MultiMapObjectArray();
    var key1 = 'aaa';
    var val1 = 'value 1';
    targetMmoa.put(key1, val1);

    var val2 = 'value 2';
    targetMmoa.put(key1, val2);

    var key3 = 'bbb';
    var val3 = 'value 3';
    targetMmoa.put(key3, val3);

    var mmoaToAdd = new MultiMapObjectArray();
    var val4 = 'value 4';
    mmoaToAdd.put(key1, val4);
    var val5 = 'value 5';
    mmoaToAdd.put(key1, val5);
    var key6 = 'ccc';
    var val6 = 'value 6';
    mmoaToAdd.put(key6, val6);

    // add mmoaToAdd to targetMmoa
    targetMmoa.addMultiMap(mmoaToAdd);
    targetMmoa.entries.should.have.keys([key1, key3, key1, key6]);
    targetMmoa.entries[key1].should.eql([val1, val2, val4, val5]);
    targetMmoa.entries[key3].should.eql([val3]);
    targetMmoa.entries[key6].should.eql([val6]);
  });
});