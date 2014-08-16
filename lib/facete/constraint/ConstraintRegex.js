
    ns.ConstraintRegex = Class.create(ns.ConstraintBasePathValue, {
        classLabel: 'jassa.facete.ConstraintRegex',
        
        initialize: function($super, path, regexStr) {
            $super('regex', path, regexStr);
        },
        
        createElementsAndExprs: function(facetNode) {
            var result = ns.ConstraintUtils.createConstraintRegex(facetNode, this.path, this.value.getLiteralLexicalForm());
            return result;
        }
    });
    