(function() {

    var rdf = Jassa.rdf;
    var sparql = Jassa.sparql;
    var util = Jassa.util;
    
    var ns = Jassa.facete;

    
    /**
     * 
     * 
     * @param sortDir Sort direction; {=0: unspecified, >0: ascending, <0 descending}
     * @param nullDir Whether to sort null values first or last
     * 
     * sortType: 'data' ordinary sort of the data , 'null' sort null values first or last
     * 
     */
    ns.SortCondition = Class.create({
        initialize: function(columnId, sortDir, sortType) {
            this.columnId = columnId;
            this.sortDir = sortDir == null ? 1 : sortDir;
            this.sortType = sortType || 'data';
        },
        
        getColumnId: function() {
            return this.columnId;
        },
        
        getSortType: function() {
            return this.sortType;
        },
        
        setSortType: function(sortType) {
            this.sortType = sortType;
        },
        
        getSortDir: function() {
            return this.sortDir;
        },
        
        setSortDir: function(sortDir) {
            this.sortDir = sortDir;
        }
    });
 
    /**
     * Note used yet.
     * searchMode: exact, regex, beginsWith, endsWith
     */
    ns.FilterString = Class.create({
        initialize: function(str, mode) {
            this.str = str;
            this.mode = mode;
        }
    });


    /**
     * @param id Id of the column - string recommended; cannot be modified once set
     * 
     */
    ns.ColumnView = Class.create({
        initialize: function(tableMod, columnId) {
            this.tableMod = tableMod;
            this.columnId = columnId;
           /*
           this.sortCondition = sortCondition || new ns.SortCondition();
           this.aggregator = aggregator || null;
           this.filter = filter || null;
           */
        },
       
        getId: function() {
            return this.columnId;
        },
       
        getSortConditions: function() {
            var result = {};

            var id = this.columnId;

            _(this.tableMod.getSortConditions()).each(function(sc) {
                var cid = sc.getColumnId();
                if(cid === id) {
                    var sortType = sc.getSortType();
                   
                    result[sortType] = sc.getSortDir();
                }
            });
           
            return result;
        },
       
        getAggregator: function() {
            var result = this.tableMod.getAggregator(this.columnId);
            return result;
        },
       
        setAggregator: function(aggregator) {
            //this.tableMod.setAggregator(this.columnId, aggregator);
            this.tableMod.getAggregators()[this.columnId] = aggregator;
        }
    });
    
    

    ns.Aggregator = Class.create({
        initialize: function(name, attrs) {
            this.name = name;
            this.attrs = attrs; // Optional attributes;
        },
        
        getName: function() {
            return this.name;
        },
        
        getAttrs: function() {
            return this.attrs;
        }
    });

    
    
    
    /**
     * Object that holds modifications to a table
     * 
     * { myCol1: {sortDir: 1, aggName: sum, path: foo}, ... }
     * - sum(?varForFoo) As myCol1
     * 
     */
    ns.TableMod = Class.create({
        initialize: function() {
            this.columnIds = []; // Array of active column ids

            this.colIdToColView = {};
            this.sortConditions = []; // Array of sortConditions in which to apply sort conditions

            this.colIdToAgg = {};
            
            this.limitAndOffset = new ns.LimitAndOffset();
            
            this._isDistinct = true;
        },
        
        isDistinct: function() {
            return this._isDistinct;
        },
        
        setDistinct: function(isDistinct) {
            this._isDistinct = isDistinct;
        },
        
        getColumnIds: function() {
            return this.columnIds;
        },
        
        getColumn: function(id) {
            return this.colIdToColView[id];
        },
        
        // Returns the active columns
        getColumns: function() {
            var self = this;
            var result = _(this.columnIds).map(function(columnId) {
                var r = self.colIdToColView[columnId];
                
                return r;
            });
            
            
            return result;
        },
        
        getSortConditions: function() {
            return this.sortConditions;
        },
        
        getLimitAndOffset: function() {
            return this.limitAndOffset;
        },
        
        getAggregator: function(columnId) {
            var result = this.colIdToAgg[columnId];
            return result;
        },
        
        getAggregators: function() {
            return this.colIdToAgg;
        },
        
        //setAggregator: function()
        
        /**
         * Adds a column based on a ColumnState object.
         * 
         * @param suppressActive default: false; true: Do not add the id to the array of active columns 
         */
        addColumn: function(columnId, suppressActive) {
            var colView = this.colIdToColView[columnId];
            if(colView) {
                throw 'Column ' + columnId + ' already part of the table';
            }
            
            colView = new ns.ColumnView(this, columnId);            
            this.colIdToColView[columnId] = colView;
            
            if(!suppressActive) {
                this.columnIds.push(columnId);
            }
            
            // TODO Fail on duplicate
            /*
            var columnId = columnState.getId();
            this.columnIds.push(columnId);
            
            this.idToState[columnId] = columnState;
            */
            
            return colView;
        },
        
        /**
         * Removes a column by id
         */
        removeColumn: function(columnId) {
            delete this.colIdToColView[columnId];
            
            var self = this;
            util.ArrayUtils.filter(this.columnIds, function(cid) {            
                var r = columnId != cid;
                return r;
             });
            
        }
    });

    /*
        getSortConditions: function() {
            return this.sortConditions;
        },
        
        getAggregators: function() {
            return this.aggregators;
        },
        
        getLimitAndOffset: function() {
            return limitAndOffset;
        },
        
        getSearchStrings: function() {
            return this.searchStrings;
        },
        
        removeColumn: function(columnId) {            
            util.ArrayUtils.filter(this.sortConditions, function(sc) {            
               var r = sc.getColumnId() != columnId;
               return r;
            });

            util.ArrayUtils.filter(this.aggregators, function(agg) {            
                var r = agg.getColumnId() != columnId;
                return r;
            });
            
            delete this.searchStrings[columnId]; 
        },
      */  
        
        /**
         * TODO Should this method return a ColumnViews on the internal state?
         * Then we could toggle e.g. the sortDirection on a column directly
         * 
         * @returns
         */
    /*
        getEffectiveColumnData: function() {
            
            var result = [];
            for(var i = 0; i < this.columnNames.length; ++i) {
                var columnName = this.columnNames[i];
                
                var data = {
                    index: i,
                    name: columnName,
                    sort: {
                        index: null
                        condition: null
                    },
                    aggregator: null
                }
                
                
            }
            
            return result;
        }
    });
*/
   

    ns.ExprModFactoryAggCount = Class.create({
       createExpr: function(baseExpr) {
           var result = new sparql.E_Count(baseExpr);
           
           return result;
       } 
    });

    ns.ExprModFactoryAggMin = Class.create({
        createExpr: function(baseExpr) {
            var result = new sparql.E_Min(baseExpr);
            
            return result;
        } 
    });
     
    ns.ExprModFactoryAggMax = Class.create({
        createExpr: function(baseExpr) {
            var result = new sparql.E_Min(baseExpr);
            
            return result;
        } 
    });

    
    ns.ExprModRegistry = {
        'count': new ns.ExprModFactoryAggCount,
        'min': new ns.ExprModFactoryAggMin,
        'max': new ns.ExprModFactoryAggMax
    };
    
    
    ns.ElementFactoryFacetPaths = Class.create({
        initialize: function(facetConfig, paths) {
            this.facetConfig = facetConfig;
            this.paths = paths || new util.ArrayList();
        },
        
        createElement: function() {
            var facetConceptGenerator = facete.FaceteUtils.createFacetConceptGenerator(this.facetConfig);
            var concept = facetConceptGenerator.createConceptResources(new facete.Path());

            var rootFacetNode = this.facetConfig.getRootFacetNode();
            
            
            var pathElements = _(this.paths).map(function(path) {
                var facetNode = rootFacetNode.forPath(path);
                
                console.log('facetNode: ', facetNode);
                
                var e = facetNode.getElements(true);
                
                
                // TODO On certain constraints affecting the path, we can skip the Optional
                var g = new sparql.ElementGroup(e);

                var r;
                if(e.length !== 0) {
                    r = new sparql.ElementOptional(g);
                }
                else {
                    r = g;
                }
                
                return r;
            });
                        
            var elements = [];
            elements.push.apply(elements, concept.getElements());
            elements.push.apply(elements, pathElements);
            
            var tmp = new sparql.ElementGroup(elements);
            
            var result = tmp.flatten();

            return result;
        }
    });

    
    ns.FacetTableConfig = Class.create({
        initialize: function(facetConfig, tableMod, paths) {
            this.facetConfig = facetConfig;
            this.tableMod = tableMod || new ns.TableMod();
            this.paths = paths || new util.ArrayList();
        },
        
        getFacetConfig: function() {
            return this.facetConfig;
        },

        getTableMod: function() {
            return this.tableMod;
        },

        getPaths: function() {
            return this.paths;
        },        

        togglePath: function(path) {
            // Updates the table model accordingly
            var status = util.CollectionUtils.toggleItem(this.paths, path);
            
            var rootFacetNode = this.facetConfig.getRootFacetNode();
            var facetNode = rootFacetNode.forPath(path);
            var varName = facetNode.getVar().getName();
            
            if(status) {
                this.tableMod.addColumn(varName);
            }
            else {
                this.tableMod.removeColumn(varName);
            }
        },
        
        createDataConcept: function() {
            var emptyPath = new ns.Path();
            var paths = this.paths.getArray().slice(0);

            if(!this.paths.contains(emptyPath)) {
                paths.push(emptyPath);
            }
            
            var dataElementFactory = new ns.ElementFactoryFacetPaths(this.facetConfig, paths);
            var dataElement = dataElementFactory.createElement();
            
            var rootFacetNode = this.facetConfig.getRootFacetNode();
            var dataVar = rootFacetNode.getVar();
            
            var result = new ns.Concept(dataElement, dataVar);

            return result;
        }
        
    /*
        createQueryFactory: function() {
            // create an ElementFactory based on the paths and the facetConfig
            var elementFactory = new ns.ElementFactoryFacetPaths(this.facetConfig, this.paths);

            var queryFactory = new ns.QueryFactoryTableMod(elementFactory, tableMod);
            
            return queryFactory;
        }
    */
    });

    ns.QueryFactoryFacetTable = Class.create(ns.QueryFactory, {
        initialize: function(facetTableConfig) {
            this.facetTableConfig = facetTableConfig;
        },
        
        createQuery: function() {
            var facetConfig = this.facetTableConfig.getFacetConfig();
            
            // TODO Possible source of confusion: the config uses a collection for paths, but here we switch to a native array 
            var paths = this.facetTableConfig.getPaths().getArray();
            var tableMod = this.facetTableConfig.getTableMod();

            
            var elementFactory = new ns.ElementFactoryFacetPaths(facetConfig, paths);

            var queryFactory = new ns.QueryFactoryTableMod(elementFactory, tableMod);
            
            var result = queryFactory.createQuery();
            
            return result;
        }
    });
    
    
    ns.TableUtils = {
        /**
         * Create an angular grid option object from a tableMod
         */
        createNgGridColumnDefs: function(tableMod) {

            var columnViews = tableMod.getColumns();
            
            var result = _(columnViews).each(function(columnView) {
                var col = {
                    field: columnView.getId(),
                    displayName: columnView.getId()
                };
                
                return col;
            });
            
            return result;
        }
    };
    
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
    

    /*
     * TODO: How to connect this class with a facetTreeConfig?
     * We might need a FacetNodeFactoryFacetTreeConfig
     * 
     */
    ns.FaceteTable = Class.create({
        initialize: function() {
            //this.pathVarMap = pathVarMap;// Formerly called facetNode
            // FIXME: varNode not defined!!!
            this.varNode = varNode;            
            this.paths = new util.ArrayList();
            this.tableMod = tableMod;
        },

        getPaths: function() {
            return this.paths;
        },
        
        getTableMod: function() {
            return this.tableMod;
        },
        
        togglePath: function(path) {
            // Updates the table model accordingly
            var status = util.CollectionUtils.toggleItem(this.paths, path);
            
            var target = this.varNode.forPath(path);
            var varName = target.getVarName();
            
            if(status) {
                // FIXME: this.tableMode not defined
                this.tableMode.addColumn(varName);
            }
            else {
                // FIXME: this.tableMode not defined
                this.tableMode.removeColumn(varName);
            }
        }
    });
    
    
    
    /*
     * Old code below, delete once the new code is working 
     */
    
    ns.FaceteTableModOld = Class.create({
        initialize: function() {
           this.columnIds = [];
           //this.columnIdToPath = [];
           
           //this.pathToColumnId = [];
           this.columnIdToPath = new util.HashBidiMap();
           
           this.columnIdToData = {};
           
           this.tableMod = new ns.TableMod();
        },
        
        getTableMod: function() {
            return this.tableMod;
        },
        
        createColumnData: function() {
            var self = this;
            var result = _(this.columnIds).map(function(columnId) {
                var r = self.columnIdToData;
                
                if(!r) {
                    r = {};
                    self.columnIdToData[columnId] = r;
                }
                
                
                
                return r;
            });            
        },
        
        getColumns: function() {
            var self = this;
            var result = _(this.columnIds).map(function(columnId) {
                var r = self.columnIdToData;
                return r;
            });

//            var self = this;
//            
//            var tableMod = this.tableMod;
//            var sortConditions = tableMod.getSortConditions();
//            var aggregators = tableMod.getAggregators();
//            
//            var sortMap = sortConditions.createMap();
//            
//            var result = _(this.columnIds).map(function(columnId) {
//                var r = {};
//                
//                var path = self.columnIdToPath[columnIdToPath];
//                
//                var sort = sortMap[columnId];
//                if(sort) {
//                    r.sort = sort;
//                }
//
//            });
//            
//            return result;
        },

        putColumn: function(columnId, path) {
            this.columnIds.push(path);
            this.columnIdToPath.put(columnId, path);
        },
        
        removeColumn: function(columnId) {
            var tableMod = this.tableMod;
            //debugger;
            //var pathToColumnId = this.columnIdToPath.getInverse();
            
            this.columnIdToPath.remove(columnId);
            tableMod.removeColumn(columnId);
            
            util.ArrayUtils.filter(this.columnIds, function(item) {
                return item != columnId;
            });
        },
        
        getPaths: function() {
            var r = this.columnIdToPath.getInverse().keyList(); //.map(function(entry) {
            var result = new util.ArrayList();
            result.setItems(r);
//                return entry.getValue(); 
//            });
    
            return result;
        },
        
        togglePath: function(path) {
            var pathToColumnId = this.columnIdToPath.getInverse();
            var columnId = pathToColumnId.get(path);
            
            if(columnId) {
                this.removeColumn(columnId);
            } else {
                columnId = 'col_' + this.columnIds.length;
                
                this.putColumn(columnId, path);                
            }
            
            /*
            var columnIds = pathToColumnId.get(path);
            if(columnIds.length === 0) {
                var columnId = 'col_' + this.columnIds.length;
                
                this.addColumn(columnId, path);
                //pathToColumnId.put(path, columnId);
                //this.columnIds.push(columnId);
            } else {
                var lastColumnId = columnIds[columnIds.length - 1];
                this.removeColumn(lastColumnId);
            }
            */
        }
    });

    
})();
