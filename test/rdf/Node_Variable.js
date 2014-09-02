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

var Node_Variable = require('../../lib/rdf/node/Node_Variable');

describe('Node_Variable', function() {
  var nodeVarName = 'varXYZ';
  var nodeVar = new Node_Variable(nodeVarName);

  it('should state that it is variable', function() {
    nodeVar.isVariable().should.be.true;
  });

  it('should state that it is not concrete', function() {
    nodeVar.isConcrete().should.be.false;
  });
});