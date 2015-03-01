//var Class = require('../ext/Class');
var Relation = require('./Relation');

var Query = require('./Query');
var ExprVar = require('./expr/ExprVar');
var ExprAggregator = require('./expr/ExprAggregator');
var ElementSubQuery = require('./element/ElementSubQuery');
var AggCountVarDistinct = require('./agg/AggCountVarDistinct');

var Concept = require('./Concept');
var ConceptUtils = require('./ConceptUtils');

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
        result.getGroupBy().push(new ExprVar(relation.getSourceVar()));

        return result;
    },


    /**
     * Wraps a relation with a limit
     *
     * Select ?s ?o {
     *    / original relation with vars ?s and ?o /
     * } Limit rowLimit
     *
     */
    createQueryRawSize: function(relation, sourceNode, countVar, rowLimit) {
        var concept = new Concept(relation.getElement(), relation.getSourceVar());

        var result = ConceptUtils.createQueryRawSize(concept, sourceNode, countVar, rowLimit);
        return result;
    },

    /**
     * Creates a query
     *
     * Select ?s (Count(*) As ?countVar) {
     *     { Select ?s { relation . Filter(?s = sourceValue} Limit rowLimit}
     * }
     *
     * If no rowLimit is provided, the subselect is omitted
     */
    createQueryValueCount: function(relation, sourceValue, countVar, rowLimit) {
        var wrapped = this.createRelationWithLimit(relation, rowLimit);

        var result = new Query();

        var varExprList = result.getProject();
        varExprList.add(relation.getSourceVar());
        varExprList.add(countVar, new ExprAggregator(null, new AggCountVarDistinct(new ExprVar(relation.getTargetVar()))));
        result.setQueryPattern(relation.getElement());
        result.getGroupBy().push(new ExprVar(relation.getSourceVar()));
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
