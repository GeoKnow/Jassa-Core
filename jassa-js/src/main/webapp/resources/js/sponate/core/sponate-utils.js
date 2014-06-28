(function() {

	// TODO Differntiate between developer utils and user utils
	// In fact, the latter should go to the facade file
	
	var sparql = Jassa.sparql; 
	var util = Jassa.util;

	var ns = Jassa.sponate;

	
	ns.MapParser = Class.create({
	    initialize: function(prefixMapping, patternParser) {
	        this.prefixMapping = prefixMapping;
	        this.patternParser = patternParser || new ns.ParserPattern();
	    },
	    
	    parseMap: function(spec) {
	        var result = ns.SponateUtils.parseMap(spec, this.prefixMapping, this.patternParser);
	        return result;
	    }
	});
	
	ns.SponateUtils = {

	    // TODO: We need to deal with references
	    processResultSet: function(rs, pattern, retainRdfNodes, doClientFiltering) {
            var accumulator = new ns.AggregatorFacade(pattern);
            
            while(rs.hasNext()) {
                var binding = rs.nextBinding();
                
                accumulator.process(binding);
            }
            
            var json = accumulator.getJson(retainRdfNodes);
            
            //console.log('Final json: ' + JSON.stringify(json));
            
            var result;
            if(_(json).isArray()) {

                var filtered = json;

                if(doClientFiltering && !retainRdfNodes) {
                    filtered = _(json).filter(function(item) {
                        // FIXME: criteria not defined
                        var isMatch = criteria.match(item);
                        return isMatch;
                    });
                    
                    var all = json.length;
                    var fil = filtered.length;
                    var delta = all - fil;

                    console.log('[DEBUG] ' + delta + ' items filtered on the client ('+ fil + '/' + all + ' remaining) using criteria ' + JSON.stringify(criteria));
                }

                result = new util.IteratorArray(filtered);
                
            } else {
                console.log('[ERROR] Implement me');
                throw 'Implement me';
            }
            
            return result;
        },
	        
	    /**
	     * Parse a sponate mapping spec JSON object and return a sponate.Mapping object 
	     * 
	     * TODO Add fallback to default patternParser if none provided
	     */
	    parseMap: function(spec, prefixMapping, patternParser) {
            var name = spec.name;

            var jsonTemplate = spec.template;
            var from = spec.from;

            var context = this.context;
            
            // Parse the 'from' attribute into an ElementFactory
            // TODO Move to util class
            var elementFactory;
            if(_(from).isString()) {
                
                var elementStr = from;
                
                if(prefixMapping != null) {
                    var prefixes = prefixMapping.getNsPrefixMap();
                    //var vars = sparql.extractSparqlVars(elementStr);
                    var str = sparql.expandPrefixes(prefixes, elementStr);
                }

                var element = sparql.ElementString.create(str);//, vars);
                
                elementFactory = new sparql.ElementFactoryConst(element);
            }
            else if(from instanceof sparql.Element) {
                elementFactory = new sparql.ElementFactoryConst(from);
            }
            else if(from instanceof sparql.ElementFactory) {
                elementFactory = from;
            }
            else {
                console.log('[ERROR] Unknown argument type for "from" attribute', from);
                throw 'Bailing out';
            }
            
            //this.context.mapTableNameToElementFactory(name, elementFactory);
            
            // TODO The support joining the from element
            
            var pattern = patternParser.parsePattern(jsonTemplate);           

            var patternRefs = ns.PatternUtils.getRefs(pattern);

            //console.log('Parsed pattern', JSON.stringify(pattern));

            // The table name is the same as that of the mapping
            //ns.ContextUtils.createTable(this.context, name, from, patternRefs);
    

            var result = new ns.Mapping(name, pattern, elementFactory, patternRefs);

            return result;
	    },
	    
        defaultPrefLangs:  ['en', ''],

        prefLabelPropertyUris: [
            'http://www.w3.org/2000/01/rdf-schema#label'
	    ],

        createDefaultLabelMap: function(prefLangs, prefLabelPropertyUris, s, p, o) {

            prefLangs = prefLangs || ns.SponateUtils.defaultPrefLangs;
            prefLabelPropertyUris = prefLabelPropertyUris || ns.SponateUtils.prefLabelPropertyUris;
            s = s || 's';
            p = p || 'p';
            o = o || 'o';
            
            var mapParser = new ns.MapParser();
            
            var labelUtilFactory = new ns.LabelUtilFactory(prefLabelPropertyUris, prefLangs);
                
            // A label util can be created based on var names and holds an element and an aggregator factory.
            var labelUtil = labelUtilFactory.createLabelUtil(o, s, p);

            var result = mapParser.parseMap({
                name: 'labels',
                template: [{
                    id: '?' + s,
                    displayLabel: labelUtil.getAggFactory(),
                    hiddenLabels: [{id: '?' + o}]
                }],
                from: labelUtil.getElement()
            });
            
            return result;
        }    
	    
	};
	
	/**
	 * @Deprecated - Do not use - will be removed asap.
	 * Superseded by service.SparqlServiceHttp
	 * 
	 */
//	ns.ServiceSponateSparqlHttp = Class.create({
//		initialize: function(rawService) {
//			this.rawService = rawService;
//		},
//		
//		execSelect: function(query, options) {
//			var promise = this.rawService.execSelect(query, options);
//			
//			var result = promise.pipe(function(json) {
//				var bindings = json.results.bindings;
//
//				var tmp = bindings.map(function(b) {
//					//console.log('Talis Json' + JSON.stringify(b));
//					var bindingObj = sparql.Binding.fromTalisJson(b);
//					//console.log('Binding obj: ' + bindingObj);
//					return bindingObj;					
//				});
//				
//				var it = new ns.IteratorArray(tmp);
//				
//				//console.log()
//				
//				return it;
//			});
//			
//			return result;
//		}
//	});

	
	/**
	 * A factory for backend services.
	 * Only SPARQL supported yet.
	 * 
	 */
//	ns.ServiceUtils = {
//	
//		createSparqlHttp: function(serviceUrl, defaultGraphUris, httpArgs) {
//		
//			var rawService = new sparql.SparqlServiceHttp(serviceUrl, defaultGraphUris, httpArgs);
//			var result = new ns.ServiceSponateSparqlHttp(rawService);
//			
//			return result;
//		}	
//	};
//	

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
	


//	ns.fnNodeEquals = function(a, b) { return a.equals(b); };

	/*
	 * We need to map a generated var back to the alias and original var
	 * newVarToAliasVar:
	 * {?foo -> {alias: 'bar', var: 'baz'} }
	 * 
	 * We need to map and alias and a var to the generater var
	 * aliasToVarMap
	 * { bar: { baz -> ?foo } }
	 *
	 * 
	 * 
	 * 
	 */
//	ns.VarAliasMap = Class.create({
//		initialize: function() {
//			// newVarToOrig
//			this.aliasToVarMap = new ns.HashMap(ns.fnNodeEquals)
//			this.newVarToAliasVar = new ns.HashMap(ns.fnNodeEquals);
//		},
//		
//		/*
//		addVarMap: function(alias, varMap) {
//			
//		},
//		
//		put: function(origVar, alias, newVar) {
//			this.newVarToAliasVar.put(newVar, {alias: alias, v: origVar});
//			
//			var varMap = this.aliasToBinding[alias];
//			if(varMap == null) {
//				varMap = new ns.BidiHashMap();
//				this.aliasToVarMap[alias] = varMap;
//			}
//			
//			varMap.put(newVar, origVar);
//		},
//		*/
//		
//		getOrigAliasVar: function(newVar) {
//			var entry = this.newVarToAliasVar.get(newVar);
//			
//			var result = entry == null ? null : entry;
//		},
//		
//		getVarMap: function(alias) {
//		}
//	});
//	
//	
//	ns.VarAliasMap.create = function(aliasToVarMap) {
//		var newVarToAliasVar = new ns.HashMap()
//		
//	};
//	
	
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
			// FIXME: open won't ever be empty here
			while(open.isEmpty()) {
				var sourceAlias = open.shift();
				
				var sourceState = aliasToState[sourceAlias];
				var sourceMapping = sourceState.mapping;
				
				ns.ContextUtils.resolveMappingRefs(this.context, sourceMapping);
				var refs = this.mapping.getPatternRefs();

				// For each reference, if it is an immediate join, add it to the join graph
				// TODO And what if it is a lazy join??? We want to be able to batch those.
				_(refs).each(function(ref) {
					var targetMapRef = ref.getTargetMapRef();
					
					var targetAlias = generator.next();

					aliasToState[targetAlias] = {
            // FIXME: targetMapping not defined
						mapping: targetMapping
					};
				
					var joins = aliasToJoins[sourceAlias];
					if(joins == null) {
						joins = [];
						aliasToJoins[sourceAlias] = joins;
					}
					
					// TODO What was the idea behind isTransient?
					// I think it was like this: If we want to fetch distinct resources based on a left join's lhs, and there is no constrain on the rhs, we can skip the join
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
      // FIXME: getEdges not defined
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
	

	/**
	 * Not used
	 */
	ns.Graph = Class.create({
		initialize: function(fnCreateNode, fnCreateEdge) {
			this.fnCreateNode = fnCreateNode;
			this.fnCreateEdge = fnCreateEdge;
			
			this.idToNode = {};
			
			// {v1: {e1: data}}
			// outgoing edges
			this.nodeIdToEdgeIdToEdge = {};
			this.idToEdge = {};

			this.nextNodeId = 1;
			this.nextEdgeId = 1;
		},
		
		createNode: function(/* arguments */) {
			var nodeId = '' + (++this.nextNodeId);
			
			var tmp = Array.prototype.slice.call(arguments, 0);
			var xargs = [this, nodeId].concat(tmp);
			
			var result = this.fnCreateNode.apply(this, xargs);
			this.idToNode[nodeId] = result;
			
			return result;
		},
		
		createEdge: function(nodeIdFrom, nodeIdTo /*, arguments */) {
			var edgeId = '' + (++this.nextEdgeId);
			
			var tmp = Array.prototype.slice.call(arguments, 0);
			// TODO Maybe we should pass the nodes rather than the node ids
			var xargs = [this.graph, nodeIdFrom, nodeIdTo].concat(tmp);

			// FIXME: this.fnEdgeNode not defined
			var result = this.fnEdgeNode.apply(this, xargs);
			
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
	
	ns.NodeJoinElement = Class.create(ns.Node, {
		initialize: function($super, graph, nodeId, element, alias) {
			$super(graph, nodeId); 
			// http://localhost/jassa/?file=jassa-facete
			this.element = element; // TODO ElementProvider?
			this.alias = alias;
		},
		
		getElement: function() {
			return this.element;
		},
		
		getAlias: function() {
			return this.alias;
		}		
	});

	
	ns.fnCreateMappingJoinNode = function(graph, nodeId) {
		console.log('Node arguments:', arguments);
		// FIXME: ns.MappingJoinNode not defined
		return new ns.MappingJoinNode(graph, nodeId);
	};


	ns.fnCreateMappingEdge = function(graph, edgeId) {
		return new ns.MappingJoinEdge(graph, edgeId);
	};


	ns.JoinGraphElement = Class.create(ns.Graph, {
		initialize: function($super) {
			$super(ns.fnCreateMappingJoinNode, ns.fnCreateMappingEdge);
		}
	});
	
	
	/**
	 * This row mapper splits a single binding up into multiple ones
	 * according to how the variables are mapped by aliases.
	 * 
	 * 
	 */
	ns.RowMapperAlias = Class.create({
		initialize: function(aliasToVarMap) {
			this.aliasToVarMap = aliasToVarMap;
		},
		
		/**
		 * 
		 * Returns a map from alias to bindings
		 * e.g. { a: binding, b: binding}
		 */
		map: function(binding) {
			//this.varAliasMap
			
			var vars = binding.getVars();
			
			var result = {};
			
			_(this.aliasToVarMap).each(function(varMap, alias) {
				
				var b = new sparql.Binding();
				result[alias] = b;
				
				var newToOld = varMap.getInverse();
				var newVars = newToOld.keyList();
				
				_(newVars).each(function(newVar) {
					var oldVar = newToOld.get(newVar);
					
					var node = binding.get(newVar);
					b.put(oldVar, node);
				});
				
			});
			
			return result;
//			
//			var varAliasMap = this.varAliasMap;
//			_(vars).each(function(v) {
//				
//				var node = binding.get(v);
//				
//				var aliasVar = varAliasMap.getOrigAliasVar(v);
//				var ov = aliasVar.v;
//				var oa = aliasVar.alias;
//				
//				var resultBinding = result[oa];
//				if(resultBinding == null) {
//					resultBinding = new ns.Binding();
//					result[oa] = resultBinding;
//				}
//				
//				resultBinding.put(ov, node);
//			});
//			
//			
//			return result;
		}
	});
	

	ns.MappingJoinEdge = Class.create(ns.Edge, {
		initialize: function($super, graph, edgeId) {
			$super(graph, graph, edgeId); 
		}
	});

	
	
})();

