(function() {

    var rdf = Jassa.rdf;
    var sparql = Jassa.sparql;
    var util = Jassa.util;
    
    var ns = Jassa.facete;

    


    


    

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
    

        
    /*
        createQueryFactory: function() {
            // create an ElementFactory based on the paths and the facetConfig
            var elementFactory = new ns.ElementFactoryFacetPaths(this.facetConfig, this.paths);

            var queryFactory = new ns.QueryFactoryTableMod(elementFactory, tableMod);
            
            return queryFactory;
        }
    */
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
