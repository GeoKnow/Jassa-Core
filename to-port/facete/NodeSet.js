    
    /**
     * A set (list) of nodes. Can be negated to mean everything except for this set. 
     * Used as a base for the creation of filters and bindings for use with prepared queries.
     * 
     */
    ns.NodeSet = Class.create({
        initialize: function(nodes, isNegated) {
            this.nodes = nodes;
            this.isNegated = isNegated;
        },
        
        getNodes: function() {
            return this.nodes;
        },
        
        isNegated: function() {
            return this.isNegated;
        }
    });
