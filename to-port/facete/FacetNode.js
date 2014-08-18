
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
            var result = rdf.NodeFactory.createVar(varName);
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
