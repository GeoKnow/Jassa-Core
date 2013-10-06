(function() {

	// TODO Differntiate between developer utils and user utils
	// In fact, the latter should go to the facade file
	
	var sparql = Jassa.sparql; 

	var ns = Jassa.sponate;
	
	ns.ServiceSponateSparqlHttp = Class.create({
		initialize: function(rawService) {
			this.rawService = rawService;
		},
		
		execSelect: function(query, options) {
			var promise = this.rawService.execSelect(query, options);
			
			var result = promise.pipe(function(json) {
				var bindings = json.results.bindings;

				var tmp = bindings.map(function(b) {
					//console.log('Talis Json' + JSON.stringify(b));
					return sparql.Binding.fromTalisJson(b);
				});
				
				var it = new ns.IteratorArray(tmp);
				
				//console.log()
				
				return it;
			});
			
			return result;
		}
	});

	
	/**
	 * A factory for backend services.
	 * Only SPARQL supported yet.
	 * 
	 */
	ns.ServiceUtils = {
	
		createSparqlHttp: function(serviceUrl, defaultGraphUris, httpArgs) {
		
			var rawService = new sparql.SparqlServiceHttp(serviceUrl, defaultGraphUris, httpArgs);
			var result = new ns.ServiceSponateSparqlHttp(rawService);
			
			return result;
		}	
	};
	
	
	/**
	 * Utility class to create an iterator over an array.
	 * 
	 */
	ns.IteratorArray = function(array, offset) {
		this.array = array;
		this.offset = offset ? offset : 0;
	};
	
	ns.IteratorArray.prototype = {
		hasNext: function() {
			var result = this.offset < this.array.length;
			return result;
		},
		
		next: function() {
			var hasNext = this.hasNext();
			
			var result;
			if(hasNext) {			
				result = this.array[this.offset];
				
				++this.offset;
			}
			else {
				result = null;
			}
			
			return result;
		}		
	};
	

	/*
	ns.AliasedElement = Class.create({
		initialize: function(element, alias) {
			this.element = element;
			this.alias = alias;
		},
		
		getElement: function() {
			return this.element;
		},
		
		getAlias: function() {
			return this.alias;
		},
		
		toString: function() {
			return '' + this.element + ' As ' + this.alias;
		}
	});
	*/
	
	/**
	 * a: castle
	 * 
	 * 
	 * b: owners
	 * 
	 * 
	 */
	ns.JoinBuilderElement = Class.create({
		initialize: function() {
			this.varAliasMap = new ns.VarAliasMap();
			this.aliasToElement = new ns.MapList(); 
		},
		
		// 
		add: function(element, projectVars) {
			
		},
		
		get: function() {
			
		}
	});

	/*
	 * We need to map a generated var back to the alias and original var
	 * {?foo -> {alias: 'bar', var: 'baz'} }
	 * 
	 * We need to map and alias and a var to the generater var
	 * { bar: { baz -> ?foo } }
	 *
	 * 
	 * 
	 * 
	 */
	ns.VarAliasMap = Class.create({
		initialize: function() {
			this.aliasToBinding = {};
			this.newVarToAliasVar = {};
		},
		
		put: function(origVar, alias, newVar) {
			
		},
		
		getAliasVar: function(newVar) {
			
		},
		
		getBinding: function(alias) {
			
		}
	});
	
	
	ns.JoinElement = Class.create({
		initialize: function(element, varMap) {
			this.element = element;
		}
		
	});


	ns.JoinUtils = {
		/**
		 * Create a join between two elements 
		 */
		join: function(aliasEleA, aliasEleB, joinVarsB) {
			//var aliasA = aliasEleA. 
			
			var varsA = eleA.getVarsMentioned();
			var varsB = eleB.getVarsMentioned();
			
			
		}
			
			
	};

	
	ns.MappingJoin = Class.create({
		initialize: function() {
			
		},
		
		
	});
	
	
	ns.HashMap = Class.create({
		initialize: function(fnHash, fnEquals) {
			this.fnHash = fnHash ? fnHash : (function(x) { return '' + x; });
			this.fnEquals = fnEquals ? fnEuqals : _.isEqual;
			
			this.hashToBucket = {};
		},
		
		put: function(key, val) {
			var hash = this.fnHash(key);
			
			var bucket = this.hashToBucket[hash];
			if(bucket == null) {
				bucket = [];
				this.hashToBucket[hash] = bucket;
			}
			

			var keyIndex = this._indexOfKey(bucket, key);
			if(keyIndex >= 0) {
				bucket[keyIndex].val = val;
				return;
			}
			
			var entry = {
				key: key,
				val: val
			};

			bucket.push(entry);
		},
		
		_indexOfKey: function(bucket, key) {
			if(bucket != null) {

				for(var i = 0; i < bucket.length; ++i) {
					var entry = bucket[i];
					
					var k = entry.key;
					if(this.fnEquals(k, key)) {
						entry.val = val;
						return i;
					}
				}

			}
			
			return -1;
		},
		
		get: function(key) {
			var hash = this.fnHash(key);
			var bucket = this.hashToBucket[hash];
			var i = this._indexOfKey(bucket, key);
			var result = i >= 0 ? bucket[i] : null;
			return result;
		},
		
		containsKey: function(key) {
			var hash = this.fnHash(key);
			var bucket = this.hashToBucket[hash];
			var result =  this._indexOfKey(bucket, key) >= 0;
			return result;
		},
		
		keyList: function() {
			var result = [];
			
			_.each(this.hashToBucket, function(bucket) {
				var keys = _(bucket).pluck('key')
				result.push.apply(result, keys);
			});
			
			return result;
		}
	});
	
	
	ns.BidiHashMap = Class.create({
		/**
		 * NEVER! Pass a constructor argument to this map yourself;
		 * 
		 */
		initialize: function(inverseMap) {
			forward = new ns.HashMap();
			inverse = inverseMap ? inverseMap : new ns.BidiHashMap(this);
		},
		
		getInverse: function() {
			return this.inverse;
		},
		
		put: function(key, val) {
			this.forward.put(key, val);
			this.inverse.put(val, key);
		},
		
		get: function(key) {
			var result = this.forward.get(key);
			return result;
		},
		
		keyList: function() {
			var result = this.forward.keyList();
			return result;
		}
	});
	
})();

