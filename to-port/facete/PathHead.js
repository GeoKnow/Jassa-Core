
    /**
     * Combines a path with a direction
     * 
     * Used for the facet tree service, to specify for each path whether to fetch the 
     * ingoing or outgoing properties (or both)
     */
    ns.PathHead = Class.create({
        initialize: function(path, inverse) {
            this.path = path;
            this.inverse = inverse ? true : false;
        },
        
        getPath: function() {
            return this.path;
        },
        
        isInverse: function() {
            return this.inverse;
        },
        
        equals: function(that) {
            var pathEquals = this.path.equals(that.path);
            var inverseEquals = this.inverse = that.inverse;
            var result = pathEquals && inverseEquals;
            return result;
        }
    });