(function() {

	var ns = Jassa.facets;

	/*
	node.listFacets(0, 10).done(function(f))
	
	
	*/
	

	/**
	 * This class bundles a baseConcept, constraints and a sparql service together 
	 * for enabling retrieving facets for paths
	 * 
	 */
	ns.FacetFetcher = Class.create({
		initialize: function(baseConcept, rootFacetNode, constraintManager) {
			this.baseConcept = baseConcept;
			this.rootFacetNode = rootFacetNode;
			this.constraintManager = constraintManager;
		},
	
		createFacetFacadeNode: function(path) {
			var facetNode = this.rootFacetNode.forPath(path);
			var result = new facets.SimpleFacetFacade(this.constraintManager, rootFacetNode);

			return result;
		},

		/**
		 * Create the concept for the set of facets at a given path.
		 * As this concept's extensions might be quite large*, reducing the extension's size by
		 * means of keyword filtering or pagination is most likely desired. 
		 * 
		 * FacetValue counts should then be obtained separately for the concrete extension.
		 * 
		 * * For example on DBpedia, there are around 50K distinct properties.
		 * 
		 */
		createFacetConcept: function(path) {
			var facetFacadeNode = this.createFacetFacadeNode(path);
		
			var result = facetFacadeNode.createConcept();
			return result;
		},

		
		createFacetValueConcepts: function(path) {
			var facetNode = this.rootFacetNode.forPath(path);
			var facetFacadeNode = new facets.SimpleFacetFacade(this.constraintManager, rootFacetNode);


			var constrainedSteps = facetFacadeNode.getConstrainedSteps();
			//console.log("[DEBUG] Constrained steps: " + JSON.stringify(constrainedSteps));

			var constrainedStepConcepts = this.createConceptItems(facetFacadeNode, constrainedSteps);
			
			
			 // Set up the concept for fetching facets of all concepts that were NOT constrained
			var tmpConcept = facetFacadeNode.createConcept(true);
			var unconstrainedConcept = ns.ConceptUtils.createCombinedConcept(this.baseConcept, tmpConcept);
			
		},
				
		
		//createFacetQuery: funct
		
		/**
		 * This method fetches the facets at a given path. 
		 * Note that counting their distinct facet values is a separate step.
		 * 
		 * 
		 * Some Notes on partitioning:
		 * 
		 * TODO 
		 * 
		 * - TODO Somehow cache the relation between filter configuration and fetch strategy
		 */
		fetchSubFacets : function(facetFacadeNode) {
			var self = this;

			// Figure out which facet steps have constraints:
			// For each of them we have to fetch the counts individually by excluding
			// constraints on that path

			// On the other hand, we can do a single query to capture all non-constrained paths
			var constrainedSteps = facetFacadeNode.getConstrainedSteps();
			//console.log("[DEBUG] Constrained steps: " + JSON.stringify(constrainedSteps));

			var conceptItems = this.createConceptItems(facetFacadeNode, constrainedSteps);
						
			/*
			 * For each obtained concept, fetch the facets and facet counts  
			 */
			var promises = [];			
			for(var i = 0; i < conceptItems.length; ++i) {
				var conceptItem = conceptItems[i];
				//console.log("Fetching data for concept item: ", conceptItem);
				var promise = this.fnFetchSubFacets(this.sparqlService, conceptItem);
				promises.push(promise);
			}
			
			
			/*
			 * Set up the query for fetching facets of all concepts that were NOT constrained
			 */
			var tmpConcept = facetFacadeNode.createConcept(true);
			var baseConcept = this.baseConcept;
			
			var concept = ns.ConceptUtils.createCombinedConcept(baseConcept, tmpConcept);
			
			
			//console.log("GenericConcept: " + concept, concept.isSubjectConcept());


			var children = model.get("children");
			//var syncer = new backboneUtils.CollectionCombine(children);

			// Get the facets of the concept
			var tmpPromises = _.map(this.facetProviders, function(facetProvider) {
				// TODO: We do not want the facets of the concept,
				// but of the concept + constraints
				
				// This means: We need to get all constraints at the current path -
				// or more specifically: All steps.
				
				
				var tmp = facetProvider.fetchFacets(concept, false, constrainedSteps);

				var promise = tmp.pipe(function(items) {


					var mapped = [];
					for(var i = 0; i < items.length; ++i) {
						var item = items[i];

						//var mapped = _.map(items, function(item) {

						var facetUri = item.facetUri;
						var isInverse = item.isInverse;

						var step = {
							type: 'property',
							property: facetUri,
							isInverse: isInverse
						};
						
						var subFacadeNode = facetFacadeNode.forProperty(facetUri, isInverse);
						
						/*
						item = {
								facetFacadeNode: subNode,
								step: step
						};
						*/
						item.facetFacadeNode = subFacadeNode;
						item.facetNode = subFacadeNode.getFacetNode();
						item.step = step;

						mapped.push(item);
					}
						//console.log("Mapped model:", item);

						//return item;
					//});

					return mapped;
				});

				return promise;
			});

			model.set({
				isLoading : true
			});

			promises.push.apply(promises, tmpPromises);

			//console.log("[DEBUG] Number of promises loading " + promises.length, promises);
			
			var finalPromise = $.when.apply(null, promises);
			
			finalPromise.always(function() {
				model.set({
					isLoading : false
				});
			});

			
				
			var reallyFinalPromise = $.Deferred();
				
			finalPromise.pipe(function() {
				
				
				
				//console.log("Arguments: ", arguments);
				var items = [];
				for(var i = 0; i < arguments.length; ++i) {
					var args = arguments[i];
					
					items.push.apply(items, args);
				}

                var itemIds = [];
                for(var i = 0; i < items.length; ++i) {
                    var item = items[i];
                    var itemId = item.id;
                    itemIds.push(itemId);
                }


                // Find all children, whose ID was not yeld
                var childIds = children.map(function(child) {
                    return child.id;
                });


                var removeChildIds = _.difference(childIds, itemIds);
                children.remove(removeChildIds);
/*
                for(var i = 0; i < removeChildIds.length; ++i) {
                    var childId = removeChildIds
                }
*/

				for(var i = 0; i < items.length; ++i) {
					var item = items[i];
					
					var previous = children.get(item.id);
					if(previous) {
						var tmp = item;
						item = previous;
						item.set(tmp);
					} else {
						children.add(item);
					}
				}

				var subPromises = [];
				children.each(function(child) {
					var facetFacadeNode = child.get('facetFacadeNode');
					var subPromise = self.updateFacets(child, facetFacadeNode);
					subPromises.push(subPromise);
				});
				
				var task = $.when.apply(null, subPromises);
				
				task.done(function() {
					reallyFinalPromise.resolve();					
				}).fail(function() {
					reallyFinalPromise.fail();
				});
				
				/*
				_.each(items, function(item) {
					item.done(function(a) {
						console.log("FFS", a);
					});
				});*/
				/*
				console.log("Children", children);
				console.log("Items", items);
				for(var i = 0; i < items.length; ++i) {
					var item = items[i];
					console.log("Child[" + i + "]: ", item); // + JSON.stringify(items[i]));
				}
				children.set(items);
				console.log("New children", children);
				*/
				
			});
			
//			var reallyFinalPromise = $.when.apply(null, xxx);

			//syncer.sync(promises);

			/*
			console.log("[DEBUG] Facet update procedure complete");
			reallyFinalPromise.then(function() {
				console.log("[DEBUG] Final promise resolved");
			});
			*/
			return reallyFinalPromise;
		},


		/**
		 * This function loads the facets of a specific concept.
		 */
		fnFetchSubFacets: function(sparqlService, conceptItem) {
	
			var facetUri = conceptItem.property;
			var concept = conceptItem.concept;
			
			var element = concept.getElement();
			var variable = concept.getVariable();
			
			var outputVar = sparql.Node.v("__c");
			var limit = null;
	
			var query = queryUtils.createQueryCount(element, null, variable, outputVar, null, true, null);
			//console.log("Fetching facets with ", query);
			var queryExecution = queryUtils.fetchInt(sparqlService, query, outputVar);
	
			
			var promise = queryExecution.pipe(function(facetCount) {
				conceptItem.facetCount = facetCount;
				//item.facetFacadeNode = subNode;
				//item.step = step;
	
				//console.log("ConceptItem: ", conceptItem);
				
				// We need to return arrays for result 
				var result = [conceptItem];
				return result;
			});
	
			return promise;
		},

	
		/**
		 * Create the list of all facets that carry constraints and
		 * for which we thus have to fetch their subfacets separately
		 * (or at least in a union).
		 */
		createConceptItems: function(facetFacadeNode, constrainedSteps) {
			var conceptItems = [];
	
			for(var i = 0; i < constrainedSteps.length; ++i) {
				var step = constrainedSteps[i];				
				
				var propertyName = step.propertyName;
	
				var targetNode = facetFacadeNode.forStep(step);
				var targetConcept = targetNode.createConcept();
				//var subNode = facetFacadeNode.forProperty(stepfacetUri.value, step.isInverse);
	
				var prefix = self.isInverse ? "<" : "";
	
				var item = {
					id: "simple_" + prefix + propertyName,
					type: 'property',
					property: propertyName,
					isInverse: step.isInverse,
					concept: targetConcept,
					step: step,
					facetFacadeNode: targetNode
				};		
				
				conceptItems.push(item);
			}
			
			return conceptItems;
		}
	});
	
})();
	
	


///**
// * A facet provider for ingoing/outgoing properties
// * 
// */
//ns.FacetProviderSimple = Class.create({
//	initialize: function(sparqlService, isInverse) {
//		this.sparqlService = sparqlService;
//		this.isInverse = isInverse ? isInverse : false;
//	},
//
//	createQuery: function(concept, mode, steps, facetVar, countVar) { // TODO add partition options
//		var self = this;
//
//		var sampleSize = null; // 50000;
//		//var facetVar = sparql.Node.v("__p");
//		//var countVar = sparql.Node.v("__c");
//		
//		var query = queryUtils.createQueryFacetCount(concept, facetVar,
//				countVar, this.isInverse, sampleSize);
//
//		//console.log("[DEBUG] Fetching facets with query: " + query);
//		
//		var uris = [];
//		if(steps && steps.length > 0) {
//			
//			// Create the URIs from the steps
//			for(var i = 0; i < steps.length; ++i) {
//				var step = steps[i];
//				
//				if(step.isInverse() === this.isInverse) {
//					var propertyUri = sparql.Node.uri(step.propertyName);
//
//					uris.push(propertyUri);
//				}
//			}
//			
//			// Skip fetching if we have inclusion mode with no uris
//			if(mode === true) {
//				if(uris.length === 0) {
//					return null;
//				}
//			}	
//
//			
//			if(uris.length !== 0) {
//				var expr = new sparql.E_In(new sparql.ExprVar(facetVar), uris);
//				
//				if(!mode) {
//					expr = new sparql.E_LogicalNot(expr);
//				}
//
//				var filter = new sparql.ElementFilter([expr]);
//
//				//console.log("Filter: ", filter);
//				query.elements.push(filter);
//			}
//		}
//		
//		return query;
//	},
//		
//	/**
//	 * @param mode false for exclusion, true for inclusion of steps
//	 * 
//	 * TODO Add support for a partition (in the simplest case limit and offset)
//	 */
//	fetchFacets: function(concept, mode, steps) {
//		var facetVar = sparql.Node.v("__p");
//		var countVar = sparql.Node.v("__c");
//		
//		var query = this.createQuery(concept, mode, steps, facetVar, countVar);
//		
//		var self = this;
//		/*
//		console.log("Steps: ", steps);
//		console.log("IsInverse: ", this.isInverse);
//		console.log("Uris: ", uris);
//		console.log("FacetProviderQuery: " + query);
//		*/
//		
//		var myDataTemplate = function(binding) {
//
//			// TODO Create a copy of the facet manager excluding the
//			// constraints on this path.
//
//			// var element = concept.getElement();
//
//			var prefix = self.isInverse ? "<" : "";
//
//			var result = {
//				id : "simple_" + prefix + binding.facetName.value,
//				type : "property",
//				facetUri : binding.facetName.value,
//				facetCount : binding.facetCount.value,
//				isInverse : self.isInverse
//			// concept: null
//			};
//
//			// console.log("Binding:", result);
//			return result;
//		};
//
//		var myDataBinding = {
//			facetName : facetVar.value,
//			facetCount : countVar.value
//		};
//
//		// console.log("Query: " + query);
//
//		var dataProviderFactory = new facets.DataProviderFactoryQuery(
//				this.sparqlService, function(x) {
//					return x;
//				});
//
//		var dataProviderTmp = dataProviderFactory.createDataProvider(query);
//
//		var postProcessor = DataTemplate.Sparql.createPostProcessor(
//				myDataTemplate, myDataBinding);
//		var dataProvider = new facets.DataProvider.Pipe(dataProviderTmp,
//				postProcessor);
//
//		var promise = dataProvider.fetchData();
//
//		
//		// TODO: If the query takes too long, switch to partitioned mode...
//		
//		
//		// dataProviderTmp.fetchData().done(function(x) {
//		// console.log("YEAH", JSON.stringify(x)); });
//		// promise.done(function(x) { console.log("YEAH",
//		// JSON.stringify(x)); });
//
//		return promise;
//	}
//});
