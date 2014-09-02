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

var Node_Fluid = require('../../lib/rdf/node/Node_Fluid');

describe('Node_Fluid', function() {
  var fluidNode = new Node_Fluid();

  it('should state that it is not concrete', function() {
    fluidNode.isConcrete().should.be.false;
  });
});