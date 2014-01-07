(function() {

	var sparql = Jassa.sparql;
	
	var ns = Jassa.facete;


	/**
	 * A class for generating variables for step-ids.
	 * So this class does not care about the concrete step taken.
	 * 
	 * @param variableName
	 * @param generator
	 * @param parent
	 * @param root
	 * @returns {ns.VarNode}
	 */
	ns.VarNode = Class.create({
		initialize: function(variableName, generator, stepId, parent, root) {
			this.variableName = variableName;
			this.generator = generator;
			this.stepId = stepId; // Null for root
			this.parent = parent;
			this.root = root;
			
			
			//console.log("VarNode status" , this);
			if(!this.root) {
				if(this.parent) {
					this.root = parent.root;
				}
				else {
					this.root = this;
				}
			}
	
			
			this.idToChild = {};
		},

		isRoot: function() {
			var result = this.parent ? false : true;
			return result;
		},

		/*
		getSourceVarName: function() {
			var result = this.root.variableName;
			return result;
		},
		*/
		
		getVariableName: function() {
			return this.variableName;
		},
		
		/*
		forPath: function(path) {
			var steps = path.getSteps();
			
			var result;
			if(steps.length === 0) {
				result = this;
			} else {
				var step = steps[0];
				
				// TODO Allow steps back
				
				result = forStep(step);
			}
			
			return result;
		},
		*/

		getIdStr: function() {
			var tmp = this.parent ? this.parent.getIdStr() : "";
			
			var result = tmp + this.variableName;
			return result;
		},

		getStepId: function(step) {
			return "" + JSON.stringify(step);
		},
		
		getSteps: function() {
			return this.steps;
		},
			
		/**
		 * Convenience method, uses forStep
		 * 
		 * @param propertyUri
		 * @param isInverse
		 * @returns
		 */
		forProperty: function(propertyUri, isInverse) {
			var step = new ns.Step(propertyUri, isInverse);
			
			var result = this.forStep(step);

			return result;
		},

		forStepId: function(stepId) {
			var child = this.idToChild[stepId];
			
			if(!child) {
				
				var subName = this.generator.next();
				child = new ns.VarNode(subName, this.generator, stepId, this);
				
				//Unless we change something
				// we do not add the node to the parent
				this.idToChild[stepId] = child;				
			}
			
			return child;
		},
		
		/*
		 * Recursively scans the tree, returning the first node
		 * whose varName matches. Null if none found.
		 * 
		 * TODO: Somehow cache the variable -> node mapping 
		 */
		findNodeByVarName: function(varName) {
			if(this.variableName === varName) {
				return this;
			}
			
			var children = _.values(this.idToChild);
			for(var i = 0; i < children.length; ++i) {
				var child = children[i];

				var tmp = child.findNodeByVarName(varName);
				if(tmp) {
					return tmp;
				}
			}
			
			return null;
		}
	});

	
	/**
	 * This class only has the purpose of allocating variables
	 * and generating elements.
	 * 
	 * The purpose is NOT TO DECIDE on which elements should be created.
	 * 
	 * 
	 * @param parent
	 * @param root
	 * @param generator
	 * @returns {ns.FacetNode}
	 */
	ns.FacetNode = Class.create({
		initialize: function(varNode, step, parent, root) {
			this.parent = parent;
			this.root = root;
			if(!this.root) {
				if(this.parent) {
					this.root = parent.root;
				}
				else {
					this.root = this;
				}
			}
	
			
			this.varNode = varNode;
			
			/**
			 * The step for how this node can be  reached from the parent
			 * Null for the root 
			 */
			this.step = step;
	
	
			this._isActive = true; // Nodes can be disabled; in this case no triples/constraints will be generated
			
			this.idToChild = {};
			
			//this.idToConstraint = {};
		},

		getRootNode: function() {
			return this.root;
		},
			
		isRoot: function() {
			var result = this.parent ? false : true;
			return result;
		},
		
		/*
		getVariableName: function() {
			return this.varNode.getVariableName();
		},*/
		
		getVar: function() {
			var varName = this.varNode.getVariableName();
			var result = sparql.Node.v(varName);
			return result;			
		},
		
		getVariable: function() {
			if(!this.warningShown) {				
				//console.log('[WARN] Deprecated. Use .getVar() instead');
				this.warningShown = true;
			}

			return this.getVar();
		},
		
		getStep: function() {
			return this.step;
		},
		
		getParent: function() {
			return this.parent;
		},
		
		getPath: function() {
			var steps = [];
			
			var tmp = this;
			while(tmp != this.root) {
				steps.push(tmp.getStep());
				tmp = tmp.getParent();
			}
			
			steps.reverse();
			
			var result = new ns.Path(steps);
			
			return result;
		},
		
		forPath: function(path) {
			var steps = path.getSteps();
			
			var result = this;
			_.each(steps, function(step) {
				// TODO Allow steps back
				result = result.forStep(step);
			});
			
			return result;
		},		

		getIdStr: function() {
			// TODO concat this id with those of all parents
		},
		
		getSteps: function() {
			return this.steps;
		},
		
		getConstraints: function() {
			return this.constraints;
		},
		
		isActiveDirect: function() {
			return this._isActive;
		},
				
		
		/**
		 * Returns an array having at most one element.
		 * 
		 * 
		 */
		getElements: function() {
			var result = [];
			
			var triples = this.getTriples();
			if(triples.length > 0) {
				var element = new sparql.ElementTriplesBlock(triples);
				result.push(element);				
			}
			
			
			return result;
		},
		
		/**
		 * Get triples for the path starting from the root node until this node
		 * 
		 * @returns {Array}
		 */
		getTriples: function() {
			var result = [];			
			this.getTriples2(result);
			return result;
		},
		
		getTriples2: function(result) {
			this.createDirectTriples2(result);
			
			if(this.parent) {
				this.parent.getTriples2(result);
			}
			return result;			
		},

		/*
		createTriples2: function(result) {
			
		},*/
		
		createDirectTriples: function() {
			var result = [];
			this.createDirectTriples2(result);
			return result;
		},
				
		
		
		/**
		 * Create the element for moving from the parent to this node
		 * 
		 * TODO Cache the element, as the generator might allocate new vars on the next call
		 */
		createDirectTriples2: function(result) {
			if(this.step) {
				var sourceVar = this.parent.getVariable();
				var targetVar = this.getVariable();
				
				var tmp = this.step.createElement(sourceVar, targetVar, this.generator);
				
				// FIXME
				var triples = tmp.getTriples();
				
				result.push.apply(result, triples);
				
				//console.log("Created element", result);
			}
			
			return result;
			
			/*
			if(step instanceof ns.Step) {
				result = ns.FacetUtils.createTriplesStepProperty(step, startVar, endVar);
			} else if(step instanceof ns.StepFacet) {
				result = ns.FacetUtils.createTriplesStepFacets(generator, step, startVar, endVar);
			} else {
				console.error("Should not happen: Step is ", step);
			}
			*/
		},
		
		isActive: function() {
			if(!this._isActive) {
				return false;
			}
			
			if(this.parent) {
				return this.parent.isActive();
			}
			
			return true;
		},
		
		attachToParent: function() {
			if(!this.parent) {
				return
			}
			
			this.parent[this.id] = this;			
			this.parent.attachToParent();
		},
		
		/*
		hasConstraints: function() {
			var result = _.isEmpty(idToConstraint);
			return result;
		},
		
		// Whether neither this nor any child have constraints
		isEmpty: function() {
			if(this.hasConstraints()) {
				return false;
			}
			
			var result = _.every(this.idConstraint, function(subNode) {
				var subItem = subNode;
				var result = subItem.isEmpty();
				return result;
			});
			
			return result;
		},
		*/
			
		/**
		 * Convenience method, uses forStep
		 * 
		 * @param propertyUri
		 * @param isInverse
		 * @returns
		 */
		forProperty: function(propertyUri, isInverse) {
			var step = new ns.Step(propertyUri, isInverse);
			
			var result = this.forStep(step);

			return result;
		},
			
		forStep: function(step) {
			//console.log("Step is", step);
			
			var stepId = "" + JSON.stringify(step);
			
			var child = this.idToChild[stepId];
			
			if(!child) {
				
				var subVarNode = this.varNode.forStepId(stepId);
				
				child = new ns.FacetNode(subVarNode, step, this, this.root);
				
				/*
				child = {
						step: step,
						child: facet
				};*/
				
				//Unless we change something
				// we do not add the node to the parent
				this.idToChild[stepId] = child;				
			}

			return child;
		},
		
		/**
		 * Remove the step that is equal to the given one
		 * 
		 * @param step
		 */
		/*
		removeConstraint: function(constraint) {
			this.constraints = _.reject(this.constraints, function(c) {
				_.equals(c, step);
			});
		},
		
		addConstraint: function(constraint) {
			this.attachToParent();
			
			var id = JSON.stringify(constraint); //"" + constraint;

			// TODO Exception if the id is object
			//if(id == "[object]")
			
			this.idToConstraint[id] = constraint;
		},
		*/
		
		/**
		 * Copy the state of this node to another one
		 * 
		 * @param targetNode
		 */
		copyTo: function(targetNode) {
			//targetNode.variableName = this.variableName;
			
			_.each(this.getConstraints(), function(c) {
				targetNode.addConstraint(c);
			});			
		},
		
		
		/**
		 * 
		 * 
		 * @returns the new root node.
		 */
		copyExclude: function() {
			// Result is a new root node
			var result = new ns.FacetNode();
			console.log("Now root:" , result);
			
			this.root.copyExcludeRec(result, this);
			
			return result;
		},
			
		copyExcludeRec: function(targetNode, excludeNode) {
			
			console.log("Copy:", this, targetNode);
			
			if(this === excludeNode) {
				return;
			}
			
			this.copyTo(targetNode);
			
			_.each(this.getSteps(), function(s) {
				var childStep = s.step;
				var childNode = s.child;
				
				console.log("child:", childStep, childNode);
				
				if(childNode === excludeNode) {
					return;
				}
				
				
				
				var newChildNode = targetNode.forStep(childStep);
				console.log("New child:", newChildNode);
				
				childNode.copyExcludeRec(newChildNode, excludeNode);
			});			

			
			//return result;
		}
	});


	/**
	 * Use this instead of the constructor
	 * 
	 */
	ns.FacetNode.createRoot = function(v, generator) {

		var varName = v.getName();
		generator = generator ? generator : new sparql.GenSym("fv");
		
		var varNode = new ns.VarNode(varName, generator);		
		var result = new ns.FacetNode(varNode);
		return result;
	};

	
	/**
	 * The idea of this class is to have a singe object
	 * for all this currently rather distributed facet stuff
	 * 
	 * 
	 * 
	 */
	ns.FacetManager = Class.create({
		initialize: function(varName, generator) { //rootNode, generator) {
			
			var varNode = new ns.VarNode(varName, generator);
			
			this.rootNode = new ns.FacetNode(varNode);
	
			//this.rootNode = rootNode;
			this.generator = generator;
		},
	
			/*
			create: function(varName, generator) {
				var v = checkNotNull(varName);
				var g = checkNotNull(generator);
				
				var rootNode = new ns.FacetNode(this, v);
				
				var result = new ns.FacetManager(rootNode, g);
				
				return result;
			},*/
		
		getRootNode: function() {
			return this.rootNode;
		},
		
		getGenerator: function() {
			return this.generator;
		}
	});
	
	
	/**
	 * Ties together a facetNode (only responsible for paths) and a constraint collection.
	 * Constraints can be declaratively set on the facade and are converted to
	 * appropriate constraints for the constraint collection.
	 * 
	 * e.g. from
	 * var constraint = {
	 * 	type: equals,
	 * 	path: ...,
	 * 	node: ...}
	 * 
	 * a constraint object is compiled.
	 * 
	 * 
	 * @param constraintManager
	 * @param facetNode
	 * @returns {ns.SimpleFacetFacade}
	 */
	ns.SimpleFacetFacade = Class.create({
		initialize: function(constraintManager, facetNode) {
			this.constraintManager = constraintManager;
			//this.facetNode = checkNotNull(facetNode);
			this.facetNode = facetNode;
		},

		getFacetNode: function() {
			return this.facetNode;
		},
		
		getVariable: function() {
			var result = this.facetNode.getVariable();
			return result;
		},
		
		getPath: function() {
			return this.facetNode.getPath();
		},
		
		forProperty: function(propertyName, isInverse) {
			var fn = this.facetNode.forProperty(propertyName, isInverse);
			var result = this.wrap(fn);
			return result;								
		},
		
		forStep: function(step) {
			var fn = this.facetNode.forStep(step);
			var result = this.wrap(fn);
			return result;				
		},
		
		wrap: function(facetNode) {
			var result = new ns.SimpleFacetFacade(this.constraintManager, facetNode);
			return result;
		},
		
		forPathStr: function(pathStr) {
			var path = ns.Path.fromString(pathStr);
			var result = this.forPath(path);
			
			//console.log("path result is", result);
			
			return result;
		},
		
		forPath: function(path) {
			var fn = this.facetNode.forPath(path);
			var result = this.wrap(fn);
			return result;
		},

		createConstraint: function(json) {
			if(json.type != "equals") {
				
				throw "Only equals supported";
			}
			
			var node = json.node;

			//checkNotNull(node);
			
			var nodeValue = sparql.NodeValue.makeNode(node);
			var result = ns.ConstraintUtils.createEquals(this.facetNode.getPath(), nodeValue);
			
			return result;
		},
		
		/**
		 * 
		 * Support:
		 * { type: equals, value: }
		 * 
		 * 
		 * @param json
		 */
		addConstraint: function(json) {
			var constraint = this.createConstraint(json);				
			this.constraintManager.addConstraint(constraint);
		},
		
		removeConstraint: function(json) {
			var constraint = this.createConstraint(json);
			this.constraintManager.moveConstraint(constraint);				
		},
		
		// Returns the set of constraint that reference a path matching this one
		getConstraints: function() {
			var path = this.facetNode.getPath();
			var constraints = this.constraintManager.getConstraintsByPath(path);
			
			return constraints;
		},
		
		/**
		 * TODO: Should the result include the path triples even if there is no constraint? Currently it includes them.
		 * 
		 * Returns a concept for the values at this node.
		 * This concept can wrapped for getting the distinct value count
		 * 
		 * Also, the element can be extended with further elements
		 */
		createElements: function(includeSelfConstraints) {
			var rootNode = this.facetNode.getRootNode();
			var excludePath = includeSelfConstraints ? null : this.facetNode.getPath();
			
			// Create the constraint elements
			var elements = this.constraintManager.createElements(rootNode, excludePath);
			//console.log("___Constraint Elements:", elements);
			
			// Create the element for this path (if not exists)
			var pathElements = this.facetNode.getElements();
			//console.log("___Path Elements:", elements);
			
			elements.push.apply(elements, pathElements);
			
			var result = sparql.ElementUtils.flatten(elements);
			//console.log("Flattened: ", result);
			
			// Remove duplicates
			
			return result;
		},
		
		
		/**
		 * Creates the corresponding concept for the given node.
		 * 
		 * @param includeSelfConstraints Whether the created concept should
		 *        include constraints that affect the variable
		 *        corresponding to this node. 
		 * 
		 */
		createConcept: function(includeSelfConstraints) {
			var elements = this.createElements(includeSelfConstraints);
			//var element = new sparql.ElementGroup(elements);
			var v = this.getVariable();
			
			var result = new ns.Concept(elements, v);
			return result;
		},
		
		
		/**
		 * Returns a list of steps of _this_ node for which constraints exist
		 * 
		 * Use the filter to only select steps that e.g. correspond to outgoing properties
		 */
		getConstrainedSteps: function() {
			var path = this.getPath();
			var result = this.constraintManager.getConstrainedSteps(path);
			return result;
		}
	});
			
			/**
			 * Returns a list of steps for _this_ node for which constraints exists
			 * 
			 */
			
			
			
			
			/**
			 * Creates a util class for common facet needs:
			 * - Create a concept for sub-facets
			 * - Create a concept for the facet values
			 * - ? more?
			 */
			/*
			createUtils: function() {
				
			}
			*/

})();

