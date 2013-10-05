(function() {
	
	var sparql = Jassa.sparql;
	
	var ns = Jassa.utils;

	
	/**
	 * A query cache that for a given SPARQL select query and one of its variables caches the corresponding bindings.
	 * 
	 * 
	 * @param sparqlService
	 * @returns {ns.QueryCacheFactory}
	 */
	
	
	ns.QueryCacheFactory = function(sparqlService) {
		this.sparqlService = sparqlService;
		this.queryToCache = {};
	};
	
	ns.QueryCacheFactory.prototype.create = function(query) {
		var queryStr = query.toString();
		var result = this.queryToCache[queryStr];
		
		if(!result) {
			result = new ns.QueryCache(this.sparqlService, query);
			this.queryToCache[queryStr] = result;
			
		}

		return result;
	};

	
	
	ns.QueryCache = function(sparqlService, query) {
		this.sparqlService = sparqlService;
		this.query = query;
		
		// TODO Only SELECT queries supported
		
		this.cache = {};
		// TODO Replace with bindingToData
		//this.bindingCache = {};
	};
		
		
	// Note: variable must be part of the projection
	/**
	 * Lookup result bindings by a variable that is bound to a list of nodes.
	 * 
	 * 
	 * @param retain if true, the lookup does not invalidate cached entries
	 */
	ns.QueryCache.prototype = {
			lookup: function(v, nodes, retain) {

				var result = $.Deferred();
				
				var resultJsonRs = {
						results: {
							bindings: null
						}
				};
				
				
				var chunkSize = 50;
				
				var tasks = [];
				
				for (var i = 0, j = nodes.length; i < j; i += chunkSize) {
					
				    var chunk = nodes.slice(i, i + chunkSize);
		
				    var task = this.lookupChunk(v, chunk, retain);
				    tasks.push(task);
				}
				
			
				var masterTask = $.when.apply(window, tasks);
				
			    masterTask.done(function(jsonRs) {	    	

			    	var resultBindings = [];
			    	for(var i = 0; i < arguments.length; ++i) {
			    		var arg = arguments[i];
			    		var chunkBindings = arg.results.bindings;
			    		
			    		// TODO: Set header, if not done yet
			    		
				    	resultBindings = resultBindings.concat(chunkBindings);		    	
			    	}	    	
			    				    	
			    	
			    	// TODO Better create a copy of the bindings, so we don't
			    	// run into trouble with posterior modifications
			    	// var copy = deepCopy(resultBindings);
			    	
			    	
			    	resultJsonRs.results.bindings = resultBindings;
			    	
			    	result.resolve(resultJsonRs);
			    	
			    }).fail(function() {
			    	result.fail();
			    });
		
				
				
				return result;
			},
			
			lookupChunk: function(v, nodes, retain) {
				
				var nodeToData = this.cache[v.value];
				if(!nodeToData) {
					this.cache[v.value] = nodeToData = {};
				}
				
				
				var fetchList = [];
				for(var i = 0; i < nodes.length; ++i) {
					var node = nodes[i];
					
					var keyStr = node.toString(); 
					if(keyStr in nodeToData) {
						continue;
					}
					
					fetchList.push(node);
				}
				
				//console.log('cache state', fetchList, nodeToData);
				
				fetchList = _.uniq(fetchList, function(node) { return node.toString(); });		
		

				
				var promise;
				
				if(_.isEmpty(fetchList)) {			
					promise = $.when();
				} else {
					var filterExpr = new sparql.E_In(v, fetchList);
					var filterElement = new sparql.ElementFilter([filterExpr]);

					
					var copy = this.query.copySubstitute(function(x) { return x; });
					copy.elements.push(filterElement);
		
					promise = this.sparqlService.executeSelect(copy).pipe(function(jsonRs) {
		
						var bindings = jsonRs.results.bindings;
						
						//console.debug("Bindings", bindings);
						
						for(var i = 0; i < bindings.length; ++i) {
							var binding = bindings[i];
							
							
							var jsonNode = binding[v.value];
							var indexNode = sparql.Node.fromTalisJson(jsonNode);
							
							var keyStr = indexNode.toString();

							
							nodeToData[keyStr] = binding;
						}
						
						for(var i = 0; i < fetchList.length; ++i) {
							var fetchItem = fetchList[i];
							var keyStr = fetchItem.toString();
							
							//var entry = nodeToData[keyStr];
							if(!(keyStr in nodeToData)) {
								nodeToData[keyStr] = false;
							}
						}
						
						
					});
				}
		
				var result = promise.pipe(function() {
					var data = {};
					for(var i = 0; i < nodes.length; ++i) {
						var node = nodes[i];
						
						var keyStr = node.toString();
						
						var cached = nodeToData[keyStr];
						if(!cached && !retain) {
							continue;
						} 
						
						data[keyStr] = nodeToData[keyStr];
						
						
//						if(keyStr in nodeToData) {
//							var cached = nodeToData[keyStr];
//							if(cached === null && !retain) {
//								continue;
//							} 
//							
//							data[keyStr] = nodeToData[keyStr];
//						} else {
//							//data[keyStr] = false;
//							//data[keyStr] = null;
//						}
					}
					
					
					var jsonRs = {
							results: {
								bindings: []
							}
					};
					
					jsonRs.results.bindings = _.values(data);
					
					//console.log("Soooo: ", jsonRs);
					
					return jsonRs;
				});
				
				return result;	
			},
			
			/*
			 * Add functions which caches results based on bindings
			 * rather than just single nodes
			 */
			lookupBinding: function(bindings) {
				
			},
			

			lookupChunkBinding: function(v, nodes, retain) {
				var bindings = _.map(nodes, function(node) {
					
					var map = {};
					map[v.value] = node;
					
					return sparql.Binding.create(map);
				});
				
				var dedup = _.uniq(bindings, false, function(item) {
					return item.toString();
				});
				
				var result = this.lookupChunkNode(bindings, retain);
				return result;
			}

	}
	
})();
