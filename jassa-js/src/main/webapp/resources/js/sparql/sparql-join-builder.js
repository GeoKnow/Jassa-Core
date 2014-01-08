(function() {
    
    var util = Jassa.util;
    var sparql = Jassa.sparql;


    var ns = Jassa.sparql;
        
    
    ns.JoinType = {
            INNER_JOIN: 'inner_join',
            LEFT_JOIN: 'left_join'
    };
    
    /**
     * A convenient facade on top of a join builder
     * 
     */
    ns.JoinNode = Class.create({
        initialize: function(joinBuilder, alias, targetJoinVars) {
            this.joinBuilder = joinBuilder;
            this.alias = alias;
            this.targetJoinVars;
        },
        
        getJoinBuilder: function() {
            return this.joinBuilder;
        },
        
        /**
         * Returns the variables on which this node is joined to the parent
         * 
         * For the root node, this is the set of default vars on which joins
         * can be performed
         * 
         */
        getJoinVars: function() {
            return this.targetJoinVars;
        },
        
        getElement: function() {
            return this.joinBuilder.getElement(this.alias);
        },

        getVarMap: function() {
            return this.joinBuilder.getVarMap(this.alias);
        },
        
        // Returns all join node object 
        // joinBuilder = new joinBuilder();
        // node = joinBuilder.getRootNode();
        // node.join([?s], element, [?o]);
        //    ?s refers to the original element wrapped by the node
        //    ?o also refers to the original element of 'element'
        // 
        // joinBuilder.getRowMapper();
        // joinBuilder.getElement();
        // TODO: Result must include joinType
        getJoinNodeInfos: function() {
            var state = this.joinBuilder.getState(this.alias);
            
            var joinBuilder = this.joinBuilder;
            var self = this;
            var result = _(state.getJoinInfos()).map(function(joinInfo) {
                var alias = joinInfo.getAlias();
                var targetJoinNode = self.joinBuilder.getJoinNode(alias);
               
                var r = new ns.JoinNodeInfo(targetJoinNode, joinInfo.getJoinType());
                return r;
            });
            
            return result;
        },

        joinAny: function(joinType, sourceJoinVars, targetElement, targetJoinVars, targetAlias) {
            var result = this.joinBuilder.addJoin(joinType, this.alias, sourceJoinVars, targetElement, targetJoinVars, targetAlias);

            return result;
        },
        
        join: function(sourceJoinVars, targetElement, targetJoinVars, targetAlias) {
            var result = this.joinAny(ns.JoinType.INNER_JOIN, sourceJoinVars, targetElement, targetJoinVars, targetAlias);
            return result;
        },

        leftJoin: function(sourceJoinVars, targetElement, targetJoinVars, targetAlias) {
            var result = this.joinAny(ns.JoinType.LEFT_JOIN, sourceJoinVars, targetElement, targetJoinVars, targetAlias);
            return result;
        },
        
        
        
        joinTree: function(joinNode) {
            
        },
        
        leftJoinTree: function(joinNode) {
            
        },
        
        joinTreeAny: function(joinNode) {
            
        }
    });
    
    
    
    /**
     * 
     * 
     */
    ns.JoinNodeInfo = Class.create({
        initialize: function(joinNode, joinType) {
            this.joinNode = joinNode;
            this.joinType = joinType;
        },

        getJoinNode: function() {
            return this.joinNode;
        },
       
        getJoinType: function() {
            return this.joinType;
        },
       
        toString: function() {
            return this.joinType + " " + this.joinNode;
        }
    });
    
    
    /**
     * This object just holds information
     * about the join type of a referred alias. 
     * 
     */
    ns.JoinInfo = Class.create({
       initialize: function(alias, joinType) {
           this.alias = alias;
           this.joinType = joinType;
       },
       
       getAlias: function() {
           return this.alias;
       },
       
       getJoinType: function() {
           return this.joinType;
       },
       
       toString: function() {
           return this.joinType + " " + this.alias;
       }
    });

    
    ns.JoinTargetState = Class.create({
        initialize: function(varMap, joinNode, element, elementVars) {
            this.varMap = varMap;
            this.joinNode = joinNode;
            this.element = element;
            this.elementVars = elementVars;
            
            //this.targetJoinVars = targetJoinVars;
            
            this.joinInfos = [];            
        },
        
        getVarMap: function() {
            return this.varMap;
        },
        
        getJoinNode: function() {
            return this.joinNode;
        },
        
        getElement: function() {
            return this.element;
        },
        
        getElementVars: function() {
            return this.elementVars;
        },
        
        getJoinInfos: function() {
            return this.joinInfos;
        }
    });
    
    /**
     * Aliases are automatically assigned if none is given explicitly
     * 
     * The alias can be retrieved using
     * joinNode.getAlias();
     * 
     * 
     * a: castle
     * 
     * 
     * b: owners
     * 
     * 
     */
    ns.JoinBuilderElement = Class.create({
        initialize: function(rootElement, rootElementVars, rootAlias, defaultRootJoinVars) {

            // Null elements can be used for pseudo-joins that only allocated variables
            // TODO Instead of null elements we now support default join variables for the root node
            if(rootElement == null) {
                console.log('[Error] Root element must not be null');
                throw 'Bailing out';
            }
            
            
            this.usedVarNames = [];
            this.usedVars = [];

            this.aliasGenerator = new ns.GenSym('a');
            this.varNameGenerator = new ns.GeneratorBlacklist(new ns.GenSym('v'), this.usedVarNames); 
            

            this.aliasToState = {};
            
            
            this.rootAlias = rootAlias ? rootAlias : this.aliasGenerator.next(); 
             
            
            //var rootElementVars = targetElement.getVarsMentioned();

            if(defaultRootJoinVars == null) {
                defaultRootJoinVars = [];
            }
            
            var rootState = this.createTargetState(this.rootAlias, new util.HashBidiMap(), defaultRootJoinVars, rootElement, rootElementVars, defaultRootJoinVars);

            this.aliasToState[this.rootAlias] = rootState;
            
            this.rootNode = rootState.getJoinNode(); //new ns.JoinNode(rootAlias);
        },

        getRootNode: function() {
            return this.rootNode;
        },

        getJoinNode: function(alias) {
            var state = this.aliasToState[alias];
            
            var result = state ? state.getJoinNode() : null;
            
            return result;
        },


        getState: function(alias) {
            return this.aliasToState[alias];
        },
    
        getElement: function(alias) {
            var state = this.aliasToState[alias];
            var result = state ? state.getElement() : null;
            return result;
        },
        
        
//        getAliasVarMap: function() {
//            var result = {};
//        },
        
//      getElement: function(alias) {
//          return this.aliasToElement[alias];
//      },
//      
//      getJoinNode: function(alias) {
//          return this.aliasToJoinNode[alias];
//      },
//      
//      getVarMap: function(alias) {
//          return this.aliasToVarMap[alias];
//      },
        
        addVars: function(vars) {
            
            var self = this;
            _(vars).each(function(v) {
                
                var varName = v.getName();
                var isContained = _(self.usedVarNames).contains(varName);
                if(!isContained) {
                    self.usedVarNames.push(varName);
                    self.usedVars.push(v);
                }
            });
        },
        
        createTargetState: function(targetAlias, sourceVarMap, sourceJoinVars, targetElement, oldTargetVars, targetJoinVars) {
            var sjv = sourceJoinVars.map(function(v) {
                var rv = sourceVarMap.get(v);               
                return rv;
            });
            
            //var sourceVars = this.ge; // Based on renaming!
            //var oldTargetVars = targetElement.getVarsMentioned();
            var targetVarMap = ns.ElementUtils.createJoinVarMap(this.usedVars, oldTargetVars, sjv, targetJoinVars, this.varGenerator);
            
            var newTargetElement = null;
            if(targetElement != null) {
                newTargetElement = ns.ElementUtils.createRenamedElement(targetElement, targetVarMap);
            }
            
            var newTargetVars = targetVarMap.getInverse().keyList();
            this.addVars(newTargetVars);

            
            var result = new ns.JoinNode(this, targetAlias, targetJoinVars);

            var targetState = new ns.JoinTargetState(targetVarMap, result, newTargetElement, newTargetVars); 
//          
//          var targetState = {
//              varMap: targetVarMap,
//              joinNode: result,
//              element: newTargetElement,
//              joins: []
//          };
//
            return targetState;
        },
        


        addJoin: function(joinType, sourceAlias, sourceJoinVars, targetElement, targetJoinVars, targetAlias) {
            var sourceState = this.aliasToState[sourceAlias];
            var sourceVarMap = sourceState.getVarMap();

            if(!targetAlias) {
                targetAlias = this.aliasGenerator.next();
            }

            var targetElementVars = targetElement.getVarsMentioned();
            
            var targetState = this.createTargetState(targetAlias, sourceVarMap, sourceJoinVars, targetElement, targetElementVars, targetJoinVars);
                        
            //var targetVarMap = targetState.varMap;            
            //var newTargetVars = targetVarMap.getInverse().keyList();
            
            // TODO support specification of join types (i.e. innerJoin, leftJoin)
            var joinInfo = new ns.JoinInfo(targetAlias, joinType);
            sourceState.getJoinInfos().push(joinInfo);
            //sourceState.joins.push(targetAlias);
            

            this.aliasToState[targetAlias] = targetState;
            
            var result = targetState.getJoinNode();
            return result;
        },

        
        getElementsRec: function(node) {
            var resultElements = [];
            
            var element = node.getElement();
            if(element != null) {

                resultElements.push(element);
            }
                
            var children = node.getJoinNodeInfos();
            
            var self = this;
            _(children).each(function(child) {
                var childNode = child.getJoinNode();
                var childElements = self.getElementsRec(childNode);

                var childElement = new ns.ElementGroup(childElements);


                var joinType = child.getJoinType();
                switch(joinType) {
                case ns.JoinType.LEFT_JOIN:
                    childElement = new ns.ElementOptional(childElement);
                    break;
                case ns.JoinType.INNER_JOIN:
                    break;
                default:
                    console.log('[ERROR] Unsupported join type: ' + joinType);
                    throw 'Bailing out';
                }
                resultElements.push(childElement);
            });
            
            return resultElements;
        },
        
        getElements: function() {
            var rootNode = this.getRootNode();
            
            var result = this.getElementsRec(rootNode);
            return result;
            
            //var result = [];
            /*
            var rootNode = this.getRootNode();

            util.TreeUtils.visitDepthFirst(rootNode, ns.JoinBuilderUtils.getChildren, function(node) {
                result.push(node.getElement());
                return true;
            });
            */
            return result;
        },
        
        getAliasToVarMap: function() {
            var result = {};
            _(this.aliasToState).each(function(state, alias) {
                result[alias] = state.varMap;
            });
            
            return result;
        }
        

//      getVarMap: function() {
//          _.each()
//      }
    });

    ns.JoinBuilderUtils = {
        getChildren: function(node) {
            return node.getJoinNodes();
        }
    }

    ns.JoinBuilderElement.create = function(rootElement, rootAlias, defaultJoinVars) {
        
        var vars = rootElement.getVarsMentioned();
        
        var joinBuilder = new ns.JoinBuilderElement(rootElement, vars, rootAlias, defaultJoinVars);
        var result = joinBuilder.getRootNode();
        
        return result;
    };
    
    
    /**
     * Creates a join node with a 'null' element,
     * however with a set of allocated variables.
     * 
     * 
     */
    ns.JoinBuilderElement.createWithEmptyRoot = function(varNames, rootAlias) {
        var vars = sparql.VarUtils.varNamesToNodes(varNames);
        
        var joinBuilder = new ns.JoinBuilderElement(null, vars, rootAlias);
        var result = joinBuilder.getRootNode();
        
        return result;        
    };
    
})();