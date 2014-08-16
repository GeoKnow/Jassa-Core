(function() {
    
    var ns = Jassa.facete;
    
    ns.ConstraintTaggerFactory = Class.create({
        initialize: function(constraintManager) {
            this.constraintManager = constraintManager;
        },
        
        createConstraintTagger: function(path) {
            var constraints = this.constraintManager.getConstraintsByPath(path);
            
            var equalConstraints = {};

            _(constraints).each(function(constraint) {
                var constraintType = constraint.getName();
                 
                if(constraintType === 'equals') {
                    var node = constraint.getValue();
                    equalConstraints[node.toString()] = node;
                }
            });
    
            console.log('eqConstraints: ', equalConstraints);
            var result = new ns.ConstraintTagger(equalConstraints);
            return result;
        }
    });
     
    ns.ConstraintTagger = Class.create({
        initialize: function(equalConstraints) {
            this.equalConstraints = equalConstraints;
        },
        
        getTags: function(node) {
            var result = {
                isConstrainedEqual: this.equalConstraints[node.toString()] ? true : false
            };
            
            return result;
        }
    }); 
    
})();