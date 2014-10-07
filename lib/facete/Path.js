var Class = require('../ext/Class');

var Step = require('./Step');

/**
 * A path is a sequence of steps
 *
 * @param steps
 * @returns {ns.Path}
 */
var Path = Class.create({
    classLabel: 'jassa.facete.Path',

    initialize: function(steps) {
        this.steps = steps ? steps : [];
    },

    getParent: function() {
        var l = this.steps.length;

        var result = l === 0 ? null : new Path(this.steps.slice(0, l - 1));
        return result;
    },

    getLength: function() {
        return this.steps.length;
    },

    isEmpty: function() {
        var result = this.steps.length === 0;
        return result;
    },

    toString: function() {
        var result = this.steps.join(' ');
        return result;
    },

    concat: function(other) {
        var result = new Path(this.steps.concat(other.steps));
        return result;
    },

    getLastStep: function() {
        var steps = this.steps;
        var n = steps.length;

        var result;
        if(n === 0) {
            result = null;
        } else {
            result = steps[n - 1];
        }

        return result;
    },

    getSteps: function() {
        return this.steps;
    },

    startsWith: function(other) {
        var n = other.steps.length;
        if(n > this.steps.length) {
            return false;
        }

        for(var i = 0; i < n; ++i) {
            var thisStep = this.steps[i];
            var otherStep = other.steps[i];

            //console.log("      ", thisStep, otherStep);
            if(!thisStep.equals(otherStep)) {
                return false;
            }
        }

        return true;
    },

    hashCode: function() {
        return this.toString();
    },

    // a equals b = a startsWidth b && a.len = b.len
    equals: function(other) {
        if(!other) {
            return false;
        }

        var n = this.steps.length;
        if(n != other.steps.length) {
            return false;
        }

        var result = this.startsWith(other);
        return result;
    },


    // Create a new path with a step appended
    // TODO Maybe replace with clone().append() - no, because then the path would not be immutable anymore
    copyAppendStep: function(step) {
        var newSteps = this.steps.slice(0);
        newSteps.push(step);

        var result = new Path(newSteps);

        return result;
    },

    toJson: function() {
        var result = [];
        var steps = this.steps;

        for(var i = 0; i < steps.length; ++i) {
            var step = steps[i];

            var stepJson = step.toJson();
            result.push(stepJson);
        }

        return result;
    },

    /*
     *
     * TODO Make result distinct
     */
    getPropertyNames: function() {
        var result = [];
        var steps = this.steps;

        for(var i = 0; i < steps.length; ++i) {
            var step = steps[i];
            var propertyName = step.getPropertyName();
            result.push(propertyName);
        }

        return result;
    }
});


/**
 * Input must be a json array of json for the steps.
 *
 */
Path.fromJson = function(json) {
    var steps = [];

    for(var i = 0; i < json.length; ++i) {
        var item = json[i];

        var step = Step.fromJson(item);

        steps.push(step);
    }

    var result = new Path(steps);
    return result;
};


Path.parse = function(pathStr) {
    pathStr = pathStr.trim();

    var items = pathStr.length !== 0 ? pathStr.split(' ') : [];
    var steps = items.map(function(item) {

        //if(item === "<^") {
            //return new ns.StepFacet(-1);
        //} else if(item === "^" || item === ">^") {
            //return new ns.StepFacet(1);
        //} else {
            return Step.parse(item);
        //}
    });

    //console.log("Steps for pathStr " + pathStr + " is ", steps);

    var result = new Path(steps);

    return result;
};

module.exports = Path;
