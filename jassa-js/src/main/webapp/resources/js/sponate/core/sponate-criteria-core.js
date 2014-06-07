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
			else if(_(crit).isArray()) {
				throw 'Not implemented';
			} else { // Primitive value; treat as equals
				result = this.parse_$eq(basePath, crit);				
			}
			
			return result;
		},
		
		
		parseObject: function(critObject, basePath) {
			
			//var basePath = context.basePath;
			
			var self = this;
			

            var options = critObject['$options'];

			var criterias = _(critObject).chain().omit('$options').map(function(val, key) {
				
				var criteria;

				if(_(key).startsWith('$')) {
				    
					// Call some special function
					var fnName = 'parse_' + key;
					var fn = self[fnName];
					
					if(!fn) {
						console.log('[ERROR] No criteria implementation for ' + key);
						throw 'Bailing out';
					}
					
					criteria = fn.call(self, basePath, val, options);
					
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
			}).value();
			
			var result;
			if(criterias.length == 1) {
				result = criterias[0];
			} else {
			    
			    // TODO Not sure if the path argument is correct here
				result = new ns.CriteriaLogicalAnd(new ns.AttrPath(), criterias);
			}

			return result;
		},
		

		parse_$eq: function(attrPath, val) {
			return new ns.CriteriaEq(attrPath, val);
		},

		parse_$gt: function(attrPath, val) {
			return new ns.CriteriaGt(attrPath, val);
		},

		parse_$gte: function(attrPath, val) {
			return new ns.CriteriaGte(attrPath, val);
		},

		parse_$lt: function(attrPath, val) {
			return new ns.CriteriaLt(attrPath, val);
		},

		parse_$lte: function(attrPath, val) {
			return new ns.CriteriaLte(attrPath, val);
		},

		parse_$ne: function(attrPath, val) {
			return new ns.CriteriaNe(attrPath, val);
		},

		parse_$regex: function(attrPath, val, flags) {
			var regex;

			
			if(_(val).isString()) {
				regex = new RegExp(val, flags);
			} else if (val instanceof RegExp) {
			    // TODO Handle the case when val already is a regex and flags are provided
				regex = val;
			} else {
				console.log('[ERROR] Not a regex: ' + val);
				throw 'Bailing out';
			}
			
			var result = new ns.CriteriaRegex(attrPath, regex);
			return result;
		},
		
		
		parse_$elemMatch: function(attrPath, val) {

			var c = this.parse(val);
			
			var criterias;
			if(c instanceof ns.CriteriaLogicalAnd) {
				criterias = c.getCriterias();
			} else {
				criterias = [c];
			}

			var result = new ns.CriteriaElemMatch(attrPath, criterias);
			return result;
		},
		
		parse_$or: function(attrPath, val) {

			if(!_(val).isArray()) {
				console.log('Argument of $or must be an array');
				throw 'Bailing out';
			}
			
			var self = this;
			var criterias = val.map(function(crit) {
				var result = self.parse(crit);
				return result;
			});
			
			var result;
			if(criterias.length == 1) {
				result = criterias[0];
			} else {
				result = new ns.CriteriaLogicalOr(attrPath, criterias);
			}
			
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
		},
		
		callVisitor: function(name, self, args) {
			var result = ns.callVisitor(name, self, args);
			return result;
		},
		
		accept: function(visitor) {
		    console.log('Not overridden');
			throw 'Not overridden';
		}
	});
	
	
	ns.CriteriaBase = Class.create(ns.Criteria, {
		initialize: function(opName) {
			this.opName = opName;
		},
		
		getOpName: function() {
			return this.opName;
		},
		
		accept: function(visitor) {
//		    debugger;
            var result = ns.callVisitor('visitCriteria' + this.opName, this, arguments);
            return result;
        }
	});
	
	
	ns.CriteriaFalse = Class.create(ns.CriteriaBase, {
		initialize: function($super) {
			$super('$false');
		},
		
		match: function(doc) {
			return false;
		}
	});

	ns.CriteriaTrue = Class.create(ns.CriteriaBase, {
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

    ns.CriteriaPathValue = Class.create(ns.CriteriaPath, {
        initialize: function($super, opName, attrPath, value) {
            $super(opName, attrPath);
            this.value = value;
        },

        getValue: function() {
            return this.value;
        },
        
        toString: function() {
            return '(' + this.attrPath + ' ' + this.opName + ' ' + this.value + ')';
        }
    });

	
	/**
	 * @param the document on which to apply the criteria 
	 */
	ns.CriteriaEq = Class.create(ns.CriteriaPathValue, {
		initialize: function($super, attrPath, value) {
			$super('$eq', attrPath, value);
		},
		
		$match: function(doc, val) {
			var result = val == this.value;
			return result;
		}
	});

	
	ns.CriteriaGt = Class.create(ns.CriteriaPath, {
		initialize: function($super, attrPath, value) {
			$super('$gt', attrPath);
			this.value = value;
		},
		
		$match: function(doc, val) {
			var result = val > this.value;
			return result;
		}
	});

	ns.CriteriaGte = Class.create(ns.CriteriaPath, {
		initialize: function($super, attrPath, value) {
			$super('$gte', attrPath);
			this.value = value;
		},
		
		$match: function(doc, val) {
			var result = val >= this.value;
			return result;
		}
	});

	
	ns.CriteriaLt = Class.create(ns.CriteriaPath, {
		initialize: function($super, attrPath, value) {
			$super('$lt', attrPath);
			this.value = value;
		},
		
		$match: function(doc, val) {
			var result = val < this.value;
			return result;
		}
	});

	ns.CriteriaLte = Class.create(ns.CriteriaPath, {
		initialize: function($super, attrPath, value) {
			$super('$lte', attrPath);
			this.value = value;
		},
		
		$match: function(doc, val) {
			var result = val <= this.value;
			return result;
		}
	});

	
	ns.CriteriaNe = Class.create(ns.CriteriaPath, {
		initialize: function($super, attrPath, value) {
			$super('$ne', attrPath);
			this.value = value;
		},
		
		$match: function(doc, val) {
			var result = val != this.value;
			return result;
		}
	});
	

	
	/**
	 * @param the document on which to apply the criteria 
	 */
	ns.CriteriaRegex = Class.create(ns.CriteriaPath, {
		initialize: function($super, attrPath, regex) {
			$super('$regex', attrPath);
			this.regex = regex;
			
//			console.log('REGEX', regex);
//			this.pattern = pattern;
//			this.flags = flags;
		},
		
		getRegex: function() {
		    return this.regex;
		},
		
//		getPattern: function() {
//		    return this.pattern;
//		},
//		
//		getFlags: function() {
//		    return this.flags
//		},
		
		$match: function(doc, val) {
			var result = this.regex.test(val);

			return result;
		}
		
//		accept: function(visitor) {
//			var result = this.callVisitor('visitRegex', this, arguments);
//			return result;
//		}
	});

	

    ns.CriteriaPathCollection = Class.create(ns.CriteriaPath, {
        initialize: function($super, opName, attrPath, criterias) {
            $super(opName, attrPath);
            this.criterias = criterias;
        },
        
        getCriterias: function() {
            return this.criterias;
        },
        
        toString: function() {
            return '[' + this.criterias.join(', ') + ']';
        }
    });

	/**
	 * A criteria where
	 * 
	 */
	ns.CriteriaLogicalAnd = Class.create(ns.CriteriaPathCollection, {
		initialize: function($super, attrPath, criterias) {
			$super('$and', attrPath, criterias);
		},
		
		match: function(doc) {
			var result = _(this.criterias).every(function(criteria) {
				var subResult = criteria.match(doc);
				return subResult;
			});
			
			return result;
		}
	});
		

	ns.CriteriaLogicalOr = Class.create(ns.CriteriaPathCollection, {
		initialize: function($super, attrPath, criterias) {
			$super('$or', attrPath, criterias);
			//this.criterias = criterias;
		},
		
//		getCriterias: function() {
//			return this.criterias;
//		},
		
		$match: function(doc, val) {

			var result = _(this.criterias).some(function(criteria) {
				var subResult = criteria.match(val);
				return subResult;
			});
			
			return result;
		}
//		,
//		
//		accept: function(visitor) {
//			var result = this.callVisitor('visitLogicalOr', this, arguments);
//			return result;
//		}

	});
		

	/**
	 * http://docs.mongodb.org/manual/reference/operator/elemMatch/#op._S_elemMatch
	 * 
	 * "Matching arrays must have at least one element that matches all specified criteria."
	 * 
	 */
	ns.CriteriaElemMatch = Class.create(ns.CriteriaPathCollection, {
		initialize: function($super, attrPath, criterias) {
			$super('$elemMatch', attrPath, criterias);
//			this.criterias = criterias;
		},
		
//		getCriterias: function() {
//			return this.criterias;
//		},
		
		$match: function(doc, val) {
			if(!_(val).isArray()) {
				console.log('[ERROR] Cannon apply $elemMatch to non-array', val);
				throw 'Bailing out';
			}
			
			console.log('$elemMatch ' + this.attrPath);
			
			var result = this.matchArray(val);
			return result;
		},
		
		// There has to be at least 1 item which satisfies all of the criterias
		matchArray: function(docArray) {
			
			var self = this;
			var result = _(docArray).some(function(doc) {
				var itemMatch = _(self.criterias).every(function(criteria) {
					//console.log('Matching doc', doc, criteria);
					var criteriaMatch = criteria.match(doc);
					return criteriaMatch;
				});

				return itemMatch;				
			});
			
			return result;
		},
		
		accept: function(visitor) {
			var result = this.callVisitor('visitElemMatch', this, arguments);
			return result;
		}
	});
	
	
	
})();

