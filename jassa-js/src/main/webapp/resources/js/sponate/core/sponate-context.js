(function() {
	
	/*
	 * This file enhances sponate with relational json document mappings
	 */
	
	var sparql = Jassa.sparql;
	var ns = Jassa.sponate;
	
	
	/**
	 * A simple table definition
	 * 
	 */
	ns.Table = Class.create({
		/**
		 * TODO: Not sure what the type of schema should be... - is it a name or an object? Probably name.
		 * 
		 */
		initialize: function(name, columnNames, schema) {
			this.name = name;
			this.columnNames = columnNames;
			this.schema = schema;
		},
		
		getName: function() {
			return this.name;
		},
				
		getColumnNames: function() {
			return this.columnNames;
		},
		
		getSchema: function() {
			return this.schema;
		},
		
		toString: function() {
			return this.name + '(' + this.columnNames.join(', ') + ')';
		}
	});
	

	/**
	 * A fake element parser. Replace it with something better at some point.
	 * 
	 */
	ns.SparqlParserFake = Class.create({
		initialize: function() {
			this.prefixes = {};
		},

		parseElement: function(str) {
			var vars = sparql.extractSparqlVars(str);
			
			var result = ns.ElementString.create(str, vars);
		}
	});


	/**
	 * This class represents a relational schema.
	 * 
	 * Right now its just table tables and their columns.
	 * 
	 */
	ns.Schema = Class.create({
		initialize: function() {
			this.nameToTable = {};
		},
		
		//createTable: function(name, )
		addTable: function(table) {
			var tableName = table.getName();

			this.nameToTable[tableName] = table;
		},
		
		getTable: function(tableName) {
			var result = this.nameToTable[tableName];
			return result;
		}
	});

	// Use sparql.PrefixMapping instead
	/*
	ns.PrefixMap = Class.create({
		initialize: function(prefixes) {
			this.prefixes = prefixes ? prefixes : {};
		},
		
		addPrefix: function(prefix, urlBase) {
			this.prefixes[prefix] = urlBase;
		},
		
		getPrefix: function(prefix) {
			var result = this.prefixes[prefix];
			return result;
		},
		
		addJson: function(json) {
			_.extend(this.prefixes, json);
		},
		
		getJson: function() {
			return this.prefixes;
		}
	});
	*/


	/*
	ns.SparqlTable = Class.create({
		initialize: function(context, table, element) {
			this.context = context;
			this.table = table;
			this.element = element;
		},
		
		getContext: function() {
			return this.context;
		},
		
		getTable: function() {
			return this.table;
		},
		
		getElement: function() {
			return element;
		},
		
		toString: function() {
			return '' + this.table + ' with ' + this.element;
		}
	});
	*/
	
	/**
	 * 
     * A Sponate context is the central object for storing all relevant
     * information about the mappings
     *  
     * - prefixes
     * - the relational schema
     * - mappings from table to SPARQL elements
     *
     * TODO Better rename to SponateContext, as to reduce ambiguity with other context objects
	 */
	ns.Context = Class.create({
		
		initialize: function(schema) {
			this.schema = schema ? schema : new ns.Schema();
			this.prefixMapping = new sparql.PrefixMappingImpl();
			
			// TODO We should not map to element directly, but to ElementProvider
			this.tableNameToElementFactory = {};
			
			// Note: the names of mappings and tables are in different namespaces
			// In fact, in most cases tables are implicitely created - with the name of the mapping
			this.nameToMapping = {};
			
			this.patternParser = new ns.ParserPattern();

			this.criteriaParser = new ns.CriteriaParser();
		},
		
		getSchema: function() {
			return this.schema;
		},
		
		getPrefixMapping: function() {
			return this.prefixMapping;
		},
		
		getPatternParser: function() {
			return this.patternParser;
		},
		
		getTableNameToElementFactory: function() {
			return this.tableNameToElementFactory;
		},
		
		getNameToMapping: function() {
			return this.nameToMapping;
		},
		
		mapTableNameToElementFactory: function(tableName, elementFactory) {
			this.tableNameToElementFactory[tableName] = elementFactory;
		},
		
		addMapping: function(name, mapping) {
			//var name = mapping.getName();
			this.nameToMapping[name] = mapping;
		},
		
		getMapping: function(mappingName) {
			var result = this.nameToMapping[mappingName];
			return result;
		},
		
		getElementFactory: function(tableName) {
			var result = this.tableNameToElementFactory[tableName];
			return result;
		},
		
		getCriteriaParser: function() {
			return this.criteriaParser;
		}
	});
	
	ns.ContextUtils = {

		/**
		 * Creates and adds a sparql table to a context
		 * 
		 */
		createTable: function(context, name, elementStr) {
			var prefixes = context.getPrefixMapping().getNsPrefixMap();//getJson();

			var vars = sparql.extractSparqlVars(elementStr);

			var str = sparql.expandPrefixes(prefixes, elementStr);
			
			var element = sparql.ElementString.create(str, vars);
			
			// TODO Maybe prefix them with '?' ???
			//var varNames = sparql.extractVarNames(vars);
			var colNames = vars.map(function(v) { return v.toString(); });
			
			var table = new ns.Table(name, colNames);
			
			context.getSchema().addTable(table);
			
			context.mapTableNameToElementFactory(name, element);
			
		},
		
		
		/**
		 * Resolve all reference patterns of a mapping:
		 * 
		 * 
		 * 
		 */
//		resolveMappingRefs: function(context, mappingName) {
//			var sourceMapping = context.getMapping(mappingName);
//			
//			if(sourceMapping == null) {
//				console.log('[ERROR] No mapping: ' + mappingName);
//				throw 'Bailing out';
//			}

		resolveMappingRefs: function(context, sourceMapping) {
			var patternRefs = sourceMapping.getPatternRefs();

			_(patternRefs).each(function(patternRef) {
				
				var stub = patternRef.getStub();
				var refSpec = ns.ContextUtils.createRefSpec(sourceMapping, stub, context);
				patternRef.setRefSpec(refSpec);
				
			});
		},
	
		/**
		 * Resolves references in PatternRef objects
		 * against the context
		 * 
		 */
		createRefSpec: function(sourceMapping, stub, context) {
			var schema = context.getSchema();
			
			var sourceMappingName = sourceMapping.getName();
			var targetMappingName = stub.ref;
	
			var targetMapping = context.getMapping(targetMappingName);
			if(targetMapping == null) {
				console.log('[ERROR] Target mapping ' + targetMapping + ' not defined');
				throw 'Bailing out';
			}
			
			var sourceTableName = sourceMapping.getTableName();
			var targetTableName = targetMapping.getTableName();
			
			var sourceTable = schema.getTable(sourceTableName);
			var targetTable = schema.getTable(targetTableName);
			
			// Cardinality 1 means no array
			// FIXME: card is not defined
			var isArray = stub.card != 1;
	
			// TODO attr path
	
			var sourceColumns;
			var targetColumns;

      // FIXME: joinColumn not defined
			if(stub.joinColumn) {
				sourceColumns = [stub.joinColumn];
			}

      // FIXME: refJoinColumn not defined
			if(stub.refJoinColumn) {
				targetColumns = [stub.refJoinColumn];
			}
			
	//		ns.validateColumnRefs(sourceTable, sourceColumns);
	//		ns.validateColumnRefs(targetTable, targetColumns);

			// FIXME: stub.joinTable not defined
			var joinTable = stub.joinTable;
			if(joinTable != null) {
				console.log('[ERROR] Implement me');
				throw 'Bailing out';
			}
			
			
			var sourceTableRef = new ns.TableRef(sourceTableName, sourceColumns);
			var targetTableRef = new ns.TableRef(targetTableName, targetColumns);
			
			var sourceMapRef = new ns.MapRef(sourceMappingName, sourceTableRef, null);
			var targetMapRef = new ns.MapRef(targetMappingName, targetTableRef, null);
			
			var result = new ns.RefSpec(sourceMapRef, targetMapRef, isArray, null);
	
			return result;
		}

	}	
	
})();
