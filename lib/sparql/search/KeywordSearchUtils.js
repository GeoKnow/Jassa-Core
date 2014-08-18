var ExprVar = require('../expr/ExprVar');
var E_LangMatches = require('../expr/E_LangMatches');
var E_LogicalOr = require('../expr/E_LogicalOr');
var E_Lang = require('../expr/E_Lang');
var E_Bound = require('../expr/E_Bound');
var E_Regex = require('../expr/E_Regex');
var E_Str = require('../expr/E_Str');

var Concept = require('../Concept');

var ElementGroup = require('../element/ElementGroup');
var ElementOptional = require('../element/ElementOptional');
var ElementFilter = require('../element/ElementFilter');


var LabelUtils = require('../LabelUtils');

var KeywordSearchUtils = {
    /**
     * Optional {
     *     ?s ?p ?o 
     *     Filter(Regex(Str(?o), 'searchString'))
     * }
     * Filter(Regex(Str(?s), 'searchString') || Bound(?o))
     * 
     * @param relation
     * @returns
     */
    createConceptRegex: function(relation, searchString) {
        var relEl = relation.getElement();
        var s = relation.getSourceVar();
        var o = relation.getTargetVar();

        // var nv = NodeValueUtils.makeString(searchString);

        var es = new ExprVar(s);
        var eo = new ExprVar(o);
        
        var innerExpr = new E_Regex(new E_Str(eo), searchString, 'i');
        
        var outerExpr = new E_LogicalOr(
            new E_Regex(new E_Str(es), searchString, 'i'),
            new E_Bound(eo));
        

        var element = new ElementGroup([
            new ElementOptional(
                new ElementGroup([relEl, new ElementFilter(innerExpr)])),
            new ElementFilter(outerExpr)
        ]);

        var result = new Concept(element, s);
        return result;
    },

};

module.exports = KeywordSearchUtils;
