
    
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
    