(function() {
	
	var ns = Jassa.facete;
	
	/**
	 * ConstraintSpecs can be arbitrary objects, however they need to expose the
	 * declared paths that they affect.
	 * DeclaredPaths are the ones part of spec, affectedPaths are those after considering the constraint's sparql element. 
	 * 
	 */
	ns.ConstraintSpec = Class.create({
		getName: function() {
			throw "Override me";
		},
		
		getDeclaredPaths: function() {
			throw "Override me";
		}
	});
	

	/**
	 * The class of constraint specs that are only based on exactly one path.
	 * 
	 * Offers the method getDeclaredPath() (must not return null)
	 * Do not confuse with getDeclaredPaths() which returns the path as an array
	 * 
	 */
	ns.ConstraintSpecSinglePath = Class.create(ns.ConstraintSpec, {
		initialize: function(name, path) {
			this.name = name;
			this.path = path;
		},
		
		getName: function() {
			return this.name;
		},
		
		getDeclaredPaths: function() {
			return [this.path];
		},
		
		getDeclaredPath: function() {
			return this.path;
		}
	});


	ns.ConstraintSpecPath = Class.create(ns.ConstraintSpecSinglePath, {
		initialize: function($super, name, path) {
			$super(name, path);
		}
	});
	
	ns.ConstraintSpecPathValue = Class.create(ns.ConstraintSpecSinglePath, {
		initialize: function($super, name, path, value) {
			$super(name, path);
			this.value = value;
		},

		getValue: function() {
			return this.value;
		}
	});
	
	
	/**
	 * Not used yet; its only here as an idea.
	 * 
	 * A specification based on a sparql expression.
	 * The variables of this expression can be either mapped to paths or to values.  
	 * 
	 * These mappings must be disjoint.
	 * 
	 */
	ns.ConstraintSpecExpr = Class.create(ns.ConstraintSpec, {
		/**
		 * expr: sparql.Expr
		 * varToPath: util.Map<Var, Path>
		 * varToNode: sparql.Binding
		 */
		initialize: function(expr, varToPath, varToNode) {
			this.expr = expr;
			this.varToPath = varToPath;
			this.varToNode = varToNode;
		},
		
		getPaths: function() {
			// extract the paths from varToPath
		}
	});
	
//	ns.ConstraintSpecBBox = Class.create(ns.ConstraintSpecSinglePath, {
//		
//	});
	
	
	
})();

