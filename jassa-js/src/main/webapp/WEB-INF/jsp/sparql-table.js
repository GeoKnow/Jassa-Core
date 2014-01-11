(function() {

    var ns = Jassa.facete;

    
    
    ns.updateSortConditions = function(arr, sc) {
        
        // Create the new array,
        // overwrite the original array
        
    };
    
    
    ns.SortConditionList = Class.create({
        initialize: function() {
            this.sortConditions = [];            
        },
        
        addSortCondition: function(sortCondition) {
            
        },

        createMap: function() {
            var result = {};
            
            _(this.sortConditions).each(function(sc, index) {
                var columnId = sc.getColumnId();
                var sortDirection = sc.getSortDirection();
                
                result[columnId] = {sortIndex: index, sortDirection: sortDirection};
            });
            
            return result;
        },
        
        clear: function() {
            while(this.sortConditions.length > 0) {
                this.sortConditions.pop();
            }
            
            
            //this.sortConditions = [];
        },
    });

    
    

    ns.ElementFactoryFacetePaths: Class.create(sparql.ElementFactory, {
        initialize: function(baseFacetNode) {
            this.baseFacetNode = baseFacetNode;
            //this.baseElementFactory = baseElementFactory;
            this.paths = [];
        },
                
        getPaths: function() {
            return this.paths;
        },
        
        createElement: function() {
            var elements = _(this.paths).map(function() {
                var element = facetNode.getElement();
                //var element = elements.length
                
                var optional = new sparql.ElementOptional(element);
                return optional;
            });
            
            var result = elements.length === 1 ? elements[0] : new sparql.ElementGroup(elements);
            
            return result;
        }
    });
    

    ns.QueryFactoryFaceteTableMod: Class.create(sparql.QueryFactory, function() {
        initialize: function(elementFactory, tableMod) {
            this.elementFactory = elementFactory;
            this.tableMod = tableMod;
            
            this.columnIds = [];
            this.columnIdToSparqlExpr = {};
        },
        
        createQuery: function() {
            var element = this.elementFactory.createElement();
            
            var query = new sparql.Query();
            
            query.setSelectType();
            query.setElement(element);
            
            // The array of columnIds that are based on aggregation
            var tableMod = this.tableMod;
            
            // Iterate all columns of the tableMod
            var columnIds = tableMod.getColumnIds();
            
            var columnInfos = this.tableMod.createColumnInfos();

            var aggColumnIds = _(columnIds).filter(function(columnId) {
                var columnInfo = columnInfo[columnId];
                return columnInfo.aggregatorName != null;
            });
            

            /*
             * Group By
             */
            var groupByColumnIds = _(columnIds).difference(aggColumnIds);
            
            _(columnIds).each(function(columnId) {
                var columnInfo = columnInfo[columnId];
            });
            
            
            var groupByExprs = _(groupByColumnIds).map(function(groupByColumnId) {
                var expr = self.columnToExpr(groupByColumnId);
            });
            
            var queryGbs = query.getGroupBy();
            queryGbs.push.apply(queryGbs, groupByExprs);
            
            
            /*
             * Sort conditions
             */
            var tableScs = tableMod.getSortConditions();
            
            var scs = _(tableScs).map(function(tableScs) {
                var columnId = tableScs.getColumnId();
                var sortDirection = tableScs.getSortDirection();
                
                var exprVar = new sparql.ExprVar(rdf.NodeFactory.createVar(columnId));
                var sc = new sparql.SortCondition(exprVar, sortDirection);
                
                return sc;
            });
            
            var queryScs = query.getSortConditions();
            queryScs.push.apply(queryScs, scs);

            
            /*
             * Limit and offset
             */
            var limitAndOffset = tableMod.getLimitAndOffset();
            
            query.setLimit(limitAndOffset.getLimit());
            query.setOffset(limitAndOffset.getOffset());
        }
    });
    
    
    
    ns.TableSpec = Class.create({
        getColumnNames: function() {
            
        }
    });

    
    ns.TableSparqlQueryBase = Class.create({
        createBaseQuery: function() {
            throw 'Not overridden';
        },
        
        createQuery: function() {
            
        }
    });
    
    
    ns.TableSparqlQueryFacete = Class.create(ns.TableSparqlQuery, {
        
    });
    
    
    
    // Fuck the code below... lets start from scratch
    
    
    
    //ns.ColumnFactory = C
    
    ns.SimpleColumn = Class.create({
        initialize: function(table, columnId) {
            this.table = table;
            this.columnId = columnId;

            this.filterString = null;
            this.sortDirection = 0;
            this.metadata = {};
        },
        
        getTable: function() {
            return this.table;  
        },
        
        getColumnId: function() {
            return this.columnId;
        },
        
        getMetadata: function() {
            return this.metadata;
        },
        
        getFilterString: function() {
            return this.filterString;
        },
        
        setFilterString: function(filterString) {
            this.filterString = filterString;
        },
        
        getSortDirection: function(sortDirection) {
            return this.sortDirection;
        },
        
        
    });
    
    
    ns.SimpleTable = Class.create({
        
        initialize: function(columnFactory) {
            this.columnFactory = columnFactory;
            
            this.sortConditions = [];
        },
        
        setTableFilter: function(filterString) {
            
        },
        
        setColumnFilter: function(columnId, filterString) {
            
        },

        addSortCondition: function(columnId, sortDirection) {
            
        }
    });
    
    
    
    /**
     * A column definition links the data that corresponds to a path to a single column
     * and associates it with a name.
     * 
     */
    ns.ColumnDefPath = Class.create({
        /*
         * @param columnName The name of the column
         * @param path The path which to link to the column     
         * @param useProperty false: Use the path's target's values. If true: refer to the paths child properties instead. 
         */
        initialize: function($super, columnName, path, useProperty) {
            $super(columnName);
            this.path = path;
            this.useProperty = useProperty;
            
            this.aggName = null;
        },
        
        setPath: function(path) {
            this.path = path;  
        },
        
        getPath: function() {
            return this.path;
        },
        
        useProperty: function() {
            return this.useProperty;
        },
        
        getAggName: function() {
            return this.aggName;
        },
        
        setAggName: function(aggName) {
            this.aggName = aggName;
        }
    });

    
    //ns.SortOrderDef =
    ns.IdAlloc = Class.create({
        initialize: function(generator, map) {
            this.generator = generator;
            this.map = map;
        },

        alloc: function(item) {
            var id = this.map.get(item);
            if(id == null) {
                id = generator.next();
            }
            
            this.map.put(item, id);
            return id;
        },
        
        unalloc: function(item) {
            var result = this.map.get(item);
            this.map.remove(item);
            
            return result;
        },
        
        toggle: function(item) {
            util.CollectionUtils.toggleItem(item);
        }
    });
      
    ns.IdAlloc.create = function() {
        var gen = new sparql.GenSym("id");
        var map = new util.HashMap();
        var result = new ns.IdAlloc(gen, map);
        return result;
    };
        
    
    ns.SortOrderDef = Class.create({
        initialize: function(columnId, sortDir) {
            this.columnId = columnId;
            this.sortDir = sortDir;
        },
       
        getColumnId: function() {
            return this.columnId;
        },
       
        getSortDir: function() {
            return this.sortDir;
        }
    });
    
    
    ns.SparqlTableSpec = Class.create({
        initialize: function() {
            this.pathIdAlloc = ns.IdAlloc.create();
            this.tableSpec = new ns.TableSpec();
        },

        createColumnFromPath: function(path) {
            var columnId = this.pathIdAlloc.alloc(path);
            
            var col = this.tableSpec.createColumn(columnId);
            
            col.getData().path = path;
        },

        getColumnSpecs: function() {
            return this.tableSpec.getColumnSpecs();
        },
        
        getColumnsByPath: function(path) {
            var columnSpecs = this.tableSpec.getColumnSpecs();
            
            var result = _(columnSpecs).filter(function(columnSpec) {
                var data = columnSpec.getData();
                var r = path.equals(data.path);
                return r;
            });
            
            return result;
        },
        
        toggleColumn: function(path) {
            var columnSpecs = this.getColumnsByPath(path);
            if(columnSpecs.length == 0) {
                this.createColumnFromPath(path);
            }
            else {
                var columnSpec = columnSpecs[columnSpecs.length - 1];
                this.tableSpec.removeColumn(columnSpec.getColumnId());
            }
        },

        getTableSpec: function() {
            return this.tableSpec;
        }
    });
    
    // TODO Possibly rename to SparqlTableSpec
    ns.TableSpec = Class.create({
        initialize: function() {
            //this.paths = new util.ArrayList();
            
            this.pathIdAlloc = ns.IdAlloc.create();
            
            //this.columnIds = [];             
            //this.columnIdToData = {};
            
            this.columnSpecIds = [];
            this.columnSpecs = {};

            this.sortOrders = [];
            
            //this.colNameToIndex = {};
        },
        
        createColumnSpec: function(id) {
            var tmp = this.columnSpecs[id];
            if(tmp != null) {
                throw 'Column with id ' + id + ' already exists';
            }
            
            var result = new ns.ColumnSpec(id);
            return result;
        },

        getColumnSpecs: function() {
            var self = this;
            var result = _(this.columnSpecIds).map(function(columnSpecId) {
                var columnSpec = self.columnSpecs[columnSpecId];
                return columnSpec;
            });
            
            return result;
        },

        /**
         *
         * @param isResetting Whether the addition of the order resets the prior order
         */
        addOrder: function(columnId, sortOrder, isResetting) {
            
            
            var newOrder = [];
            var didUpdate = false;

            if(!isResetting) {
            
                _(this.sortOrders).each(function(sortOrder) {
                    var targetColumnId = sortOrder.getColumnId();
                    if(columnId === targetColumnId) {
    
                        didUpdate = true;
    
                        // update the column sort order
                        if(sortOrder === 0) {
                            // skip
                        } else {
                            newOrder.push({columnId: columnId, sortOrder: sortOrder});
                        }
                        
                    } else {
                        newOrder.push(sortOrder);
                    }
                    
                    sortOrder.getSortDir()
                });
            }
            
            if(!didUpdate) {
                sortOrder.push({columnId: columnId, sortOrder: sortOrder});
            }
            
            this.sortOrders = newOrder;
        }
        
        getSortOrders: function() {
            return this.sortOrders;
        }
                
//         getPaths: function() {
//             var self = this;
            
//             var paths = _(self.columnIds)
            
//             return this.paths;
//             //return this.paths.getArray();
//         },
        
//         togglePath: function(path) {
//             util.CollectionUtils.toggleItem(this.paths, path);
//         },
        
//         setSort: function(path, sortDirection) {
            
//         },
        
//         appendSort: function(path) {
            
//         }
    });
    
})();



/**
 * Converts a Table Definition to a SPARQL graph pattern
 *
 * TODO Sort out some base class
 */
ns.TableToElement = Class.create({
    initialize: function(baseFacetNode) {
        this.baseFacetNode = baseFacetNode;
        //this.filterManagerFactory = filterManagerFactory;
    },

    /**
     * Transforms the tableDef into a SPARQL element
     *
     * Post process whether optional elements are actually mandatory
     * Cross checks with the constraintManager of whether the
     * (sub-)elements are optional or mandatory
     *
     *
     */
    transform: function(tableDef) {
        var baseFacetNode = this.baseFacetNode;
        var columnDefs = tableDef.getColumnDefs();
        
        //var filterManager = this.filterManagerFactory.createConstraintManager();
        
        
        var aggCols = []; 
        
        // If there are aggregation columns, all remaining non-agg columns
        // implicitely become group by columns
        
        var groupByCols = [];
        
        
        // What about search terms on the columns?
        
        var elements = _(columnDefs).map(function(cd) {
            var isCdp = cd instanceof ns.ColumnDefPath;
            
            if(!isCdp) {
                console.log('[ERROR] Unknown column definition type');
                throw 'Bailing out';
            }
            
            var path = cd.getPath();
            
            var facetNode = baseFacetNode.forPath(path);
            var r = facetNode.getElements();

            //var r = transformCdp(cd);
            return r;
        });
        
        
        
        var sortOrders = tableDef.getSortOrders();
        
        
        // For each column, collect the triple patterns that correspond to the paths
    }
});
