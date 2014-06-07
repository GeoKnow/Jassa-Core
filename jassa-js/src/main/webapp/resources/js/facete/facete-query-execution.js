(function($) {

	
	var service = Jassa.service;
	var rdf = Jassa.rdf;
    var sponate = Jassa.sponate;	
    var util = Jassa.util;
    var sparql = Jassa.sparql;

	var ns = Jassa.facete;
	
	
	/**
	 * TODO: Actually this object could take the FacetTreeConfig as its sole config argument (the other arg would be the service)
	 * 
	 */
	ns.FacetTreeServiceImpl = Class.create({
		initialize: function(facetService, expansionSet, expansionMap, facetStateProvider, pathToFilterString) { //facetStateProvider) {
			this.facetService = facetService;
			this.expansionSet = expansionSet;
			this.expansionMap = expansionMap;
			this.facetStateProvider = facetStateProvider;

			this.pathToFilterString = pathToFilterString;
		},
		
		fetchFacetTree: function(path) {
			//var path = new ns.Path.parse();

		    var parentFacetItem;

            if(path.isEmpty()) {
                parentFacetItem = new ns.FacetItem(path, rdf.NodeFactory.createUri('http://root'), null);
            } else {
                parentFacetItem = new ns.FacetItem(path, rdf.NodeFactory.createUri(path.getLastStep().getPropertyName()), null);                
            }

            parentFacetItem.setDoc({
                displayLabel: 'Items'
            });
    
            // Apply tags for the root element
            var tags = this.facetService.getTags(path);
            parentFacetItem.setTags(tags);
		    
			var result = this.fetchFacetTreeRec(path, parentFacetItem);
			
//			result.done(function(facetTree) {
//			    console.log("FacetTree: ", facetTree);
//			});
			
			return result;
		},
		
		fetchFavFacets: function(paths) {
		    var self = this;
		    var promises = _(paths).map(function(path) {
		       var parentFacetItem = new ns.FacetItem(path, rdf.NodeFactory.createUri(path.getLastStep().getPropertyName()), null);
		       var r =  self.fetchFacetTreeRec(path, parentFacetItem);
		       return r;
		    });
		    
		    
		    var result = $.Deferred();
		    $.when.apply(window, promises).done(function() {
                var r = _(arguments).map(function(item) {
                    return item;
                });
                
		        result.resolve(r);
		    }).fail(result.fail);
		    
		    
		    return result.promise();
		},
		
		
		
		/**
		 * Returns Promise<List<FacetItem>>
		 * 
		 */
		fetchFacetTreeChildren: function(path, isInverse) {

		    var baseData = {
		            path: path,
		            children: [],
		            limit: null,
		            offset: null
		    };
		        
            //baseData.children = [];
            
            var limit = null;
            var offset = null;

            var state = this.facetStateProvider.getFacetState(path);
            
            if(state) {
                var resultRange = state.getResultRange();
                
                limit = resultRange.getLimit();
                offset = resultRange.getOffset() || 0;
            }


            baseData.limit = limit;
            baseData.offset = offset;


            var filterString = this.pathToFilterString.get(path);
            var baseFlow = this.facetService.createFlow(path, isInverse, filterString);

            var countPromise = baseFlow.count();
            
            //var countPromise = this.facetService.fetchFacetCount(path, false);
            //var childFacetsPromise = this.facetService.fetchFacets(path, false, limit, offset);
            
            var dataFlow = baseFlow.skip(offset).limit(limit);
            
            // TODO How to decide whether to fetch forward or backward facets?
            
            //var childFacetsPromise = this.facetService.fetchFacetsFromFlow(dataFlow, path, false);
            //var childFacetsPromise = this.facetService.fetchFacetsFromFlow(dataFlow, pathHead.getPath(), pathHead.isInverse());
            var childFacetsPromise = this.facetService.fetchFacetsFromFlow(dataFlow, path, isInverse);


            var promises = [countPromise, childFacetsPromise];
            
             
            var result = $.Deferred();
            var self = this;
            $.when.apply(window, promises).pipe(function(childFacetCount, facetItems) {
//console.log('facetItems:', facetItems);
                baseData.childFacetCount = childFacetCount;
                
                var o = limit ? Math.floor((offset || 0) / limit) : 0; 
                
                baseData.pageIndex = 1 + o;
                baseData.pageCount = 1 + (limit ? Math.floor(childFacetCount / limit) : 0);
                
                var childPromises = _(facetItems).map(function(facetItem) {
                    var path = facetItem.getPath();

                    var childPromise = self.fetchFacetTreeRec(path, facetItem);
                    //.pipe(function(childItem) {
                    //});

                    return childPromise;
                });

                
                $.when.apply(window, childPromises).done(function() {
                    _(arguments).each(function(childItem) {
                        baseData.children.push(childItem);
                    });

                    result.resolve(baseData);
                }).fail(function() {
                    result.fail();
                });
                
            });                
		  
            return result;
		},
		
	    /**
         * Given a path, this method fetches all child facets at its target location.
         * 
         * Note that there are 2 components involved:
         * Fetching the child facets
         * 
         * @param facetItem Information about the path leading to this recursion,
         *        such as: count of distinct facet values
         *        null for the root node
         */
		fetchFacetTreeRec: function(path, parentFacetItem) {

		    var isExpanded = this.expansionSet.contains(path);
		    var expansionState = this.expansionMap.get(path);

		    var isOutgoingActive = (expansionState & 1) != 0;
		    var isIncomingActive = (expansionState & 2) != 0;

            // This is the basic information returned for non-expanded facets
            var baseData = {
                item: parentFacetItem,
                isExpanded: isExpanded,
                expansionState: expansionState,
                isOutgoingActive: isOutgoingActive,
                isIncomingActive: isIncomingActive, 
                //state: facetState,
                incoming: null,
                outgoing: null
            };

//            if(isIncomingActive) {
//                console.log('WHAAAAAAAAAAT?');
//            }
            
            var self = this;
            
            
            var result = $.Deferred();
            
            var promises = [];

            if(isExpanded) {
                
                if(isOutgoingActive) { // outgoing
                    var promise = this.fetchFacetTreeChildren(path, false).pipe(function(childData) {
                       baseData.outgoing = childData; 
                    });
                    
                    promises.push(promise);
                }
                
                if(isIncomingActive) { // incoming
                    var promise = this.fetchFacetTreeChildren(path, true).pipe(function(childData) {
                       baseData.incoming = childData; 
                    });
                    promises.push(promise);
                }
            }
            
            $.when.apply(window, promises).done(function() {
                result.resolve(baseData);
            });
            
            return result.promise();
		},
		
		
		fetchFacetTreeRecOldWrongChildFacetCounts: function(path) {
			
		    console.log('fetchFacetTreeRec: ' + path);
			var self = this;
			
			
			var result = $.Deferred();
			
            var limit = null;
            var offset = null;

            var state = this.facetStateProvider.getFacetState(path);
			
            if(state) {
                var resultRange = state.getResultRange();
                
                limit = resultRange.getLimit();
                offset = resultRange.getOffset();
            }
			
            var countPromise = this.facetService.fetchFacetCount(path, false);
			
			var childFacetsPromise = this.facetService.fetchFacets(path, false, limit, offset);
//            promise.done(function(facetItems) {
			
			var promises = [countPromise, childFacetsPromise];
			
            $.when.apply(window, promises).done(function(childFacetCount, facetItems) {
			
				var data = [];
				
				var childPromises = [];
				
				var i = 0;
				_(facetItems).each(function(facetItem) {
					
					var path = facetItem.getPath();

										
					var uri = facetItem.getNode().getUri();
					
					var isExpanded = self.expansionSet.contains(path);
					//var childPath = path.copyAppendStep(new facete.Step(uri, false));

					// Check if the node corresponding to the path is expanded so
					// that we need to fetch the child facets
					//var facetState = this.facetStateProvider.getFacetState(path);

//					console.log("facetState:", childFacetState);
//					console.log("childPath:" + childPath);
					//console.log("childPath:" + facetItem.getPath());

					
					var dataItem = {
						item: facetItem,
						isExpanded: isExpanded,
						//state: facetState,
						children: null,
						childFacetCount: childFacetCount,
						limit: limit,
						offset: offset
					};
					++i;

					data.push(dataItem);
					
					// TODO: Fetch the distinct value count for the path
					if(!isExpanded) {
						return;
					}
//					if(!(facetState && facetState.isExpanded())) {
//						return;
//					}
					console.log("Got a child facet for path " + path + ' with ' + childFacetCount + ' children');
					
					var childPromise = self.fetchFacetTreeRec(path).pipe(function(childItems) {
						dataItem.children = childItems;
					});

					childPromises.push(childPromise);
				});

				
				$.when.apply(window, childPromises)
					.done(function() {

//						var data = [];
//						_(arguments).each(function(arg) {
//							console.log('got arg', arg);
//						});
//						
//						var item = {
//							path: path,
//							distinctValueCount: 
//						};
						
						result.resolve(data);
					}).
					fail(function() {
						result.fail();
					});
				
			});
			
			return result.promise();
		}
	});
	
	
	ns.FacetService = Class.create({
		fetchFacets: function(path, isInverse) {
			throw "Override me";
		}
	});
	
	
	ns.FacetItem = Class.create({
	    /**
	     * doc: The json document returned via the sponate mapping of the labelMap.
	     * Should at least contain the fields 'displayLabel' and 'hiddenLabels'.
	     * 
	     */
		initialize: function(path, node, distinctValueCount, tags, doc) {
			this.path = path;
			this.node = node;
			this.distinctValueCount = distinctValueCount;
			this.tags = tags || {};
			this.doc = doc || {};
		},

//		getUri: functino() {
//			return node.getUri 
//		},
		getNode: function() {
			return this.node;
		},
		
		getPath: function() {
			return this.path;
		},
		
		getDoc: function() {
		    return this.doc;
		},

		setDoc: function(doc) {
		    this.doc = doc;
		},
		
		getDistinctValueCount: function() {
			return this.distinctValueCount;
		},
		
		getTags: function() {
		    return this.tags;
		},
		
		setTags: function(tags) {
		    this.tags = tags;
		}
	});
	
	
	   ns.FacetFetchingWorkflow = Class.create({
	        execute: function(sparqlService, labelMap) {
	            
	        }
	    });


	ns.FacetServiceImpl = Class.create(ns.FacetService, {
		initialize: function(sparqlService, facetConceptGenerator, labelMap, pathTaggerManager) {
			this.sparqlService = sparqlService;
			this.facetConceptGenerator = facetConceptGenerator;
			this.labelMap = labelMap;
			this.pathTaggerManager = pathTaggerManager;
		},
		
		getTags: function(path) {
            var result = this.pathTaggerManager.createTags(path);
            return result;
		},
		
		/*
		getFacetConfig: function() {
		    var result = new facete.FacetConfig();
		    result.setPathTaggerManager(this.pathTaggerManager);
		    return result;
		},
		*/

/*		
		createConceptFacetValues: function(path, excludeSelfConstraints) {
			var concept = this.facetConceptGenerator.createConceptResources(path, excludeSelfConstraints);
			return concept;
		},
*/
	
		createFlow: function(path, isInverse, filterString) {

		    var labelStore = new sponate.StoreFacade(this.sparqlService, {});//, cacheFactory);
		    labelStore.addMap(this.labelMap, 'labels');

		    
		    var concept = this.facetConceptGenerator.createConceptFacets(path, isInverse);
		    
            var criteria = {};
            if(filterString) {
                criteria = {$or: [
                    {hiddenLabels: {$elemMatch: {id: {$regex: filterString, $options: 'i'}}}},
                    {id: {$regex: filterString, $options: 'i'}}
                ]};
            }

		    
		    var result = labelStore.labels.find(criteria).concept(concept, true);
		    return result;
		},
		
		fetchFacetCount: function(path, isInverse) {
            var concept = this.facetConceptGenerator.createConceptFacets(path, isInverse);
            
            //var groupVar = facetConcept.getFacetVar();
            var outputVar = rdf.NodeFactory.createVar('_c_');
//            var countVar = concept.getVar();
//            var elements = concept.getElements();
        
            //var query = ns.QueryUtils.createQueryCount(elements, null, countVar, outputVar, null, true); 

            var query = ns.ConceptUtils.createQueryCount(concept, outputVar);

            var qe = this.sparqlService.createQueryExecution(query);
            
            var promise = service.ServiceUtils.fetchInt(qe, outputVar);

            return promise;
		},
		
		
		/**
		 * Fetches *ALL* facets and their corresponding counts with a single query.
		 * 
		 * TODO The result should be cached, and limit/offset should then work on the cache
		 * 
		 */
		fetchFacets2: function(path, isInverse, limit, offset) {
            var facetConcept = this.facetConceptGenerator.createConceptFacetsCore(path, isInverse, false);

            var elements = facetConcept.getElements();
            var groupVar = facetConcept.getFacetVar();
            var countVar = facetConcept.getFacetValueVar();
            
            var outputVar = rdf.NodeFactory.createVar('_c_');
            
            var query = ns.QueryUtils.createQueryCount(elements, null, countVar, outputVar, [groupVar], true);
            
            var countExpr = query.getProject().getExpr(outputVar);
            //console.log('sort cond: ' + countExpr);
            query.getOrderBy().push(new sparql.SortCondition(countExpr, -1));
            
            //console.log('All facet query: ' + query);
            
            //query.getOrderBys().add(new sparql.SortCondition(countVar))
            var promise = this.sparqlService.createQueryExecution(query).execSelect();
            
            var result = promise.pipe(function(rs) {
                var r = [];
                while(rs.hasNext()) {
                    var binding = rs.nextBinding();
                    
                    var property = binding.get(groupVar);
                    var dvc = binding.get(outputVar);
                    
                    var propertyName = property.getUri();
                    var distinctValueCount = dvc.getLiteralValue();
                    
                    var step = new ns.Step(propertyName, isInverse);
                    var childPath = path.copyAppendStep(step);
                    var item = new ns.FacetItem(childPath, property, distinctValueCount);


                    r.push(item);
                }

                return r;
            });
            

            // Apply tags
            var tmp = this.pipeTagging(result);
            return tmp;
            
            //result = this.pipeTagging(result);
            //return result;
		},
		
		
		pipeTagging: function(promise) {
		    var self = this;
		    
            var result = promise.pipe(function(items) {
                //ns.FacetTreeUtils.applyTags(items, self.pathTagger);
                
                _(items).each(function(item) {
                    //self.pathTaggerManager.applyTags(item);
                    //ns.FacetTreeUtils.applyTags(self.pathTaggerManager, item);
                    var tags = self.pathTaggerManager.createTags(item.getPath());
                    item.setTags(tags);
                });
                
                return items;
            });

            return result;
		},
		
		fetchFacetsFromFlow: function(flow, path, isInverse) {
            var promise = flow.asList(true); // Retains RDF nodes
		    
            var deferred = $.Deferred();

            var self = this;
	        promise.done(function(docs) {
	            /*
	            var properties = _(docs).map(function(doc) {
	                return rdf.NodeFactory.parseRdfTerm(doc.id);
	            });
	            */
	            var map = util.MapUtils.indexBy(docs, 'id');
	            var properties = _(docs).pluck('id');

	            if(properties.length === 0) {
                    deferred.resolve([]);
                    return;
	            }

                var promise = self.fetchFacetValueCounts(path, isInverse, properties, false);

                promise.done(function(r) {
                    console.log('PropertyCounts', r);
                    
                    // This feels a bit hacky, as it sets an attribute on another functions result
                    _(r).each(function(item) {
                        var doc = map.get(item.getNode());
                        item.setDoc(doc);
                    });
                    
                    deferred.resolve(r);
                }).fail(function() {
                    deferred.fail();
                });

	        }).fail(function() {
	           deferred.fail();
	        });
	        
            // Apply tags
	        var tmp = this.pipeTagging(deferred);
	        return tmp.promise();

            //deferred = this.pipeTagging(deferred);
	        //return deferred.promise(); 
		},
		
		
		/**
		 * Retrieve information about a single facet instead of its children
		 */
		fetchFacet: function(path) {
		    var scanLimit = 1000;

		    var outputVar = rdf.NodeFactory.createVar();
		    var concept = this.facetConceptGenerator.createConceptResources(path, false, scanLimit);
		    // TODO Thresholded count
            //var countQuery = ns.QueryUtils.createQueryCount(concept.getElements(), scanLimit, concept.getVar(), outputVar, null, false);
            var query = ns.ConceptUtils.createQueryCount(concept, outputVar); // scanLimit
            var qe = this.sparqlService.createQueryExecution(query);
            var promise = service.ServiceUtils.fetchInt(qe, outputVar);
            
            var self = this;
            var p2 = promise.pipe(function(count) {
                var node = path.isEmpty() ? rdf.NodeFactory.createUri('http://root') : rdf.NodeFactory.createUri(path.getLastStep().getPropertyName());
                var r = new ns.FacetItem(path, node, count, null, null);

                // FIXME: item cannot be resolved
                var tags = self.pathTaggerManager.createTags(item.getPath());
                item.setTags(tags);
                
                return r;
            });
            
            return p2;		    
		},

		
		/**
		 * TODO Superseded by fetchFacetsFromFlow
		 * 
		 * This strategy first fetches a list of properties,
		 * and only for the list members does to counting,
		 * this way, ordering by count is supported
		 * 
		 */
		fetchFacets: function(path, isInverse, limit, offset) {
		    
//		    this.fetchFacetCount(path, isInverse).done(function(cnt) {
//		        console.log('Number of facets at ' + path + ': ' + cnt); 
//		    });
		    
			var concept = this.facetConceptGenerator.createConceptFacets(path, isInverse);
			
			var query = ns.ConceptUtils.createQueryList(concept);
			//alert("" + query);
			query.setLimit(limit);
			query.setOffset(offset);
			
			//var query = this.facetQueryGenerator.createQueryFacets();
			
			var qe = this.sparqlService.createQueryExecution(query);
			
			var promise = service.ServiceUtils.fetchList(qe, concept.getVar());

			
			var self = this;
			
			var deferred = $.Deferred();

			promise.done(function(properties) {
				var promise = self.fetchFacetValueCounts(path, isInverse, properties, false);
				
				promise.done(function(r) {
	                console.log('PropertyCounts', r);
					deferred.resolve(r);
				}).fail(function() {
					deferred.fail();
				});

			}).fail(function() {
				deferred.fail();
			});
			
			
			return deferred.promise();
		},
		
		
		fetchFacetValueCountsThresholded: function(path, isInverse, properties, isNegated, scanLimit, maxQueryLength) {
		    scanLimit = 10000;
		    // Check the scan counts (i.e. how many triples we would have to scan in order to compute the counts of distinct values)
		    var querySpecs = this.createQuerySpecsFacetValueScanCounts(path, isInverse, properties, isNegated, scanLimit, maxQueryLength);
		    var promise = this.processQuerySpecsFacetValueCounts(path, isInverse, properties, querySpecs);
		    
		    var result = jQuery.Deferred();
		    
		    var self = this;
		    promise.done(function(facetItems) {
		        var selectiveItems = _(facetItems).filter(function(x) {
		            return x.getDistinctValueCount() < scanLimit;
		        });

		        var selectiveProperties = _(selectiveItems).map(function(x) {
		            return x.getNode();
		        });

                // Check which properties had scan counts below the threshold
		        
		        var p = self.fetchFacetValueCountsFull(path, isInverse, selectiveProperties, isNegated, scanLimit);
		        
		        p.done(function(fis) {
                    var selectivePropertyNameToItem = _(fis).indexBy(function(x) { return x.getNode().getUri(); });

                    var r = _(properties).map(function(property) {
                        var propertyName = property.getUri();
                        var item = selectivePropertyNameToItem[propertyName];

                        if(!item) {
                            var distinctValueCount = -1;
                            
                            var step = new ns.Step(propertyName, isInverse);
                            var childPath = path.copyAppendStep(step);
                            var item = new ns.FacetItem(childPath, property, distinctValueCount);                            
                        }
                        
                        return item;
		            });
		            
                    result.resolve(r);
		            
		        }).fail(function() {
		           result.fail.apply(this, arguments); 
		        });
		        
		        
		        
		        
		    }).fail(function() {
		        result.fail.apply(this, arguments);
		    });
		    
            // Apply tags
		    var tmp = this.pipeTagging(result);
		    return tmp;
		    
            //result = this.pipeTagging(result);
		    //return result;
		},
		
		/**
		 * Variation of fetchFacetValueCounts that adds only counts of to a certain limit for each property
		 * 
		 * @param path
		 * @param isInverse
		 * @param properties
		 * @param isNegated - Not supported yet with this strategy / requires fetching ALL properties first
		 */
		createQuerySpecsFacetValueScanCounts: function(path, isInverse, properties, isNegated, scanLimit, maxQueryLength) {
		    
		    if(isNegated) {
		        console.log('Negated property sets not (yet) supported with thresholded counting strategy');
		        throw 'Bailing out';
		    }
		    
	        var outputVar = rdf.NodeFactory.createVar('_c_');

	        // TODO Hack: We assume that the var is called this way, but we need to ensure this
	        var groupVar = rdf.NodeFactory.createVar('p_1');
		    
	        var self = this;
		    var unionMembers = _(properties).map(function(property) {
		        
	            var facetConceptItems = self.facetConceptGenerator.createConceptFacetValues(path, isInverse, [property], isNegated);
		        var facetConceptItem = facetConceptItems[0];
		        
                var facetConcept = facetConceptItem.getFacetConcept();
                
                var groupVar = facetConcept.getFacetVar();
                var countVar = facetConcept.getFacetValueVar(); 
                var elements = facetConcept.getElements();
            
                
                /*
                var limitQuery = new sparql.Query();
                var limitElements = limitQuery.getElements();

                limitQuery.getProject().add(groupVar);
                limitQuery.getProject().add(countVar);

                limitElements.push.apply(limitElements, elements);
                limitQuery.setLimit(scanLimit);
                */
                
                /*
                var distinctQuery = new sparql.Query();
                distinctQuery.setDistinct(true);
                distinctQuery.getProject().add(groupVar);
                distinctQuery.getProject().add(countVar);
                distinctQuery.getElements().push(new sparql.ElementSubQuery(limitQuery));
                distinctQuery.setLimit(limit);
                */
                
                
                //var subElement = new sparql.ElementSubQuery(limitQuery);
                //var subElement = new sparql.ElementSubQuery(distinctQuery);
                
                //var countQuery = ns.QueryUtils.createQueryCount([subElement], null, countVar, outputVar, [groupVar], false);
                var countQuery = ns.QueryUtils.createQueryCount(elements, scanLimit, countVar, outputVar, [groupVar], false);
                
                // TODO: The count is just a check for the scan counts, but not for the distinct values...
                // This means, for each p1 that is below the scan limit, we can do another query
                
                //var countQuery = ns.QueryUtils.createQueryCount(elements, null, countVar, outputVar, [groupVar], true);
                
                return countQuery;
		    });
		    
		    // For each union query group...		    
		    var finalQuery;
		    if(unionMembers.length > 1) {
		        var unionElements = _(unionMembers).map(function(query) {
		            var r = new sparql.ElementSubQuery(query);
		            return r;
		        });
		        
		        var elementUnion = new sparql.ElementUnion(unionElements);		    
		        
                finalQuery = new sparql.Query();
		        finalQuery.getProject().add(groupVar);
		        finalQuery.getProject().add(outputVar);

		        var finalElements = finalQuery.getElements();
                finalQuery.getElements().push(elementUnion);
		    }
		    else if(unionMembers.length === 1) {
		        finalQuery = unionMembers[0];
		    }
		    else {
		        console.log('Should not happen');
		        throw 'Should not happen';
		    }
		    
		    var querySpec = {
		        query: finalQuery,
		        groupVar: groupVar,
		        //countVar: outputVar
		        outputVar: outputVar
		    };
		    
		    var result = [querySpec];
		    
		    return result;
		},
		
		processQuerySpecsFacetValueCounts: function(path, isInverse, properties, querySpecs) {
            var nameToItem = {};
            
            _(properties).each(function(property) {
                var propertyName = property.getUri();
                
                nameToItem[propertyName] = {
                    property: property,
                    distinctValueCount: 0
                }
            });

            var self = this;
            var promises = _(querySpecs).map(function(querySpec) {
                
                //var facetConcept = item.getFacetConcept();
                
                var query = querySpec.query;
                var groupVar = querySpec.groupVar;
                //var countVar = querySpec.countVar;
                var outputVar = querySpec.outputVar;
                
                var qe = self.sparqlService.createQueryExecution(query);
                
                
                var promise = qe.execSelect().pipe(function(rs) {
                    
                    // Overwrite entries based on the result set
                    while(rs.hasNext()) {
                        var binding = rs.nextBinding();
                        
                        var property = binding.get(groupVar);
                        var propertyName = property.getUri();
                        
                        var distinctValueCount = binding.get(outputVar).getLiteralValue();
                                            
                        nameToItem[propertyName] = {
                            property: property,
                            distinctValueCount: distinctValueCount
                        }
                    }
                });
                
                //console.log("Test: " + query);
                return promise;
            });

            var d = $.Deferred();
            $.when.apply(window, promises).done(function() {
                
                // Create the result                    
                var r = _(properties).map(function(property) {
                    var propertyName = property.getUri();
                    var item = nameToItem[propertyName];

                    var distinctValueCount = item.distinctValueCount;
                    
                    var step = new ns.Step(propertyName, isInverse);
                    var childPath = path.copyAppendStep(step);
                    var tmp = new ns.FacetItem(childPath, property, distinctValueCount);
                    return tmp
                });
                
                //return r;

                
//              var r = [];
//              
//              for(var i = 0; i < arguments.length; ++i) {
//                  var items = arguments[i];
//                  //alert(items);
//                  
//                  r.push.apply(r, items);
//              }

                d.resolve(r);
            }).fail(function() {
                d.fail();
            });

            return d.promise();

		},
		
		
		//elements, limit, variable, outputVar, groupVars, useDistinct, options
		/**
		 * Returns the distinctValueCount for a set of properties at a given path
		 * 
		 * Creates a query of the form
		 * Select ?p Count(*) As ?c {
		 *     { /facet constraints with some var such as ?s/ }
		 *     ?s ?p ?o .
		 *     Filter(?p In (/given list of properties/))
		 * }
		 * 
		 */
		fetchFacetValueCounts: function(path, isInverse, properties, isNegated) {
		    //var result = fetchFacetValueCountsFull(path, isInverse, properties, isNegated);
		    var result = this.fetchFacetValueCountsThresholded(path, isInverse, properties, isNegated);
		    
		    return result;
		},
		
		fetchFacetValueCountsFull: function(path, isInverse, properties, isNegated) {
			var facetConceptItems = this.facetConceptGenerator.createConceptFacetValues(path, isInverse, properties, isNegated);
			

			var outputVar = rdf.NodeFactory.createVar('_c_');
			
						
            // Initialize the result
            // TODO Actually we don't need to store the property - we could map to
            // the distinct value count directly
            var nameToItem = {};
            
            _(properties).each(function(property) {
                var propertyName = property.getUri();
                
                nameToItem[propertyName] = {
                    property: property,
                    distinctValueCount: 0
                }
            });

			
			var self = this;
			var promises = _(facetConceptItems).map(function(item) {
			
				var facetConcept = item.getFacetConcept();
				
				var groupVar = facetConcept.getFacetVar();
				var countVar = facetConcept.getFacetValueVar(); 
				var elements = facetConcept.getElements();
			
				var query = ns.QueryUtils.createQueryCount(elements, null, countVar, outputVar, [groupVar], true); 
				
				var qe = self.sparqlService.createQueryExecution(query);
				
				//qe.setTimeout()
				
				
				var promise = qe.execSelect().pipe(function(rs) {
				    
				    // Overwrite entries based on the result set
					while(rs.hasNext()) {
						var binding = rs.nextBinding();
						
						var property = binding.get(groupVar);
						var propertyName = property.getUri();
						
						var distinctValueCount = binding.get(outputVar).getLiteralValue();
											
						nameToItem[propertyName] = {
						    property: property,
						    distinctValueCount: distinctValueCount
						}
					}
				});
				
				//console.log("Test: " + query);
				return promise;
			});
			
	
			var d = $.Deferred();
			$.when.apply(window, promises).done(function() {
			    
                // Create the result                    
                var r = _(properties).map(function(property) {
                    var propertyName = property.getUri();
                    var item = nameToItem[propertyName];

                    var distinctValueCount = item.distinctValueCount;
                    
                    var step = new ns.Step(propertyName, isInverse);
                    var childPath = path.copyAppendStep(step);
                    var tmp = new ns.FacetItem(childPath, property, distinctValueCount);
                    return tmp
                });
                
                //return r;

			    
//				var r = [];
//				
//				for(var i = 0; i < arguments.length; ++i) {
//					var items = arguments[i];
//					//alert(items);
//					
//					r.push.apply(r, items);
//				}

				d.resolve(r);
			}).fail(function() {
				d.fail();
			});

			return d.promise();
		}
	});
	
	
	
	
	// Below code needs to be ported or removed
	
	var Todo = {
	
		/**
		 * Tries to count all pages. If it fails, attempts to count the
		 * pages within the current partition
		 */
		refreshPageCount: function() {
			//console.log("Refreshing page count");

			var self = this;

			if(!this.tableExecutor) {
				self.paginatorModel.set({pageCount: 1});
				return;
			};

			var result = $.Deferred();

			//console.log('isLoading', self.tableModel.attributes);
			self.paginatorModel.set({isLoadingPageCount: true});
			
			var successAction = function(info) {				
				self.tableModel.set({
					itemCount: info.count,
					hasMoreItems: info.more
				});
				
				self.paginatorModel.set({
					isLoadingPageCount: false
				});
				
				result.resolve();
			};
				
			
			// Experiment with timeouts:
			// If the count does not return within 'timeout' seconds, we try to count again
			// with a certain threshold
			var sampleSize = 10000;
			var timeout = 3000;
			
			
			var task = this.tableExecutor.fetchResultSetSize(null, null, { timeout: timeout });
			
			
			task.fail(function() {
				
				console.log("[WARN] Timeout encountered when retrieving page count - retrying with sample strategy");
				
				var sampleTask = self.tableExecutor.fetchResultSetSize(
					sampleSize,
					null,
					{ timeout: timeout }
				); 

				sampleTask.pipe(successAction);
				
				sampleTask.fail(function() {
					console.log("[ERROR] Timout encountered during fallback sampling strategy - returning only 1 page")
					
					self.paginatorModel.set({
						isLoadingPageCount: false
					});

					result.resolve({
						itemCount: 1,
						hasMoreItems: true
					});
					
				})
				
			});
			
			
			task.pipe(successAction);
		},
		
		omfgWhatDidIDo_IWasABadProgrammer: function() {
		
			
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
		}
	};

})(jQuery);

