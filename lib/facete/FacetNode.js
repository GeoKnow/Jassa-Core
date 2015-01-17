var Class = require('../ext/Class');

var NodeFactory = require('../rdf/NodeFactory');

var ElementTriplesBlock = require('../sparql/element/ElementTriplesBlock');
var GenSym = require('../sparql/GenSym');
var VarUtils = require('../sparql/VarUtils');

var Path = require('./Path');
var Step = require('./Step');
var VarNode = require('./VarNode');

var HashMap = require('../util/collection/HashMap');


/**
 * This class only has the purpose of allocating variables
 * and generating elements.
 *
 * The purpose is NOT TO DECIDE on which elements should be created.
 *
 *
 * @param parent
 * @param root
 * @param generator
 * @returns {ns.FacetNode}
 */
var FacetNode = Class.create({
    initialize: function(varNode, step, parent, root) {
        this.parent = parent;
        this.root = root;
        if(!this.root) {
            if(this.parent) {
                this.root = parent.root;
            }
            else {
                this.root = this;
            }
        }


        this.varNode = varNode;

        /**
         * The step for how this node can be  reached from the parent
         * Null for the root
         */
        this.step = step;


        this._isActive = true; // Nodes can be disabled; in this case no triples/constraints will be generated

        //this.idToChild = {};
        this.idToChild = new HashMap();

        //this.idToConstraint = {};
    },

    hashCode: function() {
        var result = this.idToChild.hashCode() * 3; // * (this.step ? this.step.hashCode() : 7);
        return result;
    },

    equals: function(that) {
        throw new Error('Should not be called');
    },

    getRootNode: function() {
        return this.root;
    },

    isRoot: function() {
        var result = this.parent ? false : true;
        return result;
    },

    /*
    getVariableName: function() {
        return this.varNode.getVariableName();
    },*/

    getVar: function() {
        var varName = this.varNode.getVariableName();
        var result = NodeFactory.createVar(varName);
        return result;
    },

    getVariable: function() {
        if(!this.warningShown) {
            //console.log('[WARN] Deprecated. Use .getVar() instead');
            this.warningShown = true;
        }

        return this.getVar();
    },

    getStep: function() {
        return this.step;
    },

    getParent: function() {
        return this.parent;
    },

    getPath: function() {
        var steps = [];

        var tmp = this;
        while(tmp != this.root) {
            steps.push(tmp.getStep());
            tmp = tmp.getParent();
        }

        steps.reverse();

        var result = new Path(steps);

        return result;
    },

    forPath: function(path) {
        var steps = path.getSteps();

        var result = this;
        steps.forEach(function(step) {
            // TODO Allow steps back
            result = result.forStep(step);
        });

        return result;
    },

//    getIdStr: function() {
//        // TODO concat this id with those of all parents
//    },

    getSteps: function() {
        return this.steps;
    },

    isActiveDirect: function() {
        return this._isActive;
    },


    /**
     * Returns an array having at most one element.
     *
     *
     */
    getElements: function() {
        var result = [];

        var triples = this.getTriples();
        if(triples.length > 0) {
            var element = new ElementTriplesBlock(triples);
            result.push(element);
        }


        return result;
    },

    /**
     * Get triples for the path starting from the root node until this node
     *
     * @returns {Array}
     */
    getTriples: function() {
        var result = [];
        this.getTriples2(result);
        return result;
    },

    getTriples2: function(result) {
        this.createDirectTriples2(result);

        if(this.parent) {
            this.parent.getTriples2(result);
        }
        return result;
    },

    /*
    createTriples2: function(result) {

    },*/

    createDirectTriples: function() {
        var result = [];
        this.createDirectTriples2(result);
        return result;
    },



    /**
     * Create the element for moving from the parent to this node
     *
     * TODO Cache the element, as the generator might allocate new vars on the next call
     */
    createDirectTriples2: function(result) {
        if(this.step) {
            var sourceVar = this.parent.getVariable();
            var targetVar = this.getVariable();

            var tmp = this.step.createElement(sourceVar, targetVar, this.generator);

            // FIXME
            var triples = tmp.getTriples();

            result.push.apply(result, triples);

            //console.log('Created element', result);
        }

        return result;

        /*
        if(step instanceof ns.Step) {
            result = ns.FacetUtils.createTriplesStepProperty(step, startVar, endVar);
        } else if(step instanceof ns.StepFacet) {
            result = ns.FacetUtils.createTriplesStepFacets(generator, step, startVar, endVar);
        } else {
            console.error('Should not happen: Step is ', step);
        }
        */
    },

    isActive: function() {
        if(!this._isActive) {
            return false;
        }

        if(this.parent) {
            return this.parent.isActive();
        }

        return true;
    },

    attachToParent: function() {
        if(!this.parent) {
            return;
        }

        this.parent[this.id] = this;
        this.parent.attachToParent();
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
        //console.log('Step is', step);

        //var stepId = '' + JSON.stringify(step);

        var child = this.idToChild.get(step);//[stepId];

        if(!child) {

            var subVarNode = this.varNode.forStep(step);

            child = new FacetNode(subVarNode, step, this, this.root);

            /*
            child = {
                    step: step,
                    child: facet
            };*/

            //Unless we change something
            // we do not add the node to the parent
            this.idToChild.put(step, child);
        }

        return child;
    },

    /**
     *
     *
     * @returns the new root node.
     */
    copyExclude: function() {
        // Result is a new root node
        var result = new FacetNode();
        console.log('Now root:' , result);

        this.root.copyExcludeRec(result, this);

        return result;
    },

    copyExcludeRec: function(targetNode, excludeNode) {

        console.log('Copy:', this, targetNode);

        if(this === excludeNode) {
            return;
        }

        this.copyTo(targetNode);

        this.steps.forEach(function(s) {
            var childStep = s.step;
            var childNode = s.child;

            console.log('child:', childStep, childNode);

            if(childNode === excludeNode) {
                return;
            }



            var newChildNode = targetNode.forStep(childStep);
            console.log('New child:', newChildNode);

            childNode.copyExcludeRec(newChildNode, excludeNode);
        });


        //return result;
    }
});


/**
 * Use this instead of the constructor
 *
 */
FacetNode.createRoot = function(v, generator) {

    var varName = v ? v.getName() : VarUtils.s.getName();
    generator = generator ? generator : new GenSym('fv');

    var varNode = new VarNode(varName, generator);
    var result = new FacetNode(varNode);
    return result;
};

module.exports = FacetNode;
