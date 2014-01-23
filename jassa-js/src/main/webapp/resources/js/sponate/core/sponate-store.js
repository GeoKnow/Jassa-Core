(function() {

	
	var util = Jassa.util;
	var rdf = Jassa.rdf;
	var sparql = Jassa.sparql;
	var service = Jassa.service;
	var facete = Jassa.facete;
	
	var ns = Jassa.sponate;
	
	
	ns.QueryConfig = Class.create({
		initialize: function(criteria, limit, offset, concept, _isLeftJoin) {
			this.criteria = criteria;
			this.limit = limit;
			this.offset = offset;
			
			// HACK The following two attributes belong together, factor them out into a new class
			this.concept = concept;
			this._isLeftJoin = _isLeftJoin;
		},
		
		getCriteria: function() {
			return this.criteria;
		},
		
		getLimit: function() {
			return this.limit;
		},
		
		getOffset: function() {
			return this.offset;
		},
		
		getConcept: function() {
		    return this.concept;
		},
		
		isLeftJoin: function() {
		    return this._isLeftJoin;
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
			this.config = {};
			
			this.config.criteria = criteria;
//			this.criteria = criteria;
//			
//			this.limit = null;
//			this.offset = null;
		},
		
		/**
		 * Join the lookup with the given concept
		 */
		concept: function(_concept, isLeftJoin) {
		    var join = this.config.join = {};
		    join.concept = _concept;
		    join.isLeftJoin = isLeftJoin;
		    
		    return this;
		},
		
		/**
		 * find().nodes(someNodes).asList();
		 */
		/*
		nodes: function(ns) {
		    
		},
		*/
		
		skip: function(offset) {
			this.config.offset = offset;
			
			return this;
		},
		
		limit: function(limit) {
			this.config.limit = limit;
			
			return this;
		},
		
		/*
		find: function(criteria) {
			this.criteria = criteria;
			return this;
		},
		*/
		
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
//			var config = {
//				criteria: this.criteria,
//				limit: this.limit,
//				offset: this.offset
//			};
		    var c = this.config;
		    var j = this.config.join || {};
		    
			var config = new ns.QueryConfig(c.criteria, c.limit, c.offset, j.concept, j.isLeftJoin);
			
			var result = this.store.execute(config, retainRdfNodes);
			return result;
		},
		
        count: function() {
            var c = this.config;
            var j = this.config.join || {};
            
            var config = new ns.QueryConfig(c.criteria, c.limit, c.offset, j.concept, j.isLeftJoin);
            
            var result = this.store.executeCount(config);
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
		
		

		createQueries: function(config) {
			// TODO Compile the criteria to
			// a) SPARQL filters
			// b) post processors
			
			var context = this.context;
			var criteria = config.getCriteria();
			var limit = config.getLimit();
			var offset = config.getOffset();
			var concept = config.getConcept();
			var isLeftJoin = config.isLeftJoin();
			
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

			
			var sortConditions = []
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

						
			var requireSubQuery = limit != null || offset != null || (concept != null && !concept.isSubjectConcept()) || elementCriteria.length > 0;

            var innerElement = outerElement;

//            debugger;
            if(requireSubQuery) {


	            if(concept && !concept.isSubjectConcept()) {
	                var conceptElement = concept.getElement();
                    var conceptVar = concept.getVar();
	                 
	                var elementA = conceptElement;
	                var elementB = innerElement;

	                console.log('elementA: ' + elementA);
	                console.log('elementB: ' + elementB);

	                
	                var varsA = elementA.getVarsMentioned();
	                var varsB = elementB.getVarsMentioned();
	                 
	                var joinVarsA = [conceptVar];
	                var joinVarsB = [idVar];
	                 
	                var varMap = sparql.ElementUtils.createJoinVarMap(varsB, varsA, joinVarsB, joinVarsA); //, varNameGenerator);
	                var elementA = sparql.ElementUtils.createRenamedElement(elementA, varMap);
	                 
                    console.log('elementA renamed: ' + elementA);
	                 
	                 //var conceptElement = concept.getElement();
	                concept = new facete.Concept(elementA, idVar);
	                 
                    var q = facete.ConceptUtils.createQueryList(concept);
	                elementA = new sparql.ElementSubQuery(q);
	                 
	               
	                if(isLeftJoin) {
	                   elementB = new sparql.ElementOptional(elementB);
	                }
	               
	                var innerElement = new sparql.ElementGroup([elementA, elementB]);
	               
	               /*
	                 var efa = new sparql.ElementFactoryConst(conceptElement);
	                 var efb = new sparql.ElementFactoryConst(innerElement);
	                 

	                 var joinType = isLeftJoin ? sparql.JoinType.LEFT_JOIN : sparql.JoinType.INNER_JOIN;
	                 
	                 var efj = new sparql.ElementFactoryJoin(efa, efb, [concept.getVar()], [idVar], joinType);
	                 innerElement = efj.createElement();
	                 */
	             }

			    
				var subQuery = new sparql.Query();
				
				var subQueryElements = subQuery.getElements();
				subQueryElements.push(innerElement);
				
				if(elementCriteria.length > 0) {
				    subQueryElements.push(new sparql.ElementFilter(elementCriteria));
				}
			
				
				var subElement = new sparql.ElementSubQuery(subQuery);
				var oe = outerElement;
				
				if(isLeftJoin) {
				    //subElement = new sparql.ElementOptional(subElement);
				    oe = new sparql.ElementOptional(outerElement);
				}
				
				subQuery.setLimit(limit);
				subQuery.setOffset(offset);
				subQuery.setDistinct(true);
				subQuery.getProjectVars().add(idVar);
				outerElement = new sparql.ElementGroup([
				                                   subElement,
				                                   oe]);

				// TODO Do we need a sort condition on the inner query?
				// Note that the inner query already does a distinct
				//var orderBys = subQuery.getOrderBy();
				//orderBys.push.apply(orderBys, sortConditions);

				//console.log('innerElement: ' + innerElement);
				//console.log('outerElement: ' + outerElement);
				
				innerElement = subQuery;
			}

            
            var result = {
                requireSubQuery: requireSubQuery,
                innerElement: innerElement,
                outerElement: outerElement,
                idVar: idVar,
                vars: vars,
                sortConditions: sortConditions,
                pattern: pattern,
                criteria: criteria
            };
            
            return result;
		},

		
		execute: function(config, retainRdfNodes) {
		    var spec = this.createQueries(config);
		    
		    var result = this.executeData(spec, retainRdfNodes);
		    
		    return result;
		},
		
		executeCount: function(config) {
            var spec = this.createQueries(config);

            var element = spec.innerElement;
            var idVar = spec.idVar;
            
            var concept = new facete.Concept(element, idVar);
            var outputVar = rdf.NodeFactory.createVar('_c_');
            var query = facete.ConceptUtils.createQueryCount(concept, outputVar);
            var qe = this.sparqlService.createQueryExecution(query);
            var result = service.ServiceUtils.fetchInt(qe, outputVar);
            
            return result;
		},
		
		executeData: function(spec, retainRdfNodes) {
		    var outerElement = spec.outerElement;
		    var idExpr = spec.idExpr;
		    var sortConditions = spec.sortConditions;
		    var vars = spec.vars;
		    var pattern = spec.pattern;
		    var criteria = spec.criteria;

			//console.log('' + pattern, idExpr);
			//console.log('idExpr' + idExpr);
			
			
			// Query generation
			var query = new sparql.Query();
			query.getElements().push(outerElement);
			_(vars).each(function(v) { query.getProjectVars().add(v); });
			if(idExpr != null) {
				//console.log('Expr' + JSON.stringify(idExpr));
				
				var sc = new sparql.SortCondition(idExpr, 1);

				var orderBys = query.getOrderBy();
				orderBys.push.apply(orderBys, sortConditions);
				//query.getOrderBy().push(sc);
			}
			//query.setLimit(10);
			
			
			// TODO: We need to deal with references
			var processResult = function(it) {
				var instancer = new ns.AggregatorFacade(pattern);
				//var instancer = new sponate.PatternVisitorData(pattern);
				//var instancer = new sponate.FactoryAggregator();
				// TODO
				
				while(it.hasNext()) {
					var binding = it.nextBinding();
					
					instancer.process(binding);
				}
				
				var json = instancer.getJson(retainRdfNodes);
				
				
				
				//console.log('Final json: ' + JSON.stringify(json));
				
				var result;
				if(_(json).isArray()) {

				    var filtered;
				    if(retainRdfNodes) {
				        filtered = json;
				    }
				    else {
    					var filtered = _(json).filter(function(item) {												
    						var isMatch = criteria.match(item);
    						return isMatch;
    					})
    					
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
			};

			
			var qe = this.sparqlService.createQueryExecution(query);
			var result = qe.execSelect().pipe(processResult);			
			
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

