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

var Node = require('../../lib/rdf/node/Node');

describe('Node', function() {
  var node = new Node();

  it('should throw an error when its getUri method is called', function() {
    node.getUri.bind(null).should.throw('not a URI node');
  });

  it('should throw an error when its getName method is called', function() {
    node.getName.bind(null).should.throw('is not a variable node');
  });

  it('should throw an error when its getBlankNodeId method is called', function() {
    node.getBlankNodeId.bind(null).should.throw('is not a blank node');
  });

  it('should throw an error when its getBlankNodeLabel method is called', function() {
    // don't know what the actual error message should be due to this
    // 'convenience override'
    node.getBlankNodeLabel.bind(null).should.throw();
  });

  it('should throw an error when its getLiteral method is called', function() {
    node.getLiteral.bind(null).should.throw('is not a literal node');
  });

  it('should throw an error when its getLiteralValue method is called', function() {
    node.getLiteralValue.bind(null).should.throw('is not a literal node');
  });

  it('should throw an error when its getLiteralLexicalForm method is called', function() {
    node.getLiteralLexicalForm.bind(null).should.throw('is not a literal node');
  });

  it('should throw an error when its getLiteralDatatype method is called', function() {
    node.getLiteralDatatype.bind(null).should.throw('is not a literal node');
  });

  it('should throw an error when its getLiteralDatatypeUri method is called', function() {
    node.getLiteralDatatypeUri.bind(null).should.throw('is not a literal node');
  });

  it('should state that it is not a blank node', function() {
    node.isBlank().should.be.false;
  });

  it('should state that it is not a URI node', function() {
    node.isUri().should.be.false;
  });

  it('should state that it is not a literal node', function() {
    node.isLiteral().should.be.false;
  });

  it('should state that it is not a node variable', function() {
    node.isVariable().should.be.false;
  });

  it('should throw an error if compared with another node instance', function() {
    var node2 = new Node();

    node.equals.bind(node, node2).should.throw('not overridden')
  })
});