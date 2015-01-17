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

var ArrayList = require('../../lib/util/collection/ArrayList');

describe('ArrayList', function() {
  it('should set and return items correctly', function() {
    var arrList = new ArrayList();
    var items = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    arrList.setItems(items);
    arrList.getArray().should.eql(items);
  });

  it('should return items on a given index position correctly', function() {
    var arrList = new ArrayList();
    var items = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    arrList.setItems(items);

    // index 0
    var idx = 0;
    var expctdVal = 1;
    arrList.get(idx).should.equal(expctdVal);

    // index 3
    idx = 3;
    expctdVal = 4;
    arrList.get(idx).should.equal(expctdVal);

    // index 6
    idx = 6;
    expctdVal = 7;
    arrList.get(idx).should.equal(expctdVal);
  });

  it('should add items correctly', function() {
    var arrList = new ArrayList();
    var items = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    arrList.setItems(items);

    // add 23
    var insertVal = 23;
    var expctdItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 23];
    arrList.add(insertVal);
    arrList.getArray().should.eql(expctdItems);
  });

  it('should return the correct indexes of a given value', function() {
    var items = [1, 23, 23, 4, 23, 6, 7, 8, 9];
    var searchedItem = 23;

    // strict (Object) equality
    var arrList1 = new ArrayList();
    arrList1.setItems(items);
    var expctdIndexes1 = [1, 2, 4];
    arrList1.indexesOf(searchedItem).should.eql(expctdIndexes1);

    // equality with custom equality function
    var eqlFn = function(num1, num2) { return (num1 % 3) === (num2 % 3) };
    var arrList2 = new ArrayList(null, eqlFn);
    arrList2.setItems(items);
    var expctdIndexes2 = [1, 2, 4, 7];
    arrList2.indexesOf(searchedItem).should.eql(expctdIndexes2);
  });

  it('should determine if it contains a given item correctly', function() {
    var items = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    var arrList1 = new ArrayList();
    arrList1.setItems(items);

    // with strict equality
    arrList1.contains(5).should.be.true;
    arrList1.contains('5').should.be.false;
    arrList1.contains(23).should.be.false;
    arrList1.contains('23').should.be.false;

    // with own equality function
    var eqlFn = function(item1, item2) {
      return item1.toString() === item2.toString();
    };

    var arrList2 = new ArrayList(null, eqlFn);
    arrList2.setItems(items);

    arrList2.contains(5).should.be.true;
    arrList2.contains('5').should.be.true;
    arrList2.contains(23).should.be.false;
    arrList2.contains('23').should.be.false;
  });

  it('should return the first index of a searched item correctly', function() {
    var items = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    var searchedItem = 5;

    // with strict equality
    var arrList1 = new ArrayList();
    arrList1.setItems(items);
    var expctdIdx1 = 4;
    arrList1.firstIndexOf(searchedItem).should.equal(expctdIdx1);

    // with custom equality function
    var eqlFn = function(item1, item2) { return (item1 % 3) === (item2 % 3) };
    var arrList2 = new ArrayList(null, eqlFn);
    arrList2.setItems(items);
    var expctdIdx2 = 1;
    arrList2.firstIndexOf(searchedItem).should.equal(expctdIdx2);
  });

  it('should return the last index of a searched item correctly', function() {
    var items = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    var searchedItem = 5;

    // with strict equality
    var arrList1 = new ArrayList();
    arrList1.setItems(items);
    var expctdIdx1 = 4;
    arrList1.lastIndexOf(searchedItem).should.equal(expctdIdx1);

    // with custom equality function
    var eqlFn = function(item1, item2) { return (item1 % 3) === (item2 % 3) };
    var arrList2 = new ArrayList(null, eqlFn);
    arrList2.setItems(items);
    var expctdIdx2 = 7;
    arrList2.lastIndexOf(searchedItem).should.equal(expctdIdx2);
  });

  it('should remove the first occurrence of a given item correctly', function() {
    var itemToRemove = 5;

    // with strict equality
    var items1 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    var arrList1 = new ArrayList();
    arrList1.setItems(items1);
    var expctdRes1 = [1, 2, 3, 4, 6, 7, 8, 9];
    arrList1.remove(itemToRemove);
    arrList1.getArray().should.eql(expctdRes1);

    // with custom equality function
    var items2 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    var eqlFn = function(item1, item2) { return (item1 % 3) === (item2 % 3) };
    var arrList2 = new ArrayList(null, eqlFn);
    arrList2.setItems(items2);
    var expctdRes2 = [1, 3, 4, 5, 6, 7, 8, 9];
    arrList2.remove(itemToRemove);
    arrList2.getArray().should.eql(expctdRes2);
  });

/* removeByIndex is covered by splice
  it('should remove the item on a given index correctly', function() {
    var items = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    var arrList = new ArrayList();
    arrList.setItems(items);
    var idx = 5;
    var expctdRes = [1, 2, 3, 4, 5, 7, 8, 9];
    arrList.removeByIndex(idx);
    arrList.getArray().should.eql(expctdRes);
  });
*/

  it('should return its correct size', function() {
    var items = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    var len = items.length;
    var arrList = new ArrayList();
    arrList.setItems(items);

    arrList.size().should.equal(len);
  })
});
