/**
 * Problem:
 * Somehow there needs to be an interface to build queries, but at the same time there needs
 * to be a way to execute them.
 * 
 * Having something like Jena's Query object in js would be really really neat.
 * 
 * 
 *  
 * 
 * @returns
 */

(function() {

	var rdf = Jassa.rdf;
	var xsd = Jassa.vocab.xsd;

	
	var ns = Jassa.sparql;

	
	//var strings = Namespace("org.aksw.ssb.utils.strings");
	//var strings = require('underscore.strings');
	
	
	
	/**
	 * A binding is a map from variables to entries.
	 * An entry is a on object {v: sparql.Var, node: sparql.Node }
	 * 
	 * The main speciality of this object is that
	 * .entries() returns a *sorted* array of variable bindings (sorted by the variable name).
	 *  .toString() re-uses the ordering.
	 *  
	 * This means, that two bindings are equal if their strings are equal.
	 *  
	 * TODO We could generalize this behaviour into some 'base class'. 
	 *  
	 * 
	 */
	ns.Binding = function(varNameToEntry) {
		this.varNameToEntry = varNameToEntry ? varNameToEntry : {};
	};
	
	/**
	 * Create method in case the variables are not objects
	 * 
	 * TODO Replace with an ordinary hashMap.
	 */
	ns.Binding.create = function(varNameToNode) {
		
		var tmp = {};
		_.map(varNameToNode, function(node, vStr) {
			tmp[vStr] = {v: ns.Node.v(vStr), node: node};
		});
		
		var result = new ns.Binding(tmp);
		return result;
	};
	
	ns.Binding.fromTalisJson = function(b) {
		
		var tmp = {};
		_.each(b, function(val, k) {
			//var v = rdf.Node.v(k);
			var node = rdf.NodeFactory.createFromTalisRdfJson(val);
			tmp[k] = node;
		});
		
		var result = ns.Binding.create(tmp);
		
		return result;
	};
	
	ns.Binding.prototype = {
		put: function(v, node) {
			this.varNameToEntry[v.getName()] = {v: v, node: node};
		},
		
		get: function(v) {
			var entry = this.varNameToEntry[v.getName()];
			
			var result = entry ? entry.node : null;
			
			return result;
		},
	
		entries: function() {
			var tmp = _.values(this.varNameToEntry);
			var result = _.sortBy(tmp, function(entry) { return entry.v.getName(); });
			//alert(JSON.stringify(result));
			return result;
		},
	
		toString: function() {
			var e = this.entries();
			
			//var result = "[" + e.join()
			
			var tmp = _.map(e, function(item) {
				return '"' + item.v.getName() + '": "' + item.node + '"';  
			});
			
			var result = '{' + tmp.join(', ') + '}'; 

			return result;
		},
		
		getVars: function() {
			var result = [];

			_(this.varNameToEntry).each(function(entry) {
				result.push(entry.v);
			});
			
			return result;
		}
	};

	

	
	ns.Element = function() {
			
	};
	
	
	ns.Element.fromJson = function() {
		
	};
	
	ns.Element.toJson = function() {
		
	};
	

	
	ns.orify = function(exprs) {
		var result = ns.opify(exprs, ns.E_LogicalOr);
		return result;
	};

	ns.andify = function(exprs) {
		var result = ns.opify(exprs, ns.E_LogicalAnd);
		return result;
	};

	
	/**
	 * Deprecated
	 * 
	 * This object is overridden by opifyBalanced
	 * 
	 */
	ns.opify = function(exprs, fnCtor) {
		var open = exprs;
		var next = [];
		
		while(open.length > 1) {
		
			for(var i = 0; i < open.length; i+=2) {
				
				var a = open[i];
	
				if(i + 1 == open.length) {
					next.push(a);
					break;
				}
				
				var b = open[i + 1];
		
				var newExpr = fnCtor(a, b);
				
				next.push(newExpr); //;new ns.E_LogicalOr(a, b));
			}
			
			var tmp = open;
			open = next;
			next = [];
		}
		
		return open;
	};
	

	
	ns.uniqTriples = function(triples) {
		var result =  _.uniq(triples, false, function(x) { return x.toString(); });
		return result;
	};
	
	/**
	 * Combine two arrays of triples into a singe one with duplicates removed
	 * 
	 */
	ns.mergeTriples = function(a, b) {
		var combined = a.concat(b);		
		var result = ns.uniqTriples(combined);
		return result;		
	};
	
	
	//console.log("The namespace is: ", ns);
	
	//var ns = {};
	
	ns.varPattern = /\?(\w+)/g;
	//ns.prefixPattern =/(^|\s+)(\w+):\w+(\s+|$)/g;
	ns.prefixPattern =/((\w|-)+):(\w|-)+/g;

	ns.extractVarNames = function(vars) {
		var result = [];
		for(var i = 0; i < vars.length; ++i) {
			var v = vars[i];
			
			result.push(v.getName());
		}

		return result;
	};
	
	/**
	 * Extract SPARQL variables from a string
	 * 
	 * @param str
	 * @returns {Array}
	 */
	ns.extractSparqlVars = function(str) {
		var varNames = ns.extractAll(ns.varPattern, str, 1);
		var result = [];
		for(var i = 0; i < varNames.length; ++i) {
			var varName = varNames[i];
			var v = ns.Node.v(varName);
			result.push(v);
		}
		
		return result;
	};

	ns.extractPrefixes = function(str) {
		return ns.extractAll(ns.prefixPattern, str, 1);	
	};
	
	/**
	 * Return a new string with prefixes expanded
	 * 
	 * Yes, it sucks doing it without a proper parser...
	 * And yes, the Java world is so much better, it doesn't even compare to this crap here
	 * 
	 */
	ns.expandPrefixes = function(prefixes, str) {
		var usedPrefixes = ns.extractPrefixes(str);

		
		var result = str;
		for(var i = 0; i < usedPrefixes.length; ++i) {
			var prefix = usedPrefixes[i];
			
			var url = prefixes[prefix];
			if(!url) {
				continue;
			}
			

			// TODO Add a cache
			var re = new RegExp(prefix + ':(\\w+)', 'g');

			result = result.replace(re, '<' + url + '$1>');
			//console.log(result + ' prefixes' + prefix + url);

		}
		
		return result;
	};


	ns.extractAll = function(pattern, str, index) {
		// Extract variables from the fragment	
		var match;
		var result = [];
		
		while (match = pattern.exec(str)) {
			result.push(match[index]);
		}
		
		result = _.uniq(result);
		
		return result;
		
	};
	
	/*
	ns.parseJsonRs = function(jsonRs) {
		var bindings = jsonRs.results.bindings;
		
		var bindings = jsonRs.results.bindings;
		
		var tmpUris = {};
		for(var i = 0; i < bindings.length; ++i) {

			var binding = bindings[i];
			
			var newBinding = {};
			
			$.each(binding, function(varName, node) {
				var newNode = node ? null : Node.parseJson(node);
				
				newBinding[varName] = newNode;
			});
			
			bindings[i] = newBinding;
		}
	};
	*/
	
	
	

	
	ns.BasicPattern = function(triples) {
		this.triples = triples ? triples : [];
	};
	
	ns.BasicPattern.prototype.copySubstitute = function(fnNodeMap) {
		var newElements = _.map(this.triples, function(x) { return x.copySubstitute(fnNodeMap); });
		return new ns.BasicPattern(newElements);
	};
	
	ns.BasicPattern.prototype.toString = function() {
		return this.triples.join(" . "); 
	};

	/*
	ns.BasicPattern.prototype.copySubstitute = function() {

	};
	*/
	
	ns.Template = function(bgp) {
		this.bgp = bgp;
	};

	ns.Template.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.Template(this.bgp.copySubstitute(fnNodeMap));
	};
	
	ns.Template.prototype.toString = function() {
		return "{ " + this.bgp + " }";
	};
	
	
	ns.ElementNamedGraph = function(element, namedGraphNode) {
		this.element = element;
		this.namedGraphNode = namedGraphNode;
	};

	ns.ElementNamedGraph.classLabel = 'ElementNamedGraph';
	
	ns.ElementNamedGraph.prototype = {
		getArgs: function() {
			return [this.element];
		},
	
		copy: function(args) {
			if(args.length != 1) {
				throw "Invalid argument";
			}
		
			var newElement = args[0];
			var result = new ns.ElementNamedGraph(newElement, this.namedGraphNode);
			return result;
		},
	
		toString: function() {
			return "Graph " + this.namedGraphNode + " { " + this.element + " }";
		},
	
		copySubstitute: function(fnNodeMap) {
			return new ns.ElementNamedGraph(this.element.copySubstitute(fnNodeMap), this.namedGraphNode.copySubstitute(fnNodeMap));
		},
	
		getVarsMentioned: function() {
		
			var result = this.element.getVarsMentioned();
			if(this.namedGraphNode.isVar()) {
				_.union(result, [this.namedGraphNode]);
			}
		
			return result;
		},
	
		flatten: function() {
			return new ns.ElementNamedGraph(this.element.flatten(), this.namedGraphNode);
		}
	};
	

		

	
	
	/**
	 * An element that injects a string "as is" into a query.
	 * 
	 */
	ns.ElementString = Class.create({
		initialize: function(sparqlString) {
//			if(_(sparqlString).isString()) {
//				debugger;
//			}
			this.sparqlString = sparqlString;	
		},
 
		getArgs: function() {
			return [];
		},
	
		copy: function(args) {
			if(args.length != 0) {
				throw "Invalid argument";
			}
			
			// FIXME: Should we clone the attributes too?
			//var result = new ns.ElementString(this.sparqlString);
			return this;
			//return result;
		},
	
		toString: function() {
			return this.sparqlString.getString();
		},

		copySubstitute: function(fnNodeMap) {
			var newSparqlString = this.sparqlString.copySubstitute(fnNodeMap);
			return new ns.ElementString(newSparqlString);
		},
	
		getVarsMentioned: function() {
			return this.sparqlString.getVarsMentioned();
		},
	
		flatten: function() {
			return this;
		}
	});


	ns.ElementString.create = function(str, vars) {
		var result = new ns.ElementString(ns.SparqlString.create(str, vars));
		return result;
	};
	
	/*
	ns.ElementSubQueryString = function(value) {
		this.value = value;
	};
	
	ns.ElementSubQueryString = function(value) {
		
	}
	*/
	
	
	ns.ElementSubQuery = function(query) {
		this.query = query;
	};
	
	ns.ElementSubQuery.classLabel = "ElementSubQuery";
	
	ns.ElementSubQuery.prototype = {
		getArgs: function() {
			return [];
		},
	
		copy: function(args) {
			if(args.length != 0) {
				throw "Invalid argument";
			}
			
			// FIXME: Should we clone the attributes too?
			var result = new ns.ElementSubQuery(query);
			return result;
		},
	
		toString: function() {
			return "{ " + this.query + " }";
		},

		copySubstitute: function(fnNodeMap) {
			return new ns.ElementSubQuery(this.query.copySubstitute(fnNodeMap));
		},
	
		flatten: function() {
			return new ns.ElementSubQuery(this.query.flatten());
		}
	};
	
	ns.ElementFilter = function(exprs) {
		this.exprs = exprs;
	};
	
	ns.ElementFilter.classLabel = 'ElementFilter';

	ns.ElementFilter.prototype = {
		getArgs: function() {
			return [];
		},
	
		copy: function(args) {
			if(args.length != 0) {
				throw "Invalid argument";
			}
		
		// 	FIXME: Should we clone the attributes too?
			var result = new ns.ElemenFilter(this.exprs);
			return result;
		},
	
		copySubstitute: function(fnNodeMap) {
			var exprs = _.map(this.exprs, function(expr) {
				return expr.copySubstitute(fnNodeMap);
			});
		
			return new ns.ElementFilter(exprs);
		},

		getVarsMentioned: function() {
			return [];
		},
	
		flatten: function() {
			return this;
		},
	
		toString: function() {
			
			var expr = ns.andify(this.exprs);
			
			return "Filter(" + expr + ")";
		}
	};
	
	
	ns.ElementOptional = function(element) {
		this.optionalPart = element;
	};
	
	ns.ElementOptional.classLabel = 'ElementOptional';

	ns.ElementOptional.prototype = {
		getArgs: function() {
			return [this.optionalPart];
		},
	
		copy: function(args) {
			if(args.length != 1) {
				throw "Invalid argument";
			}
			
			// FIXME: Should we clone the attributes too?
			var result = new ns.ElementOptional(this.expr);
			return result;
		},
	
		getVarsMentioned: function() {
			return this.optionalPart.getVarsMentioned();
		},

		copySubstitute: function(fnNodeMap) {
			return new ns.ElementOptional(this.optionalPart.copySubstitute(fnNodeMap));
		},
	
		flatten: function() {
			return new ns.ElementOptional(this.optionalPart.flatten());
		},
	
		toString: function() {
			return "Optional {" + this.optionalPart + "}";
		}
	};
	
	
	ns.ElementUnion = function(elements) {
		this.elements = elements ? elements : [];
	};

	ns.ElementUnion.classLabel = 'ElementUnion';

	ns.ElementUnion.prototype = {
		getArgs: function() {
			return this.elements;
		},
	
		copy: function(args) {		
			var result = new ns.ElementUnion(args);
			return result;
		},
	
		getVarsMentioned: function() {
			var result = [];
			for(var i in this.elements) {
				result = _.union(result, this.elements[i].getVarsMentioned());
			}
			return result;
		},

		copySubstitute: function(fnNodeMap) {
			var tmp = _.map(this.elements, function(element) { return element.copySubstitute(fnNodeMap); });
		
			return new ns.ElementUnion(tmp);		
		},
	
		flatten: function() {
			var tmp = _.map(this.elements, function(element) { return element.flatten(); });
			
			return new ns.ElementUnion(tmp);
		},
	
		toString: function() {
			return "{" + this.elements.join("} Union {") + "}";
		}
	};

	
	ns.ElementTriplesBlock = function(triples) {
		this.triples = triples ? triples : [];
	};
	
	ns.ElementTriplesBlock.classLabel = 'ElementTriplesBlock';
	
	ns.ElementTriplesBlock.prototype = {
		getArgs: function() {
			return [];
		},

		copy: function(args) {
			if(args.length != 0) {
				throw "Invalid argument";
			}
	
			var result = new ns.ElementTriplesBlock(this.triples);
			return result;
		},

		getTriples: function() {
			return this.triples;
		},

		addTriples: function(otherTriples) {
			this.triples = this.triples.concat(otherTriples);
		},

		uniq: function() {
			this.triples = ns.uniqTriples(this.triples);
	//this.triples = _.uniq(this.triples, false, function(x) { return x.toString(); });
		},

		copySubstitute: function(fnNodeMap) {
			var newElements = _.map(this.triples, function(x) { return x.copySubstitute(fnNodeMap); });
			return new ns.ElementTriplesBlock(newElements);
		},

		getVarsMentioned: function() {
			var result = [];
			_.each(this.triples, function(triple) {
				result = _.union(result, triple.getVarsMentioned());				
			});

			return result;
		},

		flatten: function() {
			return this;
		},
	
		toString: function() {
			return this.triples.join(" . ");
		}
	};
	

	ns.ElementGroup = function(elements) {
		this.elements = elements ? elements : [];
	};

	ns.ElementGroup.classLabel = 'ElementGroup';

	ns.ElementGroup.prototype = {
		getArgs: function() {
			return this.elements;
		},
	
		copy: function(args) {
			var result = new ns.ElementTriplesBlock(args);
			return result;
		},
	
		copySubstitute: function(fnNodeMap) {
			var newElements = _.map(this.elements, function(x) { return x.copySubstitute(fnNodeMap); });
			return new ns.ElementGroup(newElements);
		},
	
		getVarsMentioned: function() {
			var result = ns.PatternUtils.getVarsMentioned(this.elements);
			return result;
//			var result = [];
//			for(var i in this.elements) {
//				result = _.union(result, this.elements[i].getVarsMentioned());
//			}
//			return result;
		},

		toString: function() {
			//return this.elements.join(" . ");
			return ns.joinElements(" . ", this.elements);
		},
		
	
		flatten: function() {
			var processed = ns.ElementUtils.flatten(this.elements); 
	
			if(processed.length === 1) {
				return processed[0];
			} else {
				return new ns.ElementGroup(ns.ElementUtils.flattenElements(processed));
			}
		}
	};
	

	
	ns.joinElements = function(separator, elements) {
		var strs = _.map(elements, function(element) { return "" + element; });
		var filtered = _.filter(strs, function(str) { return str.length != 0; });
		
		return filtered.join(separator);
	};
	
	
	ns.newUnaryExpr = function(ctor, args) {
		if(args.length != 1) {
			throw "Invalid argument";
		}

		var newExpr = args[0];
		
		var result = new ctor(newExpr);
		return result;		
	};
	
	
	ns.newBinaryExpr = function(ctor, args) {
		if(args.length != 2) {
			throw "Invalid argument";
		}

		var newLeft = args[0];
		var newRight = args[1];
		
		var result = new ctor(newLeft, newRight);
		return result;		
	};
	

	
	
	
	/*
	 * Not used. Distinct is part of the query object - or at least I hope it to be.
	 */
//	ns.E_Distinct = function(subExpr) {
//		this.subExpr = subExpr;
//	};
//
//	ns.E_Distinct.prototype.copySubstitute = function(fnNodeMap) {
//		return new ns.E_Distinct(this.subExpr.copySubstitute(fnNodeMap));
//	};
//	
//	ns.E_Distinct.prototype.getArgs = function() {
//		return [this.subExpr];
//	};
//	
//	ns.E_Distinct.prototype.copy = function(args) {
//		return new ns.E_Count(this.subExpr);
//	};
//
//	
//	ns.E_Distinct.prototype.toString = function() {
//		return "Distinct(" + this.subExpr +")";
//	};

	
//	ns.ExprVar = function(v) {
//		this.v = v;
//	};
//	
//	ns.ExprVar.prototype = {
//		classLabel: 'ExprVar',
//			
//		copySubstitute: function(fnNodeMap) {
//			return new ns.ExprVar(this.v.copySubstitute(fnNodeMap));
//		},
//
//		getArgs: function() {
//			return [];
//		},
//
//		copy: function(args) {
//			if(args && args > 0) {
//				throw "Invalid argument";
//			}
//	
//			var result = new ns.ExprVar(this.v);
//			return result;
//		},
//
//		toString: function() {
//			return "" + this.v;
//		},
//		
//		accept: function(visitor) {
//			var fn = visitor["visit" + this.classLabel];
//
//			var args = [this].concat(arguments.slice(1));
//			var result = fn.apply(visitor, args);
//			return result;
//		}
//	};

	

	
	ns.QueryType = {};
	ns.QueryType.Unknown = -1;
	ns.QueryType.Select = 0;
	ns.QueryType.Construct = 1;
	ns.QueryType.Ask = 2;
	ns.QueryType.Describe = 3;
	
	
	// TODO Duplication - ns.Order and ns.SortCondition are the same - the latter should be retained!
//	ns.OrderDir = {};
//	ns.OrderDir.Asc = 0;
//	ns.OrderDir.Desc = -1;
//	
//	ns.Order = function(expr, direction) {
//		this.expr = expr;
//		this.direction = direction ? direction : ns.OrderDir.Asc;
//	};
//	
//	ns.Order.prototype.toString = function() {
//		
//		var result = "" + this.expr;
//		
//		if(this.direction == ns.OrderDir.Desc) {
//			result = "Desc(" + result + ")";
//		}
//		
//		return result;
//	};
//	
	
	ns.VarExprList = function() {
		this.vars = [];
		this.varToExpr = {};
	};	
	
	ns.VarExprList.prototype = {
		getVarList: function() {
			return this.vars;
		},
			
		getExprMap: function() {
			return this.varToExpr;
		},

		add: function(v, expr) {
			this.vars.push(v);
			
			if(expr) {
				this.varToExpr[v.getName()] = expr;
			}
		},
		
		
		addAll: function(vars) {
			this.vars.push.apply(this.vars, vars);
		},
		
		entries: function() {
			var self = this;
			var result = _(this.vars).map(function(v) {
				var expr = self.varToExpr[v.getName()];

				//return expr;
				return {v: v, expr: expr};
			});
			
//			for(var i = 0; i < this.vars.length; ++i) {
//				var v = this.vars[i];
//				
//				result.push({v:v, expr:expr});
//			}

			return result;
		},
		
		copySubstitute: function(fnNodeMap) {
			var result = new ns.VarExprList();
			
			var entries = this.entries();
			for(var i = 0; i < entries.length; ++i) {
				var entry = entries[i];
				var newVar = fnNodeMap(entry.v);
				var newExpr = entry.expr ? entry.expr.copySubstitute(fnNodeMap) : null;
				
				result.add(newVar, newExpr);
			}
			
			return result;
		},
		
		toString: function() {
			var arr = [];
			var projEntries = this.entries();
			for(var i = 0; i < projEntries.length; ++i) {
				var entry = projEntries[i];
				var v = entry.v;
				var expr = entry.expr;
			
				if(expr) {
					arr.push("(" + expr + " As " + v + ")");
				} else {
					arr.push("" + v);				
				};
			}
			
			var result = arr.join(" ");
			return result;
		}
	};
	
	
	ns.SortCondition = function(expr, direction) {
		this.expr = expr;
		this.direction = direction;
	};
	
	ns.SortCondition.prototype = {
			getExpr: function() {
				return this.expr;
			},
			
			getDirection: function() {
				return this.direction;
			},
			
			toString: function() {
				var result;
				if(this.direction >= 0) {
					result = "Asc(" + this.expr + ")";
				} else if(this.direction < 0) {
					result = "Desc(" + this.expr + ")";
				}
				
				return result;
			},
			
			copySubstitute: function(fnNodeMap) {
				var exprCopy = this.expr.copySubstitute(fnNodeMap);
				
				var result = new ns.SortCondition(exprCopy, this.direction);
				
				return result;
			}
	};
	
	
	ns.Query = Class.create({
		initialize: function() {
			this.type = 0; // select, construct, ask, describe
			
			this.distinct = false;
			this.reduced = false;
			
			this.isResultStar = false;
			
			this.projectVars = new ns.VarExprList();
			//this.projectVars = []; // The list of variables to appear in the projection
			//this.projectExprs = {}; // A map from variable to an expression
			
			//this.projection = {}; // Map from var to expr; map to null for using the var directly
			
			//this.order = []; // A list of expressions
			
			this.groupBy = []; 
			this.orderBy = [];
	
			
			this.elements = [];
			
			this.constructTemplate = null;
			
			this.limit = null;
			this.offset = null;		
		},
	
		getElements: function() {
			return this.elements;
		},
				
		getProjectVars: function() {
			return this.projectVars;
		},

		setProjectVars: function(projectVars) {
			this.projectVars = projectVars;
		},
		
		getGroupBy: function() {
			return this.groupBy;
		},
		
		getOrderBy: function() {
			return this.orderBy;
		},
		
		toStringOrderBy: function() {
			var result = (this.orderBy && this.orderBy.length > 0)
				? "Order By " + this.orderBy.join(" ") + " "
				: "";
				//console.log("Order: ", this.orderBy);
			return result;
		},

		toStringGroupBy: function() {
			var result = (this.groupBy && this.groupBy.length > 0)
				? "Group By " + this.groupBy.join(" ") + " "
				: "";
				//console.log("Order: ", this.orderBy);
			return result;
		},
		
		clone: function() {
			return this.copySubstitute(ns.fnIdentity);
		},

		flatten: function() {
			var result = this.clone();

			var tmp = _.map(result.elements, function(element) { return element.flatten(); });

			var newElements = ns.ElementUtils.flattenElements(tmp);
			
			result.elements = newElements;

			return result;
		},
		
		copySubstitute: function(fnNodeMap) {
			var result = new ns.Query();
			result.type = this.type;
			result.distinct = this.distinct;
			result.reduced = this.reduced;
			result.isResultStar = this.isResultStar;
			result.limit = this.limit;
			result.offset = this.offset;
	 				
			result.projectVars = this.projectVars.copySubstitute(fnNodeMap);

			//console.log("PROJECTION  " + this.projectVars + " --- " + result.projectVars);

			/*
			for(key in this.projection) {
				var value = this.projection[key]; 

				var k = fnNodeMap(ns.Node.v(key));
				var v = value ? value.copySubstitute(fnNodeMap) : null;
				
				result.projection[k] = v;
			}*/
			
			if(this.constructTemplate) {
				result.constructTemplate = this.constructTemplate.copySubstitute(fnNodeMap);
			}

			result.orderBy = this.orderBy == null
				? null
				:  _.map(this.orderBy, function(item) { return item.copySubstitute(fnNodeMap); });			

			result.groupBy = this.groupBy == null
				? null
				:  _.map(this.groupBy, function(item) { return item.copySubstitute(fnNodeMap); });			


			result.elements = _(this.elements).map(function(element) {
//				console.log("Element: ", element);
//				debugger;
				var r = element.copySubstitute(fnNodeMap);
				return r;
			});		

			//console.log("CLONE ORIG " + this);
			//console.log("CLONE RES " + result);
			
			return result;
		},
		
		
		/**
		 * Convenience function for setting limit, offset and distinct from JSON
		 * 
		 * @param options
		 */
		setOptions: function(options) {
			if(typeof options === 'undefined') {
				return;
			}
			
			if(typeof options.limit !== 'undefined') {
				this.setLimit(options.limit);
			}
			
			if(typeof(options.offset) !== 'undefined') {
				this.setOffset(options.offset);
			}

			if(typeof(options.distinct) !== 'undefined') {
				this.setDistinct(options.distinct);
			}
		},
		
		setOffset: function(offset) {
			this.offset = offset ? offset : null;
		},

		setLimit: function(limit) {
			if(limit === 0) {
				this.limit = 0;
			} else {
				this.limit = limit ? limit : null;
			}
		},
		
		setDistinct: function(enable) {
			this.distinct = (enable === true) ? true : false;
		},

		toString: function() {
			switch(this.type) {
			case ns.QueryType.Select: return this.toStringSelect();
			case ns.QueryType.Construct: return this.toStringConstruct();
			
			}
		},

			
		toStringProjection: function() {
			if(this.isResultStar) {
				return "*";
			}

			return "" + this.projectVars;		
		},

		
		toStringLimitOffset: function() {
			var result = "";
			
			if(this.limit != null) {
				result += " Limit " + this.limit;
			}
			
			if(this.offset != null) {
				result += " Offset " + this.offset;
			}
			
			return result;		
		},
		

		toStringSelect: function() {
			var distinctStr = this.distinct ? "Distinct " : "";
			
			//console.log("Elements: ", this.elements);
			var result = "Select " + distinctStr + this.toStringProjection() + " {" + ns.joinElements(" . ", this.elements) + "} " + this.toStringGroupBy() + this.toStringOrderBy() + this.toStringLimitOffset();
			
			return result;		
		},

		toStringConstruct: function() {
			var result = "Construct " + this.constructTemplate + " {" + ns.joinElements(" . ", this.elements) + "}" + this.toStringOrderBy() + this.toStringLimitOffset();
			
			return result;
		}
	});

	
	ns.fnIdentity = function(x) { return x; };
	

	
	
	
	/**
	 * Creates a new (compound) expressions from an array
	 * of individual exrpessions.
	 * [a, b, c, d] with ctor set to "E_LogicalAnd" (abbr. And) will become
	 * And(And(a, b), And(c, d))
	 * 
	 */
	ns.opifyBalanced = function(exprs, ctor) {
		//console.warn("Constructor", ctor);

		if(exprs.length === 0) {
			return null;
		}

		var open = exprs;
		
		while(open.length > 1) {
			var next = [];

			for(var i = 0; i < open.length; i+=2) {
				var hasSecond = i + 1 < open.length;
				
				var a = open[i];
				
				if(hasSecond) {
					b = open[i + 1];
					next.push(new ctor(a, b));
				} else {
					next.push(a);
				};
			}
			
			open = next;
		}
		
		return open[0];
	}; 

	ns.opify = ns.opifyBalanced; 
	
		

	/*
	var testElement = new ns.ElementTriplesBlock([]);

	var json = serializer.serialize(testElement);
	
	alert('serialized: ' + JSON.stringify(json));
	
	
	var obj = serializer.deserialize(json);
	alert('deserialized: ' + JSON.stringify(obj));
	
	//serializeElement(testElement);
	*/
	
})();
		
