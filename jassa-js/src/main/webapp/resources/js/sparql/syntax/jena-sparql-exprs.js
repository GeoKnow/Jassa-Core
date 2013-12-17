(function() {

	var rdf = Jassa.rdf;
	var xsd = Jassa.vocab.xsd;

	
	var ns = Jassa.sparql;
	
	// NOTE This file is currently being portet to make use of classes	
		
	
	/**
	 * An string object that supports variable substitution and extraction
	 * to be used for ElementString and ExprString
	 * 
	 */
	ns.SparqlString = Class.create({
		initialize: function(value, varsMentioned) {			
			this.value = value;
			this.varsMentioned = varsMentioned ? varsMentioned : [];
		},

		toString: function() {
			return this.value;
		},
		
		getString: function() {
			return this.value;
		},

		copySubstitute: function(fnNodeMap) {
			var str = this.value;
			var newVarsMentioned = [];
			
			// Avoid double substitution of variables by using some unlikely prefix
			// instead of the question mark
			var placeholder = '@@@@';
			var reAllPlaceholders = new RegExp(placeholder, 'g');
			
			_(this.varsMentioned).each(function(v) {

			    // A variable must not end in \w (this equals: _, [0-9], [a-z] or [a-Z])
				var reStr = '\\?' + v.getName() + '([^\\w])?';
				var re = new RegExp(reStr, 'g');

				var node = fnNodeMap(v);
				if(node) {
					//console.log('Node is ', node);
				    
				    var replacement;
					if(node.isVariable()) {
						//console.log('Var is ' + node + ' ', node);
						
					    replacement = placeholder + node.getName();
					    
						newVarsMentioned.push(node);						
					} else {
					    replacement = node.toString();
					}

					//var 
					str = str.replace(re, replacement + '$1');
				} else {
					newVarsMentioned.push(v);
				}
			});

			str = str.replace(reAllPlaceholders, '?');
			
			return new ns.SparqlString(str, newVarsMentioned);
		},
	
		getVarsMentioned: function() {
			return this.varsMentioned;
		}
	});

	ns.SparqlString.classLabel = 'SparqlString';

	
	ns.SparqlString.create = function(str, varNames) {
	    var vars;
	    if(varNames != null) {
	        vars = varNames.map(function(varName) {
	           return rdf.NodeFactory.createVar(varName); 
	        });
	    } else {
	        vars = ns.extractSparqlVars(str); 
	    }
		//vars = vars ? vars : 
		
		var result = new ns.SparqlString(str, vars);
		return result;
	};



	/**
	 * Expr classes, similar to those in Jena
	 * 
	 * Usally, the three major cases we need to discriminate are:
	 * - Varibles
	 * - Constants
	 * - Functions
	 *  
	 */
	ns.Expr = Class.create({
		isFunction: function() {
			return false;
		},
		
		isVar: function() {
			return false;
		},
		
		isConstant: function() {
			return false;
		},
		
		getFunction: function() {
			throw 'Override me';
		},
		
		getExprVar: function() {
			throw 'Override me';
		},
		
		getConstant: function() {
			throw 'Override me';
		},
		
		copySubstitute: function(fnNodeMap) {
			throw 'Override me';
		}
	});
	
	// TODO Should we introduce ExprNode ?

	ns.ExprVar = Class.create(ns.Expr, {
		classLabel: 'ExprVar',

		initialize: function(v) {
			this.v = v;
		},
		
		copySubstitute: function(fnNodeMap) {
			//var node = fnNodeMap(this.v);
			
			//var result = (n == null) ? this : node;//rdf.NodeValue.makeNode(node); 
			
			//return result;
			//return new ns.ExprVar(this.v.copySubstitute(fnNodeMap));
			return this;
		},

		getArgs: function() {
			return [];
		},
		
		copy: function(args) {
			if(args && args.length > 0) {
				throw "Invalid argument";
			}

			var result = new ns.ExprVar(this.v);
			return result;
		},
	
		isVar: function() {
			return true;
		},
		
		getExprVar: function() {
			return this;
		},
		
		asVar: function() {
			return this.v;
		},
		
		getVarsMentioned: function() {
			return [this.v];
		},
		
		toString: function() {
			return "" + this.v;
		}
	});

	ns.ExprFunction = Class.create(ns.Expr, {
		isFunction: function() {
			return true;
		},

		getFunction: function() {
			return this;
		}
	});

	ns.ExprFunction0 = Class.create(ns.ExprFunction, {
		getArgs: function() {
			return [];
		},

		copy: function(args) {
			if(args && args.length > 0) {
				throw "Invalid argument";
			}
			
			var result = this.$copy(args);
			return result;
		}
	});

	ns.ExprFunction1 = Class.create(ns.ExprFunction, {
		initialize: function(subExpr) {
			this.subExpr = subExpr;
		},
		
		getArgs: function() {
			return [this.subExpr];
		},

		copy: function(args) {
			if(args.length != 1) {
				throw "Invalid argument";
			}
			
			var result = this.$copy(args);
			return result;
		},
		
		getSubExpr: function() {
			return this.subExpr;
		}
	});


	ns.ExprFunction2 = Class.create(ns.ExprFunction, {
		initialize: function(left, right) {
			this.left = left;
			this.right = right;
		},
		
		getArgs: function() {
			return [this.left, this.right];
		},

		copy: function(args) {
			if(args.length != 2) {
				throw "Invalid argument";
			}
			
			var result = this.$copy(args[0], args[1]);
			return result;
		},
		
		getLeft: function() {
			return this.left;
		},
		
		getRight: function() {
			return this.right;
		}
	});
	


// TODO Change to ExprFunction1
	ns.E_OneOf = Class.create(ns.Expr, {
	    // TODO Jena uses an ExprList as the second argument
		initialize: function(lhsExpr, nodes) {
		
		    this.lhsExpr = lhsExpr;
			//this.variable = variable;
			this.nodes = nodes;
		},
	
		getVarsMentioned: function() {
			//return [this.variable];
		    var result = this.lhsExpr.getVarsMentioned();
		    return result;
		},
	
		copySubstitute: function(fnNodeMap) {		
			var newElements = _.map(this.nodes, function(x) { return rdf.getSubstitute(x, fnNodeMap); });
			return new ns.E_OneOf(this.lhsExpr.copySubstitute(fnNodeMap), newElements);
		},
	
		toString: function() {
		
			if(!this.nodes || this.nodes.length === 0) {
				// 
				return "FALSE";
			} else {		
				return "(" + this.lhsExpr + " In (" + this.nodes.join(", ") + "))";
			}
		}
	});

	//ns.E_In = ns.E_OneOf
	
	ns.E_Str = Class.create(ns.ExprFunction1, {
//		initialize: function($super) {
//			
//		}, 
		
		copySubstitute: function(fnNodeMap) {
			return new ns.E_Str(this.subExpr.copySubstitute(fnNodeMap));
		},

		getVarsMentioned: function() {
			return this.subExpr.getVarsMentioned();
		},
	
	
		$copy: function(args) {
			return new ns.E_Str(args[0]);
		},
	
		toString: function() {
			return "str(" + this.subExpr + ")";
		}
	});
	
	
	ns.E_Regex = function(expr, pattern, flags) {
		this.expr = expr;
		this.pattern = pattern;
		this.flags = flags;
	};
		
	ns.E_Regex.prototype = {
			copySubstitute: function(fnNodeMap) {
				return new ns.E_Regex(this.expr.copySubstitute(fnNodeMap), this.pattern, this.flags);
			},
	
			getVarsMentioned: function() {
				return this.expr.getVarsMentioned();
			},
	
			getArgs: function() {
				return [this.expr];
			},
	
			copy: function(args) {
				if(args.length != 1) {
					throw "Invalid argument";
				}
		
				var newExpr = args[0];
				var result = new ns.E_Regex(newExpr, this.pattern, this.flags);
				return result;
			},
	
	
		toString: function() {		
			var patternStr = this.pattern.replace("'", "\\'");
			var flagsStr = this.flags ? ", '" + this.flags.replace("'", "\\'") + "'" : "";
	
			
			return "Regex(" + this.expr + ", '" + patternStr + "'" + flagsStr + ")"; 
		}
	};
	
	
	
	ns.E_Like = function(expr, pattern) {
		this.expr = expr;
		this.pattern = pattern;
	};
		
	ns.E_Like.prototype = {
			copySubstitute: function(fnNodeMap) {
				return new ns.E_Like(this.expr.copySubstitute(fnNodeMap), this.pattern);
			},
	
			getVarsMentioned: function() {
				return this.expr.getVarsMentioned();
			},
	
			getArgs: function() {
				return [this.expr];
			},
	
			copy: function(args) {
				var result = newUnaryExpr(ns.E_Like, args);
				return result;
			},
	
	
		toString: function() {		
			var patternStr = this.pattern.replace("'", "\\'");
	
			
			return "(" + this.expr + " Like '" + patternStr + "')"; 
		}
	};
	


	ns.E_Function = function(uriNode, args) {
		this.uriNode = uriNode;
		this.args = args;
	};
	
	ns.E_Function.prototype.copySubstitute = function(fnNodeMap) {
		var newArgs = _.map(this.args, fnNodeMap);
		
		return new ns.E_Function(this.uriNode, newArgs);
	};
	
	ns.E_Function.prototype.getArgs = function() {
		return this.args;
	};
	
	ns.E_Function.prototype.copy = function(newArgs) {
		return new ns.E_Function(this.uriNode, newArgs);
	};
	
	ns.E_Function.prototype.toString = function() {
		var argStr = this.args.join(", ");
		
		var result = this.uriNode.value + "(" + argStr + ")";
		return result;
	};

	
	
	ns.E_Equals = Class.create(ns.ExprFunction2, {
	
		copySubstitute: function(fnNodeMap) {
			return new ns.E_Equals(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
		},	
	
		$copy: function(left, right) {
			return new ns.E_Equals(left, right);
		},
	
		toString: function() {
			return "(" + this.left + " = " + this.right + ")";
		},
	
		eval: function(binding) {
			// TODO Evaluate the expression
		},
	});

	
	ns.E_LangMatches = function(left, right) {
		this.left = left;
		this.right = right;		
	};
	
	ns.E_LangMatches.prototype = {
			copySubstitute: function(fnNodeMap) {
				return new ns.E_LangMatches(fnNodeMap(this.left), fnNodeMap(this.right));
			},

			getArgs: function() {
				return [this.left, this.right];
			},
			
			copy: function(args) {
				return ns.newBinaryExpr(ns.E_LangMatches, args);
			},
			
			toString: function() {
				return "langMatches(" + this.left + ", " + this.right + ")";
			}
	};
	

	ns.E_Lang = function(expr) {
		this.expr = expr;		
	};
	
	ns.E_Lang.prototype = {
			copySubstitute: function(fnNodeMap) {
				return new ns.E_Lang(fnNodeMap(this.expr));
			},

			getArgs: function() {
				return [this.expr];
			},
			
			copy: function(args) {
				var result = newUnaryExpr(ns.E_Lang, args);
				return result;
			},
			
			toString: function() {
				return "lang(" + this.expr + ")";
			}
	};
	
	ns.E_Bound = function(expr) {
		this.expr = expr;		
	};
	
	ns.E_Bound.prototype = {
			copySubstitute: function(fnNodeMap) {
				return new ns.E_Bound(fnNodeMap(this.expr));
			},

			getArgs: function() {
				return [this.expr];
			},
			
			copy: function(args) {
				var result = newUnaryExpr(ns.E_Bound, args);
				return result;
			},
			
			toString: function() {
				return "bound(" + this.expr + ")";
			}
	};
	
	
	
	
	ns.E_GreaterThan = function(left, right) {
		this.left = left;
		this.right = right;
	};

	ns.E_GreaterThan.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.E_GreaterThan(fnNodeMap(this.left), fnNodeMap(this.right));
	};

	ns.E_GreaterThan.prototype.getArgs = function() {
		return [this.left, this.right];
	};
	
	ns.E_GreaterThan.prototype.copy = function(args) {
		return ns.newBinaryExpr(ns.E_GreaterThan, args);
	};
	
	ns.E_GreaterThan.prototype.toString = function() {
		return "(" + this.left + " > " + this.right + ")";
	};

	ns.E_LessThan = function(left, right) {
		this.left = left;
		this.right = right;
	};

	ns.E_LessThan.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.E_LessThan(fnNodeMap(this.left), fnNodeMap(this.right));
	};

	ns.E_LessThan.prototype.getArgs = function() {
		return [this.left, this.right];
	};
	
	ns.E_LessThan.prototype.copy = function(args) {
		return ns.newBinaryExpr(ns.E_LessThan, args);
	};

	ns.E_LessThan.prototype.toString = function() {
		return "(" + this.left + " < " + this.right + ")";
	};
	
	ns.E_LogicalAnd = function(left, right) {
		this.left = left;
		this.right = right;
	};

	ns.E_LogicalAnd.prototype.copySubstitute = function(fnNodeMap) {
		//return new ns.E_LogicalAnd(fnNodeMap(this.left), fnNodeMap(this.right));
		return new ns.E_LogicalAnd(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
	};
	
	ns.E_LogicalAnd.prototype.getArgs = function() {
		return [this.left, this.right];
	};
	
	ns.E_LogicalAnd.prototype.copy = function(args) {
		return ns.newBinaryExpr(ns.E_LogicalAnd, args);
	};
	
	ns.E_LogicalAnd.prototype.toString = function() {
		return "(" + this.left + " && " + this.right + ")";
	};
	
	ns.E_LogicalOr = function(left, right) {
		this.left = left;
		this.right = right;
	};

	ns.E_LogicalOr.prototype.copySubstitute = function(fnNodeMap) {
		return new ns.E_LogicalOr(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
	};
	
	ns.E_LogicalOr.prototype.getArgs = function() {
		return [this.left, this.right];
	};
	
	ns.E_LogicalOr.prototype.copy = function(args) {
		return ns.newBinaryExpr(ns.E_LogicalOr, args);
	};

	ns.E_LogicalOr.prototype.toString = function() {
		return "(" + this.left + " || " + this.right + ")";
	};


	ns.E_LogicalNot = function(expr) {
		this.expr = expr;
	};

	ns.E_LogicalNot.prototype = {
			copySubstitute: function(fnNodeMap) {
				return new ns.E_LogicalNot(this.expr.copySubstitute(fnNodeMap));
			},

			getArgs: function() {
				return [this.left, this.right];
			},
			
			copy: function(args) {
				return ns.newBinaryExpr(ns.E_LogicalOr, args);
			},

			toString: function() {
				return "(!" + this.expr + ")";
			}
	};

	
	
	
	/**
	 * If null, '*' will be used
	 * 
	 * TODO Not sure if modelling aggregate functions as exprs is a good thing to do.
	 * 
	 * @param subExpr
	 * @returns {ns.E_Count}
	 */
	ns.E_Count = function(subExpr, isDistinct) {
		this.subExpr = subExpr;
		this.isDistinct = isDistinct ? isDistinct : false;
	};

	ns.E_Count.prototype.copySubstitute = function(fnNodeMap) {
		var subExprCopy = this.subExpr ? this.subExpr.copySubstitute(fnNodeMap) : null;
		
		return new ns.E_Count(subExprCopy, this.isDistinct);
	};
	
	ns.E_Count.prototype.toString = function() {		
		return "Count(" + (this.isDistinct ? "Distinct " : "") + (this.subExpr ? this.subExpr : "*") +")";
	};



	ns.E_Min = function(subExpr) {
		this.subExpr = subExpr;
	};

	ns.E_Min.prototype.copySubstitute = function(fnNodeMap) {
		var subExprCopy = this.subExpr ? this.subExpr.copySubstitute(fnNodeMap) : null;
		
		return new ns.E_Min(subExprCopy);
	};
	
	ns.E_Min.prototype.getArgs = function() {
		return [this.subExpr];
	};
	
	ns.E_Min.prototype.copy = function(args) {
		if(args.length != 1) {
			throw "Invalid argument";
		}

		var newSubExpr = args[0];

		var result = new ns.E_Min(newSubExpr);
	};

	ns.E_Min.prototype.toString = function() {		
		return "Min(" + this.subExpr + ")";
	};
	

	
	ns.E_Max = function(subExpr) {
		this.subExpr = subExpr;
	};

	ns.E_Max.prototype.copySubstitute = function(fnNodeMap) {
		var subExprCopy = this.subExpr ? this.subExpr.copySubstitute(fnNodeMap) : null;
		
		return new ns.E_Min(subExprCopy);
	};

	ns.E_Max.prototype.getArgs = function() {
		return [this.subExpr];
	};
	
	ns.E_Max.prototype.copy = function(args) {
		if(args.length != 1) {
			throw "Invalid argument";
		}

		var newSubExpr = args[0];

		var result = new ns.E_Max(newSubExpr);
	};
	
	ns.E_Max.prototype.toString = function() {		
		return "Max(" + this.subExpr + ")";
	};



	ns.ExprString = Class.create(ns.Expr, {
		initialize: function(sparqlString) {
			this.sparqlString = sparqlString;
		},
		
		copySubstitute: function(fnNodeMap) {
			var newSparqlString = this.sparqlString.copySubstitute(fnNodeMap);
			return new ns.ExprString(newSparqlString);
		},
		
		getVarsMentioned: function() {
			return this.sparqlString.getVarsMentioned();
		},

		getArgs: function() {
			return [];
		},
		
		copy: function(args) {
			if(args.length != 0) {
				throw "Invalid argument";
			}

			return this;
		},

		toString: function() {
			return "(!" + this.expr + ")";
		}				
	});
	
	ns.ExprString.create = function(str, varNames) {		
		var result = new ns.ExprString(ns.SparqlString.create(str, varNames));
		return result;
	};
	
	
	
	// TODO Not sure about the best way to design this class
	// Jena does it by subclassing for each type e.g. NodeValueDecimal
	
	// TODO Do we even need this class? There is NodeValueNode now!
	ns.NodeValue = Class.create(ns.Expr, {
		initialize: function(node) {
			this.node = node;
		},
		
		isConstant: function() {
			return true;
		},

		getConstant: function() {
			return this;
		},

		
		getArgs: function() {
			return [];
		},

		getVarsMentioned: function() {
			return [];
		},
		
		asNode: function() {
			throw "makeNode is not overridden";
		},
//		getNode: function() {
//			return this.node;
//		},

		copySubstitute: function(fnNodeMap) {
			// TODO Perform substitution based on the node value
			// But then we need to map a node to a nodeValue first...
			return this;
			//return new ns.NodeValue(this.node.copySubstitute(fnNodeMap));
		},
	
		toString: function() {
		    var node = this.node;

//		    var tmp = node.toString();
//		    if(tmp.indexOf('#string') > 0) {
//		        debugger;
//		    }
		    
		    var result;
		    if(node.isLiteral()) {
		        if(node.getLiteralDatatypeUri() === xsd.xstring.getUri()) {
		            result = '"' + node.getLiteralLexicalForm() + '"'; 
		        }
		        else if(node.datatype === xsd.xdouble.value) {
		            // TODO This is a hack - why is it here???
		            return parseFloat(this.node.value);		            
		        }
		    }
		    else {
		        result = node.toString();
		    }
			// TODO Numeric values do not need the full rdf term representation
			// e.g. "50"^^xsd:double - this method should output "natural/casual"
			// representations
			return result;
	
			/*
			var node = this.node;
			var type = node.type;
			
			switch(type) {
			case 1: return this.node.toString();
			case 2: return ns.valueFragment(node) + ns.languageFragment(node);
			case 3: return ns.valueFragment(node) + ns.datatypeFragment(node);
			default: {
					console.warn("Should not happen; type = " + node.type);
					break;
			}		
			}
			*/
		}
	});

	/**
	 * Static functions for ns.NodeValue
	 * 
	 * Note: It seems we could avoid all these specific sub types and 
	 * do something more generic
	 */
	_.extend(ns.NodeValue, {
		
		createLiteral: function(val, typeUri) {
			var node = rdf.NodeFactory.createTypedLiteralFromValue(val, typeUri);
			var result = new ns.NodeValueNode(node);
			return result;
			
//			var dtype = rdf.RdfDatatypes[dtypeUri];
//			if(!dtype) {
//				console.log('[ERROR] No dtype for ' + dtypeUri);
//			}
//			
//			var lex = dtype.unparse(val);
//			var lang = null;
//			
//			var literalLabel = new rdf.LiteralLabel(val, lex, lang, dtype);
//			
//			var node = new rdf.Node_Literal(literalLabel);
//			
//			var result = new ns.NodeValueNode(node);
//			
//			return result;
		},
		
		
		makeString: function(str) {
			return ns.NodeValue.createLiteral(str, xsd.str.xstring);
		},
		
		makeInteger: function(val) {
			return new ns.NodeValue.createLiteral(val, xsd.str.xint);
		},
		
		makeFloat: function(val) {
			return new ns.NodeValue.createLiteral(val, xsd.str.xfloat);
		},
		
		makeNode: function(node) {
			return new ns.NodeValueNode(node);
		}

		
//		makeFloat: function(val) {
//			return new ns.NodeValueFloat(val);
//		}
	});
	
	
	ns.NodeValueNode = Class.create(ns.NodeValue, {
		initialize: function(node) {
			this.node = node;
		},
		
		asNode: function() {
			return this.node;
		},
		
		toString: function() {
		    var node = this.node;
		    
		    var result = null;
            if(node.isLiteral()) {
                if(node.getLiteralDatatypeUri() === xsd.xstring.getUri()) {
                    result = '"' + node.getLiteralLexicalForm() + '"'; 
                }
            }
            
            if(result == null) {
                result = node.toString();
            }

			return result;
		}
	});
	
	
//	ns.NodeValueInteger = Class.create(ns.NodeValue, {
//		initialize: function(val) {
//			this.val = val;
//		},
//		
//		getInteger: function() {
//			return this.val;
//		},
//		
//		makeNode: function() {
//			var result = rdf.Node.typedLit(str, xsd.str.xstring);
//			return result;			
//		}
//	});
	
//	ns.NodeValueInteger = Class.create(ns.NodeValue, {
//		initialize: function(val) {
//			this.val = val;
//		},
//		
//		getInteger: function() {
//			return this.val;
//		},
//		
//		makeNode: function() {
//			var result = rdf.Node.typedLit(str, xsd.str.xstring);
//			return result;			
//		}
//	});
	
	
//	ns.NodeValueString = Class.create(ns.NodeValue, {
//		initialize: function(str) {
//			this.str = str
//		},
//		
//		
//		// Having a generic get type function is more extensible to custom types
//		// Yet, convenience functions for common types, such as isString(),
//		// would be quite nice from an API perspective
//		getType: function() {
//			return 'string';
//		},
//		
//		getString: function() {
//			return this.str;
//		},
//		
//		makeNode: function() {
//			var result = rdf.Node.typedLit(str, xsd.str.xstring);
//			return result;
//		}
//	});
	
	// Jena-style compatibility
//	ns.NodeValue.makeNode = function(node) {
//		return new ns.NodeValue(node);
//	};

	ns.valueFragment = function(node) {
		return '"' + node.value.toString().replace('"', '\\"') + '"';
	};
	
	ns.languageFragment = function(node) {
		return node.language ? "@" + node.language : "";
	};
	
	ns.datatypeFragment = function(node) {
		return node.datatype ? '^^<' + node.datatype + '>' : "";
	};
	

	
	
})();




	/*
	 * TODO E_Cast should be removed -
	 * a cast expression should be modeled as a function taking a single argument which is the value to cast.
	 * 
	 */
//	
//	ns.E_Cast = function(expr, node) {
//		this.expr = expr;
//		this.node = node;
//	};
//	
//	ns.E_Cast.prototype.copySubstitute = function(fnNodeMap) {
//		return new ns.E_Cast(this.expr.copySubstitute(fnNodeMap), this.node.copySubstitute(fnNodeMap));		
//	};
//	


//ns.E_Cast.prototype.getVarsMentioned = function() {
//var result = this.expr.getVarsMentioned();
//
//// Note: Actually a variable is invalid in the node postition 
//if(node.isVar()) {
//	result.push(result);
//}
//
//return result;
//};
//
//ns.E_Cast.prototype.getArgs = function() {
//return [this.expr];
//};
//
//ns.E_Cast.prototype.copy = function(args) {
//if(args.length != 1) {
//	throw "Invalid argument";
//}
//
//var result =new ns.E_Cast(args[0], this.node);
//return result;
//};
//
//ns.E_Cast.prototype.toString = function() {
//return this.node + "(" + this.expr + ")";
//};
