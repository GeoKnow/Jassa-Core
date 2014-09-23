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

var ArrayUtils = require('../../lib/util/ArrayUtils');

describe('ArrayUtils', function() {
  it('should add array items to another array correctly', function() {
    var targetArr = [1, 2, 3];
    var items = [23, 34, 45];
    var expctdRes = [1, 2, 3, 23, 34, 45];

    ArrayUtils.addAll(targetArr, items);
    targetArr.should.eql(expctdRes);
  });

  it('should chunk arrays correctly', function() {
    var inputArr = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    var size1 = 1;
    var expctdRes1 = [[1], [2], [3], [4], [5], [6], [7], [8], [9]];
    ArrayUtils.chunk(inputArr, size1).should.eql(expctdRes1);

    var size2 = 2;
    var expctdRes2 = [[1, 2], [3, 4], [5, 6], [7, 8], [9]];
    ArrayUtils.chunk(inputArr, size2).should.eql(expctdRes2);

    var size3 = 3;
    var expctdRes3 = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    ArrayUtils.chunk(inputArr, size3).should.eql(expctdRes3);

    var size4 = 9;
    var expctdRes4 = [[1, 2, 3, 4, 5, 6, 7, 8, 9]];
    ArrayUtils.chunk(inputArr, size4).should.eql(expctdRes4);
  });

  it('should clear arrays correctly', function() {
    var inputArr = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    ArrayUtils.clear(inputArr);
    inputArr.should.be.empty;
  });

  it('should replace one array with another array correctly', function() {
    var array1 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    var array2 = [12, 23, 34, 45, 56, 67, 78, 89];

    ArrayUtils.replace(array1, array2);
    array1.should.eql(array2);
  });

  it('should filter array items correctly', function() {
    var inputArr = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    var filterEven = function(item) {
      return (item % 2) === 0;
    };

    var expctdRes = [2, 4, 6, 8];

    ArrayUtils.filter(inputArr, filterEven).should.eql(expctdRes);
  });

  it('should return the correct first index w.r.t. a given equality function', function() {
    var inputArr = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    var eqFn = function(val1, val2) {
      return (val1 % 3) === (val2 % 3);
    };

    var comparator = 4;

    // var expctdRes1 = [1];
    var expctdIndex1 = 0;
    ArrayUtils.indexOf(inputArr, comparator, eqFn).should.eql(expctdIndex1);

    // fallback in case no equality function is provided
    // var expctdRes2 = [4];
    var expctdIndex2 = 3;
    ArrayUtils.indexOf(inputArr, comparator).should.eql(expctdIndex2);
  });

  it('should return the correct indexes w.r.t. a given equality function', function() {
    var inputArr = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    var eqFn = function(val1, val2) {
      return (val1 % 3) === (val2 % 3);
    };

    var comparator = 4;

    // var expctdRes1 = [1, 4, 7];
    var expctdIndexes1 = [0, 3, 6];
    ArrayUtils.indexesOf(inputArr, comparator, eqFn).should.eql(expctdIndexes1);

    // fallback in case no equality function is provided
    // var expctdRes2 = [4];
    var expctdIndexes2 = [3];
    ArrayUtils.indexesOf(inputArr, comparator).should.eql(expctdIndexes2);
  });

  it('should return the correct indexes when grepping for items satisfying a ' +
      'certain condition', function() {
    var inputArr = ['one', 'two', 'three', 'four', 'five', 'six', 'seven',
                    'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
                    'fourteen', 'fifteen', 'sixteen', 'Humppa!'];

    var filterFn = function(item, index) {
      var regex = /een$/;
      return regex.test(item);
    };

    // var expctdRes = ['thirteen', 'fourteen', 'fifteen', 'sixteen'];
    var expctdIndexes = [12, 13, 14, 15];
    ArrayUtils.grep(inputArr, filterFn).should.eql(expctdIndexes);
  });

  it('should copy an array omitting certain index positions', function() {
    var inputArr =      [1, 2, 3, 4, 5, 6, 7, 8, 9];
    var indexesToOmit = [         3,    5, 6, 7   ];
    var expctdRes =     [1, 2, 3,    5,          9];

    ArrayUtils.copyWithoutIndexes(inputArr, indexesToOmit).should.eql(expctdRes);
  });

  it('should remove array values of a certain set of indexes correctly', function() {
    var inputArr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    var indexesToRemove = [1, 2, 4, 8, 23];
    var expctdRes = [1, 4, 6, 7, 8];

    ArrayUtils.removeIndexes(inputArr, indexesToRemove).should.eql(expctdRes);
  });

  it('should remove values based on a certain grep condition correctly', function() {
    var inputArr = ['one', 'two', 'three', 'four', 'five', 'six', 'seven',
                    'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
                    'fourteen', 'fifteen', 'sixteen', 'Humppa!'];

    var filterFn = function(item, index) {
      var regex = /een$/;
      return regex.test(item);
    };

    var expctdRes = ['one', 'two', 'three', 'four', 'five', 'six', 'seven',
                     'eight', 'nine', 'ten', 'eleven', 'twelve', 'Humppa!'];

    ArrayUtils.removeByGrep(inputArr, filterFn);
    inputArr.should.eql(expctdRes);
  });
});