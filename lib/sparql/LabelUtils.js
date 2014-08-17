var Triple = require('../rdf/Triple');
var NodeFactory = require('../rdf/NodeFactory');

var NodeValueUtils = require('./NodeValueUtils');
var ExprVar = require('./expr/ExprVar');
var E_OneOf = require('./expr/E_OneOf');
var E_LangMatches = require('./expr/E_LangMatches');
var E_LogicalOr = require('./expr/E_LogicalOr');
var E_Lang = require('./expr/E_Lang');
var E_Bound = require('./expr/E_Bound');
var E_Regex = require('./expr/E_Regex');
var E_Str = require('./expr/E_Str');

var ExprUtils = require('./ExprUtils');

var Concept = require('./Concept');
var Relation = require('./Relation');
var ConceptUtils = require('./ConceptUtils');

var ElementTriplesBlock = require('./element/ElementTriplesBlock');
var ElementGroup = require('./element/ElementGroup');
var ElementOptional = require('./element/ElementOptional');
var ElementFilter = require('./element/ElementFilter');

var VarUtils = require('./VarUtils');

var LabelUtils = {

    createRelationPrefLabels: function(bestLabelConfig) {

        var prefLangs = bestLabelConfig.getLangs();
        var prefPreds = bestLabelConfig.getPredicates();

        var s = bestLabelConfig.getSubjectVar();
        var p = bestLabelConfig.getPredicateVar();
        var o = bestLabelConfig.getObjectVar();
        
        
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
        var propFilter = new E_OneOf(propertyExpr, prefPreds);
        //);
        
        var els = [];
        els.push(new ElementTriplesBlock([ new Triple(s, p, o)] ));
        els.push(new ElementFilter(propFilter));
        els.push(new ElementFilter(langConstraint));
        
        var langElement = new ElementGroup(els);
        
        //var result = new Concept(langElement, s);
        var result = new Relation(langElement, s, o);
        return result;
    },
};

module.exports = LabelUtils;
