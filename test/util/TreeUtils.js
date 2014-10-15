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

var TreeUtils = require('../../lib/util/TreeUtils');

describe('TreeUtils', function() {
  it('should depth-first-traverse an input tree correctly', function() {
    // build tree structure
    var grantChildA1 = {name: 'A1', children: [], visited: false};
    var grantChildA2 = {name: 'A2', children: [], visited: false};
    var childA = {name: 'A', children: [grantChildA1, grantChildA2], visited: false};

    var grantChildB1 = {name: 'B1', children: [], visited: false};
    var grantChildB2 = {name: 'B2', children: [], visited: false};
    var childB = {name: 'B', children: [grantChildB1, grantChildB2], visited: false};

    var root = {name: 'root', children: [childA, childB], visited: false};

    // child and node access function:
    var getChildren = function(node) {
      return node.children;
    };
    var access = function(node) {
      if (node.name === 'B') {
        return false;

      } else {
        node.visited = true;
        return true;
      }
    };

    // actual visiting
    TreeUtils.visitDepthFirst(root, getChildren, access);

    // checking
    grantChildA1.visited.should.be.true;
    grantChildA2.visited.should.be.true;
    grantChildB1.visited.should.be.false;
    grantChildB2.visited.should.be.false;
    childA.visited.should.be.true;
    childB.visited.should.be.false;
    root.visited.should.be.true;
  });

  it('should flatten an input tree correctly', function() {
    // build tree structure
    var grantChildA1 = {name: 'A1', children: [], visited: false};
    var grantChildA2 = {name: 'A2', children: [], visited: false};
    var childA = {name: 'A', children: [grantChildA1, grantChildA2], visited: false};

    var grantChildB1 = {name: 'B1', children: [], visited: false};
    var grantChildB2 = {name: 'B2', children: [], visited: false};
    var childB = {name: 'B', children: [grantChildB1, grantChildB2], visited: false};

    var root = {name: 'root', children: [childA, childB], visited: false};

    // actual flattening
    var expctdFlattened =
        [root, childA, grantChildA1, grantChildA2, childB, grantChildB1, grantChildB2];

    TreeUtils.flattenTree(root, 'children').should.eql(expctdFlattened);
  });
});