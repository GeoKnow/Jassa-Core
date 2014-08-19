var ExprVar = require('./expr/ExprVar');

var ExprAggregator = require('./expr/ExprAggregator');
var AggCount = require('./agg/AggCount');

var ElementGroup = require('./element/ElementGroup');
var ElementSubQuery = require('./element/ElementSubQuery');

var Query = require('./Query');

var QueryUtils = {
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
};

module.exports = QueryUtils;
