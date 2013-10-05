/**
 * JAvascript Suite for Sparql Access (JASSA)
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
 * 
 * - 
 * 
 * 
 * 
 * @author Claus Stadler
 */

(function(ns) {

	//var sparql = require('');
	


// http://snmaynard.com/2012/10/17/things-i-wish-i-knew-about-mongodb-a-year-ago/
// http://docs.mongodb.org/manual/reference/operator/nav-query/
//
//{ tags: { $in: ["appliances", "school"] } },
//{ $set: { sale:true } }
//
// So in general we have {key: {constraint} }
// TODO: We need a special symbol to refer to the key of an object, maybe $id ?
// { $and: [ { price: 1.99 }, { qty: { $lt: 20 } }, { sale: true } ] }
//http://stackoverflow.com/questions/9705065/mongodb-query-on-nested-field-with-index
//)

/**
 * 
 * @param idExpr Expression yielding the mappings id; needed for grouping triples belonging to the same JSON document.
 * @param jsonMapping The raw mapping object
 */
ns.Mapping = function(graphPattern, jsonMapping) {
	this.graphPattern = graphPattern;
	this.jsonMapping = jsonMapping;
};



	
ns.Store = function(sparqlService, mapping) {
	this.sparqlService = sparqlService;
	this.mapping = mapping;
}

ns.Store.prototype = {	
	find: function(query) {
		//this.graphPattern.
		var idExpr = this.fnParseExpr(this.mapping.id);
		
		if(!(idExpr instanceof ExprVar)) {
			throw "Non-variable id expression not supported yet.";
		}
		
		var v = idExpr.getVar();
		
		// Select projVars { { Select Distinct $idExpr$ { graphPattern with constraints } } } Order By idExpr
	}
}




ns.FieldSimple = function(expr) {
	this.expr = expr;
};

ns.FieldSimple.prototype = {
	isArray: function() {
		return false;
	}
}

ns.FieldArray = function(valueExpr, indexExpr) {
	this.valueExpr = valueExpr;
	this.indexExpr = indexExpr;
}
	

ns.parseFieldArray = function(val) {
	
},

ns.parseFieldString = function(val) {
	var expr = ns.parseExprString(val);
	
	var result = new ns.FieldSimple(expr);
	return result;
},
	
ns.parseField = function(val) {
	var result;
	
	if(_(val).isString()) {
		result = ns.parseFieldString(val);
	}
	else if(_(val).isArray()) {
		result = ns.parseFieldArray(val);
	}
	else {
		
	}
	
	return result;
},
	
	
ns.parseExpr = function(obj) {
	var result;
	
	if(_.isString(obj)) {
		result = ns.parseExprString(obj);
	}
	
},

ns.parseExprString: function(str) {
	if(_(str).startsWith('?')) {
		var varName = str.substr(1);
		result = sparql.Node.v(varName);
	} else {
		result = sparql.Node.plainLiteral(str);
	}

	return result;
};


/*
 * Constraints
 * 
 * 
 * 
 * 
 */

ns.Constraint = function() {
	
};

ns.Constraint.prototype = {
	applyTo: function(field) {
		
	}	
};


ns.parseCritera = function(critera) {
	
}


ns.criteraParsers = {
	'field': function() {
		
	},
		
	'$in': function() {
		
	},
	
	'$and': function() {
		
	},
	
	'$set': function() {
		
	},
};
	
	
})(ns);

