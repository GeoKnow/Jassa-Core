/**
 * An API that hides the underlying complexity.
 *
 */
(function() {

	var sparql = Jassa.sparql;
	var ns = Jassa.sponate;
	
	
	ns.Mapping = Class.create({
		initialize: function(name, pattern, elementFactory, patternRefs) {
			// TODO Remove the name attribute
		    this.name = name;
			this.pattern = pattern;
			this.elementFactory = elementFactory;
			
			// TODO Remove this attribute
			//this.tableName = name;

			// Cached value; inferred from pattern
			this.patternRefs = patternRefs || [];
		},
		
		getName: function() {
			return this.name;
		},
		
		getPattern: function() {
			return this.pattern;
		},
		
		getElementFactory: function() {
		    return this.elementFactory;
		},
		
//		getTableName: function() {
//			return this.tableName;
//		},
		
		getPatternRefs: function() {
			return this.patternRefs;
		},
		
		toString: function() {
		    var result = '[pattern: ' + this.pattern + ', element: ' + this.elementFactory.createElement() + ']';
		    return result;
		}
	});
	
	/**
	 * An easy to use API on top of the more complex system.
	 * 
	 * TODO Add example how to invoke
	 * 
	 */
	ns.StoreFacade = Class.create({
		
		/**
		 * Service and prefixes (a JSON map) are two common things that
		 * make sense to pass in to the constructor. 
		 * 
		 * 
		 */
		initialize: function(service, prefixes) {
			this.service = service;

			this.context = new ns.Context();
			this.context.getPrefixMap().addJson(prefixes);
		},

		addMap: function(obj, name) {
		    var result = (obj instanceof ns.Mapping) ? this.addMapObj(name, obj) : this.addMapSpec(obj);
		    return result;
		},
		
		addMapObj: function(name, map) {
            //var name = nameOverride || mapping.getName();

            var elementFactory = map.getElementFactory();
            this.context.mapTableNameToElementFactory(name, elementFactory);

            this.context.addMapping(name, map);
                
            // Create a new store object
            this.createStore(name);
                
            return this;
		    
		},
		
		/**
		 * Add a mapping specification
		 * 
		 */
		addMapSpec: function(spec) {
		    var map = ns.SponateUtils.parseMap(spec, this.context.getPrefixMap(), this.context.getPatternParser());
	            
		    var name = spec.name; //mapping.getName();

		    var result = this.addMapObj(name, map);
		    return result;
		    
//		    var elementFactory = mapping.getElementFactory();
//            this.context.mapTableNameToElementFactory(name, elementFactory);
//
//		    this.context.addMapping(mapping);
//	            
//		    // Create a new store object
//		    this.createStore(name);
//	            
//		    return this;

		    
		    /*
			var name = spec.name;

			var jsonTemplate = spec.template;
			var from = spec.from;

			var context = this.context;
			
			// Parse the 'from' attribute into an ElementFactory
			// TODO Move to util class
			var elementFactory;
			if(_(from).isString()) {
			    
			    var elementStr = from;
			    
	            var prefixes = context.getPrefixMap().getJson();
	            //var vars = sparql.extractSparqlVars(elementStr);
	            var str = sparql.expandPrefixes(prefixes, elementStr);
	            
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
			
            this.context.mapTableNameToElementFactory(name, elementFactory);
			
			// TODO The support joining the from element
			
			var pattern = this.context.getPatternParser().parsePattern(jsonTemplate);			

			var patternRefs = ns.PatternUtils.getRefs(pattern);

			//console.log('Parsed pattern', JSON.stringify(pattern));

			// The table name is the same as that of the mapping
			//ns.ContextUtils.createTable(this.context, name, from, patternRefs);
	

			var mapping = new ns.Mapping(name, pattern, name, patternRefs);
			
			this.context.addMapping(mapping);
			
			// Create a new store object
			this.createStore(name);
			
			return this;
			*/
		},
		
		createStore: function(name) {

			if(name in this) {
				console.log('[ERROR] An attribute / store with name ' + name + ' already exists');
				throw 'Bailing out';
			}
			
			this[name] = new ns.Store(this.service, this.context, name);
		},
		
		/*
		 * Functions for access to underlying components  
		 */
		
		getSchema: function() {
			return schema;
		}
	});
	
	
})();
