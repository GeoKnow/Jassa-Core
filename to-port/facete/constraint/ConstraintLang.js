    
    ns.ConstraintLang = Class.create(ns.ConstraintBasePathValue, {
        classLabel: 'jassa.facete.ConstraintLang',
        
        initialize: function($super, path, langStr) {
            $super('lang', path, langStr);
        },
        
        createElementsAndExprs: function(facetNode) {
            var result = ns.ConstraintUtils.createConstraintLang(facetNode, this.path, this.value);
            return result;
        }
    });
