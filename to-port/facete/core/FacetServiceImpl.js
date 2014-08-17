
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
            
//          this.fetchFacetCount(path, isInverse).done(function(cnt) {
//              console.log('Number of facets at ' + path + ': ' + cnt); 
//          });
            
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
                            item = new ns.FacetItem(childPath, property, distinctValueCount);
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
        }
    });
    
    
    