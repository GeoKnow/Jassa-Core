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
var jassa = require('../../lib/index')(Promise, ajax);
// namespaces
var rdf = jassa.rdf;
var vocab = jassa.vocab;
var sparql = jassa.sparql;
var service = jassa.service;

var AnonIdStr = require('../../lib/rdf/AnonIdStr');

describe('AnonId string', function() {
  it('should initialize correctly', function() {
    var anonId = 'xyz';
    var anonIdStr = new AnonIdStr(anonId);
    anonIdStr.toString().should.equal(anonId);
    anonIdStr.getLabelString().should.equal(anonId);
  });
});