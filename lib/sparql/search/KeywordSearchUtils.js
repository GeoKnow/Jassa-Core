// var Class = require('../../ext/Class');

var rdfs = require('../../vocab/rdfs');
var Triple = require('../../rdf/Triple');
var NodeFactory = require('../../rdf/NodeFactory');

var NodeValueUtils = require('./../NodeValueUtils');
var ExprVar = require('../expr/ExprVar');
var E_OneOf = require('../expr/E_OneOf');
var E_LangMatches = require('../expr/E_LangMatches');
var E_Lang = require('../expr/E_Lang');

var ExprUtils = require('../ExprUtils');

var Concept = require('../Concept');
var ConceptUtils = require('../ConceptUtils');

var ElementTriplesBlock = require('../element/ElementTriplesBlock');
var ElementGroup = require('../element/ElementGroup');
var ElementFilter = require('../element/ElementFilter');

var VarUtils = require('../VarUtils');

var KeywordSearchUtils = {
    createConceptRegex: function(searchString, prefLabelPropertyUris, prefLangs) {
        prefLangs = prefLangs || ['en', ''];
        prefLabelPropertyUris = prefLabelPropertyUris || ['http://www.w3.org/2000/01/rdf-schema#label']; 

        var prefLabelProperties = prefLabelPropertyUris.map(function(name) {
            var r = NodeFactory.createUri(name);
            return r;
        });

        //var s = concept.getVar();
        //var s = conceptVar;
        //var p = ConceptUtils.freshVar(concept, 'p');
        //var o = ConceptUtils.freshVar(concept, 'l'); // TODO Optimize: Each freshVar collects the variable names again 
        var s = VarUtils.x;
        var p = VarUtils.y;
        var o = VarUtils.z;
        
        
        var subjectExpr = new ExprVar(s);
        var propertyExpr = new ExprVar(p);
        var labelExpr = new ExprVar(o);

        // Second, create the element
        var langTmp = prefLangs.map(function(lang) {
            var r = new E_LangMatches(new E_Lang(labelExpr), NodeValueUtils.makeString(lang));
            return r;
        });
            
        // Combine multiple expressions into a single logicalOr expression.
        var langConstraint = ExprUtils.orify(langTmp);
        
        //var propFilter = new sparql.E_LogicalAnd(
        var propFilter = new E_OneOf(propertyExpr, prefLabelProperties);
        //);
        
        var els = [];
        els.push(new ElementTriplesBlock([ new Triple(s, p, o)] ));
        els.push(new ElementFilter(propFilter));
        els.push(new ElementFilter(langConstraint));
        
        var langElement = new ElementGroup(els);
        
        var result = new Concept(langElement, s);
        return result;
    },

};

module.exports = KeywordSearchUtils;
