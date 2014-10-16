    /**
     * Ties together a facetNode (only responsible for paths) and a constraint collection.
     * Constraints can be declaratively set on the facade and are converted to
     * appropriate constraints for the constraint collection.
     * 
     * e.g. from
     * var constraint = {
     *  type: equals,
     *  path: ...,
     *  node: ...}
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
      // FIXME: createEquals is not defined in ConstraintUtils
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
      // FIXME: ConstraintManager class has no method moveConstraint (only removeConstraint)
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
