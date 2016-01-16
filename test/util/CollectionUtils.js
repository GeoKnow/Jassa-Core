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

var HashSet = require('../../lib/util/collection/HashSet');
var SetUnion = require('../../lib/util/collection/SetUnion');
var SetIntersection = require('../../lib/util/collection/SetIntersection');

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
  });

  it('should give a proper union view of sets', function() {
      var a = new HashSet();
      a.addAll([1, 2, 3]);

      var b = new HashSet();
      b.addAll([3, 4, 5]);

      var x = new HashSet();
      x.addAll([1, 2, 3, 4, 5]);

      var c = new SetUnion([a, b]);
      c.hashCode().should.equal(x.hashCode());

      var y = new HashSet();
      y.addAll([2, 3, 4, 5]);

      a.remove(1);
      c.hashCode().should.equal(y.hashCode());

      var z = new HashSet();
      z.addAll([3]);

      var d = new SetIntersection([a, b]);
//      console.log('a: ' + a.entries());
//      console.log('b: ' + b.entries());
//      console.log('d: ' + d.entries());
//      console.log('z: ' + z.entries());
      d.hashCode().should.equal(z.hashCode());
  });
});