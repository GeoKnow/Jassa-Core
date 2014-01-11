(function() {

    var sparql = Jassa.sparql;
    var util = Jassa.util;
    
    var ns = Jassa.facete;

    
    ns.SimpleSortCondition = Class.create({
        initialize: function(columnId, sortDirection) {
            this.columnId = columnId;
            this.sortDirection = sortDirection;
        },
        
        getColumnId: function() {
            return this.columnId;
        },
        
        getSortDirection: function() {
            return this.sortDirection;
        }
    });
 

    ns.SimpleAggregation = Class.create({
        initialize: function(columnId, aggregatorName) {
            this.columnId = columnId;
            this.aggregatorName = aggregatorName;
        },
        
        getColumnId: function() {
            return this.columnId;
        },
        
        getAggregatorName: function() {
            return this.aggregatorName;
        }        
    });

    
    /**
     * Object that holds modifications to a table
     * 
     * { myCol1: {sortDirection: 1, aggName: sum, path: foo}, ... }
     * - sum(?varForFoo) As myCol1
     * 
     */
    ns.TableMod = Class.create({
        initialize: function() {
            this.sortConditions = []; // SimpleSortConditions
            //this.sortOrder = []; // Only references to the columnIds - the sortDir is part of the column
            this.aggregators = [];
            this.limitAndOffset = new facete.LimitAndOffset();
            this.searchStrings = {}; // Mapping from columnId to searchString
        },
        
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
        }
    });

    
    ns.FaceteTableMod = Class.create({
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
                var columnId = 'col_' + this.columnIds.length;
                
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
