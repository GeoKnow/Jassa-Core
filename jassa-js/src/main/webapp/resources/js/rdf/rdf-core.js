(function() {
	
	var ns = Jassa.rdf;
	

	// Note: the shortcuts we used actually are quite ok for JavaScript
	// i.e. doing ns.Node.v() rather than ns.NodeFactory.createNode()
	
	ns.Node = Class.create({
		getUri: function() {
			throw "not a URI node";
		},
	
		getName: function() {
			throw " is not a variable node";
		},
		
		getBlankNodeId: function() {
			throw " is not a blank node";
		},
		
		getBlankNodeLabel: function() {
			//throw " is not a blank node";
			return this.getBlankNodeId().getLabelString();
		},
		
		getLiteral: function() {
			throw " is not a literal node";
		},
		
		getLiteralValue: function() {
			throw " is not a literal node";
		},
		
		getLiteralLexicalForm: function() {
			throw " is not a literal node";			
		},
		
		getLiteralDatatype: function() {
			throw " is not a literal node";			
		},
		
		getLiteralDatatypeUri: function() {
			throw " is not a literal node";			
		},
		
		isBlank: function() {
			return false;
		},
		
		isUri: function() {
			return false;
		},
		
		isLiteral: function() {
			return false;
		},
		
		isVariable: function() {
			return false;
		},
		
		equals: function(that) {

			// By default we assume non-equality
			var result = false;
			
			if(that == null) {
				result = false;
			}
			else if(this.isLiteral()) {
				if(that.isLiteral()) {
					
					var isSameLex = this.getLiteralLexicalForm() == that.getLiteralLexicalForm();
					var isSameType = this.getLiteralDatatypeUri() == that.getLiteralDatatypeUri();
					var isSameLang = this.getLiteralLanguage() == that.getLiteralLanguage();
					
					result = isSameLex && isSameType && isSameLang;
				}
			}
			else if(this.isUri()) {
				if(that.isUri()) {
					result = this.getUri() == that.getUri();
				}
			}
			//else if(this.)
			else {
				throw 'not implemented yet';
			}
			
			return result;
		}
	});
	

	ns.Node_Concrete = Class.create(ns.Node, {
		isConcrete: function() {
			return true;
		}
	});


	ns.Node_Uri = Class.create(ns.Node_Concrete, {
		initialize: function(uri) {
			this.uri = uri;
		},

		isUri: function() {
			return true;
		},
		
		getUri: function() {
			return this.uri;
		},
		
		toString: function() {
			return '<' + this.uri + '>';
		}
	});
	
	ns.Node_Blank = Class.create(ns.Node_Concrete, {
		// Note: id is expected to be an instance of AnonId
		initialize: function(id) {
			this.id = id;
		},
		
		isBlank: function() {
			return true;
		},
		
		getBlankNodeId: function() {
			return id;
		}
	});
	
	ns.Node_Fluid = Class.create(ns.Node, {
		isConcrete: function() {
			return false;
		}		
	});

    // I don't understand the purpose of this class right now
	// i.e. how it is supposed to differ from ns.Var
	ns.Node_Variable = Class.create(ns.Node_Fluid, {
		isVariable: function() {
			return true;
		}
	});

	ns.Var = Class.create(ns.Node_Variable, {
		initialize: function(name) {
			this.name = name;
		},
		
		getName: function() {
			return this.name;
		},
		
		toString: function() {
			return '?' + this.name;
		}
	});

	
	ns.Node_Literal = Class.create(ns.Node_Concrete, {
		initialize: function(literalLabel) {
			this.literalLabel = literalLabel;
		},
		
		isLiteral: function() {
			return true;
		},
		
		getLiteral: function() {
			return this.literalLabel;
		},

		getLiteralValue: function() {
			return this.literalLabel.getValue();
		},

		getLiteralLexicalForm: function() {
			return this.literalLabel.getLexicalForm();
		},
		
		getLiteralDatatype: function() {
			return this.literalLabel.getDatatype();
		},
		
		getLiteralDatatypeUri: function() {
			var dtype = this.getLiteralDatatype();
			var result = dtype ? dtype.getUri() : null; 
			return result;
		},
		
		getLiteralLanguage: function() {
			return this.literalLabel.getLanguage();
		},
		
		toString: function() {
			return this.literalLabel.toString();
		}
	});

	
	ns.escapeLiteralString = function(str) {
		return str;
	};
	
	/**
	 * An simple object representing a literal -
	 * independent from the Node inheritance hierarchy.
	 * 
	 * Differences to Jena:
	 *   - No getDatatypeUri method, as there is dtype.getUri() 
	 */
	ns.LiteralLabel = Class.create({
		/**
		 * Note: The following should hold:
		 * dtype.parse(lex) == val
		 * dtype.unpars(val) == lex
		 * 
		 * However, this class doesn't care about it.
		 * 
		 */
		initialize: function(val, lex, lang, dtype) {
			this.val = val;
			this.lex = lex;
			this.lang = lang;
			this.dtype = dtype;
		},
		
		/**
		 * Get the literal's value as a JavaScript object
		 */
		getValue: function() {
			return this.val;
		},
		
		getLexicalForm: function() {
			return this.lex
		},
		
		getLanguage: function() {
			return this.lang;
		},
		
		/**
		 * Return the dataype object associated with this literal.
		 */
		getDatatype: function() {
			return this.dtype;
		},
		
		toString: function() {
			var dtypeUri = this.dtype.getUri();
			var litStr = ns.escapeLiteralString(this.lex);
			
			var result;
			if(dtypeUri) {
				result = '"' + litStr + '"^^<' + dtypeUri + '>';
			} else {
				result = '"' + litStr + '"' + (this.lang ? '@' + this.lang : '');
			}
			
			return result;
		}
	});

	
	ns.AnonId = Class.create({
		getLabelString: function() {
			throw "not implemented";
		}
	});
	
	ns.AnonIdStr = Class.create(ns.AnonId, {
		initialize: function(label) {
			this.label = label;
		},

		getLabelString: function() {
			return label;
		}
	});
	
	
	ns.DatatypeLabel = Class.create({
		parse: function(val) {
			throw 'Not implemented';
		},
		
		unparse: function(val) {
			throw 'Not implemented';
		}
	});
	
	
	ns.DatatypeLabelInteger = Class.create(ns.DatatypeLabel, {
		parse: function(str) {
			var result = parseInt(str, 10);
			return result;
		},
		
		unparse: function(val) {
			return '' + val;
		}
	});

	ns.DatatypeLabelFloat = Class.create(ns.DatatypeLabel, {
		parse: function(str) {
			var result = parseFloat(str);
			return result;
		},
		
		unparse: function(val) {
			return '' + val;
		}
	});
	
	ns.DatatypeLabelString = Class.create(ns.DatatypeLabel, {
		parse: function(str) {
			return str
		},
		
		unparse: function(val) {
			return val;
		}
	});

	
	ns.RdfDatatype = Class.create({
		getUri: function() {
			throw "Not implemented";
		},
		
		unparse: function(value) {
			throw "Not implemented";
		},
		
	    /**
	     * Convert a value of this datatype out
	     * to lexical form.
	     */
		parse: function(str) {
			throw "Not implemented";
		}
	});


	ns.RdfDatatypeBase = Class.create(ns.RdfDatatype, {
		initialize: function(uri) {
			this.uri = uri;
		},
		
		getUri: function() {
			return this.uri;
		}
	});
	
	ns.RdfDatatype_Label = Class.create(ns.RdfDatatypeBase, {
		initialize: function($super, uri, datatypeLabel) {
			$super(uri);
			
			this.datatypeLabel = datatypeLabel;
		},

		parse: function(str) {
			var result = this.datatypeLabel.parse(str);
			return result;
		},
		
		unparse: function(val) {
			var result = this.datatypeLabel.unparse(val);
			return result;			
		}
	});
	
	
	
	
	
	ns.NodeFactory = {
		createUri: function(uri) {
			return new ns.Node_Uri(uri);
		},
			
		createVar: function(name) {
			return new ns.Var(name);
		},
		
		createPlainLiteral: function(value, lang) {
			var label = new ns.LiteralLabel(value, value, lang);
			var result = new ns.Node_Literal(label);
			
			return result;
		},
		
		createTypedLiteralFromString: function(str, dtype) {
			throw 'Not implemented yet';
		},
		
		createFromTalisRdfJson: function(talisJson) {
			if(!talisJson || typeof(talisJson.type) === 'undefined') {
				throw "Invalid node: " + JSON.stringify(talisJson);
			}
			
			var result;
			switch(talisJson.type) {
				case 'bnode':
					throw 'Not implemented yet';
					break;
				case 'uri': 
					result = ns.NodeFactory.createUri(talisJson.value);	
					break;
				case 'literal':
					// Virtuoso showed a bug with
					var lang = talisJson.lang || talisJson['xml:lang'];
					result = ns.NodeFactory.createPlainLiteral(talisJson.value, lang);
					break;
				case 'typed-literal':
					ns.Node = ns.NodeFactory.createTypedLiteralFromString(talisJson.value, talisJson.datatype);
					break;
				default:
					console.log("Unknown type: '" + talisJson.type + "'");
					throw 'Bailing out';
			}
			
			return result;
		}
	};

	// Convenience methods
	_.extend(ns.Node, {
		uri: ns.NodeFactory.createUri,
		v: ns.NodeFactory.createVar
	});

	
})();




//
//
//// This node approach is broken...
//// I thought I could get away with something cheap because this is JavaScript,
//// but it turns out that good engineering stays good regardless of the target language.
//
//ns.Node = function(type, value, language, datatype) {
//	this.type = type;
//	this.value = value;
//	this.language = language;
//	this.datatype = datatype;
//};
//
//
//ns.Node.classLabel = 'Node';
//
//ns.Node.prototype = {
//		getValue: function() {
//			return this.value;
//		},
//
//		getType: function() {
//			return this.type;
//		},
//
//		getLanguage: function() {
//			return this.language;
//		},
//
//		getDatatype: function() {
//			return this.datatype;
//		},
//		
//		equals: function(that) {
//			var result = _.isEqual(this, that);
//			return result;
//		},
//		
//		/**
//		 * Warning: If fnNodeMap does not return a copy, the node will not be copied.
//		 * In general, Node should be considered immutable!
//		 * 
//		 * @param fnNodeMap
//		 * @returns
//		 */
//		copySubstitute: function(fnNodeMap) {
//			var sub = fnNodeMap(this);		 
//			var result = (sub == undefined || sub == null) ? this : sub;
//			return result;
//		},
//		
//		toString: function() {
//			switch(this.type) {
//			case -1: return "?" + this.value;
//			case 0: return "_:" + this.value;
//			case 1: return "<" + this.value + ">";
//			case 2: return "\"" + this.value + "\"" + (this.language ? "@" + this.language : "");
//			case 3: return "\"" + this.value + "\"" + (this.datatype ? "^^<" + this.datatype + ">" : "");
//			}
//		},
//		
//		isVar: function() {
//			return this.type === -1;
//		},
//		
//		isUri: function() {
//			return this.type === ns.Node.Type.Uri;
//		},
//		
//		toJson: function() {
//			throw "Not implemented yet";
//		}
//};
//
//
//ns.Node.Type = {};
//ns.Node.Type.Variable = -1;
//ns.Node.Type.BlankNode = 0;
//ns.Node.Type.Uri = 1;
//ns.Node.Type.PlainLiteral = 2;
//ns.Node.Type.TypedLiteral = 3;
//
//ns.Node.fromJson = function(talisJson) {
//	return ns.Node.fromTalisJson(talisJson);
//};
//
//ns.Node.fromTalisJson = function(talisJson) {
//	var result = new ns.Node();
//	
//	if(!talisJson || typeof(talisJson.type) === 'undefined') {
//		throw "Invalid node: " + JSON.stringify(talisJson);
//	}
//	
//	var type;
//	switch(talisJson.type) {
//	case 'bnode': type = 0; break;
//	case 'uri': type = 1; break;
//	case 'literal': type = 2; break;
//	case 'typed-literal': type = 3; break;
//	default: console.log("Unknown type: '" + talisJson.type + "'");
//	}
//	
//	result.type = type;
//	result.value = talisJson.value;
//	result.language = talisJson.lang ? talisJson.lang : "";
//	result.datatype = talisJson.datatype ? talisJson.datatype : "";
//
//	// TODO I thought it happened that a literal hat a datatype set, but maybe I was imaginating things
//	if(result.datatype) {
//		result.type = 3;
//	}
//	
//	return result;
//	/*
//	var type = -2;
//	if(node.type == "uri") {
//		
//	}*/
//};
//
//ns.Node.isNode = function(candidate) {
//	return candidate && (candidate instanceof ns.Node);
//};
//
//ns.Node.isUri = function(candidate) {
//	return ns.Node.isNode(candidate) && candidate.isUri();		
//};
//
//
//ns.Node.parse = function(str) {
//	var str = str.trim();
//	
//	if(strings.startsWith(str, '<') && strings.endsWith(str, '>')) {		
//		return ns.Node.uri(str.substring(1, str.length - 1));
//	} else {
//		throw "Node.parse not implemented for argument: " + str;
//	}
//};
//
//ns.Node.uri = function(str) {
//	return new ns.Node(1, str, null, null);
//};
//	
//ns.Node.v = function(name) {
//	return new ns.Node(-1, name, null, null);
//};
//
////ns.Node.blank = function(id) {
////	return new ns.Node(0, id, null, null);
////};
////
////ns.Node.plainLit = function(value, language) {
////	return new ns.Node(2, value, language, null);
////};
////
////ns.Node.typedLit = function(value, datatype) {
////	return new ns.Node(3, value, null, datatype);
////};
//
//ns.Node.forValue = function(value) {
//	var dt = typeof value;		
//	if(dt === "number") {
//		return ns.Node.typedLit(value, "http://www.w3.org/2001/XMLSchema#double");
//	} else {
//		console.error("No handling for datatype ", td);
//	}
//	
//	//alert(dt);		
//};
//
//
//// BAM! Overwrite the node class
