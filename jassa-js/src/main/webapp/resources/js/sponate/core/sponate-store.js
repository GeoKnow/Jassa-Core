(function() {

	
	var util = Jassa.util;
	var rdf = Jassa.rdf;
	var sparql = Jassa.sparql;
	var service = Jassa.service;
	var facete = Jassa.facete;
	
	var ns = Jassa.sponate;
	
	
	ns.QueryConfig = Class.create({
		initialize: function(criteria, limit, offset, concept, _isLeftJoin, nodes) {
			this.criteria = criteria;
			this.limit = limit;
			this.offset = offset;
			
			// HACK The following two attributes belong together, factor them out into a new class
			this.concept = concept;
			this._isLeftJoin = _isLeftJoin;
			
			// Note: For each element in the nodes array, corresponding data will be made available.
			// Thus, if nodes is an empty array, no results will be fetched; set to null to ignore the setting
			this.nodes = nodes;
		},
		
		shallowClone: function() {
		    var r = new ns.QueryConfig(this.criteria, this.limit, this.offset, this.concept, this._isLeftJoin, this.nodes);
		    return r;
		},
		
		getCriteria: function() {
			return this.criteria;		
		},
		
		setCriteria: function(criteria) {
		    this.criteria = criteria;
		},
		
		getLimit: function() {
			return this.limit;
		},
		
		setLimit: function(limit) {
		    this.limit = limit;
		},
		
		getOffset: function() {
			return this.offset;
		},
		
		setOffset: function(offset) {
		    this.offset = offset;
		},
		
		getConcept: function() {
		    return this.concept;
		},
		
		setConcept: function(concept) {
		    this.concept = concept;
		},
		
		isLeftJoin: function() {
		    return this._isLeftJoin;
		},
		
		setLeftJoin: function(isLeftJoin) {
		    this._isLeftJoin = isLeftJoin;
		},
		
		getNodes: function() {
		    return this.nodes;
		},
		
		setNodes: function(nodes) {
		    this.nodes = nodes;
		}
	});
	
	/**
	 * The cursor is both a flow api and a result set / iterator.
	 * 
	 * (Not sure I like this design, i.e. making distinct concepts look like if they were same,
	 * but that's the way ppl do JavaScript, sigh)
	 * 
	 * Calling next, hasNext or forEach starts retrieving the data
	 * 
	 */
	ns.Cursor = Class.create({
		hasNext: function() {
			
		},
		
		next: function() {
			
		},
		

		forEach: function(fn) {
			while(this.hasNext()) {
				var json = this.next();
				
				fn(json);
			}
		}
	}); 
	
	
	ns.CursorFlow = Class.create({
		
		
		hasNext: function() {
			
		},
		
		skip: function(n) {
			
		},
		
		limit: function(n) {
			
		},
		
		sort: function(attr) {
			
		}
		
	});

	
	ns.QueryFlow = Class.create({
		initialize: function(store, criteria) {
			this.store = store;
			this.config = new ns.QueryConfig();
			
			this.config.setCriteria(criteria);
		},
		
		/**
		 * Join the lookup with the given concept
		 */
		concept: function(_concept, isLeftJoin) {
		    this.config.setConcept(_concept);
		    this.config.setLeftJoin(isLeftJoin);
		    
		    return this;
		},
		
		/**
		 * Specify a set of nodes for which to perform the lookup
		 * If concept is specified, nodes will be applied to the concept
		 * 
		 * //Use of .concept(...) and .nodes(..) is mutually exclusive
		 * 
		 */
		nodes: function(_nodes) {
		    this.config.setNodes(_nodes);
		    
		    return this;
		},
		
		skip: function(offset) {
			this.config.setOffset(offset);
			
			return this;
		},
		
		limit: function(limit) {
			this.config.setLimit(limit);
			
			return this;
		},
		
		offset: function(offset) {
		    this.config.setOffset(offset);
		    
		    return this;
		},
		
		asList: function(retainRdfNodes) {
			var promise = this.execute(retainRdfNodes);

			// TODO This should be part of the store facade
			var result = promise.pipe(function(it) {
				var arr = [];
				while(it.hasNext()) {
					arr.push(it.next());
				}
				
				return arr;
			});
			
			return result;
		},
		
		hasNext: function() {
			
		},
		
		next: function() {
			
		},
		
		
		// TODO This is a hack right now - not sure how to design the execution yet
		execute: function(retainRdfNodes) {
			var result = this.store.execute(this.config, retainRdfNodes);
			return result;
		},
		
        count: function() {
            var result = this.store.executeCount(this.config);
            return result;          
        }		
	});
	
	
	
	
	
	/**
	 * 
	 * TODO We need to attach a post processor, e.g. for ?/ label
	 * 
	 * TODO Pagination will break with criteria queries as the criteria-to-sparql translation is not working yet
	 *   
	 * 
	 */
	ns.Store = Class.create({
		/**
		 * A sparql service (assumed to return talis json rdf)
		 * 
		 */
		initialize: function(sparqlService, context, mappingName, cacheFactory) {
			this.sparqlService = sparqlService;
			this.context = context;
			this.mappingName = mappingName;
			this.cacheFactory = cacheFactory;
		},
		
		find: function(crit) {
			var criteriaParser = this.context.getCriteriaParser(); 


			var criteria = criteriaParser.parse(crit);
						
			var result = new ns.QueryFlow(this, criteria);
			return result;
		},
		
		getByIds: function(nodes) {
		    
		},
		
		getByConcept: function(concept, doJoin) {
		    
		},
		
		

		createQuerySpec: function(config) {
			// TODO Compile the criteria to
			// a) SPARQL filters
			// b) post processors
			
			var context = this.context;
			var criteria = config.getCriteria();
			var limit = config.getLimit();
			var offset = config.getOffset();
			var filterConcept = config.getConcept();
			var isLeftJoin = config.isLeftJoin();
			var nodes = config.getNodes();
			
			//console.log('context', JSON.stringify(this.context), this.context.getNameToMapping());
			
			var mapping = this.context.getMapping(this.mappingName);
			

			// Resolve references if this has not been done yet
			// TODO Optimize this by caching prior resolution
			ns.ContextUtils.resolveMappingRefs(this.context, mapping);
			console.log('Refs: ', mapping.getPatternRefs());

			
			// Compile criterias
			var criteriaCompiler = new ns.CriteriaCompilerSparql();
			
			var elementCriteria = criteriaCompiler.compile(context, mapping, criteria);
			console.log('Compiled criteria: ' + elementCriteria, elementCriteria);
			
			

			
			
			//console.log('mapping:', mapping);
			
			// Retrieve the mapping's table and the associated element
			
			var elementFactory = mapping.getElementFactory(); //this.context.getElementFactory(mapping.getTableName());
			var outerElement = elementFactory.createElement();
			
			
			if(elementCriteria) {
			    //element = new sparql.ElementGrou()
			}
			
			var pattern = mapping.getPattern();
			//console.log('Pattern here ' + JSON.stringify(pattern));

			
			
			
			var vars = pattern.getVarsMentioned();
			//console.log('' + vars);
		
			
			var idExpr;
			if(pattern instanceof ns.PatternMap) {
				idExpr = pattern.getKeyExpr();
			}

			
			var sortConditions = [];
			if(idExpr != null) {
				//console.log('Expr' + JSON.stringify(idExpr));
				
				var sc = new sparql.SortCondition(idExpr, 1);

				sortConditions.push(sc);
			}

			
            var idVar;
            if(!(idExpr instanceof sparql.ExprVar)) {
                console.log("[ERROR] Currently the idExpr must be a variable. This restriction may be lifted in the future");
                throw "Bailing out";
            }
            idVar = idExpr.asVar();

						
			var requireSubQuery = limit != null || offset != null || elementCriteria.length > 0; // || (filterConcept != null && !filterConcept.isSubjectConcept()) ||;

            var innerElement = outerElement;


            
            
/////            
            // Combine innerElement, concept and the criteria
            var attrConcept = new facete.Concept(innerElement, idVar);

            // If there is no filterConcept, the result is the mappingConcept
            // If there is a filterConcept and NO leftJoin, the result is the combination of the mappingConcept and the filterConcept
            //    if there is a leftJoin
            //       if there is a leftJoin AND there are NO filter criteria, the result is just the filterConcept
            //    if there are filter criteria, the result is the l
            //    if there are filter critera, append them
            
            // createCombineConcept(attrConcept, filterConcept, renameVars, attrsOptional, filterAsSubquery)
            var coreConcept;
            
            var attrsInCore;
            if(!filterConcept) {
                coreConcept = attrConcept;
            }
            else {
                if(!isLeftJoin) {
                   coreConcept = facete.ConceptUtils.createCombinedConcept(attrConcept, filterConcept, true);
                } else {
                    
                    if(elementCriteria.length > 0) {
                        // Make the attributes optional
                        //var optionalAttrConcept = new facete.Concept(new sparql.ElementOptional(attrConcept.getElement()), attrConcept.getVar());
                        
                        // TODO The filter concept should go first
                        //coreConcept = facete.ConceptUtils.createCombinedConcept(optionalAttrConcept, filterConcept, true, true);
                        coreConcept = facete.ConceptUtils.createCombinedConcept(attrConcept, filterConcept, true, true);
                    } else {
                        //coreConcept = attrConcept;
                        // TODO Rename the vars
                        //coreConcept = filterConcept;
                        coreConcept = facete.ConceptUtils.createRenamedConcept(attrConcept, filterConcept);
                    }                    
                }
            }
            
            // Append the filter criterias to the core concept
            if(elementCriteria.length > 0) {
                var criteriaFilter = (elementCriteria.length > 0) ? new sparql.ElementFilter(elementCriteria) : null;  
                
                var es = [coreConcept.getElement(), criteriaFilter];
                var eg = new sparql.ElementGroup(es); //facete.ElementUtils.createElementGroupFlattenShallow(es);
                
                coreConcept = new facete.Concept(eg, coreConcept.getVar());
            }

            console.log('[INFO] SponateCoreConcept ' + coreConcept);            
        
            var coreElement = coreConcept.getElement();

			if(requireSubQuery) {
				var subQuery = new sparql.Query();
				/*
				var subQueryElements = subQuery.getElements();
				subQueryElements.push(innerElement);
				*/
				subQuery.setQueryPattern(coreElement);
				
				/*
				if(elementCriteria.length > 0) {
				    subQueryElements.push(new sparql.ElementFilter(elementCriteria));
				}
				*/
			
				
				subQuery.setLimit(limit);
				subQuery.setOffset(offset);
				subQuery.setDistinct(true);
				subQuery.getProject().add(idVar);

                var oe = outerElement;
                if(isLeftJoin) {
                    //subElement = new sparql.ElementOptional(subElement);
                    oe = new sparql.ElementOptional(outerElement);
                }
				
				outerElement = new sparql.ElementGroup([
				                                   new sparql.ElementSubQuery(subQuery),
				                                   oe]);

				// TODO Do we need a sort condition on the inner query?
				// Note that the inner query already does a distinct
				//var orderBys = subQuery.getOrderBy();
				//orderBys.push.apply(orderBys, sortConditions);

				
				innerElement = coreElement;
			} else {
			    outerElement = coreElement;
			}
            
            var result = {
                requireSubQuery: requireSubQuery,
                coreConcept: coreConcept,
                innerElement: innerElement,
                outerElement: outerElement,
                idVar: idVar,
                idExpr: idExpr,
                vars: vars,
                sortConditions: sortConditions,
                pattern: pattern,
                criteria: criteria,
                nodes: nodes
            };
            
            //console.log('innerElement: ' + innerElement);
            //console.log('outerElement: ' + outerElement);
            

            
            return result;
		},

		
		execute: function(config, retainRdfNodes) {
		    var spec = this.createQuerySpec(config);
		    
		    var result = this.executeData(spec, retainRdfNodes);
		    
		    return result;
		},
		
		executeCount: function(config) {
            var spec = this.createQuerySpec(config);

            if(spec.nodes) {
                console.log('Counting if nodes are provided is not implemented yet');
                throw 'Counting if nodes are provided is not implemented yet';
            }
                

            //var element = spec.innerElement;
            //var idVar = spec.idVar;           
            //var concept = new facete.Concept(element, idVar);
            var concept = spec.coreConcept;
            
            var threshold = config.getLimit();
            var result = service.ServiceUtils.fetchCountConcept(this.sparqlService, concept, threshold);
            /*
            var outputVar = rdf.NodeFactory.createVar('_c_');
            var query = facete.ConceptUtils.createQueryCount(concept, outputVar);
            var qe = this.sparqlService.createQueryExecution(query);
            var result = service.ServiceUtils.fetchInt(qe, outputVar);
            */
            
            return result;
		},
		
		executeData: function(spec, retainRdfNodes) {
		    var outerElement = spec.outerElement;
		    var idExpr = spec.idExpr;
		    var idVar = spec.idVar;
		    var sortConditions = spec.sortConditions;
		    var vars = spec.vars;
		    var pattern = spec.pattern;
		    var criteria = spec.criteria;

			//console.log('' + pattern, idExpr);
			//console.log('idExpr' + idExpr);
			
			
			// Query generation
			var query = new sparql.Query();
			query.getElements().push(outerElement);
			_(vars).each(function(v) { query.getProject().add(v); });
			if(idExpr != null) {
				//console.log('Expr' + JSON.stringify(idExpr));
				
				var sc = new sparql.SortCondition(idExpr, 1);

				var orderBys = query.getOrderBy();
				orderBys.push.apply(orderBys, sortConditions);
				//query.getOrderBy().push(sc);
			}
			//query.setLimit(10);
			
			var rsPromise;
			if(spec.nodes) {
			    rsPromise = service.ServiceUtils.execSelectForNodes(this.sparqlService, query, idVar, spec.nodes);
			}
			else {
	            var qe = this.sparqlService.createQueryExecution(query);
	            rsPromise = qe.execSelect();			    
			}

			var result = rsPromise.pipe(function(rs) {
			    var r = ns.SponateUtils.processResultSet(rs, pattern, retainRdfNodes, false);
			    return r;
			});
			
			return result;
			//console.log('' + query);
			
			
			
			// TODO We are no longer retrieving triples, but objects
			// Thus limit and offset applies to entities -> sub query! 			
		}
	});
	
	
	ns.QueryPlan = Class.create({
		initialize: function() {
			
		}
	});
	
})();

/*
Advanced
Novel
Grandiose
Enhanced
Library /
Api
for
Magic Sparql (Marql)
or simply: Angular + Magic Sparql = Angular Marql
*/

/*
 * Thinking about how to create the join stuff...
 * 
 * We need to distinguish two levels:
 * - Projection
 * - Selection
 *
 * Generic query structure:
 * 
 * Select projectionVars {
 *   { Select Distinct ?s {
 *     SelectionElement
 *   } Limit foo Offset bar }
 *   Optional {
 *      Projection(?s)
 *   }
 * }
 * 
 * We can perform optimizations of the selection and projection element are isomorph, but
 * we can add this later.
 *   
 * 
 * Projection will always follow the join rules that have been configured in the references
 * 
 * For the selection however, whenever a criteria spans accross ref boundaries, we
 * directly join in the referenced map's element as to perform the filter on the database
 * 
 * This means, we need some kind of collection where we can just add in joins as we encounter them
 * In fact, this is the purpose of the CriteraRewriterSparql:
 * The result of compiling a criteria is a concept - which internally has all the joins set
 * 
 * And how to do the projection when there is eager fetching?
 * Again we collect all joins, however, this time we combine them with OPTIONALS
 * 
 * So what does the 'QueryPlan' or whatever object look like?
 * 
 * 
 * Note: Each proxyObject should also have some special attribute like
 * @proxyState or @proxyControl
 * Which then reveals which properties are the ones being proxied
 * 
 * then we could do something like object['@proxyControl'].myProperty.fetch(10, 20)
 * object['@proxyControl'].myProperty.count() // This needs to trigger a batch count though
 * 
 * 
 * So the goal is to be able to retrieve only parts of an relation
 * 
 * Actually, isn't this just like having store objects again?
 * 
 * foo = store.castles.find().asList();
 * var bar =foo.owners.limit(10).find().asList();
 * bar.friends.facebook.limit(10).find(name: {$regex:...}).asList();
 * 
 * find().asStores(); ->
 * 
 * find()
 * 
 * Yup, that's how it is.
 * 
 * So if we want to do it like this, we must not fetch all values of the join column in advance,
 * but rather track the groupKey of the parent PatternMap
 * 
 * 
 * So what does the query plan look like?
 * Well, I don't think we need something like that -
 * we just need to satisfy all references.
 * 
 * open = [initial mapping]
 * closed =[]
 * 
 * 
 * Compiling the criteria:
 * C
 * 
 * If we hit a ref,
 * 
 * 
 * gen = new GenSym('a');
 * while(!open is empty) {
 *    sourceMapping = open.pop();
 *    if(closed.contains(sourceMapping)) {
 *        circular reference; create a proxy instead (we could allow a certain number of round trips though)
 *    }
 *    close.push(sourceMapping);
 *    
 *    refs = sourceMapping.getRefs();
 *    var sourceAlias = gen.next(); // create a new alias for the mapping
 *    			// or maybe the alias is less for the mapping and more for its table
 *    
 *    for(ref in ref) {
 *        if ref.joinType = immediate { // TODO align terminology with hibernate
 *            targetMapping = context.getMapping(ref.getTargetMappingName)
 *            
 *            var targetAlias
 *            
 *            
 *            
 *        }
 *    
 *    }
 *    
 *    
 * 
 * }
 * 
 * 
 * owners: [{ aggColumn: '?s', joinColumn: '?x', }]
 * 
 * -> Aggregator {
 *     refSpec: { targetMapping: 'owners', aggColumn: ?s, sourcColumn: ?x, targetColumn: ?z} 
 *     
 *     bindings: [{?s='<>'}, {   }] // The bindings that were passed to the aggregator
 * }
 * 
 * 
 * Required operations:
 * - Find all aggregators with the same refSpec
 * - 
 * 
 * castles:
 * [{id: ?s, name:[{ref: labels, attr:name}]]
 * ?s a Castle
 * 
 * 
 * labels:
 * [{id: ?s, name: ?l}]
 * ?s label ?l
 * 
 * 
 * 
 * aliasToMapping: { //Note: This points to mapping objects
 *     a: { mappingName: castles , aggregator , aggregatorRefs}
 * }
 * 
 * [?s a Castle] With[] As a
 * [?x label ?l] With [x->s] As b   | b->{s->x}    x->{b, s}
 * 
 * joinGraph: {
 *   root: a,
 *   joins: {
 *     a: {target: b, sourceColumns, targetColumns, optional: true}
 *   }
 * }
 * 
 * For each row, k
 * 
 * }
 * 
 * 
 */

//  var processResult = function(it) {
//  var instancer = new ns.AggregatorFacade(pattern);
//  //var instancer = new sponate.PatternVisitorData(pattern);
//  //var instancer = new sponate.FactoryAggregator();
//  // TODO
//  
//  while(it.hasNext()) {
//      var binding = it.nextBinding();
//      
//      instancer.process(binding);
//  }
//  
//  var json = instancer.getJson(retainRdfNodes);
//  
//  
//  
//  //console.log('Final json: ' + JSON.stringify(json));
//  
//  var result;
//  if(_(json).isArray()) {
//
//      var filtered;
//      if(retainRdfNodes) {
//          filtered = json;
//      }
//      else {
//          var filtered = _(json).filter(function(item) {                                              
//              var isMatch = criteria.match(item);
//              return isMatch;
//          })
//          
//          var all = json.length;
//          var fil = filtered.length;
//          var delta = all - fil;
//
//          console.log('[DEBUG] ' + delta + ' items filtered on the client ('+ fil + '/' + all + ' remaining) using criteria ' + JSON.stringify(criteria));
//      }
//
//      result = new util.IteratorArray(filtered);
//      
//  } else {
//      console.log('[ERROR] Implement me');
//      throw 'Implement me';
//  }
//  
//  return result;
//};
//
//
