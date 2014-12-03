var Triple = require('../rdf/Triple');
var ExprVar = require('./expr/ExprVar');

var E_OneOf = require('./expr/E_OneOf');

var ExprAggregator = require('./expr/ExprAggregator');
var AggCount = require('./agg/AggCount');

var ElementFilter = require('./element/ElementFilter');
var ElementGroup = require('./element/ElementGroup');
var ElementUnion = require('./element/ElementUnion');
var ElementSubQuery = require('./element/ElementSubQuery');
var ElementTriplesBlock = require('./element/ElementTriplesBlock');

//var VarUtils = require('./VarUtils');

var Query = require('./Query');

var QueryUtils = {
    // This method is dangerous as it attempts to handle too many cases
    // don't use
    createQueryCount: function(elements, limit, variable, outputVar, groupVars, useDistinct, options) {
        var element = elements.length === 1 ? elements[0] : new ElementGroup(elements);

        var exprVar = variable ? new ExprVar(variable) : null;


        var queryPattern;

        var needsSubQuery = limit || useDistinct || (groupVars && groupVars.length > 0);
        if(needsSubQuery) {

            var subQuery = new Query();
            subQuery.setQueryPattern(element);

            if(groupVars) {
                for(var i = 0; i < groupVars.length; ++i) {
                    var groupVar = groupVars[i];
                    subQuery.getProject().add(groupVar);
                    //subQuery.groupBy.push(groupVar);
                }
            }

            if(variable) {
                subQuery.getProject().add(variable);
            }

            if(subQuery.getProjectVars().length === 0) {
                subQuery.setQueryResultStar(true);
            }

            subQuery.setDistinct(useDistinct);
            subQuery.setLimit(limit);

            queryPattern = new ElementSubQuery(subQuery);
        } else {
            queryPattern = new ElementGroup(elements);
        }



        var result = new Query();
        result.setQueryPattern(queryPattern);

        if(groupVars) {
            groupVars.forEach(function(groupVar) {
                result.getProject().add(groupVar);
                result.getGroupBy().push(new ExprVar(groupVar));
            });
        }

        result.getProject().add(outputVar, new ExprAggregator(null, new AggCount()));

        return result;
    },


    createQueryUnionSubQueries: function(subQueries, projectVars) {
        var result;

        if(subQueries.length === 0) {
            result = null;
        } else {

            if(subQueries.length === 1) {
                result = subQueries[0];
            } else {
                // Convenience assumption if no project vars are provided
                projectVars = projectVars || subQueries[0].getProjectVars();

                // Create a union over the sub queries
                var subElements = subQueries.map(function(subQuery) {
                    var r = new ElementSubQuery(subQuery);
                    return r;
                });

                var union = new ElementUnion(subElements);

                result = new Query();
                result.setQuerySelectType();
                projectVars.forEach(function(v) {
                    result.getProject().add(v);
                });
                //result.getProject().add(sourceVar);
                //result.getProject().add(targetVar);
                result.setQueryPattern(union);
            }
        }

        return result;
    },

    // iris as rdf.Nodes
    createQueryDescribeViaSelect: function(iris, s, p, o) {

        var result = new Query();
        result.setQuerySelectType();
        result.setDistinct(true);

        var element = new ElementGroup([
            new ElementTriplesBlock([new Triple(s, p, o)]),
            new ElementFilter(new E_OneOf(new ExprVar(s), iris))
        ]);

        result.setQueryPattern(element);

        result.getProject().add(s);
        result.getProject().add(p);
        result.getProject().add(o);

        return result;
    }

};

module.exports = QueryUtils;
