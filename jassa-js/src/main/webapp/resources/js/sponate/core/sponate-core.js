(function() {

	var sparql = Jassa.sparql;
	var util = Jassa.util;

	var ns = Jassa.sponate;
	
	
	
    ns.AccumulatorFactoryFn = Class.create({
        initialize: function(fn, referencedVars) {
            this.fn = fn;
            this.referencedVars = referencedVars;
        },
        
        createAggregator: function() {
            var result = new ns.AccumulatorFn(this.fn, this.referencedVars);
            return result;
        },
        
        getVarsMentioned: function() {
            return this.referencedVars;
        }
    });
    
    ns.AccumulatorFn = Class.create({
        initialize: function(fn) {
            this.fn = fn;
            // TODO Is this really a node, or an arbitrary object?
            this.node = null;
        },
        
        processBinding: function(binding) {
            var val = this.fn(binding);
            this.node = val;
        },
        
        toJson: function() {
            return this.node;
            //return this.node.toString();
        },
        
        toNode: function() {
            return this.node
        }
    });

	
	/**
	 * TODO Like Jena, we could use the namings Aggregator and Accumulator
	 * I think our aggregators are closer to accumulators. 
	 * 
	 */
	
	/**
	 * A path of attributes.
	 * 
	 * Just an array of attribute names.
	 * 
	 * 
	 */
	ns.AttrPath = Class.create({
		initialize: function(steps) {
			this.steps = steps ? steps : [];
		},
		
		getSteps: function() {
			return this.steps;
		},
		
		toString: function() {
			return this.steps.join('.');
		},
		
		slice: function(start, end) {
			var result = this.steps.slice(start, end);
			return result;
		},
		
		first: function() {
			return this.steps[0];
		},
		
		at: function(index) {
			return this.steps[index];
		},
		
		isEmpty: function() {
		    return this.steps.length == 0;
		},
		
		size: function() {
		    return this.steps.length;
		},
		
		concat: function(that) {
			var tmp = this.steps.concat(that.getSteps());
			var result = new ns.AttrPath(tmp);
			return result;
		},
		
		
		/**
		 * Retrieve the value of a path in a json document
		 * 
		 */
		find: function(doc) {
			var result = doc;
			
			var steps = this.steps;
			for(var i = 0; i < steps.length; ++i) {			
				var attr = steps[i];

				if(!_(result).isObject()) {
					console.log('[ERROR] Cannot access attribute of non-object', this.steps, doc, result);
					throw 'Bailing out';
				}
				
				result = result[attr];
			}
			
			return result;
		}
	});
	
	ns.AttrPath.parse = function(str) {
		var steps = str.split('.');
		
		return new ns.AttrPath(steps);
	};
	

	
	/*
	 * patterns
	 * 
	 * This object's state are the 'blue brint' for building the json documents from sparql bindings
	 * 
	 */

	// DON'T USE ANYMORE - visitor pattern in JavaScript turned out to be pretty useless
	ns.callVisitor = function(name, self, args) {

//		if(self !== this) {
//			console.log('Different this pointers');
//		}
		
		// The first argument is the visitor
		var visitor = args[0];

		var fn = visitor[name];

		if(!fn) {
			console.log('[ERROR] No visitor with name ' + name + ' in ', self);
			throw 'Bailing out';
		}
		
		var tmp = Array.prototype.slice.call(args, 1);
		var xargs = [self].concat(tmp);
		//console.log('xargs', xargs.length, xargs);
		
		//debugger;
		var result = fn.apply(visitor, xargs);
		
		return result;
		
	};
	
	/**
	 * 
	 * 
	 */
	ns.Pattern = Class.create({
		callVisitor: function(name, self, args) {
			var result = ns.callVisitor(name, self, args);
			return result;
		},

		getClassName: function() {
            throw 'override me';		    
		},
		
//		accept: function() {
//			throw 'override me';
//		},

		toString: function() {
			return 'override me';
		},

		getVarsMentioned: function() {
			throw 'override me';
		},
		
		/**
		 * Get the list of sub patterns; empty array if none
		 */
		getSubPatterns: function() {
			throw 'override me';
		},
		
		$getReferences: function(result) {
			throw 'override me';
		},
		
		/**
		 * Find a pattern by an object of type ns.AttrPath.
		 * If a string is passed, it will be parsed first.
		 * 
		 * 
		 */
		findPattern: function(rawAttrPath, start) {
			
			var attrPath;
			if(_(attrPath).isString()) {
				attrPath = ns.AttrPath.parse(rawAttrPath);
			} else {
				attrPath = rawAttrPath;
			}
			
			start = start ? start : 0;
			
			var result;
			// On empty paths return this.
			var pathLength = attrPath.size();
			if(start > pathLength) {
			    console.log('[ERROR] Start in path ' + start + ' greater than path length ' + pathLength);
			}
			else if(start == pathLength) {
			    result = this;
			}
			else {
			    result = this.$findPattern(attrPath, start);
			}
			return result;
		},
		
		$findPattern: function(attrPath, start) {
			console.log('[ERROR] "findPattern" for path "' + attrPath + '" is not supported on this kind of object: ' + JSON.stringify(this));
			throw 'Bailing out';
		}
	});
	
	
//	ns.Iterator = Class.create({
//		next: function() {
//			throw 'Not overridden';
//		},
//		
//		hasNext: function() {
//			throw 'Not overridden';
//		}
//	});
	


			
	
	
/*
	ns.IteratorDepthFirst = Class.create({
		initialize: function(node, fnGetChildern, fnGetValue) {
			this.fnGetChildren = fnGetChildren;
			this.fnGetValue = fnGetValue;
		},
		
		prefetch: function() {
			
		}
	});
*/
	
	ns.PatternUtils = {
		/**
		 * Get all patterns in a pattern
		 */
		getRefs: function(pattern) {
			var result = [];
			
			var fn = function(pattern) {
				var proceed = true
				if(pattern instanceof ns.PatternRef) {
					result.push(pattern);
					proceed = false;
				}
				
				return proceed;
			}
			
			util.TreeUtils.visitDepthFirst(pattern, ns.PatternUtils.getChildren, fn);
			
			return result;
		},
		
		getChildren: function(pattern) {
			return pattern.getSubPatterns();
		}
		
		/**
		 * Generic method for visiting a tree structure
		 * 
		 */
//		visitDepthFirst: function(parent, fnChildren, fnPredicate) {
//			var proceed = fnPredicate(parent);
//			
//			if(proceed) {
//				var children = fnChildren(parent);
//				
//				_(children).each(function(child) {
//					ns.PatternUtils.visitDepthFirst(child, fnChildren, fnPredicate);
//				});
//			}
//		}
			
	};
	
	ns.PatternCustomAgg = Class.create(ns.Pattern, {
	   initialize: function(customAggFactory) {
	       this.customAggFactory = customAggFactory;
	   },
	
	   getCustomAggFactory: function() {
	       return this.customAggFactory;
	   },
	   
	   getClassName: function() {
	       return 'PatternCustomAgg';
	   },
	   
       getVarsMentioned: function() {
           var result = this.customAggFactory.getVarsMentioned();
           return result;
       },
       
       getSubPatterns: function() {
           return [];
       }
	});
	
	/**
	 * A pattern for a single valued field.
	 * 
	 * Can carry a name to a client side aggregator to use.
	 * 
	 * 
	 */
	ns.PatternLiteral = Class.create(ns.Pattern, {
		initialize: function(expr, aggregatorName) {
			this.expr = expr;
			this.aggregatorName = aggregatorName;
		},
		
        getClassName: function() {
            return 'PatternLiteral';            
        },
		
		getExpr: function() {
			return this.expr;
		},
		
//		accept: function(visitor) {
//			var result = this.callVisitor('visitLiteral', this, arguments);
//			return result;
//		},
		
		toString: function() {
			return '' + this.expr;
		},

		getVarsMentioned: function() {
			var result = this.expr.getVarsMentioned();
			return result;
		},
		
		getSubPatterns: function() {
			return [];
		}
	});


	/**
	 * A pattern for a map from *predefined* keys to patterns.
	 * 
	 */
	ns.PatternObject = Class.create(ns.Pattern, {
		initialize: function(attrToPattern) {
			this.attrToPattern = attrToPattern;
		},

		getClassName: function() {
            return "PatternObject";            
        },

		getMembers: function() {
			return this.attrToPattern;
		},

//		putPattern: function(attr, subPattern) {
//			var p = this.attrToPattern[attr];
//			if(p) {
//				throw 'Sub pattern already set for ' + attr;
//			}
//			
//			this.attrToPattern[attr] = subPattern;
//		},
		
		getPattern: function(attr) {
			return this.attrToPattern[attr];
		},
		
//		accept: function(visitor) {
//			var result = this.callVisitor('visitObject', this, arguments);
//			return result;
//		},
		
		toString: function() {
			var parts = [];
			_(this.attrToPattern).each(function(v, k) { parts.push('"' + k + '": ' + v); });
			
			var result = '{' + parts.join(',') + '}';
			return result;
		},

		getVarsMentioned: function() {
			var result = [];
			
			var fnToString = (function(x) {
				//console.log('x: ' + x, x, x.toString());
				return x.toString();
			});
			
			_.each(this.attrToPattern, function(member, k) {
				result = result.concat(member.getVarsMentioned());
			});
			result = _.uniq(result, false, fnToString);	
			
			return result;		
		},
		
		$findPattern: function(attrPath, start) {
			var attr = attrPath.at(start);
			
			var pattern = this.attrToPattern[attr];
			
			var result;
			if(pattern) {
//			    if(attrPath.size() > start + 1) {
			        result = pattern.findPattern(attrPath, start + 1);
//			    }
//			    else {
//			        result = pattern;
//			    }
			} else {
				result = null;
			}
			
			return result;
		},
		
		getSubPatterns: function() {
			var result = [];
			
			_.each(this.attrToPattern, function(member, k) {
				result.push(member);
			});

			return result;
		}
	});

	
	/**
	 * A pattern for a map from *variable* keys to patters
	 * 
	 * map[keyExpr(binding)] = pattern(binding);
	 * 
	 * The subPattern corresponds to the element contained
	 * 
	 * TODO An array can be seen as a map from index to item
	 * So formally, PatternMap is thus the best candidate for a map, yet
	 * we should add a flag to treat this pattern as an array, i.e. the groupKey as an index
	 * 
	 */
	ns.PatternMap = Class.create(ns.Pattern, {
		initialize: function(keyExpr, subPattern, isArray) {
			this.keyExpr = keyExpr;
			this.subPattern = subPattern;
			this._isArray = isArray;
		},
		
        getClassName: function() {
            return "PatternMap";            
        },

		getKeyExpr: function() {
			return this.keyExpr;
		},
		
		getSubPattern: function() {
			return this.subPattern;
		},
		
		isArray: function() {
			return this._isArray;
		},
		
		toString: function() {
			var result = '[' + this.subPattern + ' / ' + this.keyExpr + '/' + this.type + ']';
			return result;
		},

//		accept: function(visitor) {
//			var result = this.callVisitor('visitMap', this, arguments);
//			return result;
//		},
		
		getVarsMentioned: function() {
			var result = this.subPattern.getVarsMentioned();
			return result;
		},
		
		getSubPatterns: function() {
			return [this.subPattern];
		},
		
		$findPattern: function(attrPath, start) {
		    var result = this.subPattern.findPattern(attrPath, start);
		    return result;
        }

	});

	
	/**
	 * A PatternRef represents a reference to another Mapping.
	 * However, because we allow forward references, we might not be able
	 * to resolve references during parsing.
	 * For this reason, we first just store the original configuration
	 * in the stub object, and later resolve it into a full blown refSpec.
	 * 
	 */
	ns.PatternRef = Class.create(ns.Pattern, {
		initialize: function(stub) {
			this.stub = stub;
			this.refSpec = null;
		},

		getClassName: function() {
            return "PatternRef";            
        },
		
		getStub: function() {
			return this.stub;
		},
		
		setRefSpec: function(refSpec) {
			this.refSpec = refSpec;
		},
		
		getRefSpec: function() {
			return this.refSpec;
		},
		
		toString: function() {
			return JSON.stringify(this);
		},
		
//		accept: function(visitor) {
//			var result = this.callVisitor('visitRef', this, arguments);
//			return result;
//		},

		getVarsMentioned: function() {
			var result = [];
			
			var stub = this.stub;
			if(stub.joinColumn != null) {
				// TODO HACK Use proper expression parsing here
				var v = rdf.Node.v(stub.joinColumn.substr(1));
				result.push(v);
			} else {
				console.log('[ERROR] No join column declared; cannot get variable');
				throw 'Bailing out';
			}
			
			
			return result;
			
			//if(refSpec)
		},
		
		getSubPatterns: function() {
			return [];
		}
	});


	/**
	 * A reference to a table of which some columns are source, and others are target columns
	 * 
	 */
	ns.JoinTableRef = Class.create({
		initialize: function(tableName, sourceColumns, targetColumns) {
			this.tableName = tableName;
			this.sourceColumns = sourceColumns;
			this.targetColumns = targetColumns;
		},
		
		getTableName: function() {
			return this.tableName;
		},
		
		getSourceColumns: function() {
			return this.sourceColumns;
		},
		
		getTargetColumns: function() {
			return this.targetColumn;
		},
		
		toString: function() {
			var result
				= '(' + this.sourceColumns.join(', ') + ') '
				+ this.tableName
				+ ' (' + this.targetJoinColumns.join() + ')';
			
			return result;
		}
	});

	/**
	 * 
	 * 
	 */
	ns.TableRef = Class.create({
		initialize: function(tableName, columnNames) {
			this.tableName = tableName;
			this.columnNames = columnNames;
		},
		
		getTableName: function() {
			return this.tableName;
		},
		
		getColumnNames: function() {
			return this.columnNames;
		},
		
		toString: function() {
			var result = this.tableName + '(' + this.columnNames.join(', ') + ')';
			return result;
		}
	});


	/**
	 * A reference to another map's pattern
	 * 
	 */
//	ns.RefPattern = Class.create({
//		initialize: function(mapName, attrPath) {
//			this.mapName = mapName;
//			this.attrPath = attrPath;
//		},
//		
//		getMapName: function() {
//			return this.mapName;
//		},
//		
//		getAttrPath: function() {
//			return this.attrPath;
//		},
//		
//		toString: function() {
//			var result = this.mapName + '::' + attrPath;
//			return result;
//		}
//
//	});
	

	/**
	 * A reference to another map
	 * 
	 */
	ns.MapRef = Class.create({
		initialize: function(mapName, tableRef, attrPath) {
			this.mapName = mapName;
			this.tableRef = tableRef;
		},
		
		getMapName: function() {
			return this.mapName;
		},
		
		getTableRef: function() {
			return this.tableRef;
		},

		getAttrPath: function() {
			return this.attrPath;
		},
		
		toString: function() {
			var result = this.patternRef + '/' + tableRef + '@' + attrPath;
			return result;
		}
	});
	
	/**
	 * Specification of a reference.
	 * 
	 * 
	 */
	ns.RefSpec = Class.create({

		initialize: function(sourceMapRef, targetMapRef, isArray, joinTableRef) {
			this.sourceMapRef = sourceMapRef;
			this.targetMapRef = targetMapRef;
			this.isArray = isArray;
			this.joinTableRef = joinTableRef;
		},
	
		getSourceMapRef: function() {
			return this.sourceMapRef;
		},
		
		getTargetMapRef: function() {
			return this.targetMapRef;
		},
		
		isArray: function() {
			this.isArray;
		},
		
		getJoinTableRef: function() {
			return this.joinTabelRef;
		},
		
		toString: function() {
			var result = this.sourceMapRef + ' references ' + this.targetMapRef + ' via ' + this.joinTableRef + ' as array? ' + this.isArray;
			return result;
		}
	});


	/*
	 * Aggregators
	 */
		
	ns.Aggregator = Class.create({
		getPattern: function() {
			throw new 'override me';
		},
		
		getJson: function() {
			throw 'override me';
		}
	});

	
	ns.AggregatorCustomAgg = Class.create(ns.Aggregator, {
	   initialize: function(patternCustomAgg, customAgg) {
	       this.customAgg = customAgg;
	   },
	   
	   getPattern: function() {
	       return this.pattenCustomAgg;
	   },
	   
	   process: function(binding, context) {
	       this.customAgg.processBinding(binding);
	   },
	   
	   getJson: function() {
	       var result = this.customAgg.getJson();
	       return result;
	   }
	});
	
	
	ns.AggregatorLiteral = Class.create(ns.Aggregator, {
		initialize: function(patternLiteral) {
			this.patternLiteral = patternLiteral;
			
			this.node = null;
		},
		
		getPattern: function() {
			return this.patternLiteral;
		},
		
		process: function(binding, context) {
			var expr = this.patternLiteral.getExpr();

			var exprEvaluator = context.exprEvaluator;
			
			var ex = exprEvaluator.eval(expr, binding);
			if(ex.isConstant()) {
				var c = ex.getConstant();
				var node = c.asNode();

				this.setNode(node);
	
			} else {
				console.log('[ERROR] Could not evaluate to constant');
				throw 'Bailing out';
			}			
		},
		
		setNode: function(newNode) {
			var oldNode = this.node;
			
			if(oldNode == null) {
				this.node = newNode;
			}
			else {
				if(!oldNode.equals(newNode)) {
					console.log('[ERROR] Value already set: Attempted to override ' + oldNode + ' with ' + newNode);
				}
			}
		},
		
		getJson: function() {
			var result;

			var node = this.node;
			
			if(node) {
				if(node.isUri()) {
					result = node.toString();
				} else if (node.isLiteral()) {
					result = node.getLiteralValue();
				} else if(sparql.NodeValue.nvNothing.asNode().equals(node)) {
				    result = null;
				} else {
					throw 'Unsupported node type';
				}
			}

			return result;
		}

	});
	
	ns.AggregatorObject = Class.create(ns.Aggregator, {
		
		/**
		 * An aggregator factory must have already taken
		 * care of initializing the attrToAggr map.
		 * 
		 */
		initialize: function(patternObject, attrToAggr) {
			this.pattersObject = this.patternObject;
			this.attrToAggr = attrToAggr;
		},
		
		
		process: function(binding, context) {
			
			_(this.attrToAggr).each(function(aggr, attr) {
				aggr.process(binding, context);
			});
			
		},
		
		getJson: function() {
			var result = {};
			
			_(this.attrToAggr).each(function(aggr, attr) {
	    		var json = aggr.getJson();
	    		result[attr] = json;
		    });

			return result;
		}
	});
	
	
	ns.AggregatorMap = Class.create(ns.Aggregator, {
		initialize: function(patternMap) {
			this.patternMap = patternMap;
			
			this.keyToAggr = new ns.MapList();
		},
		
		getPattern: function() {
			return this.patternMap
		},
		
		process: function(binding, context) {
			var pattern = this.patternMap;
			
			var keyExpr = pattern.getKeyExpr();
			var subPattern = pattern.getSubPattern();
			var isArray = pattern.isArray();

			var exprEvaluator = context.exprEvaluator;
			var aggregatorFactory = context.aggregatorFactory;

			var keyEx = exprEvaluator.eval(keyExpr, binding);
			
			if(!keyEx.isConstant()) {
				console.log('[ERROR] Could not evaluate key to a constant ' + JSON.stringify(keyEx) + ' with binding ' + binding);
				throw 'Bailing out';
			}
			
			var key = keyEx.getConstant().asNode();
			
			var keyStr = '' + key;
			
			var aggr = this.keyToAggr.get(keyStr);

			if(aggr == null) {
				aggr = aggregatorFactory.create(subPattern);
				
				this.keyToAggr.put(keyStr, aggr);
			}
			
			aggr.process(binding, context);
		},
		
		getJson: function() {
			var result;

			var isArray = this.patternMap.isArray();
			if(isArray) {
				result = this.getJsonArray();
			} else {
				result = this.getJsonMap();
			}

			return result;
		},
		
		getJsonArray: function() {
			var result = [];

			var aggrs = this.keyToAggr.getItems();
			var result = aggrs.map(function(aggr) {
				var data = aggr.getJson();
				return data;
			});
				
			return result;
		},
		
		getJsonMap: function() {
			var result = {};
			
			var aggrs = this.keyToAggr.getItems();
			var keyToIndex = this.keyToAggr.getKeyToIndex();
			
			_(keyToIndex).each(function(index, aggr) {
		    	var aggr = items[index];
		    	var data = aggr.getJson();
		    	result[key] = data;
			});
			
			return result;			
		}

	});
	
	
	ns.AggregatorRefCounter = 0;

	/**
	 * TODO: An aggregatorRef cannot turn itself into a proxy,
	 * instead, the parent object needs to be enhanced with proxy capabilities
	 * 
	 * I see two options:
	 * (a) We make use of the ns.Field class, and pass each aggregator the field from which it is referenced.
	 * This is somewhat ugly, because then the aggregator needs to know how to react when being
	 * placed into an array or an object
	 *  
	 * (b) We make a postprocessing step of the (almost) final json and check which properties
	 * and array elements point to proxy objects
	 * 
	 * This post processing is maybe the best solution, as it reduces complexity here
	 * and we separate the concerns. 
	 * 
	 */
	ns.AggregatorRef = Class.create(ns.Aggregator, {
		initialize: function(patternRef) {
			// th
			this.name = '' + (ns.AggregatorRefCounter++);
			
			this.patternRef = patternRef;
			
			this.json = null;
			//this.map = new ns.MapList();
			
			this.bindings = [];
		},
		
		/**
		 * The name is used so we can refer to a specific aggregator
		 * 
		 * 
		 */
		getName: function() {
			return this.name;
		},
		
		process: function(binding, context) {
			this.bindings.push(binding);

			//context.registryRef.addRef(this, binding)
		},
		
		getJson: function() {
			return this.json;
		},
		
		// The sponate system takes care of resolving references
		setJson: function(json) {
			this.json = json;
		}
	});

	
	
//	ns.AggregatorFactory = Class.create({
//	   createAggregator: function() {
//	       throw 'Not overridden';
//	   } 
//	});
	
	
	/**
	 * TODO: This smells like a desig flaw:
	 * Aggregators should be independent of the pattern -
	 * aggregators should only have a reference to a childAggregatorFactory,
	 * whereas this factory may be based on a pattern
	 * 
	 * AggregatorFactory
	 * 
	 * Recursively instantiates aggregators based on patterns.
	 * 
	 */
	ns.AggregatorFactory = Class.create({
		initialize: function() {
			//this.pattern = pattern;
			
			// Registry for custom aggregators 
			//this.nameToAggregator = {};			
		},
	
		create: function(pattern) {
		    var fnName = "visit" + pattern.getClassName();
		    var fn = this[fnName];
		    if(!fn) {
		        console.log('[ERROR] Function with name "' + fnName + '" not found.')
		        throw 'Bailing out';
		    }
			var result = fn.call(this, pattern);
			return result;
		},
		
		
		visitPatternObject: function(patternObject) {
			var attrToAggr = {};
			
			var self = this;
			var members = patternObject.getMembers();
			_(members).each(function(attrPattern, attr) {
				var aggr = self.create(attrPattern);
				
				attrToAggr[attr] = aggr;
			});

			//console.log('attrToAggr ', attrToAggr);
			var result = new ns.AggregatorObject(patternObject, attrToAggr);
			return result;
		},

		visitPatternArray: function(pattern) {
			return ns.AggregatorArray(pattern);
		},
		
		visitPatternMap: function(patternMap) {
			return new ns.AggregatorMap(patternMap);
		},
		
		visitPatternLiteral: function(patternLiteral) {
			return new ns.AggregatorLiteral(patternLiteral);
		},
		
		visitPatternRef: function(patternRef) {
			return new ns.AggregatorRef(patternRef);
		},
		
		visitPatternCustomAgg: function(patternCustomAgg) {
		    var customAgg = patternCustomAgg.getCustomAggFactory().createAggregator();
		    return new ns.AggregatorCustomAgg(patternCustomAgg, customAgg);
		}
	});
	
	
	
	/**
	 * A collection to keep track of references.
	 * 
	 * Intended to be called in AggregatorRef.process 
	 * 
	 */
	ns.RegistryRef = Class.create({
		initialize: function() {
			
		},
		
		addRef: function(aggergatorRef, binding) {
			
		}
	});

	

	ns.AggregatorFacade = Class.create({
		
		initialize: function(pattern) {			
			this.context = {
				exprEvaluator: new sparql.ExprEvaluatorImpl(),
				aggregatorFactory: new ns.AggregatorFactory(),
				refRegistry: new ns.RegistryRef()
			};
			
			this.rootAggregator = this.context.aggregatorFactory.create(pattern);
		},

		process: function(binding) {
			this.rootAggregator.process(binding, this.context);
		},
		
		
		getJson: function() {
			var result = this.rootAggregator.getJson();
			
			return result;
		}
	});
	
	
	ns.ParserPattern = Class.create({

		initialize: function() {
			this.attrs = {
				id: 'id',
				ref: 'ref'
			};
		},
		
		/**
		 * An array can indicate each of the following meanings:
		 * 
		 * - [ string ]
		 *   If the argument is a string, we have an array of literals,
		 *   whereas the string will be interpreted as an expression.
		 *   
		 * - [ object ]
		 * 
		 *   If the argument is an object, the following intepretation rules apply:
		 *   
		 *   - If there is an 'id' attribute, we interpret it as an array of objects, with the id as the grouping key,
		 *     and a subPattern corresponding to the object
		 *   [{ id: '?s' }]
		 *
		 *   - If there is a 'ref' attribute, we intepret the object as a specification of a reference
		 *   
		 *   
		 *   - If neither 'id' nor 'ref' is specified ...
		 *   TODO i think then the object should be interpreted as some kind of *explicit* specification, wich 'id' and 'ref' variants being syntactic sugar for them
		 * 
		 */
		parseArray: function(val) {

			if(val.length != 1) {
				console.log('[ERROR] Arrays must have exactly one element that is either a string or an object', val);
				throw 'Bailing out';
			}
			
			var config = val[0];
			
			var result;
			if(_(config).isString()) {
				
				result = this.parseArrayLiteral(config);
				
			} else if(_(config).isObject()) {
				
				result = this.parseArrayConfig(config);
				
			} else {
				throw 'Bailing out';
			}
			
			return result;
		},

		parseArrayConfig: function(config) {

			var idAttr = this.attrs.id;
			var refAttr = this.attrs.ref;

			var hasId = config[idAttr] != null;
			var hasRef = config[refAttr] != null;
			
			if(hasId && hasRef) {
				console.log('[ERROR] id and ref are mutually exclusive');
				throw 'Bailing out';
			}
			
			var result;
			if(hasId) {
				
				var subPattern = this.parseObject(config);
				//console.log(config, JSON.stringify(subPattern));
				
				// Expects a PatternLiteral
				var idPattern = subPattern.getPattern(idAttr);
				var idExpr = idPattern.getExpr();				
				result = new ns.PatternMap(idExpr, subPattern, true); 
				
			} else if(hasRef) {
				result = this.parseArrayRef(config);
			} else {
				console.log('[ERROR] Not implemented');
				throw 'Bailing out';
			}
			
			return result;
		},
		
		
		/**
		 * Here we only keep track that we encountered a reference.
		 * We cannot validate it here, as we lack information
		 * 
		 * 
		 */
		parseArrayRef: function(config) {

			var result = new ns.PatternRef(config);
			return result;
		},
		
		parseArrayLiteral: function() {

		},
		
		
		parseLiteral: function(val) {
			var expr = this.parseExprString(val);
			
			var result = new ns.PatternLiteral(expr);
			return result;
		},
		
		/**
		 * An object is an entity having a set of fields,
		 * whereas fields can be of different types
		 * 
		 */
		parseObject: function(val) {
			
			var attrToPattern = {};
	
			var self = this;
			_(val).each(function(v, attr) {
		    	var v = val[attr];
		    	var subPattern = self.parsePattern(v); 
		    	
		    	attrToPattern[attr] = subPattern;				
			});
			
			var result = new ns.PatternObject(attrToPattern);
			return result;
		}, 

//		parsePattern: function(fieldName, val) {
//			// if the value is an array, create an array field
//			// TODO An array field can be either an array of literals or of objects
//			// How to represent them?
//			// Maybe we could have Object and Literal Fields plus a flag whether these are arrays?
//			// So then we wouldn't have a dedicated arrayfield.
//			// if the value is an object, create an object reference field
//			
//			// friends: ArrayField(
//		},
		
		parsePattern: function(val) {
			
			var result;
			
			if(_(val).isString()) {
				result = this.parseLiteral(val);
			}
			else if(_(val).isArray()) {
				result = this.parseArray(val);
			}
            else if(_(val).isFunction()) {
                result = new ns.PatternCustomAgg(new ns.AccumulatorFactoryFn(val));
            }
            else if(val instanceof rdf.Node && val.isVariable()) {
                var expr = new sparql.ExprVar(val);             
                result = new ns.PatternLiteral(expr);               
            }
            else if(val instanceof sparql.Expr) {
                result = new ns.PatternLiteral(expr);               
            }
			else if(_(val).isObject()) {
			    
			    var fnCustomAggFactory = val['createAggregator'];
			    if(fnCustomAggFactory) {
			        result = new ns.PatternCustomAgg(val); 
			        //console.log('aggregator support not implemented');
			        //throw 'Bailing out';
			    }
			    else {
			        result = this.parseObject(val);
			    }
			}
			else {
			    console.log('[ERROR] Unknown item type: ', val);
				throw "Unkown item type";
			}

			
			return result;
		},
					
			
		parseExpr: function(obj) {
			var result;
			
			if(_.isString(obj)) {
				result = this.parseExprString(obj);
			}
			
			return result;
		},

		parseExprString: function(str) {
			var result;
			
			if(_(str).startsWith('?')) {
				var varName = str.substr(1);				
				var v = sparql.Node.v(varName);
				result = new sparql.ExprVar(v);

			} else {
				result = sparql.NodeValue.makeString(str);
				// TODO: This must be a node value
				//result = sparql.Node.plainLit(str);
			}
			
			// TODO Handle special strings, such as ?\tag 

			//console.log('Parsed', str, 'to', result);
			
			return result;
		}
		
	});
	

	
	ns.parseExpr = function(str) {
		
	}

})();

