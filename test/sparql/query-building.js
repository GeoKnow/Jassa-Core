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

//var BestLabelConfig = require('../../lib/sparql/BestLabelConfig');
//var LiteralPreference = require('../../lib/sparql/LiteralPreference');
//var rdfs = require('../../lib/vocab/rdfs');
//var VarUtils = require('../../lib/sparql/VarUtils');


var Query = require('../../lib/sparql/Query');
var QueryUtils = require('../../lib/sparql/QueryUtils');

var NodeFactory = require('../../lib/rdf/NodeFactory');
var ExprVar = require('../../lib/sparql/expr/ExprVar');

var ElementString = require('../../lib/sparql/element/ElementString');
var SortCondition = require('../../lib/sparql/SortCondition');
var SortElement = require('../../lib/sparql/SortElement');


describe('QueryBuilding', function() {

  // getLangs
  it('should properly inject sort conditions', function() {
      var query = new Query();
      query.setQuerySelectType();
      query.setQueryResultStar(true);

      var e = new ElementString.create('?s rdfs:label ?o')
      query.setQueryPattern(e);

      var sortConditions = [new SortCondition(new ExprVar(NodeFactory.createVar('o')))]

      var sortElement = new SortElement(e, sortConditions);

      QueryUtils.injectSortElement(query, sortElement);

      console.log('Query: ' + query);

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