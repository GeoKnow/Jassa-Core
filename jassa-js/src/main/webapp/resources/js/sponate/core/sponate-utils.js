(function() {

	// TODO Differntiate between developer utils and user utils
	// In fact, the latter should go to the facade file
	
	var sparql = Jassa.sparql; 

	var ns = Jassa.sponate;
	
	ns.ServiceSponateSparqlHttp = Class.create({
		initialize: function(rawService) {
			this.rawService = rawService;
		},
		
		execSelect: function(query, options) {
			var promise = this.rawService.execSelect(query, options);
			
			var result = promise.pipe(function(json) {
				var bindings = json.results.bindings;

				var tmp = bindings.map(function(b) {
					//console.log('Talis Json' + JSON.stringify(b));
					return sparql.Binding.fromTalisJson(b);
				});
				
				var it = new ns.IteratorArray(tmp);
				
				//console.log()
				
				return it;
			});
			
			return result;
		}
	});

	
	/**
	 * A factory for backend services.
	 * Only SPARQL supported yet.
	 * 
	 */
	ns.ServiceUtils = {
	
		createSparqlHttp: function(serviceUrl, defaultGraphUris, httpArgs) {
		
			var rawService = new sparql.SparqlServiceHttp(serviceUrl, defaultGraphUris, httpArgs);
			var result = new ns.ServiceSponateSparqlHttp(rawService);
			
			return result;
		}	
	};
	
	
	/**
	 * Utility class to create an iterator over an array.
	 * 
	 */
	ns.IteratorArray = function(array, offset) {
		this.array = array;
		this.offset = offset ? offset : 0;
	};
	
	ns.IteratorArray.prototype = {
		hasNext: function() {
			var result = this.offset < this.array.length;
			return result;
		},
		
		next: function() {
			var hasNext = this.hasNext();
			
			var result;
			if(hasNext) {			
				result = this.array[this.offset];
				
				++this.offset;
			}
			else {
				result = null;
			}
			
			return result;
		}		
	};
	

	/*
	ns.AliasedElement = Class.create({
		initialize: function(element, alias) {
			this.element = element;
			this.alias = alias;
		},
		
		getElement: function() {
			return this.element;
		},
		
		getAlias: function() {
			return this.alias;
		},
		
		toString: function() {
			return '' + this.element + ' As ' + this.alias;
		}
	});
	*/
	
	/**
	 * a: castle
	 * 
	 * 
	 * b: owners
	 * 
	 * 
	 */
	ns.JoinBuilderElement = Class.create({
		initialize: function() {
			this.varAliasMap = new ns.VarAliasMap();
			this.aliasToElement = new ns.MapList(); 
		},
		
		// 
		add: function(element, projectVars) {
			
		},
		
		get: function() {
			
		}
	});

	/*
	 * We need to map a generated var back to the alias and original var
	 * {?foo -> {alias: 'bar', var: 'baz'} }
	 * 
	 * We need to map and alias and a var to the generater var
	 * { bar: { baz -> ?foo } }
	 *
	 * 
	 * 
	 * 
	 */
	ns.VarAliasMap = Class.create({
		initialize: function() {
			this.aliasToBinding = {};
			this.newVarToAliasVar = {};
		},
		
		put: function(origVar, alias, newVar) {
			
		},
		
		getAliasVar: function(newVar) {
			
		},
		
		getBinding: function(alias) {
			
		}
	});
	
	
	ns.JoinElement = Class.create({
		initialize: function(element, varMap) {
			this.element = element;
		}
		
	});


	ns.JoinUtils = {
		/**
		 * Create a join between two elements 
		 */
		join: function(aliasEleA, aliasEleB, joinVarsB) {
			//var aliasA = aliasEleA. 
			
			var varsA = eleA.getVarsMentioned();
			var varsB = eleB.getVarsMentioned();
			
			
		},
			
		
		
		/**
		 * This method prepares all the joins and mappings to be used for the projects
		 * 
		 * 
		 * 
		 * transient joins will be removed unless they join with something that is
		 * not transient
		 * 
		 */
		createMappingJoin: function(context, rootMapping) {
			var generator = new sparql.GenSym('a');
			var rootAlias = generator.next();

			// Map<String, MappingInfo>
			var aliasToState = {};
			
			// ListMultimap<String, JoinInfo>
			var aliasToJoins = {};
		
			
			aliasToState[rootAlias] = {
				mapping: rootMapping,
				aggs: [] // TODO The mapping's aggregators
			};
			
			var open = [a];
			
			while(open.isEmpty()) {
				var sourceAlias = open.shift();
				
				var sourceState = aliasToState[sourceAlias];
				var sourceMapping = sourceState.mapping;
				
				ns.ContextUtils.resolveMappingRefs(this.context, sourceMapping);
				
				var refs = mapping.getPatternRefs(); 

				// For each reference, if it is an immediate join, add it to the join graph
				// TODO And what if it is a lazy join??? We want to be able to batch those.
				_(refs).each(function(ref) {
					var targetMapRef = ref.getTargetMapRef();
					
					var targetAlias = generator.next();
					
					aliasToState[targetAlias] = {
						mapping: targetMapping	
					};
				
					var joins = aliasToJoins[sourceAlias];
					if(joins == null) {
						joins = [];
						aliasToJoins[sourceAlias] = joins;
					}
					
					var join = {
						targetAlias: targetAlias,
						isTransient: true
					};
					
					joins.push(join);
				});
				
				
				var result = {
					aliasToState: aliasToState, 
					aliasToJoins: aliasToJoins
				};
				
				return result;
			}
		}
			
	};

	
	ns.GraphItem = Class.create({
		initialize: function(graph, id) {
			this.graph = graph;
			this.id = id;
		},
		
		getGraph: function() {
			return this.graph;
		},
		
		getId: function() {
			return this.id;
		}
	});


	ns.Node = Class.create(ns.GraphItem, {
		initialize: function($super, graph, id) {
			$super(graph, id);
		},
		
		getOutgoingEdges: function() {
			var result = this.graph.getEdges(this.id);
			return result;
		}
	});

	
	ns.Edge = Class.create({
		
		initialize: function(graph, id, nodeIdFrom, nodeIdTo) {
			this.graph = graph;
			this.id = id;
			this.nodeIdFrom = nodeIdFrom;
			this.nodeIdTo = nodeIdTo;
		},
		
		getNodeFrom: function() {
			var result = this.graph.getNode(this.nodeIdFrom);
			return result;
		},
		
		getNodeTo: function() {
			var result = this.graph.getNode(this.nodeIdTo);
			return result;			
		}
	});
	
	
	ns.Graph = Class.create({
		initialize: function(fnCreateNode, fnCreateEdge) {
			this.fnCreateNode = fnCreateNode;
			this.fnCretaeEdge = fnCreateEdge;
			
			this.idToNode = {};
			
			// {v1: {e1: data}}
			this.nodeIdToEdgeIdToEdge = {};
			this.idToEdge = {};

			this.nextNodeId = 1;
			this.nextEdgeId = 1;
		},
		
		createNode: function() {
			var nodeId = '' + (++this.nextNodeId);
			
			var result = this.fnCreateNode.apply(arguments /* todo */);
			idToNode[nodeId] = result;
			
			return result;
		},
		
		createEdge: function(nodeIdFrom, nodeIdTo) {
			var edgeId = '' + (++this.nextEdgeId);
			
			var result = this.fnEdgeNode.apply(arguments /* todo */);
			
			var edgeIdToEdge = this.nodeIdToEdgeIdToEdge[edges];
			if(edgeIdToEdge == null) {
				edgeIdToEdge = {};
				this.nodeIdToEdgeIdToEdge = edgeIdToEdge; 
			}
			
			edgeIdToEdge[edgeId] = result;
			this.idToEdge[edgeId] = result;
			
			
			return result;
		}		
		
	});
	
	ns.MappingJoinNode = Class.create(ns.Node, {
		initialize: function($super, graph, nodeId) {
			$super(graph, graph, edgeId); 

			this.graph = graph;
			this.alias = alias;
		},
		
		getAlias: function() {
			return this.alias;
		},
		
		
		// Note refSpec must have an id
		addJoin: function(targetMapping, refSpec) {
			var nodeTo = this.graph.createNode();
			
			
			
			return nodeTo;
		}
	});


	ns.MappingJoinEdge = Class.create(ns.Edge, {
		initialize: function($super, graph, edgeId) {
			$super(graph, graph, edgeId); 
		}
	});

	
	ns.HashMap = Class.create({
		initialize: function(fnHash, fnEquals) {
			this.fnHash = fnHash ? fnHash : (function(x) { return '' + x; });
			this.fnEquals = fnEquals ? fnEuqals : _.isEqual;
			
			this.hashToBucket = {};
		},
		
		put: function(key, val) {
			var hash = this.fnHash(key);
			
			var bucket = this.hashToBucket[hash];
			if(bucket == null) {
				bucket = [];
				this.hashToBucket[hash] = bucket;
			}
			

			var keyIndex = this._indexOfKey(bucket, key);
			if(keyIndex >= 0) {
				bucket[keyIndex].val = val;
				return;
			}
			
			var entry = {
				key: key,
				val: val
			};

			bucket.push(entry);
		},
		
		_indexOfKey: function(bucket, key) {
			if(bucket != null) {

				for(var i = 0; i < bucket.length; ++i) {
					var entry = bucket[i];
					
					var k = entry.key;
					if(this.fnEquals(k, key)) {
						entry.val = val;
						return i;
					}
				}

			}
			
			return -1;
		},
		
		get: function(key) {
			var hash = this.fnHash(key);
			var bucket = this.hashToBucket[hash];
			var i = this._indexOfKey(bucket, key);
			var result = i >= 0 ? bucket[i] : null;
			return result;
		},
		
		containsKey: function(key) {
			var hash = this.fnHash(key);
			var bucket = this.hashToBucket[hash];
			var result =  this._indexOfKey(bucket, key) >= 0;
			return result;
		},
		
		keyList: function() {
			var result = [];
			
			_.each(this.hashToBucket, function(bucket) {
				var keys = _(bucket).pluck('key')
				result.push.apply(result, keys);
			});
			
			return result;
		}
	});
	
	
	ns.BidiHashMap = Class.create({
		/**
		 * NEVER! Pass a constructor argument to this map yourself;
		 * 
		 */
		initialize: function(inverseMap) {
			forward = new ns.HashMap();
			inverse = inverseMap ? inverseMap : new ns.BidiHashMap(this);
		},
		
		getInverse: function() {
			return this.inverse;
		},
		
		put: function(key, val) {
			this.forward.put(key, val);
			this.inverse.put(val, key);
		},
		
		get: function(key) {
			var result = this.forward.get(key);
			return result;
		},
		
		keyList: function() {
			var result = this.forward.keyList();
			return result;
		}
	});
	
})();

