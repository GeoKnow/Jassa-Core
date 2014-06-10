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
           if(!query) {
               var deferred = jQuery.Deferred();
               deferred.resolve(0);
               result = deferred.promise();
           } else {           
               query = query.clone();
    
               query.setLimit(null);
               query.setOffset(null);
     
               var result = ns.ServiceUtils.fetchCountQuery(sparqlService, query, timeoutInMillis, secondaryCountLimit);
           }

           return result;
       },
       
       fetchData: function(sparqlService, query, limit, offset) {
           if(!query) {
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
    });



    ns.TableServiceSparqlQuery = Class.create(ns.TableService, {
        /**
         * TODO Possibly add primaryCountLimit - i.e. a limit that is never counted beyond, even if the backend might be fast enough
         */
        initialize: function(sparqlService, query, timeoutInMillis, secondaryCountLimit) {
            this.sparqlService = sparqlService;
            this.query = query;
            this.timeoutInMillis = timeoutInMillis || 3000;
            this.secondaryCountLimit = secondaryCountLimit || 1000;
        },
        
        fetchSchema: function() {
            var query = this.query;

            var schema = {
                colDefs: ns.TableServiceUtils.createNgGridOptionsFromQuery(query)
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

    
    /**
     * So the issue is: actually we need a lookup service to get the column headings
     * The lookup service would need the sparqlService
     * 
     * 
     */
    ns.TableServiceFacet = Class.create(ns.TableService, {
        initialize: function(sparqlService, tableConfigFacet, lookupServiceNodeLabels, lookupServicePathLabels, timeoutInMillis, secondaryCountLimit) {
            this.sparqlService = sparqlService;
            this.tableConfigFacet = tableConfigFacet;
            this.lookupServiceNodeLabels = lookupServiceNodeLabels;
            this.lookupServicePathLabels = lookupServicePathLabels;
            this.timeoutInMillis = timeoutInMillis;
            this.secondaryCountLimit = secondaryCountLimit;
        },
        
        fetchSchema: function() {
            var tableConfigFacet = this.tableConfigFacet;
            
            var paths = tableConfigFacet.getPaths().getArray();
                        
            // We need to fetch the column headings
            var promise = this.lookupServicePathLabels.lookup(paths);
            
            var result = promise.pipe(function(map) {
                
                var colDefs = _(paths).map(function(path) {
                    var r = {
                        field: tableConfigFacet.getColumnId(path),
                        displayName: map.get(path),
                        path: path
                    };
                });

                var r = {
                    colDefs: colDefs
                };

                return r;
            });
            
            return result;
        },
                
        fetchCount: function() {
            var result = ns.TableServiceUtils.fetchCount(this.sparqlService, this.query, this.timeoutInMillis, this.secondaryCountLimit);
            return result;            
        },
        
        // TODO Rename function - its too generic
        // It takes a Map<String, Node> and transforms it to Map<String, {node:, displayLabel: }>
        // TODO An alternative would be to just put the map with the labels into the schema...
        transformData: function(data) {
            // Collect nodes
            var nodes = [];
            _(data).each(function(item, k) {
                _(item).each(function(node) {
                    nodes.push(node);                    
                });
            });
            
            // Get the node labels
            var p = this.lookupServiceNodeLabels.lookup(nodes);
            
            // Transform every node
            var result = p.pipe(function(nodeToLabel) {
                var r = _(data).map(function(item) {
                    var r = {};
                    _(item).each(function(node, key) {
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
        },
        
        fetchData: function(limit, offset) {
            var promise = ns.TableServiceUtils.fetchData(this.sparqlService, this.query, limit, offset);

            var self = this;
            var result = promise.pipe(function(data) {
                var r = self.transformData(data);
                return r;
            });
            
            return result;
        },
        
        fetchCount: function() {
            var result = ns.TableServiceUtils.fetchCount(this.sparqlService, this.query, this.timeoutInMillis, this.secondaryCountLimit);
            return result;            
        }
        
    });
    
    
})();

