var forEach = require('lodash.foreach');

var Class = require('../ext/Class');

var VarNode = require('./VarNode');
var Step = require('./Step');

var HashMap = require('../util/collection/HashMap');
var ObjectUtils = require('../util/ObjectUtils');

/**
 * A class for generating variables for step-ids.
 * So this class does not care about the concrete step taken.
 *
 * @param variableName
 * @param generator
 * @param parent
 * @param root
 * @returns {ns.VarNode}
 */
var VarNode = Class.create({
    initialize: function(variableName, generator, step, parent, root) {
        this.variableName = variableName;
        this.generator = generator;
        //this.stepId = stepId; // Null for root
        this.step = step; // Null for root
        this.parent = parent;
        this.root = root;


        //console.log('VarNode status' , this);
        if(!this.root) {
            if(this.parent) {
                this.root = parent.root;
            }
            else {
                this.root = this;
            }
        }


        this.idToChild = new HashMap();
    },

    hashCode: function() {
        var result = ObjectUtils.hashCodeStr(this.variableName) * (this.step ? this.step.hashCode() : 7);
        return result;
    },

    equals: function(that) {
        throw new Error('Should not be called');
    },

    isRoot: function() {
        var result = this.parent ? false : true;
        return result;
    },

    /*
    getSourceVarName: function() {
        var result = this.root.variableName;
        return result;
    },
    */

    getVariableName: function() {
        return this.variableName;
    },

    /*
    forPath: function(path) {
        var steps = path.getSteps();

        var result;
        if(steps.length === 0) {
            result = this;
        } else {
            var step = steps[0];

            // TODO Allow steps back

            result = forStep(step);
        }

        return result;
    },
    */

//    getIdStr: function() {
//        var tmp = this.parent ? this.parent.getIdStr() : '';
//
//        var result = tmp + this.variableName;
//        return result;
//    },

    getStop: function(step) {
        return this.step;
    },

//    getStepId: function(step) {
//        return '' + JSON.stringify(step);
//    },

    getSteps: function() {
        return this.steps;
    },

    /**
     * Convenience method, uses forStep
     *
     * @param propertyUri
     * @param isInverse
     * @returns
     */
    forProperty: function(propertyUri, isInverse) {
        var step = new Step(propertyUri, isInverse);

        var result = this.forStep(step);

        return result;
    },

    forStep: function(step) {
        var child = this.idToChild.get(step);

        if(!child) {

            var subName = this.generator.next();
            child = new VarNode(subName, this.generator, step, this);

            //Unless we change something
            // we do not add the node to the parent
            this.idToChild.put(step, child);
        }

        return child;
    },

    /*
     * Recursively scans the tree, returning the first node
     * whose varName matches. Null if none found.
     *
     * TODO: Somehow cache the variable -> node mapping
     */
    findNodeByVarName: function(varName) {
        if(this.variableName === varName) {
            return this;
        }

        var children = [];
        forEach(this.idToChild, function(child) {
           children.push(child);
        });

        //var children = _.values(this.idToChild);
        //forEach(this.idToChild, function(child) {
        for(var i = 0; i < children.length; ++i) {
            var child = children[i];

            var tmp = child.findNodeByVarName(varName);
            if(tmp) {
                return tmp;
            }
        }

        return null;
    }
});

module.exports = VarNode;
