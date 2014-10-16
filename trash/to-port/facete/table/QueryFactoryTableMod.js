
    ns.QueryFactoryTableMod = Class.create(ns.QueryFactory, {
        initialize: function(elementFactory, tableMod) {
            this.elementFactory = elementFactory;
            this.tableMod = tableMod;
        },
        
        createQuery: function() {
            var tableMod = this.tableMod;
            var element = this.elementFactory.createElement();
            
            if(!element) {
                return null;
            }
            
            
            var isDistinct = tableMod.isDistinct();

            
            var result = new sparql.Query();
            result.getElements().push(element);
            
            var columns = tableMod.getColumns();

            
            // Map from column id to SPARQL expression representing this column
            var idToColExpr = {};
            
            var aggColumnIds = [];
            var nonAggColumnIds = [];
            
            _(columns).each(function(c) {
                var columnId = c.getId();
                var v = rdf.NodeFactory.createVar(columnId);
                var ev = new sparql.ExprVar(v);
                
                
                var agg = c.getAggregator();
                if(agg) {
                    aggColumnIds.push(columnId);
                    
                    var aggName = agg.getName();
                    
                    var aggExprFactory = ns.ExprModRegistry[aggName];
                    if(!aggExprFactory) {
                        throw 'No aggExprFactory for ' + aggName;
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
                _(nonAggColumnIds).each(function(nonAggColumnId) {
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
            
            
            _(sortConditions).each(function(sortCondition) {
                var columnId = sortCondition.getColumnId();

                var colExpr = idToColExpr[columnId];
                
                if(!colExpr) {
                    console.log('[ERROR] Should not happen');
                    throw 'Should not happen';
                }

                // Ordering of null values
                //var sortCondition = cs.getSortCondition();
                var sortDir = sortCondition.getSortDir();
                var sortType = sortCondition.getSortType();

                var sortCond = null;

                switch(sortType) {
                case 'null':
                    // Null ordering only works with non-aggregate columns
                    if(_(aggColumnIds).indexOf(columnId) < 0) {

                        if(sortDir > 0) {
                            sortCond = new sparql.SortCondition(new sparql.E_LogicalNot(new sparql.E_Bound(colExpr)), 1);
                        } else if(sortDir < 0) {
                            sortCond = new sparql.SortCondition(new sparql.E_Bound(colExpr), 1);                    
                        }
                    
                    }

                    break;

                case 'data': 
                    sortCond = !sortDir ? null : new sparql.SortCondition(colExpr, sortDir);

                    break;
                
                default:
                    console.log('Should not happen');
                    throw 'Should not happen';
                }
                
                if(sortCond) {
                    result.getOrderBy().push(sortCond);
                }
                
                
            });
            
            result.setDistinct(isDistinct);
            
            return result;
        }
    });
    
