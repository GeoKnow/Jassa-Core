(function() {
	
	var ns = Jassa.sponate;

	/*
	ns.AttrStep = Class.create({
		initialize: function(name) {
			this.name = name;
		}
	});
	*/
	

	
	/**
	 * Parser for criterias.
	 * 
	 * A criteria is a form of constraint.
	 * 
	 */
	ns.CriteriaParser = Class.create({
		
		parse: function(crit) {

			var rootPath = new ns.AttrPath();

			var result = this.parseAny(crit, rootPath);
			return result;
		},
		
		parseAny: function(crit, basePath) {
			
			var result;
			if(crit == null) {
				result = new ns.CriteriaTrue();
			}
			else if(_(crit).isObject()) {
				result = this.parseObject(crit, basePath);
			}
			else {
				throw 'Not implemented';
			}
			
			return result;
		},
		
		
		parseObject: function(critObject, basePath) {
			
			//var basePath = context.basePath;
			
			var self = this;
			var criterias = _(critObject).map(function(val, key) {
				
				var criteria;

				if(_(key).startsWith('$')) {
					// Call some special function
					var fnName = 'parse_' + key;
					var fn = self[fnName];
					
					if(!fn) {
						console.log('[ERROR] No criteria implementation for ' + key);
						throw 'Bailing out';
					}
					
					criteria = fn.call(self, basePath, val);
					
				} else {				
					var tmpPath = ns.AttrPath.parse(key);				
					var attrPath = basePath.concat(tmpPath);
					
					if(!val) {
						console.log('[ERROR] No value for attribute ' + key);
						throw 'Bailing out';
					}
					
					criteria = self.parseAny(val, attrPath);
				}
				
				return criteria;
			});
			
			var result;
			if(criterias.length == 1) {
				result = criterias[0];
			} else { 			
				result = new ns.CriteriaLogicalAnd(criterias);
			}

			return result;
		},
		

		parse_$eq: function(attrPath, val) {
			var result = new ns.CriteriaEq(attrPath, val);
			return result;
		}
		
		
	});
	
	
	/**
	 * Criterias
	 * 
	 * Represent constraints on JSON documents
	 * 
	 * For convenience, they can readily match json (i.e. no compilation to a filter object necessary)
	 * Note: Usually good engineering mandates separating these concerns, and maybe we shoot ourselves into the foot by not doing it here
	 * So in the worst case, we would create a FilterFactory which creates filters from criterias.
	 * a filter is equivalent to a predicate - i.e. a function that returns boolean.
	 * 
	 * 
	 */
	
	ns.Criteria = Class.create({
		getOpName: function() {
			throw 'Not overridden';
		},
		
		match: function(doc) {
			throw 'Not overridden';
		}
	});
	
	
	ns.CriteriaBase = Class.create(ns.Criteria, {
		initialize: function(opName) {
			this.opName = opName;
		},
		
		getOpName: function() {
			return this.opName;
		}
	});
	
	
	ns.CriteriaFalse = Class.create(ns.Criteria, {
		initialize: function($super) {
			$super('$false');
		},
		
		match: function(doc) {
			return false;
		}
	});

	ns.CriteriaTrue = Class.create(ns.Criteria, {
		initialize: function($super) {
			$super('$true');
		},
		
		match: function(doc) {
			return true;
		}
	});
	

	
	ns.CriteriaPath = Class.create(ns.CriteriaBase, {
		initialize: function($super, opName, attrPath) {
			$super(opName);
			this.attrPath = attrPath;
			if(!attrPath) {
				throw 'npe';
			}
		},
		
		getAttrPath: function() {
			return this.attrPath;
		},
		
		match: function(doc) {
			var val = this.attrPath.find(doc);
			
			var result = this.$match(doc, val);
			
			return result;
		},
		
		
		// Minor convenience, as the base function already took care of resolving the value
		$match: function(doc, val) {
			throw 'Not overridden';
		}
		
	});



	
	/**
	 * @param the document on which to apply the criteria 
	 */
	ns.CriteriaEq = Class.create(ns.CriteriaPath, {
		initialize: function($super, attrPath, value) {
			$super('$eq', attrPath);
			this.value = value;
		},
		
		$match: function(doc, val) {
			var result = this.value == val;

			return result;
		}
	});


	/**
	 * A criteria where
	 * 
	 */
	ns.CriteriaLogicalAnd = Class.create(ns.CriteriaBase, {
		initialize: function($super, criterias) {
			$super('$and');
			this.criterias = criterias;
		},
		
		getCriterias: function() {
			return this.criterias;
		},
		
		match: function(doc) {
			var result = _(this.criterias).every(function(criteria) {
				var subResult = criteria.match(doc);
				return subResult;
			});
			
			return result;
		}
	});
		

	/**
	 * http://docs.mongodb.org/manual/reference/operator/elemMatch/#op._S_elemMatch
	 * 
	 * "Matching arrays must have at least one element that matches all specified criteria."
	 * 
	 */
	ns.CriteriaElemMatch = Class.create(ns.CriteriaPath, {
		initialize: function($super, attrPath, criterias) {
			$super('$elemMatch', attrPath);
			this.criterias = criterias;
		},
		
		getCriterias: function() {
			return this.criterias;
		},
		
		$match: function(doc, val) {
			if(!_(val).isArray()) {
				console.log('[ERROR] Cannon apply $elemMatch to non-array', val);
				throw 'Bailing out';
			}
			
			var result = this.matchArray(val);
			return result;
		},
		
		// There has to be at least 1 item which satisfies all of the criterias
		matchArray: function(docArray) {
			
			var self = this;
			var result = _(docArray).some(function(item) {
				var itemMatch = _(self.criterias).every(function(criteria) {
					var criteriaMatch = criteria.match(doc);
					return criteriaMatch;
				});

				return itemMatch;				
			})
			
			return result;
		}
	});
	
	
	
})();

