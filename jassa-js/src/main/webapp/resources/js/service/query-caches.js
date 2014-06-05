(function() {
	
    var util = Jassa.util;
	var sparql = Jassa.sparql;
	
	var ns = Jassa.service;

	
	/**
	 * A query cache that for a given SPARQL select query and one of its variables caches the corresponding bindings.
	 * 
	 * 
	 * @param sparqlService
	 * @returns {ns.QueryCacheFactory}
	 */
	
	
//	ns.QueryCacheFactory = Class.create({
//	    initialize: function(sparqlService) {
//	        this.sparqlService = sparqlService;
//	        this.queryToCache = {};
//	    },
//	
//	    /**
//	     * If a cache was already created for a query, the same cache is returned
//	     * 
//	     */
//	    create: function(query) {
//    		var queryStr = query.toString();
//    		var result = this.queryToCache[queryStr];
//    		
//    		if(!result) {
//    			result = new ns.QueryCache(this.sparqlService, query);
//    			this.queryToCache[queryStr] = result;
//    			
//    		}
//    
//    		return result;
//	    }
//	});
//
	
	
// TODO How to unify the simple cache and a fully fledged binding cache?
//  I.e. how to unify lookups based on an array of nodes
//   with those of an array of bindings?
//    
	
// TODO How to keep track of pagination?
// TODO How to deal with 'sub-caches'? I.e. There is an index on (?x) and another on (?x, ?y)
	    // Well, this is more related to how to find the best index and that's a different topic
	
	ns.QueryCacheNodeFactory = Class.create({
		createQueryCache: function(sparqlService, query, indexExpr) {
			throw 'Not overridden';
		}
	});
	
	
	ns.QueryCacheNodeFactoryImpl = Class.create(ns.QueryCacheNodeFactory, {
		initialize: function() {
			this.keyToCache = new Cache(); 
		},
		
		createQueryCache: function(sparqlService, query, indexExpr) {
      // FIXME: SparqlService.getServiceState() not defined
			var key = 'cache:/' + sparqlService.getServiceId() + '/' + sparqlService.getServiceState() + '/' + query + '/' + indexExpr;
			
			console.log('cache requested with id: ' + key);
			
			var cache = this.keyToCache.getItem(key);
			if(cache == null) {
				cache = new ns.QueryCacheBindingHashSingle(sparqlService, query, indexExpr);
				this.keyToCache.addItem(key, cache);
			}
			
			return cache;
		}
	});
	
	
	
	ns.QueryCacheBindingHashSingle = Class.create({
	    initialize: function(sparqlService, query, indexExpr) {
            this.sparqlService = sparqlService;
            this.query = query;

            //this.indexVarName = indexVarName;
            this.indexExpr = indexExpr;
            
            
            this.maxChunkSize = 50;
            
            //this.indexVar = rdf.
            
            this.exprEvaluator = new sparql.ExprEvaluatorImpl();
            
            this.nodeToBindings = new Cache();
            
            // Cache for nodes for which no data existed
            this.nodeMisses = new Cache();
	    },
	    
	    fetchResultSet: function(nodes) {
	        var self = this;
	        var nodeToBindings = this.nodeToBindings;

	        
	        var stats = this.analyze(nodes);
	        
	        var resultBindings = [];
	        
	        // Fetch data from the cache
	        _(stats.cachedNodes).each(function(node) {
	            var bindings = nodeToBindings.getItem(node.toString());
	            resultBindings.push.apply(resultBindings, bindings);
	        });
	        
	        // Fetch data from the chunks
	        
	        var fetchTasks = _(stats.nonCachedChunks).map(function(chunk) {
	            var promise = self.fetchChunk(chunk);
	            return promise;
	        });
	    
            var masterTask = $.when.apply(window, fetchTasks);
            
            var exprEvaluator = this.exprEvaluator;
            var indexExpr = this.indexExpr; 
            
            // TODO Cache the misses
            var result = masterTask.pipe(function() {          
                
                var seenKeys = {};
                
                for(var i = 0; i < arguments.length; ++i) {
                    var rs = arguments[i];
                    while(rs.hasNext()) {
                        var binding = rs.nextBinding();
                    
                        resultBindings.push(binding);
                        
                        var keyNode = exprEvaluator.eval(indexExpr, binding);
                        
                        var hashKey = keyNode.toString();
                        
                        // Keep track of which nodes we have encountered
                        seenKeys[hashKey] = keyNode;
                        
                        var cacheEntry = nodeToBindings.getItem(hashKey);
                        if(cacheEntry == null) {
                            cacheEntry = [];
                            nodeToBindings.setItem(hashKey, cacheEntry);
                        }
                        
                        cacheEntry.push(binding);
                    }              
                }
              
                var itBinding = new util.IteratorArray(resultBindings);
                var r = new ns.ResultSetArrayIteratorBinding(itBinding);
                
                return r;
            });
//                .fail(function() {
//                
//            });

            return result;
	    },
	    
	    fetchChunk: function(nodes) {
	        var query = this.query.clone();
	        
	        var filterExpr = new sparql.E_OneOf(this.indexExpr, nodes);
	        var filterElement = new sparql.ElementFilter([filterExpr]);
	        query.getElements().push(filterElement);
	        
	        var qe = this.sparqlService.createQueryExecution(query);
	        
	        var result = qe.execSelect();
	        return result;
	        //var v = rdf.NodeFactory.createVar(this.index);
	    },
	    
	    /**
	     * Given an array of nodes, this method returns:
	     * (a) the array of nodes for which cache entries exist
	     * (b) the array of nodes for which NO cache entries exist
	     * (c) the array of nodes for which it is know that no data exists
	     * (c) chunked arrays of nodes for which no cache entries exist
	     * (d) the maxChunkSize used to create the chunks
	     * 
	     * @param nodes
	     * @returns
	     */
	    analyze: function(nodes) {
	        var nodeToBindings = this.nodeToBindings;
	        
	        var cachedNodes = [];
	        var nonCachedNodes = [];
	        
	        _(nodes).each(function(node) {
	            var nodeStr = node.toString();
	            var entry = nodeToBindings.getItem(node.toString());
	            if(entry == null) {
                    nonCachedNodes.push(node);
	            } else {
                    cachedNodes.push(node);
	            }
	        });
	        
	        
            var maxChunkSize = this.maxChunkSize;

            var nonCachedChunks = [];
            for (var i = 0; i < nonCachedNodes.length; i += maxChunkSize) {
                var chunk = nodes.slice(i, i + maxChunkSize);
    
                nonCachedChunks.push(chunk);
            }

	        var result = {
	            cachedNodes: cachedNodes,
	            nonCachedNodes: nonCachedNodes,
	            nonCachedChunks: nonCachedChunks,
	            maxChunkSize: maxChunkSize
	        };

	        return result;
	    }
	
	});
	

})();
