/**
 * Core classes of the facet system:
 * 
 * PathManager
 * PathNode
 * 
 * TODO Breadcrumb (encapsulates a path and supports generating a query element from it)
 * 
 */
(function() {

	var sparql = Jassa.sparql;
	var ns = Jassa.facets;
	
	ns.FacetUtils = {
		createTriplesStepProperty: function(step, startVar, endVar) {
			var s = startVar;
			var p = sparql.Node.uri(step.propertyName);
			var o = endVar;
			
			// Swap subject-object if inverse step
			if(step.isInverse()) {
				var tmp = s;
				s = o;
				o = tmp;
			}
			
			
			var triple = new rdf.Triple(s, p, o);
			
			return [triple];
		},
		
		createTriplesStepFacets: function(generator, step, startVar, endVar) {
			
			//console.log("Generator:", generator);
			var s = startVar;
			var p = endVar;
			var o = sparql.Node.v(generator.next()); // TODO Create a new unique var name
			
			// Swap subject-object if inverse step
			if(step.direction < 0) {
				var tmp = s;
				s = o;
				o = tmp;
			}
			
			
			var triple = new rdf.Triple(s, p, o);
			
			return [triple];
			
		}
	};
	

	/**
	 * 
	 * @param variable A variable name (string)
	 * @param nodeFactory
	 * @returns {ns.PathManager}
	 */
	ns.PathManager = Class.create({
		initialize: function(variable, nodeFactory) {
			this.nextVariableId = 1;
			
			if(!nodeFactory) {
				nodeFactory = new ns.PathNodeFactoryDefault();
			}
			
			this.nodeFactory = nodeFactory;
			
			this.root = nodeFactory.create(this, variable); //
		},
	
		newNode: function(variable) {
			if(!variable) {
				variable = this.nextVariable();
			}
			
			return this.nodeFactory.create(this, variable);
		},
	
		getRoot: function() {
			return this.root;
		},
	
	
		nextVariable: function() {
			return "v_" + (this.nextVariableId++);
		},	

		/**
		 * Converts a path string to a list of path elements
		 * 
		 * Variables will be created as needed.
		 * 
		 * e.g.
		 * "fts:beneficiary fts:city owl:sameAs geo:long" 
		 * "fts:beneficiary fts:city owl:sameAs geo:lat"
		 * 
		 * { ?s fts:beneficiary ?v1 . ?v1 fts:city ?v2 . ?v3 owl:sameAs ?v4 . 
		 * Operators:
		 * 
		 * <: Inverse <fts:beneficiary
		 * ^: To property
		 * 
		 * 
		 * @param pathStr
		 */
		toTriples: function(path) {
			var result = this.toTriplesRec(this.root, path);
			
			return result;
		},
		
	
		getNode: function(path) {
			var result = this.root;
	
			//console.log("PATH", path);
			
			var steps = path.getSteps();
	
			for(var i = 0; i < steps.length; ++i) {
				var stepStr = "" + steps[i];
				
				result = result.getOrCreate(stepStr);
			}
			
			return result;
		}
	});

	
	
	/*
	ns.PathManager.prototype.getNode = function(pathStr) {
		var items = pathStr.split(" ");
		
		var result = this.getNodeRec(this.root, items);
		
		return result;
	};
	*/

	
	/* TODO Not used
	ns.PathManager.prototype.toTriplesRec = function(node, path) {
		var result = [];
		
		var steps = path.getSteps();
		
		for(var i = 0; i < steps.length; ++i) {
			var step = steps[i];
			var stepStr = "" + step;
			
			
			var nextNode = node.getOrCreate(stepStr);
			var s = ssb.Node.v(node.variable);
			var p = ssb.Node.uri(step.getPropertyName());
			var o = ssb.Node.v(nextNode.variable);
			
			var triple = new ssb.Triple(s, p, o);
			result.push(triple);

			node = nextNode;
		}
		
		return result;
	};
	*/
	
	
	/**
	 * 
	 * Variable is a string
	 * 
	 * @param variable
	 * @returns {ns.PathNode}
	 */
	ns.PathNode = Class.create({
		initialize: function(pathManager, variable) {
			this.pathManager = pathManager;
			if(!variable) {
				variable = pathManager.nextVariable();
			}
			this.variable = variable;
			
			// A map from property name to another path node
			this.outgoing = {};
	
			this.incoming = {};
		},
	
	
		/*
		ns.PathNode.prototype.toTriple = function(propertyName) {
			//var propertyName = items[offset];
			
			var nextNode = this.getOrCreate(propertyName);
			
			var s = ssb.Node.v(this.variable);
			var p = ssb.Node.uri(propertyName);
			var o = ssb.Node.v(nextNode.variable);
			
			return new ssb.Triple(s, p, o);
		};
		*/
		
		/**
		 * Gets or create a new outgoing node.
		 * 
		 * FIXME The "outgoing" refers to reachable successor via some label.
		 * The label can also indicate an inverse property step. 
		 */
		getOrCreate: function(propertyName) {
			var node = this.outgoing[propertyName];
			if(!node) {
				node = this.pathManager.newNode(); //new ns.PathNode(this.pathManager);
	
				this.outgoing[propertyName] = node;
				node.incoming[propertyName] = this;
			} else {
				// Nothing to do
			}
			
			return node;
		}
	});

	
	/**
	 * A step to the set of facets (properties) of a set of resources
	 * Symbol is ^ 
	 * 
	 * Use <^ or >^ to navigate to incoming/outgoing uris only.
	 * 
	 * 
	 * @param direction: <0 incoming, =0 both; >0 outgoing
	 */
	ns.StepFacet = Class.create({
		initialize: function(direction) {
			this.direction = direction;
		},
	
		toString: function() {
			if(this.direction < 0) {
				return "<^";
			} else if(this.direction > 0) {
				return ">^";
			} else {
				return "^";
			}
		},
		
		equals: function(other) {
			return _.isEqual(this, other);
		}
	});



})();



//ns.PathNodeFactoryDefault = function() {
//};
//
//ns.PathNodeFactoryDefault.prototype.create = function(pathManager, variable) {
//	return new ns.PathNode(pathManager, variable);
//};
//
