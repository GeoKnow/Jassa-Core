//var Class = require('../ext/Class');
var Relation = require('./Relation');

var Query = require('./Query');
var ExprVar = require('./expr/ExprVar');
var ExprAggregator = require('./expr/ExprAggregator');
var ElementSubQuery = require('./element/ElementSubQuery');
var AggCountVarDistinct = require('./agg/AggCountVarDistinct');


var RelationUtils = {
    /**
     * Creates a query
     * 
     * Select ?s (Count(Distinct ?o) As ?countVar){
     *     relation
     * }
     * 
     */
    createQueryDistinctValueCount: function(relation, countVar) {
        var result = new Query();

        var varExprList = result.getProject();
        varExprList.add(relation.getSourceVar());
        varExprList.add(countVar, new ExprAggregator(null, new AggCountVarDistinct(new ExprVar(relation.getTargetVar()))));
        result.setQueryPattern(relation.getElement());

        return result; 
    },
    
    // TODO Add a method that can align source / target variables of relations
    // so that unions over them can be easily created
    
    /**
     * Same as above, except that the query is conveniently
     * wrapped as a relation object.
     */
    createRelationDistinctValueCount: function(relation, countVar) {
        var query = this.createQueryDistinctValueCount(relation, countVar);
        var element = new ElementSubQuery(query);
        var result = new Relation(element, relation.getSourceVar(), countVar);
        return result;
    },
};


module.exports = RelationUtils;
