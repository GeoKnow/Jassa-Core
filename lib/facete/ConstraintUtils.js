var ElementUtils = require('../sparql/ElementUtils');

var ExprVar = require('../sparql/expr/ExprVar');
var E_Lang = require('../sparql/expr/E_Lang');
var E_LangMatches = require('../sparql/expr/E_LangMatches');
var E_Regex = require('../sparql/expr/E_Regex');
var E_Equals = require('../sparql/expr/E_Equals');
var NodeValueUtils = require('../sparql/NodeValueUtils');

var ElementTriplesBlock = require('../sparql/element/ElementTriplesBlock');

var ElementsAndExprs = require('./ElementsAndExprs');

var Concept = require('../sparql/Concept');
var ConceptUtils = require('../sparql/ConceptUtils');

var ConstraintUtils = {
    createConstraintExists: function(rootFacetNode, path) {

        var facetNode = rootFacetNode.forPath(path);
        var elements = ElementUtils.createElementsTriplesBlock(facetNode.getTriples());
        var result = new ElementsAndExprs(elements, []);

        return result;
    },

    createConstraintLang: function(rootFacetNode, path, langStr) {
        var facetNode = rootFacetNode.forPath(path);

        var pathVar = facetNode.getVar();
        var exprVar = new ExprVar(pathVar);

        var elements = ElementUtils.createElementsTriplesBlock(facetNode.getTriples());

        // NOTE Value is assumed to be node holding a string, maybe check it here
        var val = langStr; //constraintSpec.getValue().getLiteralValue();

        var exprs = [new E_LangMatches(new E_Lang(exprVar), val)];

        var result = new ElementsAndExprs(elements, exprs);

        //console.log('constraintSpec.getValue() ', constraintSpec.getValue());
        return result;
    },

    createConstraintRegex: function(rootFacetNode, path, str) {
        var facetNode = rootFacetNode.forPath(path);

        var pathVar = facetNode.getVar();
        var exprVar = new ExprVar(pathVar);

        var elements = ElementUtils.createElementsTriplesBlock(facetNode.getTriples());

        // NOTE Value is assumed to be node holding a string, maybe check it here
        var val = str; //constraintSpec.getValue().getLiteralValue();


        var exprs = [new E_Regex(exprVar, val, 'i')];

        var result = new ElementsAndExprs(elements, exprs);

        //console.log('constraintSpec.getValue() ', constraintSpec.getValue());
        return result;
    },

    createConstraintEquals: function(rootFacetNode, path, node) {
        var facetNode = rootFacetNode.forPath(path);

        var pathVar = facetNode.getVar();
        var exprVar = new ExprVar(pathVar);

        var elements = ElementUtils.createElementsTriplesBlock(facetNode.getTriples());

        //var valueExpr = constraintSpec.getValue();
        var valueExpr = NodeValueUtils.makeNode(node); //constraintSpec.getValue());


        var exprs = [new E_Equals(exprVar, valueExpr)];

        var result = new ElementsAndExprs(elements, exprs);

        //console.log('constraintSpec.getValue() ', constraintSpec.getValue());
        return result;
    },

    createConstraintConcept: function(rootFacetNode, path, filterConcept) {
        var facetNode = rootFacetNode.forPath(path);

        var pathVar = facetNode.getVar();
        var element = new ElementTriplesBlock(facetNode.getTriples());

        var pathConcept = new Concept(element, pathVar);
        var resultConcept = ConceptUtils.createCombinedConcept(pathConcept, filterConcept, true, false);

        var exprs = [];

        var result = new ElementsAndExprs([resultConcept.getElement()], exprs);

        //console.log('constraintSpec.getValue() ', constraintSpec.getValue());
        return result;

    },

};

module.exports = ConstraintUtils;
