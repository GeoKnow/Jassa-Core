(function($) {

	var uriUtils = Namespace("org.aksw.ssb.utils.uris");

	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");
	var labelUtils = Namespace("org.aksw.ssb.utils");

	
	// TODO Possible separate namespaces for query generation and execution
	var ns = Namespace("org.aksw.ssb.facets.QueryUtils"); 

	ns.createEmptyResultSet = function(vars) {
		var result = $.Deferred();
		result.resolve(ns.createEmptyJsonResultSet(vars));
		
		return result.promise();
	};
	
	ns.createEmptyJsonResultSet = function(vars) {
		var result = { "head": { "link": [], "vars": vars },
				  "results": { "distinct": false, "ordered": true, "bindings": [ ] } };
		
		return result;
	};
	
	
	ns.fetchStatementsBySubjects = function(service, uriStrs) {		
		// FIXME: filterUrisValidate not defined
		uriStrs = uriUtils.filterUrisValidate(uriStrs);
		
		if(uriStrs.length === 0) {
			var result = ns.createEmptyResultSet(["s"]);
			return result;
		}
		
		console.log("Fetching statements for (<" + uriStrs.join('> , <') + ">)");	
		var queryString = "Select ?s ?p ?o { ?s ?p ?o . Filter(?s In (<" + uriStrs.join(">,<") + ">)) . }";

		var result = service.executeSelect(queryString);
		return result;
	};

	ns.fetchDefaultGraphs = function(sparqlService) {
        var g = sparql.Node.v('g');
        var query = ns.createQueryGetNamedGraphs(g);

        var result = ns.fetchList(sparqlService, query, g);
        return result;
	};

	ns.fetchClasses = function(sparqlService) {
		var c = sparql.Node.v("c");
		var query = ns.createQueryGetClasses(c);
		
		var task = ns.fetchList(sparqlService, query, c);
		/*
		.pipe(function(nodes) {
			var names = _.map(nodes, function(node) { return node.value; });
			return names;
		});*/
		
		return task;
	};

	ns.fetchNamedGraphs = function(sparqlService) {
		var g = sparql.Node.v("g");
		var query = ns.createQueryGetNamedGraphs(g);
		
		var task = ns.fetchList(sparqlService, query, g);
		/*
		.pipe(function(nodes) {
			var names = _.map(nodes, function(node) { return node.value; });
			return names;
		});
		*/
		
		return task;
	};

	/**
	 * 
	 * 
	 */
	ns.loadDefaultFacets = function(sparqlService, config, callback) {
		var autoFacetVar = 1;
		
		var s = config.conceptVar;

		// FIXME: createQueryLoadDefaults not defined
		var q = ns.FacetUtils.createQueryLoadDefaults(config);
		
		if(!callback) {
      // FIXME: DummyCallback not defined
			callback = ns.DummyCallback;
		}
		
		console.log("Fetching facets: " + q);
		
		sparqlService.executeSelect(q.toString(), {
			failue: function() { callback.failure(); },
			success: function(jsonRs) {
				// Update the model (and thereby the view)
        // FIXME: jsonRdfResultSetToMap not defined
				var map = jsonRdfResultSetToMap(jsonRs, "__p", "__c");

				for(var propertyName in map) {
					//var count = map[propertyName];
					var propertyNode = sparql.Node.uri(propertyName);
					var objectNode = sparql.Node.v("var" + autoFacetVar);
					
					
					/*
					var facetDesc = new sparql.facets.FacetDesc
					(
							propertyName,
							propertyNode,
							new sparql.ElementTriplesBlock([new rdf.Triple(self.config.conceptVar, propertyNode, objectNode)])
					);
					*/
					
					var element = new sparql.ElementTriplesBlock([new rdf.Triple(s, propertyNode, objectNode)]);

          // FIXME: Facet not defined
					var newFacet = new ns.Facet(config.getRoot(), propertyNode.value, element, s.value);

          // FIXME: addFacet not defined
					config.addFacet(newFacet);
					
					//self.knownFacets.push(facetDesc);
					//var facets = config.getRoot().getSubFacets();					
				}
				callback.success();
			}
		});
	};


	/**
	 * Fetches label for the facets
	 * 
	 * 
	 */
	ns.processFacets = function(state, jsonRs, labelFetcher, callback) {
		//console.log("Facet result set", jsonRs);
		
		var result = state;
    // FIXME: jsonRdfResultSetToMap not defined
		var map = jsonRdfResultSetToMap(jsonRs, "__p", "__c");
	
		//console.log("labelFetcher", $.ssb);
		return labelFetcher.fetch(_.keys(map), true).pipe(function(idToLabel) {
															
			for(var propertyName in map) {
				
				var label = propertyName;
				if(propertyName in idToLabel) {
					label = idToLabel[propertyName].value;
				}
													
				var count = map[propertyName];
				
				var node = result.pathManager.getRoot().getOrCreate(propertyName);

				node.data = {count: count, label: label};
			}
			
			if(callback) {
				callback.success(result);
			}
			
			return result;
		});		
	};

	
	/*
	ns.ConstraintQuery = function(constraints) {
		this.constraints = constraints;
	};
	*/

	
	ns.fetchFacetValues = function(sparqlService, queryFactory, path, searchString) {
		
		// Create a query factory without constraints for the given path
    // FIXME: copyExcludeConstraint not defined
		var qf = queryFactory.copyExcludeConstraint(path);
		
		// Navigate to the given path
    // FIXME: copyNavigate not defined
		qf = queryFactory.copyNavigate(path);
		
		// FIXME: getDriver not defined
		var concept = qf.getDriver();
		
		var baseElement = concept.element;
		
		var countVar = sparql.Node.v("__c");
		var facetVar = concept.variable;//sparql.Node.v(breadcrumb.targetNode.variable);
    // FIXME: breadcrumb not defined
    // FIXME: state not defined
		var query = ns.createQueryFacetValuesCountedFiltered(baseElement, breadcrumb, state.config.sampleSize, searchString, countVar);

		console.log("Query data", "" + query);
		
		//var query = queryData.query;
		// TODO Make the limit configurable
		query.limit = 10;
		
		//console.debug("Values query:", queryData);
		
		// Test query
		//query.elements.push(new sparql.ElementString("?s rdfs:label ?var1 . Filter(regex(?var1, '199')) ."));
		
		// The result is a list of facet values:
		// (valueNode, label, count)
		var result = {}; //[];

    // FIXME: executeSelect not defined
		return sparqlService.executeSelect(query.toString()).pipe(function(jsonRs) {
				//console.debug("Binding", jsonRs);
				
				
				var bindings = jsonRs.results.bindings;
				
				for(var i = 0; i < bindings.length; ++i) {
					var binding = bindings[i];
					var val = binding[facetVar.value];
					
					var valueNode = sparql.Node.fromTalisJson(val);
					var count = binding[countVar.value].value;// TODO Maybe parse as int

          // FIXME: couldn't find FacetValue constructor
					var facetValue = new facets.FacetValue(valueNode, count);
					result[valueNode] = facetValue;
					//result.push();
				}
					
				
				//console.log("Raw facet values:", result);
				//var vars = jsonRs.head.vars;
				
				// TODO We need a discriminator column so we know which facet the values correspond to
				//var map = jsonRdfResultSetToMap(jsonRs, "var1", "__c");
		
				var uris = [];
				for(var key in result) {
					var node = result[key].node;

					if(node.isUri()) {						
						uris.push(node.value);
					}
				}
				
				//console.debug("Value URIs", uris, result);
				
				//var labelFetcher = new labelUtils.LabelFetcher(sparqlService);
        // FIXME: labelFetcher not defined
				return labelFetcher.fetch(uris, true).pipe(function(uriToLabel) {

					//console.log("Facet value uris", uris, uriToLabel);

					for(var i in result) {						
						var facetValue = result[i];
						var node = result[i].node;
						
						var label = uriToLabel[node.value];
						if(!label) {
							label = node;
						}
						
						facetValue.label = label;
						
						//console.debug("Using facet value label", facetValue.label);
					}
					
					/*
					for(var i = 0; i < result.length; ++i) {						
						var val = result[i].node;
						
						var label = idToLabel[val.value];
						if(!label) {
							label = val;
						}
						
						result[i].label = label;					
					}
					*/

					if(callback) {
						callback.success(result, uriToLabel);
					}
					
					return {facetValues:result, uriToLabel: uriToLabel};
				});
			});
		
		
	};
	
	/**
	 * Fetches the values for given path.
	 * Constraints on this path can be excluded.
	 * 
	 * 
	 * @returns A promise for the action
	 * 
	 */
	ns.loadFacetValues = function(sparqlService, labelFetcher, state, breadcrumb, searchString, callback) {
		//var self = this;

		var baseElement = state.concept.element;
		
		var countVar = sparql.Node.v("__c");
		var facetVar = sparql.Node.v(breadcrumb.targetNode.variable);
		var query = ns.createQueryFacetValuesCountedFiltered(baseElement, breadcrumb, state.config.sampleSize, searchString, countVar);

		console.log("Query data", "" + query);
		
		//var query = queryData.query;
		// TODO Make the limit configurable
		query.limit = 10;
		
		//console.debug("Values query:", queryData);
		
		// Test query
		//query.elements.push(new sparql.ElementString("?s rdfs:label ?var1 . Filter(regex(?var1, '199')) ."));
		
		// The result is a list of facet values:
		// (valueNode, label, count)
		var result = {}; //[];

    // FIXME: executeSelect not defined
		return sparqlService.executeSelect(query.toString()).pipe(function(jsonRs) {
				//console.debug("Binding", jsonRs);
				
				
				var bindings = jsonRs.results.bindings;
				
				for(var i = 0; i < bindings.length; ++i) {
					var binding = bindings[i];
					var val = binding[facetVar.value];
					
					var valueNode = sparql.Node.fromTalisJson(val);
					var count = binding[countVar.value].value;// TODO Maybe parse as int

          // FIXME: could not find FacetValue constructor
					var facetValue = new facets.FacetValue(valueNode, count);
					result[valueNode] = facetValue;
					//result.push();
				}
					
				
				//console.log("Raw facet values:", result);
				//var vars = jsonRs.head.vars;
				
				// TODO We need a discriminator column so we know which facet the values correspond to
				//var map = jsonRdfResultSetToMap(jsonRs, "var1", "__c");
		
				var uris = [];
				for(var key in result) {
					var node = result[key].node;

					if(node.isUri()) {						
						uris.push(node.value);
					}
				}
				
				//console.debug("Value URIs", uris, result);
				
				//var labelFetcher = new labelUtils.LabelFetcher(sparqlService);
				return labelFetcher.fetch(uris, true).pipe(function(uriToLabel) {

					//console.log("Facet value uris", uris, uriToLabel);

					for(var i in result) {						
						var facetValue = result[i];
						var node = result[i].node;
						
						var label = uriToLabel[node.value];
						if(!label) {
							label = node;
						}
						
						facetValue.label = label;
						
						//console.debug("Using facet value label", facetValue.label);
					}
					
					/*
					for(var i = 0; i < result.length; ++i) {						
						var val = result[i].node;
						
						var label = idToLabel[val.value];
						if(!label) {
							label = val;
						}
						
						result[i].label = label;					
					}
					*/

					if(callback) {
						callback.success(result, uriToLabel);
					}
					
					return {facetValues:result, uriToLabel: uriToLabel};
				});
			});
	};

	
	ns.fetchPivotFacets = function(sparqlService, concept, isInverse) {
		
		var outputVar = sparql.Node.v("__p");
		var query = ns.createQueryGetPivotFacets(concept, outputVar, isInverse);
		
		var result = ns.fetchList(sparqlService, query, outputVar);
		//var result = sparqlService.executeSelect(query.toString()).pipe(function()
		
		return result;
	};
	
	/**
	 * 
	 * 
	 * @param node
	 * @param item
	 */
	ns.fetchFacetCountsGeomRec = function(sparqlService, labelFetcher, facetState, node, propertyNameToItem) {
		
		//var self = this;
		var concept = facetState.concept;
    // FIXME: createFacetQueryCount not defined
		var query = ns.createFacetQueryCount(concept.element, concept.variable);

		// Return a promise so we can react if the callback finishes
    // FIXME: executeSelect not defined
		var result = sparqlService.executeSelect(query.toString()).pipe(function(jsonRs) {

				console.log("fetchFacetCountsGeomRec Query", query.toString());
				//console.log("jsonRs for facet counts", jsonRs);
				return ns.processFacets(facetState, jsonRs, labelFetcher).pipe(function(facetState) {
												
					var countTasks = [];

					$.each(node.outgoing, function(propertyName, child) {
						var item = propertyNameToItem[propertyName];
						
						if(item) {
							
							var breadcrumb = item.model.get("breadcrumb");
							
							countTasks.push(ns.loadFacetValues(sparqlService, labelFetcher, facetState, breadcrumb).pipe(function(data) {
								child.facetValues = data.facetValues;
								//console.log("So far got", facetValues);
							}));

							//console.log("Need to fetch: ", item);
						}							
					});
					
					return $.when.apply(window, countTasks).then(function() {
						return facetState;				
					});					
				});
		});
		
		return result;
	};

	
	ns.fetchList = function(sparqlService, query, variable) {
    // FIXME: executeSelect not defined
		var result = sparqlService.executeSelect(query).pipe(function(data) {
			//console.debug("fetchList got data:", "" + query, data);
			var list = [];
			var bindings = data.results.bindings;
			for(var i = 0; i < bindings.length; ++i) {
				var binding = bindings[i];
				var item = binding[variable.value];
				var node = sparql.Node.fromTalisJson(item);
				
				list.push(node);
			}
			
			return list;
		});
	
		return result;		
	};
	
	
	/**
	 * Fetches the first column of the first row of a result set and parses it as int.
	 * 
	 */
	ns.fetchInt = function(sparqlService, query, variable, ajaxOptions) {

    // FIXME: executeSelect not defined
		var result = sparqlService.executeSelect(query, ajaxOptions).pipe(function(data) {
			var count = parseInt(data.results.bindings[0][variable.value].value);
			
			return count;
		});
	
		return result;
	};

})(jQuery);