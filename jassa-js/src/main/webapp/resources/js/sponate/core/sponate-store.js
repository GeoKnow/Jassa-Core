(function() {

	var sparql = Jassa.sparql;
	
	var ns = Jassa.sponate;
	
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
			this.criteria = criteria;
		},
		
		/*
		find: function(criteria) {
			this.criteria = criteria;
			return this;
		},
		*/
		
		asList: function() {
			var promise = this.execute();

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
		execute: function() {
			var config = {
				criteria: this.criteria
			};
			
			var result = this.store.execute(config);
			return result;
		}
		
	});
	
	
	/**
	 * 
	 * TODO We need to attach a post processor, e.g. for ?/ label
	 * 
	 */
	ns.Store = Class.create({
		/**
		 * A sparql service (assumed to return talis json rdf)
		 * 
		 */
		initialize: function(service, context, mappingName) {
			this.service = service;
			this.context = context;
			this.mappingName = mappingName;
		},
		
		find: function(crit) {
			var criteriaParser = this.context.getCriteriaParser(); 


			var criteria = criteriaParser.parse(crit);
						
			var result = new ns.QueryFlow(this, criteria);
			return result;
		},
		

		execute: function(config) {
			// TODO Compile the criteria to
			// a) SPARQL filters
			// b) post processors
			
			
			var criteria = config.criteria;
			
			//console.log('context', JSON.stringify(this.context), this.context.getNameToMapping());
			
			var mapping = this.context.getMapping(this.mappingName);
			
			
			// Resolve references if this has not been done yet
			// TODO Optimize this by caching prior resolution
			//var refs = ns.PatternUtils.getRefs(pattern);
			ns.ContextUtils.resolveMappingRefs(this.context, mapping);
			
			console.log('Refs: ', mapping.getPatternRefs());

			
			//console.log('mapping:', mapping);
			
			// Retrieve the mapping's table and the associated element
			var element = this.context.getElement(mapping.getTableName());
			
			
			
			var pattern = mapping.getPattern();
			//console.log('Pattern here ' + JSON.stringify(pattern));
						
			
			var vars = pattern.getVarsMentioned();
			//console.log('' + vars);
		
			
			var idExpr;
			if(pattern instanceof ns.PatternMap) {
				idExpr = pattern.getKeyExpr();
			}
			
			//console.log('' + pattern, idExpr);
			//console.log('idExpr' + idExpr);
			
			
			// Query generation
			var query = new sparql.Query();
			query.getElements().push(element);
			_(vars).each(function(v) { query.getProjectVars().add(v); });
			if(idExpr != null) {
				//console.log('Expr' + JSON.stringify(idExpr));
				
				var sc = new sparql.SortCondition(idExpr, 1);

				query.getOrderBy().push(sc);
			}
			//query.setLimit(10);
			
			
			// TODO: We need to deal with references
			var processResult = function(it) {
				var instancer = new ns.AggregatorFacade(pattern);
				//var instancer = new sponate.PatternVisitorData(pattern);
				//var instancer = new sponate.FactoryAggregator();
				// TODO
				
				while(it.hasNext()) {
					var binding = it.next();
					
					instancer.process(binding);
				}
				
				var json = instancer.getJson();
				
				
				
				//console.log('Final json: ' + JSON.stringify(json));
				
				var result;
				if(_(json).isArray()) {

					
					var filtered = _(json).filter(function(item) {												
						var isMatch = criteria.match(item);
						return isMatch;
					})
					
					var all = json.length;
					var fil = filtered.length;
					var delta = all - fil;

					console.log('[DEBUG] ' + delta + ' items filtered on the client ('+ fil + '/' + all + ' remaining) using criteria ' + JSON.stringify(criteria));

					
					result = new ns.IteratorArray(filtered);
					
				} else {
					throw 'Implement me';
				}
				
				return result;
			};

			
			var result = service.execSelect(query).pipe(processResult);			
			
			return result;
			//console.log('' + query);
			
			
			
			// TODO We are no longer retrieving triples, but objects
			// Thus limit and offset applies to entities -> sub query! 			
		}
	});
	
	
})();

/*
Advanced
Novel
Grandiose
Enhanced
Library
Api
for
Magic Sparql (Marql)
*/
