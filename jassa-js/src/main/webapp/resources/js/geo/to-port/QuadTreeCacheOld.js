(function($) {
	
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");

	var qt = Namespace("org.aksw.ssb.collections.QuadTree");

	var rdfQueryUtils = Namespace("org.aksw.ssb.utils.rdfquery");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	var facets = Namespace("org.aksw.ssb.facets");
	
	var geo = Namespace("org.aksw.ssb.vocabs.wgs84");
	var rdfs = Namespace("org.aksw.ssb.vocabs.rdfs");
	var xsd = Namespace("org.aksw.ssb.vocabs.xsd");
	var appvocab = Namespace("org.aksw.ssb.vocabs.appvocab");

	
	
	var ns = Namespace("org.aksw.ssb.collections.QuadTreeCache");

	/*
	 * Query factory for counting geoms, features and features per geom
	 * 
	 *  TODO extend with the full breadcrumb
	 *  TODO Can be generalized to fetch source-to-target (n:m) relations
	 *  via elements
	 */
	ns.QueryFactory = function(element, featureVar, geomVar, countVar) {
		this.element = element;
		this.featureVar = featureVar;
		this.geomVar = geomVar;
		
		if(!countVar) {
			this.countVar = sparql.Node.v("__c");	
		}		
	};
	
	ns.QueryFactory.prototype = {
		createQueryGeomCount: function(maxCount) {		
	
			var result = queryUtils.createQueryCount(this.element, maxCount, this.geomVar, this.countVar);
			
			//console.log("Query [GeomCount] " + result, result);
			
			return result;
		},

		createQueryFeatureCount: function(maxCount) {
			var result = queryUtils.createQueryCount(this.element, maxCount, this.featureVar, this.countVar);
			return result;		
		},
	
		createQueryGeomToFeatureCount: function() {
			
			/*
			var groupByVars = this.featureVar.value === this.geomVar.value
				? []
				: [this.geomVar];
			*/
			
			//console.log("debug point");
				
			var result = queryUtils.createQueryCount(this.element, null, this.featureVar, this.countVar, [this.geomVar]);
			return result;
		},
	
	
	
		/**
		 * Creates a query for the geoms,  without retrieving the feature counts
		 */
		createQueryGeoms: function() {
			var result = queryUtils.createQuerySelect(new facets.ConceptInt(this.element, this.geomVar));
			return result;
		}

	};
	
	
	/**
	 * BackendFactory 
	 *
	 * Can create query execution objects for either bounds or explicit geom uris.
	 * Also, options can be specified, of how the queries should be constructed -
	 * i.e. enabled/disabled facets, boundaries as sub-query
	 * 
	 * options:
	 * 	subQuery = {none, bounds, bounds+facets}
	 * 
	 */
	ns.BackendFactory = function(sparqlService, geoConceptFactory) {
		this.sparqlService = sparqlService;
		this.geoConceptFactory = geoConceptFactory;	
	};
	
	ns.BackendFactory.prototype = {
		getFeatureVar: function() {
			return this.geoConceptFactory.getFeatureVar(); //.getFeatureConcept().getVar();
		},
		
		getGeomVar: function() {
			return this.geoConceptFactory.getGeomVar(); //.getGeoConceptFactory
		},
			
		forConcept: function(concept) {	
			var element = concept.getElement();
			return this.forElement(element);
		},


		forElement: function(element) {
			var featureVar = this.getFeatureVar();
			var geomVar = this.getGeomVar();
			
			var queryFactory = new ns.QueryFactory(element, featureVar, geomVar);
	
			return new ns.Backend(this.sparqlService, queryFactory);		
		},

	
	
		forBounds: function(bounds, options) {
			//debugger;
			var geoConcept = this.geoConceptFactory.createConcept(bounds, options);
			
			//console.log('GeoConcept forBounds', geoConcept);
			
			var result = this.forConcept(geoConcept);
			return result;
		},

		forGeoms: function(geomUriNodes, options) {
			// TODO Not implemented
//			var queryGenerator = this.queryGeneratorGeo.forGeoms(geomUriNodes);
//	
//			var result = this.forQueryGenerator(queryGenerator);
//			return result;
		},

		/**
		 * 
		 * 
		 * @param options
		 */
		forGlobal: function(options) {
			var geoConcept = this.geoConceptFactory.createConcept(null, options);
			
			var result = this.forConcept(geoConcept);
			return result;
		}
	};
	
	
	/**
	 * Some thoughts on the revised process:
	 * First we count the number of geoms in the area.
	 * For each tile where the count is below the threshold,
	 * send a query that counts the number of features for each geom
	 * 
	 * for each geom
	 * 
	 */
	ns.Backend = function(sparqlService, queryFactory) {
		this.sparqlService = sparqlService;
		this.queryFactory = queryFactory;
	};
	
	
	ns.Backend.prototype = {
		fetchGeomCount: function(maxCount) {
			var query = this.queryFactory.createQueryGeomCount(maxCount);
			
			//console.debug("Query [GeomCount] " + query);
			
			var result = queryUtils.fetchInt(this.sparqlService, query.toString(), this.queryFactory.countVar);
			return result;
		},
	

		// TODO: I want to be able to generate these queries without having to pass in bounds
		fetchFeatureCount: function(element, featureVariable, maxCount) {
			var query = this.queryFactory.createQueryFeatureCount(maxCount);
			//var query = this.queryFactory.createQueryGeomCount(maxCount);
			var result = queryUtils.fetchInt(this.sparqlService, query.toString(), this.queryFactory.countVar);
			return result;
		},
	

		/**
		 * This is the default one
		 * 
		 * @returns
		 */
		fetchGeomToFeatureCount__Disabled: function() {
			var query = this.queryFactory.createQueryGeomToFeatureCount();
	
			var self = this;
			var result = this.sparqlService.executeSelect(query.toString()).pipe(function(jsonRs) {
				var map = jsonRdfResultSetToMap(jsonRs, self.queryFactory.geomVar.value, self.queryFactory.countVar.value);
				return map;
			});
			return result;		
		},
	

		/**
		 * Version for Sparqlify
		 */
		fetchGeomToFeatureCount: function() {
			var query = this.queryFactory.createQueryGeoms();
	
			var self = this;
			var task = queryUtils.fetchList(this.sparqlService, query, this.queryFactory.geomVar); 
			
			var result = task.pipe(function(list) {
				var map = {};
				
				for(var i = 0; i < list.length; ++i) {
					map[list[i].value] = 1;
				}
				
				return map;
			});
			return result;
		}
	};
	
	
	ns.NOTHING = 0;
	ns.ADDED = 1;
	ns.REMOVED = 2;
	ns.SHIFTED = 3;
	
	/**
	 * Compare two states of the quad tree, and for each involved node assign one
	 * of the following actions:
     *
     * 0: Nothing (no state change - node is completely visible in both states) 
	 * 1: AddAll  (invisible in old, completely visible in new)
	 * 2: RemoveAll (completely visible in old, invisible in new) 
	 * 3: Shift (partial overlap in old and/or new)
	 *
	 * 
	 * 
	 * 
	 */
	ns.diff = function(oldNodes, newNodes, oldBounds, newBounds) {
		var involvedNodes = oldNodes ? _(oldNodes).union(newNodes) : newNodes;
		
		var addedNodes    = _.difference(newNodes, oldNodes);
		var removedNodes  = _.difference(oldNodes, newNodes);
		var retainedNodes = _.intersection(newNodes, oldNodes);

		var states = [];

		// Filter existing markers by the new bounds
		//$.each(this.currentNodes, function(i, node) {
		for(var i in involvedNodes) {
			var node = involvedNodes[i];			
			var nb = node.getBounds();
			
			// TODO Take added/removed node sets into account
			if(newBounds.contains(nb)) {
				if(oldBounds && oldBounds.contains(nb) && _.contains(oldNodes, node)) {
					states[i] = ns.NOTHING;
				} else if(!oldBounds || !oldBounds.isOverlap(nb) || !_.contains(oldNodes, node)) {
					states[i] = ns.ADDED;
				} else {
					states[i] = ns.SHIFTED;
				}
			} else if(oldBounds && oldBounds.contains(nb) && !newBounds.isOverlap(nb)) {
				states[i] = ns.REMOVED;
			} else if (newBounds.isOverlap(nb)) {
				states[i] = ns.SHIFTED;
			} else {
				console.error("Should not happen");
			}
		}

		return {nodes: involvedNodes, states: states, addedNodes: addedNodes, removedNodes: removedNodes };
	};
	
	
	/**
	 * Given a geoQueryFactory (i.e. a factory object, that can create queries for given bounds),
	 * this class caches results for bounds.
	 * 
	 * The process is as follows:
	 * The orginial bounds are extended to the size of tiles in a quad tree.
	 * Then the data is fetched.
	 * A callback with the data and the original bounds is invoked.
	 * IMPORTANT! The callback has to make sure how to filter the data against the original bounds (if needed)
	 * 
	 * TODO This class is not aware of postprocessing by filtering against original bounds - should it be?
	 * 
	 * @param backend
	 * @returns {ns.QuadTreeCache}
	 */
	ns.QuadTreeCache = function(backendFactory, geomPosFetcher, options) {	
		var maxBounds = new qt.Bounds(-180.0, 180.0, -90.0, 90.0);
		this.quadTree = new qt.QuadTree(maxBounds, 18, 0);
	
		this.backendFactory = backendFactory;

		if(!options) {
			options = {};
		}
		
		// FIXME Rename to maxTileItemCount
		// Maximum geoms per tile before skipping
		this.maxItemCount = options.maxTileItemCount ? options.maxTileItemCount : 25;
		
		// Maximum geoms to accept for global lookup
		this.maxGlobalItemCount = options.maxGlobalItemCount ? options.maxGlobalItemCount : 50;
		
		//console.log("[QuadTree] MaxTileItemCount: " + this.maxItemCount);
		//console.log("[QuadTree] MaxGlobalItemCount: " + this.maxGlobalItemCount);
		
//		this.labelFetcher = labelFetcher;
		this.geomPosFetcher = geomPosFetcher;
	};

	
	ns.QuadTreeCache.prototype = {
			

		createCountTask: function(node) {

			var self = this;
			
			var result =
				this.backendFactory.forBounds(node.getBounds()).fetchGeomCount(self.maxItemCount).pipe(function(value) {
	
					//console.debug("Counted items within " + node.getBounds(), value);
					
					node.setMinItemCount(value); 
					
					// If the value is 0, also mark the node as loaded
					if(value === 0) {
						//self.initNode(node);
						node.isLoaded = true;
					}
				});
			
			return result;
		},
	
		/**
		 * If either the minimum number of items in the node is above the threshold or
		 * all children have been counted, then there is NO need for counting
		 * 
		 */
		isCountingNeeded: function(node) {
			//console.log("Node To Count:", node, node.isCountComplete());
			
			return !(this.isTooManyGeoms(node) || node.isCountComplete());
		},
	
	

		/**
		 * Loading is needed if NONE of the following criteria applies:
		 * . node was already loaded
		 * . there are no items in the node
		 * . there are to many items in the node
		 * 
		 */
		isLoadingNeeded: function(node) {
	
			//(node.data && node.data.isLoaded)
			var noLoadingNeeded = node.isLoaded || (node.isCountComplete() && node.infMinItemCount === 0) || this.isTooManyGeoms(node);
			
			return !noLoadingNeeded;
		},
	
	
		isTooManyGeoms: function(node) {	
			//console.log("FFS", node.infMinItemCount, node.getMinItemCount());
			return node.infMinItemCount >= this.maxItemCount;
		},
		
	
	
		createCountTasks: function(nodes) {
			var self = this;
			var result = _.compact(_.map(nodes, function(node) { return self.createCountTask(node); }));
			
			/*
			var result = [];
			$.each(nodes, function(i, node) {
				var task = self.createCountTask(node);
				if(task) {
					result.push(task);
				}
			});
			*/
	
			return result;
		},
	
	
		/**
		 * 
		 * @param node
		 * @returns
		 */
		createTaskGeomToFeatureCount: function(node) {
			var result = this.backend.fetchGeomToFeatureCount().pipe(function(geomToFeatureCount) {
				node.data.geomToFeatureCount = geomToFeatureCount;
			});
			
			return result;
		},
	
	
		/**
		 * Sets the node's state to loaded, attaches the geomToFeatureCount to it.
		 * 
		 * @param node
		 * @param geomToFeatureCount
		 */
		loadTaskAction: function(node, geomToFeatureCount) {
			//console.log("GeomToFeatureCount", geomToFeatureCount);
			
			node.data.geomToFeatureCount = geomToFeatureCount;
			
			// We need to load all positions of the geometries
			
			
			// Determine for which geoms we can load the features
			
			node.isLoaded = true;
			//node.data.graph = rdfQueryUtils.rdfQueryFromTalisJson(data); //ns.triplesFromTalisJson(data); //data;//ns.rdfQueryFromTalisJson(data);
			
		},
	
		createLoadTasks: function(nodes) {
			var self = this;
			var result = [];
						
			//$.each(nodes, function(index, node) {
			_.each(nodes, function(node) {
				//console.debug("Inferred minimum item count: ", node.infMinItemCount);
	
				//if(node.data.absoluteGeomToFeatureCount)
				
				var loadTask = self.backendFactory.forBounds(node.getBounds()).fetchGeomToFeatureCount().pipe(function(geomToFeatureCount) {
					self.loadTaskAction(node, geomToFeatureCount);
				});
	
				result.push(loadTask);
			});
			
			return result;
		},
	
	
	
		load: function(bounds) {
			// Prevent the bounds being set too frequently
			// TODO Maybe look the tree rather than this.... 
			var self = this;
			if(this.isLocked) {
				return;
			}
			this.isLocked = true;
	
			var result = $.Deferred();
			
			var task = this.createWorkflow(bounds);
			
			$.when(task).then(function(nodes) {
				self.isLocked = false;
				result.resolve(nodes);
			}).fail(function() {
				self.isLocked = false;
				result.fail();
			});
			
			return result;
		},
	
		createWorkflow: function(bounds) {
			var rootNode = this.quadTree.getRootNode();
			
			var self = this;
			var result;
			//console.log("Initiating data fetching workflow");
			if(!rootNode.checkedGlobal) {
				
				//console.log("Checking applicability of global fetching strategy (was not checked before)");
				
				result = $.Deferred();
				
				globalCheckTask = this.backendFactory.forGlobal().fetchGeomCount(self.maxGlobalItemCount).pipe(function(geomCount) {
					//console.debug("Global check counts", geomCount, self.maxGlobalItemCount);
					return !(geomCount >= self.maxGlobalItemCount);
				});
	
				result = $.Deferred();
	
				$.when(globalCheckTask).then(function(canUseGlobal) {
	
					//console.log("Applicability: ", canUseGlobal);
					
					rootNode.checkedGlobal = true;
					task = canUseGlobal ? self.createGlobalWorkflow(rootNode) : self.loadTiles(bounds);
	
					$.when(task).then(function(nodes) {
						result.resolve(nodes);
					}).fail(function() {
						result.fail();
					});
				}).fail(function() {
					result.fail();
				});
			} else {
				console.log("Using tile based strategy (global strategy checked)");
				result = self.loadTiles(bounds);
			}
			
			return result;
		},
	
		createGlobalWorkflow: function(node) {
		
			var self = this;
			
			var result = $.Deferred();
	
			// Fetch the items
			var loadTask = self.backendFactory.forGlobal().fetchGeomToFeatureCount().pipe(function(geomToFeatureCount) {
				//console.log("Global fetching: ", geomToFeatureCount);
				self.loadTaskAction(node, geomToFeatureCount);
			});
	
			$.when(loadTask).then(function() {
				$.when(self.postProcess([node])).then(function() {
					//console.log("Global workflow completed.");
					//console.debug("Workflow completed. Resolving deferred.");
					result.resolve([node]);
				}).fail(function() {
					result.fail();
				});
			}).fail(function() {
				result.fail();
			});
	
			return result;
		},
		
	
	
		/**
		 * This method implements the primary workflow for tile-based fetching data.
		 * 
		 * globalGeomCount = number of geoms - facets enabled, bounds disabled.
		 * if(globalGeomCount > threshold) {
		 * 
		 * 
		 *    nodes = aquire nodes.
		 *    foreach(node in nodes) {
		 *        fetchGeomCount in the node - facets TODO enabled or disabled?
		 *        
		 *        nonFullNodes = nodes where geomCount < threshold
		 *        foreach(node in nonFullNodes) {
		 *            fetch geomToFeatureCount - facets enabled
		 *            
		 *            fetch all positions of geometries in that area
		 *            -- Optionally: fetchGeomToFeatureCount - facets disabled - this can be cached per type of interest!!
		 *        }
		 *    }
		 * } 
		 * 
		 */
		loadTiles: function(bounds) {
			var self = this;
				
			
			//console.log("Aquiring nodes for " + bounds);
			var nodes = this.quadTree.aquireNodes(bounds, 2);
	
			// Init the data attribute if needed
			_.each(nodes, function(node) {
				if(!node.data) {
					node.data = {};
				}
			});
			
	
			// Mark empty nodes as loaded
			_.each(nodes, function(node) {
				if(node.isCountComplete() && node.infMinItemCount === 0) {
					node.isLoaded = true;
				}
			});
	
			
			var uncountedNodes = _.filter(nodes, function(node) { return self.isCountingNeeded(node); });
			//console.log("# uncounted nodes", uncountedNodes.length);
	
			// The deferred is only resolved once the whole workflow completed
			var result = $.Deferred();
	
			
			var countTasks = this.createCountTasks(uncountedNodes);
			
			$.when.apply(window, countTasks).then(function() {
				nonLoadedNodes = _.filter(nodes, function(node) { return self.isLoadingNeeded(node); });
				//console.log("# non loaded nodes", nonLoadedNodes.length, nonLoadedNodes);
				
				var loadTasks = self.createLoadTasks(nonLoadedNodes);
				$.when.apply(window, loadTasks).then(function() {
					//ns.QuadTreeCache.finalizeLoading(nodes);
					
					$.when(self.postProcess(nodes)).then(function() {
						//self.isLocked = false;
						//console.debug("Workflow completed. Resolving deferred.");
						result.resolve(nodes);
					});
				});
			});
			
			return result;
		},

	
		finalizeLoading: function(nodes) {
			// Restructure all nodes that have been completely loaded, 
			var parents = [];
			
			$.each(nodes, function(index, node) {
				if(node.parent) {
					parents.push(node.parent);
				}
			});
	
			parents = _.uniq(parents);
			
			var change = false;			
			do {
				change = false;
				for(var i in parents) {
					var p = parents[i];
	
					var children = p.children;
	
					var didMerge = ns.tryMergeNode(p);
					if(!didMerge) {
						continue;
					}
					
					change = true;
	
					$.each(children, function(i, child) {
						var indexOf = _.indexOf(nodes, child);
						if(indexOf >= 0) {
							nodes[indexOf] = undefined;
						}
					});
					
					nodes.push(p);
					
					if(p.parent) {
						parents.push(p.parent);
					}
					
					break;
				}
			} while(change == true);
			
			_.compact(nodes);
			
			/*
			$.each(nodes, function(i, node) {
				node.isLoaded = true;
			});
			*/
			
			//console.log("All done");
			//self._setNodes(nodes, bounds);
			//callback.success(nodes, bounds);		
		},

	
		/**
		 * Extracts labels and geometries from the databanks that were fetched for the nodes 
		 * 
		 */
		postProcess: function(nodes) {
			var self = this;

			var deferred = $.Deferred();
			
			/*
			deferred.resolve({});

			return deferred;
			*/
			
			
			// Here we create an rdfQuery databank object with the information we gathered
			
			var subTasks = _.map(nodes, function(node) {
	
				if(!node.data || !node.data.geomToFeatureCount) {
					return;
				}
				
	
				
				node.data.graph = $.rdf.databank();
				
				var uriStrs = _.keys(node.data.geomToFeatureCount);
				var uris = _.map(uriStrs, function(uriStr) { return sparql.Node.uri(uriStr); });
				
				
				//console.debug("Post processing uris", uris);

				/*
				var p1 = self.labelFetcher.fetch(uriStrs).pipe(function(data) {
					//console.log("Labels", data);
					node.data.geomToLabel = data;
				});
				*/
				

				var p2 = self.geomPosFetcher.fetch(uris).pipe(function(data) {
					//console.log("Positions", data);
					node.data.geomToPoint = data;
				});
	
				var databank = node.data.graph;
				_.each(node.data.geomToFeatureCount, function(count, geom) {
					var s = sparql.Node.uri(geom);
					var o = sparql.Node.typedLit(count, xsd.integer);
					
					var tripleStr = "" + s + " " + appvocab.featureCount + " " + o;
					var triple = $.rdf.triple(tripleStr);
					
					databank.add(triple);					
				});

				
				var subTask = $.when(p2).then(function() {
					
					var data = node.data;
					var geomToLabel = data.geomToLabel;
					var databank = data.graph;
					
					_.each(geomToLabel, function(label, uri) {
						var s = sparql.Node.uri(uri);
						var o = sparql.Node.plainLit(label.value, label.language);
						
						var tripleStr = "" + s + " " + rdfs.label + " " + o;
						var triple = $.rdf.triple(tripleStr);
						
						databank.add(triple);
					});
	
					var geomToPoint = data.geomToPoint;
					
					_.each(geomToPoint, function(point, uri) {
						var s = sparql.Node.uri(uri);
						var oLon = sparql.Node.typedLit(point.x, xsd.xdouble.value);
						var oLat = sparql.Node.typedLit(point.y, xsd.xdouble.value);
						
						var lonTriple = "" + s + " " + geo.lon + " " + oLon; 
						var latTriple = "" + s + " " + geo.lat + " " + oLat;
						
						//alert(lonTriple + " ---- " + latTriple);
						
						databank.add(lonTriple);
						databank.add(latTriple);
					});
				});
				
				return subTask;			
			});
			
			$.when.apply(window, subTasks).then(function() {
				deferred.resolve();
			});
			
			return deferred.promise();
		}


	
	}

	/**
	 * 
	 * 
	 * @param parent
	 * @returns {Boolean} true if the node was merged, false otherwise
	 */
	ns.tryMergeNode = function(parent) {
		return false;
		
		if(!parent) {
			return;
		}
	
		// If all children are loaded, and the total number
		var itemCount = 0;
		for(var i in parent.children) {
			var child = parent.children[i];
			
			if(!child.isLoaded) {
				return false;
			}
			
			itemCount += child.itemCount;
		}
		
		if(itemCount >= self.maxItemCount) {
			return false;
		}
		
		parent.isLoaded = true;
	
		for(var i in parent.children) {
			var child = parent.children[i];
			
			mergeMapsInPlace(parent.idToPos, child.idToPos);
			
			mergeMapsInPlace(parent.data.idToLabels, child.data.idToLabels);
			mergeMapsInPlace(parent.data.idToTypes, child.data.idToTypes);
			
			//parent.data.ids.addAll(child.data.ids);
			//parent.data.addAll(child.data);
		}
		
		
		// Unlink children
		parent.children = null;
		
		console.log("Merged a node");
		
		return true;
	};

	
	
})(jQuery);
