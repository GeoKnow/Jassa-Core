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

var Node_Concrete = require('../../lib/rdf/node/Node_Concrete');

describe('Node_Concrete', function() {
  var concrNode = new Node_Concrete();

  it('should state that it is concrete', function() {
    concrNode.isConcrete().should.be.true;
  });
});