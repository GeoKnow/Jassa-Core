var Class = require('../ext/Class');

var NodeFactory = require('../rdf/NodeFactory');
var Triple = require('../rdf/Triple');
var ElementTriplesBlock = require('../sparql/element/ElementTriplesBlock');

var ObjectUtils = require('../util/ObjectUtils'); 

/**
 * 
 * @param direction
 * @param resource
 * @returns {ns.Step}
 */
var Step = Class.create({
    classLabel: 'jassa.facete.Step',

    initialize: function(propertyName, isInverse) {
        this.type = 'property';
        this.propertyName = propertyName;
        this._isInverse = isInverse;
    },

    toJson: function() {
        var result = {
            isInverse: this.isInverse,
            propertyName: this.propertyName
        };
        
        return result;
    },
    
    getPropertyName: function() {
        return this.propertyName;
    },

    isInverse: function() {
        return this._isInverse;
    },


    equals: function(other) {
        return ObjectUtils.equals(this, other);
    },

    toString: function() {
        if(this._isInverse) {
            return '<' + this.propertyName;
        } else {
            return this.propertyName;
        }
    },
    
    createElement: function(sourceVar, targetVar, generator) {
        var propertyNode = NodeFactory.createUri(this.propertyName);
        
        var triple;
        if(this._isInverse) {
            triple = new Triple(targetVar, propertyNode, sourceVar);
        } else {
            triple = new Triple(sourceVar, propertyNode, targetVar);
        }
        
        var result = new ElementTriplesBlock([triple]);
        
        return result;
    }
});


/**
 * Create a Step from a json specification:
 * {
 *     propertyName: ... ,
 *     isInverse: 
 * }
 * 
 * @param json
 */
Step.fromJson = function(json) {
    var propertyName = json.propertyName;
    var isInverse = json.IsInverse();
    
    var result = new Step(propertyName, isInverse);
    return result;
};

Step.parse = function(str) {
    var result;
    if(str.startsWith('<')) {
        result = new Step(str.substring(1), true);
    } else {
        result = new Step(str, false);
    }
    return result;
};

module.exports = Step;
