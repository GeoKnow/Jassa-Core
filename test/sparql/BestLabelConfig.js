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

var BestLabelConfig = require('../../lib/sparql/BestLabelConfig');
var LiteralPreference = require('../../lib/sparql/LiteralPreference');
var rdfs = require('../../lib/vocab/rdfs');
var VarUtils = require('../../lib/sparql/VarUtils');

describe('BestLabelConfig', function() {
  var languages = ['en', 'pl', ''];
  var predicates = [rdfs.label, rdfs.comment];
  var objtVar = VarUtils.c,  subjVar = VarUtils.a, predVar = VarUtils.b;
  var blConfig = new BestLabelConfig(new LiteralPreference(languages, predicates), objtVar, subjVar, predVar);

  // getLangs
  it('should return its languages correctly', function() {
    // NOTE: assuming object equality here
    blConfig.getLangs().should.equal(languages);
  });

  // getPredicates
  it('should return its predicates correctly', function() {
    // NOTE: assuming object equality here
    blConfig.getPredicates().should.equal(predicates);
  });

  // getSubjectVar
  it('should return its subject variable correctly', function() {
    blConfig.getSubjectVar().should.equal(subjVar);
  });

  // getPredicateVar
  it('should return its predicate variable correctly', function() {
    blConfig.getPredicateVar().should.equal(predVar);
  });

  // getObjectVar
  it('should return its object variable correctly', function() {
    blConfig.getObjectVar().should.equal(objtVar);
  });

  // toString
  /*
  it('should return its string representation correctly', function() {
    var expctdStr = 'BestLabelConfig, ' + blConfig.langs + ', ' +
        blConfig.predicates + ', ' + blConfig.subjectVar + ', ' +
        blConfig.predicateVar + ', ' + blConfig.objectVar;
    blConfig.toString().should.equal(expctdStr);
  });
  */
});