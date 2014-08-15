var Class = require('../ext/Class');

var ElementUtils = require('./ElementUtils');
var ElementGroup = require('./element/ElementGroup');
var ElementTriplesBlock = require('./element/ElementTriplesBlock');

var ConceptUtils = require('./ConceptUtils');

/**
 * A concept is pair comprised of a sparql graph
 * pattern (referred to as element) and a variable.
 * 
 */
var Concept = Class.create({
    
    classLabel: 'jassa.sparql.Concept',

    initialize: function(element, variable) {
        this.element = element;
        this.variable = variable;
    },

    toJson: function() {
        var result = {
                element: JSON.parse(JSON.stringify(this.element)),
                variable: this.variable
        };
        
        return result;
    },
    
    getElement: function() {
        return this.element;
    },
    
    getVarsMentioned: function() {
        // TODO The variable is assumed to be part of the element already
        var result = this.getElement().getVarsMentioned();
        return result;
    },
    
    hasTriples: function() {
        var elements = this.getElements();
        var triples = ElementUtils.getElementsDirectTriples(elements);
        var result = triples.length > 0;
        
        return result;
    },
    
    /**
     * Convenience method to get the elements as an array.
     * Resolves sparql.ElementGroup
     * 
     */
    getElements: function() {
        var result;
        
        if(this.element instanceof ElementGroup) {
            result = this.element.elements;
        } else {
            result = [ this.element ];
        }
        
        return result;
    },

    getVar: function() {
        return this.variable;               
    },
    
    getVariable: function() {
        
        if(!this.warningShown) {                
            //console.log('[WARN] Deprecated. Use .getVar() instead');
            this.warningShown = true;
        }

        return this.getVar();
    },

    toString: function() {
        return '' + this.element + '; ' +  this.variable;
    },

    // Whether this concept is isomorph to (?s ?p ?o, ?s)
    isSubjectConcept: function() {
        var result = false;

        var v = this.variable;
        var e = this.element;
        
        if(e instanceof ElementTriplesBlock) {
            var ts = e.triples;

            if(ts.length === 1) {
                var t = ts[0];
                
                var s = t.getSubject();
                var p = t.getPredicate();
                var o = t.getObject();
                
                result = v.equals(s) && p.isVariable() && o.isVariable();
            }
        }

        return result;
    },

    combineWith: function(that) {
        var result = ConceptUtils.createCombinedConcept(this, that);
        return result;
    },

    createOptimizedConcept: function() {
        var element = this.getElement();
        var newElement = element.flatten();

  // FIXME: ConceptInt class is not defined
        var result = new Concept(newElement, this.variable);

        return result;
    },

    asQuery: function(limit, offset) {
        var result = ConceptUtils.createQueryList(this, limit, offset);
        return result;
    },

    
    /**
     * Remove unnecessary triple patterns from the element:
     * Example:
     * ?s ?p ?o
     * ?s a :Person
     *  
     *  We can remove ?s ?p ?o, as it does not constraint the concepts extension.
     */
    getOptimizedElement: function() {
        /* This would become a rather complex function, the method isSubjectConcept is sufficient for our use case */
        return null;
    },
});

/**
 * Array version constructor
 *
 */
Concept.createFromElements = function(elements, variable) {
    var element;
    if(elements.length == 1) {
        element = elements[0];
    } else {
        element = new ElementGroup(elements);
    }

    var result = new Concept(element, variable);

    return result;
};

module.exports = Concept;
