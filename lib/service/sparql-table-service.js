(function() {

    var util = Jassa.util;
    var sparql = Jassa.sparql;

    var ns = Jassa.service;


    ns.TableServiceUtils = {
        bindingToJsMap: function(varList, binding) {
            var result = {};
            
            _(varList).each(function(v) {
                var varName = v.getName();
                //result[varName] = '' + binding.get(v);
                result[varName] = binding.get(v);
            });

            return result;
       },
       
       createNgGridOptionsFromQuery: function(query) {
           if(!query) {
               return [];
           }
           
           var projectVarList = query.getProjectVars(); //query.getProjectVars().getVarList();
           var projectVarNameList = sparql.VarUtils.getVarNames(projectVarList);

           var result = _(projectVarNameList).map(function(varName) {
               var col = {
                   field: varName,
                   displayName: varName
               };
                   
               return col;
           });
           
           return result;
       },

       fetchCount: function(sparqlService, query, timeoutInMillis, secondaryCountLimit) {
           var result;
           if(!sparqlService || !query) {
               var deferred = jQuery.Deferred();
               deferred.resolve(0);
               result = deferred.promise();
           } else {           
               query = query.clone();
    
               query.setLimit(null);
               query.setOffset(null);
     
               result = ns.ServiceUtils.fetchCountQuery(sparqlService, query, timeoutInMillis, secondaryCountLimit);
           }

           return result;
       },
       
       fetchData: function(sparqlService, query, limit, offset) {
           if(!sparqlService || !query) {
               var deferred = jQuery.Deferred();

               var itBinding = new util.IteratorArray([]);
               var varNames = [];
               var rs = new ns.ResultSetArrayIteratorBinding(itBinding, varNames);
              
               
               deferred.resolve(rs);
               return deferred.promise();
           }

           // Clone the query as to not modify the original object
           query = query.clone();

           query.setLimit(limit);
           query.setOffset(offset);
           
           var qe = sparqlService.createQueryExecution(query);

           var result = qe.execSelect().pipe(function(rs) {
               var data = [];
               
               var projectVarList = query.getProjectVars(); //query.getProjectVars().getVarList();
               
               while(rs.hasNext()) {
                   var binding = rs.next();
                   
                   var o = ns.TableServiceUtils.bindingToJsMap(projectVarList, binding);
                   
                   data.push(o);
               }
               
               return data;
           });
           
           return result;           
       },

       collectNodes: function(rows) {
           // Collect nodes
           var result = [];
           _(rows).each(function(item, k) {
               _(item).each(function(node) {
                   result.push(node);
               });
           });

           _(result).uniq(false, function(x) { return '' + x; });
           
           return result;
       },

       fetchSchemaTableConfigFacet: function(tableConfigFacet, lookupServicePathLabels) {
           var paths = tableConfigFacet.getPaths().getArray();
           
           // We need to fetch the column headings
           var promise = lookupServicePathLabels.lookup(paths);
           
           var result = promise.pipe(function(map) {
               
               var colDefs = _(paths).map(function(path) {
                   var r = {
                       field: tableConfigFacet.getColumnId(path),
                       displayName: map.get(path),
                       path: path
                   };
                   return r;
               });

               var r = {
                   colDefs: colDefs
               };

               return r;
           });
           
           return result;           
       },

       // rows is expected to be a List<Map<String, Node>>
       transformToNodeLabels: function(lookupServiceNodeLabels, rows) {
           
           var nodes = this.collectNodes(rows);
           
           // Get the node labels
           var p = lookupServiceNodeLabels.lookup(nodes);
           
           // Transform every node
           var result = p.pipe(function(nodeToLabel) {
               var r = _(rows).map(function(row) {
                   var r = {};
                   _(row).each(function(node, key) {
                       var label = nodeToLabel.get(node);
                       r[key] = {
                           node: node,
                           displayLabel: label
                       };
                   });
                   return r;
               });
               return r;                    
           });
           
           return result;
       }
    };

    ns.TableService = Class.create({
        /**
         * Expected to return an object:
         * 
         * {    
         *    columns: [{id: 's', tags: your data}, {id: 'p'}]
         *    tags: your data
         * }
         */
        fetchSchema: function() {
            console.log('Implement me');
            throw 'Implement me';
        },
        
        /**
         * Expected to return a promise which yields an integral value for the total number of rows
         */
        fetchCount: function() {
            console.log('Implement me');
            throw 'Implement me';
        },        
        
        /**
         * Expected to return a promise which yields an array of objects (maps) from field name to field data
         */
        fetchData: function(limit, offset) {
            console.log('Implement me');
            throw 'Implement me';
        }
        
        /**
         * For identical hash codes, the response of the fetchData method is assumed to
         * be the same
         */
//        getDataConfigHash: function() {
//            console.log('Implement me');
//            throw 'Implement me';
//        },
//        
//        getSchemaConfigHash: function() {
//            console.log('Implement me');
//            throw 'Implement me';
//        }
    });



    ns.TableServiceQuery = Class.create(ns.TableService, {
        /**
         * TODO Possibly add primaryCountLimit - i.e. a limit that is never counted beyond, even if the backend might be fast enough
         */
        initialize: function(sparqlService, query, timeoutInMillis, secondaryCountLimit) {
            this.sparqlService = sparqlService;
            this.query = query;
            this.timeoutInMillis = timeoutInMillis || 3000;
            this.secondaryCountLimit = secondaryCountLimit || 1000;
        },
        
//        getDataConfigHash: function() {
//            var query = this.queryFactory.createQuery();
//            var result = '' + query;
//            return result;
//            //return '' + this.queryFactory.createQuery();
//        },
//        
//        getSchemaConfigHash: function() {
//            return '' + this.query;
//        },
        
        fetchSchema: function() {
            var schema = {
                colDefs: ns.TableServiceUtils.createNgGridOptionsFromQuery(this.query)
            };

            var deferred = $.Deferred();
            deferred.resolve(schema);
            
            return deferred.promise();
        },
        
        fetchCount: function() {
            var result = ns.TableServiceUtils.fetchCount(this.sparqlService, this.query, this.timeoutInMillis, this.secondaryCountLimit);
            return result;
        },
        
        fetchData: function(limit, offset) {
            var result = ns.TableServiceUtils.fetchData(this.sparqlService, this.query, limit, offset);
            return result;
        }        
    });

    
    ns.TableServiceDelegateBase = Class.create(ns.TableService, {
        initialize: function(delegate) {
            this.delegate = delegate;
        },

        fetchSchema: function() {
            var result = this.delegate.fetchSchema();
            return result;
        },
        
        /**
         * Expected to return a promise which yields an integral value for the total number of rows
         */
        fetchCount: function() {
            var result = this.delegate.fetchCount();
            return result;
        },        
        
        /**
         * Expected to return a promise which yields an array of objects (maps) from field name to field data
         */
        fetchData: function(limit, offset) {
            var result = this.delegate.fetchData();
            return result;
        }               
    });
    
    
    ns.TableServiceNodeLabels = Class.create(ns.TableServiceDelegateBase, {
        initialize: function($super, delegate, lookupServiceNodeLabels) {
            $super(delegate);
            this.lookupServiceNodeLabels = lookupServiceNodeLabels;
        },

        fetchData: function(limit, offset) {            
            var promise = this.delegate.fetchData(limit, offset);

            var self = this;
            var result = promise.pipe(function(rows) {
                var r = ns.TableServiceUtils.transformToNodeLabels(self.lookupServiceNodeLabels, rows);
                return r;
            });
            
            return result;
        }    
    });

    
    /**
     * So the issue is: actually we need a lookup service to get the column headings
     * The lookup service would need the sparqlService
     * 
     * 
     */
    //ns.TableServiceFacet = Class.create(ns.TableService, {
    ns.TableServiceFacet = Class.create(ns.TableServiceNodeLabels, {
        initialize: function($super, tableServiceQuery, tableConfigFacet, lookupServiceNodeLabels, lookupServicePathLabels) {
            $super(tableServiceQuery, lookupServiceNodeLabels);
            //this.tableServiceQuery = tableServiceQuery;
            this.tableConfigFacet = tableConfigFacet;
            //this.lookupServiceNodeLabels = lookupServiceNodeLabels;
            this.lookupServicePathLabels = lookupServicePathLabels;
        },
        
        fetchSchema: function() {
            // Ignores the schema of the underlying table Service
            var result = ns.TableServiceUtils.fetchSchemaTableConfigFacet(this.tableConfigFacet, this.lookupServicePathLabels);
            return result;
        }
                
//        fetchCount: function() {
//            var result = this.tableServiceQuery.fetchCount();
//            return result;            
//        },
//                
//        fetchData: function(limit, offset) {
//            
//            var promise = this.tableServiceQuery.fetchData(limit, offset);
//            //var promise = ns.TableServiceUtils.fetchData(this.sparqlService, this.query, limit, offset);
//
//            var self = this;
//            var result = promise.pipe(function(rows) {
//                var r = ns.TableServiceUtils.transformToNodeLabels(self.lookupServiceNodeLabels, rows);
//                return r;
//            });
//            
//            return result;
//        }
    });
    
    
})();

