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

var CollectionUtils = require('../../lib/util/CollectionUtils');

var ArrayList = require('../../lib/util/collection/ArrayList');

describe('CollectionUtils', function() {

  it('should toggle an item\'s membership of a collection correctly', function() {
    var arr = [1, 2, 3, 4, 5, 6, 7];
    var coll = new ArrayList();
    coll.setItems(arr);

    var item = 5;

    // remove
    var arrWoItem = [1, 2, 3, 4, 6, 7];
    CollectionUtils.toggleItem(coll, item).should.be.false;
    coll.getArray().should.eql(arrWoItem);

    // re-add
    var arrWAppendedItem = [1, 2, 3, 4, 6, 7, 5];
    CollectionUtils.toggleItem(coll, item).should.be.true;
    coll.getArray().should.eql(arrWAppendedItem);
  })
});