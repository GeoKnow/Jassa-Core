var forEach = require('lodash.foreach');
var uniq = require('lodash.uniq');

var Class = require('../ext/Class');

var ExprUtils = require('../sparql/ExprUtils');
var ElementsAndExprs = require('./ElementsAndExprs');

/**
 * TODO Possibly rename to constraint list
 *
 * A constraint manager is a container for ConstraintSpec objects.
 *
 * @param cefRegistry
 *            A Map<String, ConstraintElementFactory>
 */
var ConstraintManager = Class.create({
    classLabel: 'jassa.facete.ConstraintManager',

    initialize: function(constraints) {
        this.constraints = constraints || [];
    },

    /**
     * Returns a new constraintManager with a new array of the original
     * constraints
     */
    shallowClone: function() {
        var result = new ConstraintManager(this.constraints.slice(0));
        return result;
    },

    /**
     * Yields all constraints having at least one variable bound to the
     * exact path
     *
     * Note: In general, a constraint may make use of multiple paths
     */
    getConstraintsByPath: function(path) {
        var result = [];

        var constraints = this.constraints;

        //for(var i = 0; i < constraints.length; ++i) {
        constraints.forEach(function(constraint) {

            var paths = constraint.getDeclaredPaths();

            var isPath = paths.some(function(p) {
                var tmp = p.equals(path);
                return tmp;
            });

            if(isPath) {
                result.push(constraint);
            }
        });

        return result;
    },

    getConstrainedSteps: function(path) {
            // console.log("getConstrainedSteps: ", path);
        // checkNotNull(path);

        var tmp = [];

        var steps = path.getSteps();
        var constraints = this.constraints;

        for(var i = 0; i < constraints.length; ++i) {
            var constraint = constraints[i];
            // console.log(" Constraint: " + constraint);

        var paths = constraint.getDeclaredPaths();
        // console.log(" Paths: " + paths.length + " - " + paths);

        for(var j = 0; j < paths.length; ++j) {
            var p = paths[j];
            var pSteps = p.getSteps();
            var delta = pSteps.length - steps.length;

            // console.log(" Compare: " + delta, p, path);

            var startsWith = p.startsWith(path);
            // console.log(" Startswith: " + startsWith);
                if(delta == 1 && startsWith) {
                    var step = pSteps[pSteps.length - 1];
                    tmp.push(step);
                }
            }
        }

        var result = uniq(tmp, function(step) { return '' + step; });

        // console.log("Constraint result", constraints.length,
        // result.length);

        return result;
    },

    getConstraints: function() {
        return this.constraints;
    },

    addConstraint: function(constraint) {
        this.constraints.push(constraint);
    },

    addConstraints: function(constraints) {
        var self = this;
        constraints.forEach(function(constraint) {
            self.addConstraint(constraint);
        });
    },

    // Fcuking hack because of legacy code and the lack of a standard
    // collection library...
    // TODO Make the constraints a hash set (or a list set)
    removeConstraint: function(constraint) {
        var result = false;

        var cs = this.constraints;

        var n = [];
        for(var i = 0; i < cs.length; ++i) {
            var c = cs[i];

            if(!c.equals(constraint)) {
                n.push(c);
            } else {
                result = true;
            }
        }

        this.constraints = n;
        return result;
    },

    toggleConstraint: function(constraint) {
        var wasRemoved = this.removeConstraint(constraint);
        if(!wasRemoved) {
            this.addConstraint(constraint);
        }
    },

    createElementsAndExprs: function(facetNode, excludePath) {
            // var triples = [];
        var elements = [];
        var resultExprs = [];

        var pathToExprs = {};

        var self = this;

        this.constraints.forEach(function(constraint) {
            var paths = constraint.getDeclaredPaths();

            var pathId = paths.join(' ');
//            _(paths).reduce(
//                function(memo, path) {
//                    return memo + ' ' + path;
//                }, '');

            // Check if any of the paths is excluded
            if(excludePath) {
                var skip = paths.some(function(path) {
                    // console.log("Path.equals", excludePath, path);

                    var tmp = excludePath.equals(path);
                    return tmp;
                });

                if(skip) {
                    return;
                }
            }

            paths.forEach(function(path) {
                var fn = facetNode.forPath(path);
                var tmpElements = fn.getElements();
                elements.push.apply(elements, tmpElements);
            });

            var ci = constraint.createElementsAndExprs(facetNode);

            var ciElements = ci.getElements();
            var ciExprs = ci.getExprs();

            if(ciElements) {
                elements.push.apply(elements, ciElements);
            }

            if(ciExprs && ciExprs.length > 0) {

                var exprs = pathToExprs[pathId];
                if(!exprs) {
                    exprs = [];
                    pathToExprs[pathId] = exprs;
                }

                var andExpr = ExprUtils.andify(ciExprs);
                exprs.push(andExpr);
            }
        });

        forEach(pathToExprs, function(exprs) {
            var orExpr = ExprUtils.orify(exprs);
            resultExprs.push(orExpr);
        });

        var result = new ElementsAndExprs(elements, resultExprs);

        return result;
    }
});

module.exports = ConstraintManager;
