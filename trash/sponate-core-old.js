/**
 * JAvascript Mapper for Sparql Access (JAMSA)
 * 
 * The purpose of this project is to easy JavaScript access with SPARQL by the following means:
 * 
 * - Sparql Service abstraction
 *     Useful for caching, transient pagination, delays,...
 *     See my Java jena-sparql-api project to see what i mean.
 * 
 * - A Jena-like port of some of the Sparql Syntax classes
 *     Maybe a proper port should be done using GWT.
 * 
 * - Sparql-Json mappings (read only SPARQL access; no write)
 */
(function(ns) {

	var sparql = Jassa.sparql;

	var ns = Jassa.sponate;

	
	ns.FieldSimple = Class.create({
		initialize: function(holder) {
			this.holder = holder ? holder : null;
		},
		
		getHolder: function() {
			return this.holder;
		},
		
		setHolder: function(holder) {
			this.holder = holder;
		}
	});
	
	/**
	 * Field is an abstraction to get or set a specific value
	 * in an array or object.
	 * 
	 * Although with JavaScript there is no difference between the concepts,
	 * I am worried about shooting myself into the foot if I mix these concepts. 
	 */
	ns.FieldArray = function(array, index) {
		this.array = array;
		this.index = index;
	};
	
	ns.FieldArray.prototype = {
		getValue: function() {
			var result = this.array[this.index];
			return result;
		},

		setValue: function(value) {
			this.array[this.index] = value;
		}
	};
	
//	ns.FieldObject = function(obj, property) {
//		this.obj = obj;
//		this.property = property;
//	};
//
//
//	ns.FieldObject.prototype = {
//		getValue: function() {
//			var result = this.obj[this.property];
//			return result;
//		},
//		
//		setValue: function(value) {
//			this.obj[this.property] = value;
//		}
//	};
	
	ns.Field = Class.create({
		getValue: function() {
			throw 'not overridden';
		},
		
		setValue: function(val) {
			throw 'not overridden';
		}
	});
	
	
	/**
	 * A field to puts a value into the holder of an object
	 * 
	 */
	ns.FieldObject = Class.create(ns.Field, {
		initialize: function(holderObject, property) {
			this.holderObject = holderObject;
			this.property = property;
		},
		
		getHolder: function() {
			return this.holderObject.getHolder(this.property);
			
			//return this.holderObject[this.property];
		},

		setHolder: function(holder) {
			//this.holderObject[this.property] = holder;
			this.holderObject.putHolder(this.property, holder);
		}
		
	});
	
	
	/** 
	 * 
	 */
	ns.FieldArray = Class.create(ns.Field, {
		initialize: function(holderArray, index) {
			this.holderArray = holderArray;
			this.index = index;
		},
		
		getHolder: function() {
			var index = this.index;
			
			var result;
			if(!index) {
				result = null;
			} else {
				result = this.holderArray[index]; 
			}
			
			return result;
		},
		
		setHolder: function(holder) {
			var index = this.index;

			var result;
			if(!index) {
				index = this.holderArray.length;
				this.holderArray.push(null);
			}

			this.holderArray[index] = holder 
			
			return result;
		}
	});
	
//	ns.FieldHolder = Class.create(ns.Field, {
//		initialize: function(holder) {
//			this.holder = holder;
//		},
//		
//		getValue: function() {
//			return this.holder;
//		},
//		
//		setValue: function(holder) {
//			this.holder = holder;
//		}
//		
//	});
//	
	
	/**
	 * A pattern is an object that creates a JavaScript object from a binding.
	 * Patterns can be nested.
	 * 
	 */
	ns.Pattern = Class.create({
		callVisitor: function(name, self, args) {

			if(self !== this) {
				console.log('Different this pointers');
			}
			
			// The first argument is the visitor
			var visitor = args[0];

			var fn = visitor[name];

			
			var tmp = Array.prototype.slice.call(args, 1);
			var xargs = [self].concat(tmp);
			//console.log('xargs', xargs.length, xargs);
			
			//debugger;
			var result = fn.apply(visitor, xargs);
			
			return result;
		},
		
		getVarsMentioned: function() {
			throw 'Not overridden';
		},
		
		toString: function() {
			return 'override me';
		}
	});
	

	ns.PatternLiteral = Class.create(ns.Pattern, {
		initialize: function(expr) {
			this.expr = expr;
		},

		getExpr: function() {
			return this.expr;
		},
		
		accept: function(visitor) {
			var result = this.callVisitor('visitLiteral', this, arguments);
			return result;
		},
		
		getVarsMentioned: function() {
			var result = this.expr.getVarsMentioned();
						
			return result;
		},
		
		toString: function() {
			return '' + this.expr;
		}
	});


	ns.PatternObject = Class.create(ns.Pattern, {
		initialize: function(members) {
			this.members = members;
		},
	
		getMembers: function() {
			return this.members;
		},
			
//		accept: function(visitor) {
//			var result = visitor.visitObject(this, arguments);
//			return result;
//		}
		accept: function(visitor) {
			var result = this.callVisitor('visitObject', this, arguments);
			return result;
		},
		
		getVarsMentioned: function() {
			var result = [];
			_.each(this.members, function(member, k) {
				result = _.union(result, member.getVarsMentioned());	
			});
			
			return result;		
		},

		toString: function() {
			var parts = [];
			_(this.members).each(function(v, k) { parts.push('"' + k + '": ' + v); });
			
			var result = '{' + parts.join(',') + '}';
			return result;
		}
	});
	
	
	
	
	
	
	ns.PatternCollection = Class.create(ns.Pattern, {
		initialize: function(itemPattern, type) {
			// type is either array or map
			this.itemPattern = itemPattern;
			this.type = type;
		},
		
		getType: function() {
			return this.type;
		},
		
		getItemPattern: function() {
			return this.itemPattern;
		},
		
		accept: function(visitor) {
			var result = this.callVisitor('visitCollection', this, arguments);
			return result;
		},
		
		getVarsMentioned: function() {
			var result = this.itemPattern.getVarsMentioned();
			return result;
		},
		
		toString: function() {
			var result = '[' + this.itemPattern + ' / ' + this.type + ']';
			return result;
		}
	});

	
	ns.PatternReference = Class.create(ns.Pattern, {
		
	});
	
	
//	ns.PatternMap = Class.create(ns.Pattern, {
//		accept: function(visitor) {
//			var result = visitor.visitMap(this, arguments);
//			return result;
//		}
//	});

	
	/**
	 * A Holder is an object that can deal with incremental settings of values
	 * and returning a JSON representation of its state.
	 * 
	 * A Holder can correspond to a single value (that can not be overwritten with a different value),
	 * an array, or an object.
	 * 
	 * Upon a call to finalize, the holder may post-process its data such that a call to
	 * toJson yields the final result.
	 * 
	 * The behavior of toJson before a call to finalize is undefined.  
	 * 
	 */
	ns.Holder = Class.create({
		
		finalize: function() {
			
		},
		
		toJson: function() {
			throw "Not overridden";
		}
	});

	
	ns.HolderNode = Class.create(ns.Holder, {
		initialize: function() {
			this.node = null;
		},
		
		setValue: function(node) {
			var n = this.node;
			if(n != null && !n.equals(node)) {
				
				console.log('Value already set. Attempted to overwrite ' + n + ' with ' + node);
				throw 'Bailing out';
			}
			
			this.node = node;
		},
		
		getValue: function() {
			return this.node;
		},
		
		toJson: function() {
			var result;
			
			var node = this.node;
			if(node == null) {
				result = null
			} else if(node.isUri()) {
				result = node.getUri();
			} else {
				result = node.getLiteralValue();
			}
			
			return result;
		}
	});
	

	/**
	 * A datastructure for a *single* object
	 * Each attribute can only have a single holder
	 * 
	 */
	ns.HolderObject = Class.create(ns.Holder, {
		initialize: function() {
			this.attrToHolder = {};
			
			this.idAttr = 'id';
			// this.pattern = pattern;
		},
		
		getHolder: function(attr) {
			return this.attrToHolder[attr];
		},
		
		putHolder: function(attr, holder) {
			var h = this.attrToHolder[attr];
			if(h) {
				throw 'Holder already set for ' + attr;
			}
			
			this.attrToHolder[attr] = holder;
		},
		
		toJson: function() {
			var result = {};
			
			var members = this.attrToHolder;
			for (var property in members) {
			    if (members.hasOwnProperty(property)) {
			    	var holder = members[property];
			    	if(holder) {
			    		//console.log('holder: ' + JSON.stringify(holder));
			    		
			    		var json = holder.toJson();
			    		result[property] = json;
			    	}
			    }
			    
			}
			
			return result;
		}
	});

	
	/**
	 * A holder for creating an array of arrays
	 * 
	 * TODO To be done.
	 */
	ns.HolderArrayArray = Class.create(ns.Holder, {
		
	});
	
	
	// An array of literals. Each literal can appear multiple times
	// TODO Support uniqness
	ns.HolderArrayLiteral = Class.create(ns.Holder, {
		initialize: function() {
			this.holders = [];
		},
		
		addHolder: function(holder) {
			this.holders.push(holder);
		},
		
		toJson: function() {
			var result = [];
			
			var holders = this.holders;
			for(var i = 0; i < holders.length; ++i) {
				var holder = holders[i];
				
				var data = holder.toJson();
				result.push(data);
			}
			
			return result;
		}
	});
	
	
	// An array of objects can only hold each object once. 
	ns.HolderArrayObject = Class.create(ns.Holder, {
		initialize: function(type) {
			//this.pattern = pattern;
			this.type = type;
			
			this.holders = [];
			
			this.keyToIndex = {};
		},
		
		putHolder: function(key, holder) {
			//debugger;
			if(key == null) {
				console.log('key must not be null');
				throw 'Bailing out';
			}
			
			var index = this.keyToIndex[key];
			if(index) {
				console.log('Index already existed');
				throw 'Bailing out';
			}
			
			index = this.holders.length;
			this.holders.push(holder);
			
			this.keyToIndex[key] = index;
		},
		
		getHolderByKey: function(key) {
			var index = this.keyToIndex[key];
			
			var result = (index == null) ? null : this.holders[index];
			
			return result;
		},
		
		getHolders: function() {
			return this.holders; 
		},
		
		toJson: function() {
			var result;
			var type = this.type;
			if(type == 'array') {
				result = this.toJsonArray();
			} else if(type == 'map') {
				result = this.toJsonMap();
			} else {
				console.log('[ERROR] Unknown type for json serialization');
				throw 'Bailing out';
			}
			
			return result;
		},
		
		toJsonArray: function() {
			var result = [];
			//debugger;

			var holders = this.holders;
			for(var i = 0; i < holders.length; ++i) {
				var holder = holders[i];
				
				var data = holder.toJson();
				result.push(data);
			}
			
			return result;
		},
		
		toJsonMap: function() {
			var result = {};
			
			var holders = this.holders;
			var keyToIndex = this.keyToIndex;
			
			for (var key in keyToIndex) {
			    if (keyToIndex.hasOwnProperty(key)) {
			    	var index = keyToIndex[key];
			    	
			    	var holder = holders[index];
			    	
			    	var data = holder.toJson();
			    	result[key] = data;
			    }
			}
			
			return result;			
		}
	});
	
	ns.HolderArrayLiteral
	
	
	/**
	 * The pattern classes are just a blue print, no actual
	 * data is associated with them.
	 *
	 * Now the thing is, that when we instanciate an object or a map
	 * (both use the id attribute), we also need to allocate the appropriate fields
	 * for these objects already ... don't we?
	 * 
	 * 
	 * 
	 * 
	 *
	 * Essentially, wherever we have an expression,
	 * 
	 * 
	 * expression
	 * field
	 * 
	 * 
	 * 
	 * 
	 */
	ns.PatternVisitorData = Class.create({
		
		initialize: function(rootPattern) {
			this.rootPattern = rootPattern;
			this.rootField = new ns.FieldSimple();
			
			this.exprEvaluator = new ns.ExprEvaluator();
		},
		
		getJson: function() {
			var rootHolder = this.rootField.getHolder();
			
			var result;
			if(rootHolder) {
				result = rootHolder.toJson();
			} else {
				result = null;
			}
			
			return result;
		},
		
		/**
		 * Invoke this repeatedly with different bindings to
		 * populate the result according to the pattern 
		 * 
		 */
		instantiate: function(binding) {
			this.rootPattern.accept(this, binding, this.rootField);
			
			//var result = field.getValue();			
			//return result;
		},

		
		visitLiteral: function(pattern, binding, field) {

			var holder = field.getHolder();
			if(!holder) {
				holder = new ns.HolderNode();
				//console.log('literal field ' + JSON.stringify(field));
				field.setHolder(holder);
			}

			var expr = pattern.getExpr();
			
			var node = this.exprEvaluator.eval(expr, binding);
			holder.setValue(node);


			/*
			var val;
			if(node == null) {
				val = null;
			} else if(node.isUri()) {
				val = node.getUri();
			} else if(node.isLiteral()) {
				val = node.getLiteralValue();
			} else {
				throw "Not implemented yet";
			}
			
			if(_(val).isUndefined()) {
				val = null;
			}

			console.log('val ' + val + ' for ' + node + ' from ' + expr);
			*/
			
		},		
		
		
		visitCollection: function(pattern, binding, field) {

			var itemPattern = pattern.getItemPattern();
			
			var itemType;
			if(itemPattern instanceof ns.PatternObject) {
				itemType = 'object';
			} else if(itemPattern instanceof ns.PatternLiteral) {
				itemType = 'literal';
			} else {
				console.log('[ERROR] Unsupported array subscript type ', itemPattern);
				throw 'Bailing out';
			}
			
			
			//console.log('Item type', itemType);

			var holder = field.getHolder();
			if(!holder) {
				var type = pattern.getType();

				if(itemType == 'object') {
					holder = new ns.HolderArrayObject(type);					
				}
				else if(itemType == 'literal') {
					holder = new ns.HolderArrayLiteral();
				}					
				else {
					throw 'Unsupported pattern type for array';
				}
				
				field.setHolder(holder);
			}
			//console.log('literal field ' + JSON.stringify(field));

			// If the itemPattern is an object, we need to evaluate its id
			// as to choose the right holder
			
			if(itemType == 'object') {
				var idAttr = 'id';
				var idField = new ns.FieldSimple();
				var members = itemPattern.getMembers();
				var idPattern = members[idAttr];
				if(idPattern == null) {
					console.log('[ERROR] No id given in ' + JSON.stringify(itemPattern));
					throw 'Bailing out';
				}
				
				idPattern.accept(this, binding, idField);
				var idHolder = idField.getHolder();
				var id = idHolder.getValue();
				
				// Get the holder (if it exists)
				//debugger;
				var itemHolder = holder.getHolderByKey(id);
				
				if(itemHolder == null) {
					itemHolder = new ns.HolderObject();
					holder.putHolder(id, itemHolder);
				}
				
				// The field has a holder already preset
				
				//var itemField = new ns.FieldObject(itemHolder);
				var itemField = new ns.FieldSimple(itemHolder);
				itemPattern.accept(this, binding, itemField);
				
				//console.log('got', JSON.stringify(itemHolder.toJson()));
			}
			else {
				
				throw 'implement me';
				
			}
			
			// If the itemPattern is an objectPattern, we need to get a prior created instance of it
		},
		
		// An array of objects (based on the id attribute)
//		visitArray: function(pattern, binding, field) {
//			var holder = field.getHolder(); 
//			
//			if(!holder) {
//				holder = new ns.HolderObjectMap();
//				field.setValue(holder);
//			}
//			
//			
//		},
		
		// A map of objects (based on the id attribute)
//		visitObjectMap: function(pattern, binding, field) {
//			
//		},
		
		
		/**
		 * Objects are managed using a map from the id to their id.
		 * { 'foo': { id: 'foo' ... } } 
		 * 
		 * 
		 * 
		 */
		visitObject: function(pattern, binding, field) {

			var holder = field.getHolder(); 
			
			if(!holder) {
				holder = new ns.HolderObject();
				field.setHolder(holder);
			}
			
			
			var members = pattern.getMembers();

			var idAttr = 'id';

			// Evaluate the id of the expression
//			var idField = new ns.FieldSimple();
//			var idPattern = members[idAttr];
//			idPattern.accept(this, binding, idField);
//			var idHolder = idField.getHolder();
//			var id = idHolder.getValue();

			// Check the holder if it already contains the id 			
//			holder.put('id', idHolder);

			// TODO: A field
			
//			var idPattern = members['id'];
//			var idHolder = idPattern.accept(this, binding);
//			var id = idHolder.getValue();
			
			// Check if there already is an object with this id.
			

			
			for (var property in members) {
			    if (members.hasOwnProperty(property)) {

			    	var pattern = members[property];
			    	var f = new ns.FieldObject(holder, property);

			    	pattern.accept(this, binding, f);
			    	
			    	
			    	// NOTE Why can't we just do:
			    	// (a) "members[property] = pattern.accept(....)"
			    	//     There may already exist a value for the property - how to add the new one?
			    	// members[property] = new holder();  - then pass the holder instead of field
			    	//     In this case the parent has to know what holder the children require
			    }
			}
			
			// Now that we have evaluated all expressions of the object,
			// 
			
	    	//console.log('visitObject', result);
			
			//field.setValue(result);
			//return result;

		},
		
		visitMap: function() {
			
		}
		
	});
	
	
//	ns.PatternVisitorInstantiate = function() {
//		
//		this.exprEvaluator = new ns.ExprEvaluator();
//		//console.log('wtf is ', this);
//		//throw "out";
//	};
//	
//	ns.PatternVisitorInstantiate.prototype = {
//
//		instantiate: function(pattern, binding) {
//			
//			
//			// Create a dummy object; the final pattern will be stored in the 'dummy' attribute
//			//var field = new ns.FieldObject({}, 'dummy');
//			var field = new ns.FieldSimple();
//			
//			pattern.accept(this, binding, field);
//			
//			var result = field.getValue();
//			
//			return result;
//		},
//			
//		visitLiteral: function(pattern, binding, field) {
//			var expr = pattern.getExpr();
//			
//			var node = this.exprEvaluator.eval(expr, binding);
//			
//			var val;
//			if(node == null) {
//				val = null;
//			} else if(node.isUri()) {
//				val = node.getUri();
//			} else if(node.isLiteral()) {
//				val = node.getLiteralValue();
//			} else {
//				throw "Not implemented yet";
//			}
//			
//			if(_(val).isUndefined()) {
//				val = null;
//			}
//
//			console.log('val ' + val + ' for ' + node + ' from ' + expr);
//			
//			field.setValue(val);
//		},
//
//		visitObject: function(pattern, binding, field) {
//			var result = {};
//			//debugger;
//			var members = pattern.getMembers();
//			
//			for (var property in members) {
//			    if (members.hasOwnProperty(property)) {
//
//			    	var pattern = members[property];
//			    	var f = new ns.FieldObject(result, property);
//
//			    	pattern.accept(this, binding, f);
//			    }
//			}
//	    	//console.log('visitObject', result);
//			
//			field.setValue(result);
//			//return result;
//		},
//			
//		visitArray: function(pattern, binding, field) {
//			
//		},
//				
//		visitMap: function(pattern, binding, field) {
//			
//		}
//
//	};
		
	
		
	ns.JsItemType = {
		LITERAL: 'Literal',
		ARRAY: 'Array',
		OBJECT: 'Object'
	};

	
	ns.JsItem = function(itemType) {
		this.itemType = itemType;
	};
	
	
	/**
	 * 
	 */
	ns.JsItemObject = function(fields) {
		this.idKey = 'id';

		this.itemType = ns.JsItemType.OBJECT;
		this.fields = fields ? fields : {};
	};
	
	// TODO Mabe treat the id such as an ordinary field
	ns.JsItemObject.protoype = {
		getId: function() {
			var result = this.fields[this.idKey];
			return result;
		},
		
		getFields: function() {
			return this.fields;
		}
	};
	
	/**
	 * An array field can hold any field type as a sub field.
	 * 
	 * ['?x', '?i']
	 * [['?v', '?j'], '?i']
	 * 
	 */
	ns.JsItemArray = function(subItem, indexExpr) {
		this.item = subItem;
		this.indexExpr = indexExpr;
	};

	
	/**
	 * A simple item that corresponds to a literal value
	 * 
	 */
	ns.JsItemLiteral = function() {
		this.expr = expr;		
	};

	
	ns.ParserTemplate = function() {
		
	};
	
	ns.ParserTemplate.prototype = {
		/**
		 * An array is used for two purposes:
		 * (a) Specifying a collection type - List or Map
		 * (b) Defining a reference
		 *
		 * (a)
		 * [pattern, config?]
		 * 
		 * (b)
		 * [null, config]
		 * 
		 */
		parseArray: function(val) {
			var pattern;
			var config;

			if(val.length == 1) {
				pattern = val[0];
				config = {};
			}
			else if(val.length == 2) {
				pattern = val[0];
				config = val[1];
			}
			
			var isRef = false;
			
			var result;
			if(isRef) {
				
			}
			else {
				result = this.parseArrayCollection(pattern, config);
			}
			
			
			//var result = new ns.JsObjectArray(obj, indexExpr);
			return result;
		},

		parseArrayCollection: function(pattern, config) {

			// type can be array or map
			var type = config.type ? config.type : 'array';

//			if(type == 'array') {
//				
//			}
//			else if(type == 'map') {
//				
//			}
//			else {
//				console.log('[ERROR] Unsupported type ' + type);
//				throw 'Bailing out';
//			}
			
			var subPattern = this.parsePattern(pattern);
			var result = new ns.PatternCollection(subPattern, type);
			
			//alert(JSON.stringify(result));
			
			return result;
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
			
			var members = {};
			
			for (var property in val) {
			    if (val.hasOwnProperty(property)) {

			    	var v = val[property];
			    	var member = this.parsePattern(v); 
			    	
			    	members[property] = member;
			    	//var fieldName = field.getName();
			    	//fields[fieldName] = field;
			    }
			}
			
			var result = new ns.PatternObject(members);
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
		
		parsePattern: function(val, template) {
			
			template = template ? template : new ns.Template();
			
			var result;
			
			if(_(val).isString()) {
				result = this.parseLiteral(val);
			}
			else if(_(val).isArray()) {
				result = this.parseArray(val);
			}
			else if(_(val).isObject()) {
				result = this.parseObject(val);
			}
			else {
				throw "Unkown item type";
			}

			
			return result;
		},
					
			
		parseExpr: function(obj) {
			var result;
			
			if(_.isString(obj)) {
				result = this.parseExprString(obj);
			}
			
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
		
	};
	
	
	
	
	/**
	 * A Schema specifies the fields and types of a JSON object.
	 * Schemas serve two purposes related to the merging of overlays:
	 * 
	 * - Validation: The objects being merged need to adhere to the schema
	 * - Semantics: Declarations in the schema control how to apply a merge, such as
	 *              whether arrays should be made unique. 
	 * 
	 * For example, if a field is declared to be an array, 
	 *
	 * Field types are:
	 *   Simple 
	 *   Array
	 *   Object
	 *
	 *
	 */
	ns.Schema = function() {
		
	};
	
	ns.Schema.prototype = {
		declareField: function(fieldName) {
			
		},
		
		/**
		 * foo.bar
		 * 
		 */
		getField: function(fieldName) {
			
		}
	};
	

	/**
	 * A merger creates a JSON object from
	 * incrementally applying overlays to it.
	 *  
	 * Once an overlay was applied, it cannot be removed anymore.
	 * 
	 */
	ns.Merger = function(schema) {
		this.schema = schema;

		this.data = {};
	};
	
	ns.Merger.prototype = {
		/**
		 * Apply the given json object as an overlay to any prior data.
		 * 
		 */
		applyOverlay: function(json) {
			// Recursively? iterate the schema 
		},
		
		/**
		 * Retrieve the data that was generated from applying the overlays
		 * 
		 */
		getData: function() {
			return this.data;
		}
	};
	
	
	/**
	 * A DocMapping specifies how to create a JSON document from a SPARQL Binding 
	 * 
	 * 
	 * 
	 */
	ns.DocMapping = function() {
		
	};
	
	ns.DocMapping.protoype = {
		/**
		 * Creates a JSON object according to the binding
		 * 
		 */
		instantiate: function(binding) {
			
		}	
	};
	

	
	
	/**
	 * 
	 * 
	 */
	ns.Template = function() {
		
		// A map from object identifiers to JsObject's
		this.objects = {};
	};
	
	ns.Template.prototype = {

		/**
		 *  
		 * 
		 */
		instanciate: function(binding) {
			
		}
	};
	
	
	ns.PathAssignment = function(facetNode) {
		this.facetNode = facetNode;
	};
	
	ns.PathAssignment.prototype = {
		//setPath(path, )
			
	};
	
	
	ns.ExprEvaluator = Class.create({
		
		/**
		 * Evaluate an expression with a given binding
		 * 
		 */
		eval: function(expr, binding) {
			//console.log('eval expr' ,expr);
			var result;
			if(expr.isVar()) {
				result = this.evalVar(expr, binding);
			} else if(expr.isConstant()) {
				result = this.evalConstant(expr, binding);
			} else if(expr.isFunction()) {
				result = this.evalFunction(expr, binding);
			} else {
				throw 'Unsupported expr type';
			}
				
			
			return result;
		},
		
		
		evalVar: function(expr, binding) {
			var v = expr.getVar();
			var node = binding.get(v);

			//console.log('Binding.get ' + node + ' for ' + v + ' in ' + binding);

			return node;
		},
		
		evalConstant: function(expr, binding) {
			var node = expr.asNode();
			
			return node;
		},

		// Lookup an function evaluator for the given arguments
		evalFunction: function(expr, binding) {
			throw 'Not implemented yet';
		}
	
	
	});
	
	
	
	/**
	 * A mapping is comprised of:
	 * - A concept
	 * - A jassaTemplate
	 * 
	 * @param concept The SPARQL concept on which to base the mapping
	 * @
	 * 
	 * 
	 * @author Claus Stadler 
	 */
	ns.Mapping = function(concept) {
		this.concept = concept;
		
	};
	
	
	/**
	 * This row processor creates objects from the template
	 * according to the bindings  
	 * 
	 */
	ns.RowProcessorTemplate = function(template) {
		this.template = template;
		
		this.result = {};
	};
	
	ns.RowProcessorTemplate.prototype = {
		process: function(binding) {
			var result = this.result;
			
			var objs = template.getObjects();
			
			for(var i = 0; i < objs.length; ++i) {
				var obj = objs[i];
				
				var idExpr = idExpr.getIdExpr();
				
				var idNode = exprEvaluator.eval(idExpr, binding);
				
				var id = idNode.value;
				
				// get or create the object with the given id				
				var target = result[id];
				if(!target) {
					target = result[id] = {};
					
					target['id'] = id;
				}
								
				// For each of the object's attributes merge them with the target object
				var fields = obj.getFieldDecls();
				for(var i = 0; i < fields.length; ++i) {
					var field = fields[i];
					var fieldName = filed.getName();
					var fieldType = field.getType();

					var targetFv = target[fieldName];
					var sourceExpr = obj[fieldName];
					
					// source Fv is again an expression and needs to be evaluated against the binding
					var idNode = exprEvaluator.eval(idExpr, binding);
					
					// Apply the merge
					switch(fieldtype) {
					case ns.JsItemType.OBJECT:
						if(!targetFv) {
							target[fieldName] = {};
						}
						break;

					case ns.JsItemType.ARRAY:
						throw "Array is not supported yet";
						break;
						
					case ns.JsItemType.LITERAL:
						
						if(!targetFv) {
							target[fieldName] = sourceFv;
						}
						
						if(sourceFv !== targetFv) {
							throw "Error merging field with a different value than before";
						} 
						break;

					default: {
						throw "Unsupported field type";
					}
					}
					
				}
				
				
			}
			
			// Evalute the id expression of each object
			
		},
	
		getResult: function() {
			return this.result;
		}
	};
		
	
	
	/**
	 * Convert raw talis json rdf bindings to proper objects
	 * 
	 */
//	ns.convertTalisJsonRdfBindings = function(talisJsonRdf) {
//		var bindings = talisJsonRdf.result.bindings;
//		
//		var bs = talisJsonRdf.map(function(binding) {
//			return sparql.Binding.createFromTalis(binding);
//		});
//		for(var i = 0; i < bindings.length; ++i) {
//			var binding = bindings[i];
//			
//			var b = 
//		}
//
//		return bs;
//	};	
	
})();




/**
 * A template connects paths from a SPARQL concept with a JSON object
 *
 * Simple Template Syntax:
 * 
 * {
 *   id: '?s',                          ? Indicates a variable expression
 *      // TODO Maybe '>' to indicate empty path? 
 *   type: 'Project',
 *   call: '> http://example.org/',     > Indicates a path expression 
 *   size: '> vocab:size',
 *   partners: [{                       Use array to indicate to create an array of objects
 *     id: '> o:funding',
 *     amount: 'o:funding amount'
 *   }]
 * }
 * 
 * Implicit binding variables: [ '?s' ]
 * 
 * Not needed: '.' indicates the <strong>subject</strong> at that path
 * '^' indicated the <strong>properties</strong> at that path
 * '>' indicates the <strong>objects</strong> at that path
 *
 * The empty path corresponds to the context variable itself.
 * TODO Ambiguity
 * 
 * Internal representation:
 * [{
 *     attribute: 'id',
 *     type: 'simple',
 *     key:    // new PathExpr( NodeValue.makeString('id') ) 
 *     value:  // new PathExpr( new ExprVar(?s), {?s: new Path()} );
 * }, {
 *     attribute: 'partners',
 *     type: 'array'     
 * }]
 * 
 * TODO How to make a part optional?
 * TODO Do we need support for making sub-paths optional?
 * 
 * 
 * How could we have keys as properties? Such as when we want to
 * template = {
 *    id: '.',
 *    '> ^': '>'   // TODO How can we refer to a propertie's corresponding value?
 *                 // Maybe this is not possibly using a path-based approach? With variables we'd just use the variable
 * }
 * 
 * TODO We want each propery's corresponding value(s)
 *      We do NOT want the cross product of properties and values.
 * 
 * We could do something like:
 * > hasFriend (?s ?p o, ?p)      At this path, create a triple with the variables ?s ?p ?o and use ?o
 * Yet, we could then just allow variables is the template.
 * Ok, but here we have the issue that based on the paths we know which triple patterns to generate,
 * but from variables we don't.
 * The idea is, that we can express the required triple patterns as part of the template language.
 * 
 * 
 * 
 * 
 * 
 * Understanding how the template is instanciated:
 * The template is instanciated for each row of the result set.
 * In the background, the data is ordered according to the document id attributes,
 * and Jassa aggregates the templates by means of incremental merging.
 * 
 * 
 * Overlays
 * 
 * 
 * In Sparqlify, a view had 3 components:
 * - The construct template
 * - The var binding
 * - The SQL query
 * 
 *
 * 
 * 
 * Another issue:
 * We have the object-id attribute, but what is the expected behavior when the same id
 * gets generated for objects in different positions of the tree?
 * 
 * For an example, a person has friends and colleges, and some colleges are also friends.
 * 
 * var personTemplate = {
 *     id: '?s',
 *     hasFriend: {
 *         id: '?f',
 *         homePhone: '?h'         
 *     },
 *     hasCollegue: {
 *         id: '?c'
 *         workPhone: '?w'
 *     }
 * }
 * Select ?s ?f ?h ?c ?w { { ?s hasFriend ?f ... } union { ?s hasCollegue ?c ... } }
 * 
 * 
 * Probably the best approach would really be to completely flatten the objects, so that
 * the id uniquely identifies an object regardless of its position in the tree.
 * 
 * It seems that this way we could easily extend objects using multiple overlays - 
 * i.e. having multiple mappings contributing to a single json document.
 * But is this really the case?
 *
 * 
 * var moreFriendData = {
 *     id: '?x',
 *     facebookPage: '?f'
 * };
 * 
 * How can we now link this to our above Json document?
 * 
 * 
 * 
 * 
 * Maybe we should do it like this:
 *
 * 1.) Create an empty json document mapping - such thing only holds an id.
 * var People = createNewDocument({
 *     id: '?s'
 * }, '?s a Person');
 * 
 * 
 *
 * 2.) Extend it with attributes (actually this is very similar to what D2R does with class and property bridges)
 * People.addOptional({
 *     facebookPage: '?f'
 * }, '?? facebookPage ?f') // ?? is a placeholder for the parent concepts variable
 * 
 * People.addOption({
 *     workPhone: '?w'
 * }, '?? workPhone);
 * 
 * 
 * People.createRelation('relName').to(People).using('?? friend ?@'); // ?@ references the target concept's variable
 *
 * TODO Add map and mappedBy attributes
 * context.getRelationBuilder().create('relName')
 *     .manyToMany()
 *     .from(People, 'friends')
 *     .to(People, 'isFriendOf')
 *     .via('?? friend ?@').build(); 
 * 
 * 
 * Here we might have to make a design decision:
 * - The goal of Sponate is, to create JSON documents backed by a SPARQL endpoint (via SPARQL concepts so we get fully fledged faceted search)
 * - a hibernate like approach would allow us to have less of a JSON document, but class model,
 *   where calling a getter would
 *   
 * Well, maybe with Object.defineProperty we could create something similar to hibernate proxies.
 * We could also use eval to 'compile' the proxies
 * 
 * store.list(Person);
 * for(var i = ..) {
 *     var person = ...
 *     person.friends()   // we could do a synchronous call now
 * 
 *
 * yet, this is a somewhat different use case again:
 * with this approach, we could dynamically 'explore' objects -- outside of the document boundaries
 * 
 *
 * 
 * Sync call:
 * function getWhatever() {
  // strUrl is whatever URL you need to call
  var strUrl = "", strReturn = "";

  jQuery.ajax({
    url: strUrl,
    success: function(html) {
      strReturn = html;
    },
    async:false
  });

  return strReturn;
}
 * 
 * 
 * 
 * Another point to consider: Maybe backbone relational or this Associative model thing can be
 * leveraged:
 * 
 * In this case, we would create a pseudo rest API on the client side:
 * - It can consume some identifier and return a json document
 * - whereas the json document is generated using SPARQL queries and mapping them
 * 
 * But with this level of abstraction we lose the ability to do a mongodb like api.
 * 
 * So we want to be able to express relations on a lower level - i.e. on the sparql mapping objects.
 * 
 *  
 *  
 * 
 * 
 */

