var NodeFactory = require('../rdf/NodeFactory');
var Query = require('../sparql/Query');

var ExprVar = require('../sparql/expr/ExprVar');
var SortCondition = require('../sparql/SortCondition');

var ExprModRegistry = []; // TODO Get rid of this

var E_LogicalNot = require('../sparql/expr/E_LogicalNot');
var E_Bound = require('../sparql/expr/E_Bound');

var QueryUtils = {

    /**
     * Creates a query by applying the modifications specified by the tableMod to an element
     */
    createQueryFacet: function(element, tableMod) {

        if(!element) {
            return null;
        }
        var isDistinct = tableMod.isDistinct();


        var result = new Query();
        result.setQueryPattern(element);

        var columns = tableMod.getColumns();


        // Map from column id to SPARQL expression representing this column
        var idToColExpr = {};

        var aggColumnIds = [];
        var nonAggColumnIds = [];

        columns.forEach(function(c) {
            var columnId = c.getId();
            var v = NodeFactory.createVar(columnId);
            var ev = new ExprVar(v);


            // TODO Get aggregators working again
            var agg = c.getAggregator();
            if(agg) {
                aggColumnIds.push(columnId);

                var aggName = agg.getName();

                var aggExprFactory = ExprModRegistry[aggName];
                if(!aggExprFactory) {
                    throw new Error('No aggExprFactory for ' + aggName);
                }

                var aggExpr = aggExprFactory.createExpr(ev);

                ev = aggExpr;

                result.getProject().add(v, ev);

            } else {
                nonAggColumnIds.push(columnId);
                result.getProject().add(v);
            }


            idToColExpr[columnId] = ev;
        });

        if(aggColumnIds.length > 0) {
            nonAggColumnIds.forEach(function(nonAggColumnId) {
                var expr = idToColExpr[nonAggColumnId];
                result.getGroupBy().push(expr);
            });

            // Aggregation implies distinct
            isDistinct = false;
        }


        // Apply limit / offset
        var lo = tableMod.getLimitAndOffset();
        result.setLimit(lo.getLimit());
        result.setOffset(lo.getOffset());

        // Apply sort conditions
        var sortConditions = tableMod.getSortConditions();


        sortConditions.forEach(function(sortCondition) {
            var columnId = sortCondition.getColumnId();

            var colExpr = idToColExpr[columnId];

            if(!colExpr) {
                console.log('[ERROR] Should not happen');
                throw new Error('Should not happen');
            }

            // Ordering of null values
            //var sortCondition = cs.getSortCondition();
            var sortDir = sortCondition.getSortDir();
            var sortType = sortCondition.getSortType();

            var sortCond = null;

            switch(sortType) {
            case 'null':
                // Null ordering only works with non-aggregate columns
                if(aggColumnIds.indexOf(columnId) < 0) {

                    if(sortDir > 0) {
                        sortCond = new SortCondition(new E_LogicalNot(new E_Bound(colExpr)), 1);
                    } else if(sortDir < 0) {
                        sortCond = new SortCondition(new E_Bound(colExpr), 1);
                    }

                }

                break;

            case 'data':
                sortCond = !sortDir ? null : new SortCondition(colExpr, sortDir);

                break;

            default:
                throw new Error('Should not happen');
            }

            if(sortCond) {
                result.getOrderBy().push(sortCond);
            }


        });

        result.setDistinct(isDistinct);

        return result;
    }
};
