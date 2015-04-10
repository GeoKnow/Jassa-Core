(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global define */
/* global window */

var Jassa = require('./index.js');

if (typeof define == 'function' && define.amd) {
    define('Jassa', function () {
        return Jassa;
    });
} else {
    window.Jassa = Jassa;
}

},{"./index.js":87}],2:[function(require,module,exports){
/* jshint newcap: false */
/* jshint loopfunc: true */
/* Based on Alex Arnell's inheritance implementation. */

/** section: Language
 * class Class
 *
 *  Manages Prototype's class-based OOP system.
 *
 *  Refer to Prototype's web site for a [tutorial on classes and
 *  inheritance](http://prototypejs.org/learn/class-inheritance).
 **/
var Class = (function() {


    // Claus: Copied together code from PrototypeJS to make its class file self-contained.
    // There is also a klass lib in bower, but I collected too many battle scars
    // to try yet another lib just to discover 'minor' differences in the semantics...

    // Extend a given object with all the properties in passed-in object(s).
    function extend(obj, source) {
        var prop;
        for (var i = 1, length = arguments.length; i < length; i++) {
            source = arguments[i];
            for (prop in source) {
                if (hasOwnProperty.call(source, prop)) {
                    obj[prop] = source[prop];
                }
            }
        }
        return obj;
    }

    // [BEGIN OF HACK]
    function $A(iterable) {
        if (!iterable) {
            return [];
        }
        // Safari <2.0.4 crashes when accessing property of a node list with property accessor.
        // It nevertheless works fine with `in` operator, which is why we use it here
        if ('toArray' in Object(iterable)) {
            return iterable.toArray();
        }
        var length = iterable.length || 0,
            results = new Array(length);
        while (length--) {
            results[length] = iterable[length];
        }
        return results;
    }

    var emptyFunction = function() {};

    // https://github.com/sstephenson/prototype/blob/master/src/prototype/lang/object.js
    var FUNCTION_CLASS = '[object Function]';
    var _toString = Object.prototype.toString;

    function isFunction(object) {
        return _toString.call(object) === FUNCTION_CLASS;
    }

    function argumentNames(arg) {
        var names = arg.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
            .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
            .replace(/\s+/g, '').split(',');
        return names.length === 1 && !names[0] ? [] : names;
    }

    function update(array, args) {
        var arrayLength = array.length,
            length = args.length;
        while (length--) {
            array[arrayLength + length] = args[length];
        }
        return array;
    }

    function wrap(__method, wrapper) {
        //var __method = this;
        return function() {
            var a = update([__method.bind(this)], arguments);
            return wrapper.apply(this, a);
        };
    }
    // [END OF HACK]



    // Some versions of JScript fail to enumerate over properties, names of which 
    // correspond to non-enumerable properties in the prototype chain
    var IS_DONTENUM_BUGGY = (function() {
        for (var p in {
            toString: 1
        }) {
            // check actual property name, so that it works with augmented Object.prototype
            if (p === 'toString') {
                return false;
            }
        }
        return true;
    })();

    /**
     *  Class.create([superclass][, methods...]) -> Class
     *    - superclass (Class): The optional superclass to inherit methods from.
     *    - methods (Object): An object whose properties will be "mixed-in" to the
     *        new class. Any number of mixins can be added; later mixins take
     *        precedence.
     *
     *  [[Class.create]] creates a class and returns a constructor function for
     *  instances of the class. Calling the constructor function (typically as
     *  part of a `new` statement) will invoke the class's `initialize` method.
     *
     *  [[Class.create]] accepts two kinds of arguments. If the first argument is
     *  a [[Class]], it's used as the new class's superclass, and all its methods
     *  are inherited. Otherwise, any arguments passed are treated as objects,
     *  and their methods are copied over ("mixed in") as instance methods of the
     *  new class. In cases of method name overlap, later arguments take
     *  precedence over earlier arguments.
     *
     *  If a subclass overrides an instance method declared in a superclass, the
     *  subclass's method can still access the original method. To do so, declare
     *  the subclass's method as normal, but insert `$super` as the first
     *  argument. This makes `$super` available as a method for use within the
     *  function.
     *
     *  To extend a class after it has been defined, use [[Class#addMethods]].
     *
     *  For details, see the
     *  [inheritance tutorial](http://prototypejs.org/learn/class-inheritance)
     *  on the Prototype website.
     **/
    function subclass() {}

    function create() {
        var parent = null,
            properties = $A(arguments);
        if (isFunction(properties[0])) {
            parent = properties.shift();
        }

        function klass() {
            this.initialize.apply(this, arguments);
        }

        extend(klass, Class.Methods);
        klass.superclass = parent;
        klass.subclasses = [];

        if (parent) {
            subclass.prototype = parent.prototype;
            klass.prototype = new subclass();
            parent.subclasses.push(klass);
        }

        for (var i = 0, length = properties.length; i < length; i++) {
            klass.addMethods(properties[i]);
        }

        if (!klass.prototype.initialize) {
            klass.prototype.initialize = emptyFunction;
        }

        klass.prototype.constructor = klass;
        return klass;
    }

    /**
     *  Class#addMethods(methods) -> Class
     *    - methods (Object): The methods to add to the class.
     *
     *  Adds methods to an existing class.
     *
     *  [[Class#addMethods]] is a method available on classes that have been
     *  defined with [[Class.create]]. It can be used to add new instance methods
     *  to that class, or overwrite existing methods, after the class has been
     *  defined.
     *
     *  New methods propagate down the inheritance chain. If the class has
     *  subclasses, those subclasses will receive the new methods &mdash; even in
     *  the context of `$super` calls. The new methods also propagate to instances
     *  of the class and of all its subclasses, even those that have already been
     *  instantiated.
     *
     *  ##### Examples
     *
     *      var Animal = Class.create({
     *        initialize: function(name, sound) {
     *          this.name  = name;
     *          this.sound = sound;
     *        },
     *
     *        speak: function() {
     *          alert(this.name + " says: " + this.sound + "!");
     *        }
     *      });
     *
     *      // subclassing Animal
     *      var Snake = Class.create(Animal, {
     *        initialize: function($super, name) {
     *          $super(name, 'hissssssssss');
     *        }
     *      });
     *
     *      var ringneck = new Snake("Ringneck");
     *      ringneck.speak();
     *
     *      //-> alerts "Ringneck says: hissssssss!"
     *
     *      // adding Snake#speak (with a supercall)
     *      Snake.addMethods({
     *        speak: function($super) {
     *          $super();
     *          alert("You should probably run. He looks really mad.");
     *        }
     *      });
     *
     *      ringneck.speak();
     *      //-> alerts "Ringneck says: hissssssss!"
     *      //-> alerts "You should probably run. He looks really mad."
     *
     *      // redefining Animal#speak
     *      Animal.addMethods({
     *        speak: function() {
     *          alert(this.name + 'snarls: ' + this.sound + '!');
     *        }
     *      });
     *
     *      ringneck.speak();
     *      //-> alerts "Ringneck snarls: hissssssss!"
     *      //-> alerts "You should probably run. He looks really mad."
     **/
    function addMethods(source) {
        var ancestor = this.superclass && this.superclass.prototype,
            properties = Object.keys(source);
        //properties = _.keys(source);

        // IE6 doesn't enumerate `toString` and `valueOf` (among other built-in `Object.prototype`) properties,
        // Force copy if they're not Object.prototype ones.
        // Do not copy other Object.prototype.* for performance reasons
        if (IS_DONTENUM_BUGGY) {
            if (source.toString !== Object.prototype.toString) {
                properties.push('toString');
            }
            if (source.valueOf !== Object.prototype.valueOf) {
                properties.push('valueOf');
            }
        }

        for (var i = 0, length = properties.length; i < length; i++) {
            var property = properties[i],
                value = source[property];
            if (ancestor && isFunction(value) &&
                argumentNames(value)[0] === '$super') {
                var method = value;
                value = wrap((function(m) {
                    return function() {
                        return ancestor[m].apply(this, arguments);
                    };
                })(property), method);

                // We used to use `bind` to ensure that `toString` and `valueOf`
                // methods were called in the proper context, but now that we're 
                // relying on native bind and/or an existing polyfill, we can't rely
                // on the nuanced behavior of whatever `bind` implementation is on
                // the page.
                //
                // MDC's polyfill, for instance, doesn't like binding functions that
                // haven't got a `prototype` property defined.
                value.valueOf = (function(method) {
                    return function() {
                        return method.valueOf.call(method);
                    };
                })(method);

                value.toString = (function(method) {
                    return function() {
                        return method.toString.call(method);
                    };
                })(method);
            }
            this.prototype[property] = value;
        }

        return this;
    }

    return {
        create: create,
        Methods: {
            addMethods: addMethods
        }
    };
})();

module.exports = Class;
},{}],3:[function(require,module,exports){
/* jshint maxdepth: 5 */

var JSONCanonical;

// Source: https://github.com/mirkokiefer/canonical-json
/*
The original version of this code is taken from Douglas Crockford's json2.js:
https://github.com/douglascrockford/JSON-js/blob/master/json2.js

I made some modifications to ensure a canonical output.
*/
var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
var gap;
var indent;
var meta = { // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
    };
var rep;

function quote(string) {

    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.

    escapable.lastIndex = 0;
    return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
        var c = meta[a];
        return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
}

function str(key, holder) {

    // Produce a string from holder[key].

    var i, // The loop counter.
        k, // The member key.
        v, // The member value.
        length,
        mind = gap,
        partial,
        value = holder[key];

    // If the value has a toJSON method, call it to obtain a replacement value.

    if (value && typeof value === 'object' &&
        typeof value.toJSON === 'function') {
        value = value.toJSON(key);
    }

    // If we were called with a replacer function, then call the replacer to
    // obtain a replacement value.

    if (typeof rep === 'function') {
        value = rep.call(holder, key, value);
    }

    // What happens next depends on the value's type.

    switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

            // JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

            // If the value is a boolean or null, convert it to a string. Note:
            // typeof null does not produce 'null'. The case is included here in
            // the remote chance that this gets fixed someday.

            return String(value);

            // If the type is 'object', we might be dealing with an object or an array or
            // null.

        case 'object':

            // Due to a specification blunder in ECMAScript, typeof null is 'object',
            // so watch out for that case.

            if (!value) {
                return 'null';
            }

            // Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

            // Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

                // The value is an array. Stringify every element. Use null as a placeholder
                // for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

                // Join all of the elements together, separated with commas, and wrap them in
                // brackets.

                v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

            // If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

                // Otherwise, iterate through all of the keys in the object.
                var keysSorted = Object.keys(value).sort();
                for (i in keysSorted) {
                    k = keysSorted[i];
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

            // Join all of the member texts together, separated with commas,
            // and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
    }
}

// If the JSON object does not yet have a stringify method, give it one.
var stringify = function(value, replacer, space) {

    // The stringify method takes a value and an optional replacer, and an optional
    // space parameter, and returns a JSON text. The replacer can be a function
    // that can replace values, or an array of strings that will select the keys.
    // A default replacer method can be provided. Use of the space parameter can
    // produce text that is more easily readable.

    var i;
    gap = '';
    indent = '';

    // If the space parameter is a number, make an indent string containing that
    // many spaces.

    if (typeof space === 'number') {
        for (i = 0; i < space; i += 1) {
            indent += ' ';
        }

        // If the space parameter is a string, it will be used as the indent string.

    } else if (typeof space === 'string') {
        indent = space;
    }

    // If there is a replacer, it must be a function or an array.
    // Otherwise, throw an error.

    rep = replacer;
    if (replacer && typeof replacer !== 'function' &&
        (typeof replacer !== 'object' ||
            typeof replacer.length !== 'number')) {
        throw new Error('JSON.stringify');
    }

    // Make a fake root object containing our value under the key of ''.
    // Return the result of stringifying the value.

    return str('', {
        '': value
    });
};

JSONCanonical = {
    'stringify': stringify
};

module.exports = JSONCanonical;

},{}],4:[function(require,module,exports){
'use strict';

var ns = {
    Class: require('./Class'),
    JSONCanonical: require('./JSONCanonical'),
};

Object.freeze(ns);

module.exports = ns;

},{"./Class":2,"./JSONCanonical":3}],5:[function(require,module,exports){
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

    isEmpty: function() {
        var result = this.constraints.length === 0;
        return result;
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

},{"../ext/Class":2,"../sparql/ExprUtils":211,"./ElementsAndExprs":9,"lodash.foreach":433,"lodash.uniq":583}],6:[function(require,module,exports){
var ElementUtils = require('../sparql/ElementUtils');

var ExprVar = require('../sparql/expr/ExprVar');
var E_Lang = require('../sparql/expr/E_Lang');
var E_LangMatches = require('../sparql/expr/E_LangMatches');
var E_Regex = require('../sparql/expr/E_Regex');
var E_Equals = require('../sparql/expr/E_Equals');
var NodeValueUtils = require('../sparql/NodeValueUtils');

var ElementTriplesBlock = require('../sparql/element/ElementTriplesBlock');

var ElementsAndExprs = require('./ElementsAndExprs');

var Concept = require('../sparql/Concept');
var ConceptUtils = require('../sparql/ConceptUtils');

var ConstraintUtils = {
    createConstraintExists: function(rootFacetNode, path) {

        var facetNode = rootFacetNode.forPath(path);
        var elements = ElementUtils.createElementsTriplesBlock(facetNode.getTriples());
        var result = new ElementsAndExprs(elements, []);

        return result;
    },

    createConstraintLang: function(rootFacetNode, path, langStr) {
        var facetNode = rootFacetNode.forPath(path);

        var pathVar = facetNode.getVar();
        var exprVar = new ExprVar(pathVar);

        var elements = ElementUtils.createElementsTriplesBlock(facetNode.getTriples());

        // NOTE Value is assumed to be node holding a string, maybe check it here
        var val = langStr; //constraintSpec.getValue().getLiteralValue();

        var exprs = [new E_LangMatches(new E_Lang(exprVar), val)];

        var result = new ElementsAndExprs(elements, exprs);

        //console.log('constraintSpec.getValue() ', constraintSpec.getValue());
        return result;
    },

    createConstraintRegex: function(rootFacetNode, path, str) {
        var facetNode = rootFacetNode.forPath(path);

        var pathVar = facetNode.getVar();
        var exprVar = new ExprVar(pathVar);

        var elements = ElementUtils.createElementsTriplesBlock(facetNode.getTriples());

        // NOTE Value is assumed to be node holding a string, maybe check it here
        var val = str; //constraintSpec.getValue().getLiteralValue();


        var exprs = [new E_Regex(exprVar, val, 'i')];

        var result = new ElementsAndExprs(elements, exprs);

        //console.log('constraintSpec.getValue() ', constraintSpec.getValue());
        return result;
    },

    createConstraintEquals: function(rootFacetNode, path, node) {
        var facetNode = rootFacetNode.forPath(path);

        var pathVar = facetNode.getVar();
        var exprVar = new ExprVar(pathVar);

        var elements = ElementUtils.createElementsTriplesBlock(facetNode.getTriples());

        //var valueExpr = constraintSpec.getValue();
        var valueExpr = NodeValueUtils.makeNode(node); //constraintSpec.getValue());


        var exprs = [new E_Equals(exprVar, valueExpr)];

        var result = new ElementsAndExprs(elements, exprs);

        //console.log('constraintSpec.getValue() ', constraintSpec.getValue());
        return result;
    },

    createConstraintConcept: function(rootFacetNode, path, filterConcept) {
        var facetNode = rootFacetNode.forPath(path);

        var pathVar = facetNode.getVar();
        var element = new ElementTriplesBlock(facetNode.getTriples());

        var pathConcept = new Concept(element, pathVar);
        var resultConcept = ConceptUtils.createCombinedConcept(pathConcept, filterConcept, true, false);

        var exprs = [];

        var result = new ElementsAndExprs([resultConcept.getElement()], exprs);

        //console.log('constraintSpec.getValue() ', constraintSpec.getValue());
        return result;

    },
};

module.exports = ConstraintUtils;

},{"../sparql/Concept":203,"../sparql/ConceptUtils":204,"../sparql/ElementUtils":207,"../sparql/NodeValueUtils":216,"../sparql/element/ElementTriplesBlock":237,"../sparql/expr/E_Equals":246,"../sparql/expr/E_Lang":249,"../sparql/expr/E_LangMatches":250,"../sparql/expr/E_Regex":258,"../sparql/expr/ExprVar":269,"./ElementsAndExprs":9}],7:[function(require,module,exports){
var Class = require('../ext/Class');

var HashMap = require('../util/collection/HashMap');

var NodeUtils = require('../rdf/NodeUtils');
var NodeFactory = require('../rdf/NodeFactory');

var ElementSubQuery = require('../sparql/element/ElementSubQuery');
var ElementUnion = require('../sparql/element/ElementUnion');
var ElementFilter = require('../sparql/element/ElementFilter');
var ElementGroup = require('../sparql/element/ElementGroup');
var Query = require('../sparql/Query');

var Concept = require('../sparql/Concept');
var ConceptUtils = require('../sparql/ConceptUtils');

var ExprVar = require('../sparql/expr/ExprVar');
var E_OneOf = require('../sparql/expr/E_OneOf');

//var ListServiceConcept = require('../service/list_service/ListServiceConcept');
var ListServiceSparqlQuery = require('../service/list_service/ListServiceSparqlQuery');

//var FacetService = require('./FacetService');
var LookupService = require('../service/lookup_service/LookupService');
var FacetUtils = require('./FacetUtils');

var Relation = require('../sparql/Relation');
var RelationUtils = require('../sparql/RelationUtils');
var VarUtils = require('../sparql/VarUtils');


var AggMap = require('../sponate/agg/AggMap');
var AggTransform = require('../sponate/agg/AggTransform');
var AggLiteral = require('../sponate/agg/AggLiteral');
var BindingMapperExpr = require('../sponate/binding_mapper/BindingMapperExpr');
var LookupServiceUtils = require('../sponate/LookupServiceUtils');
var ServiceUtils = require('../sponate/ServiceUtils');

var shared = require('../util/shared');
var Promise = shared.Promise;

var QueryUtils = require('../sparql/QueryUtils');

var CountUtils = {
    createAggMapCount: function(sourceVar, targetVar) {
        //var result = new AggTransform(new AggLiteral(new BindingMapperExpr(new ExprVar(targetVar))), NodeUtils.getValue);
        var result =
            new AggMap(
                new BindingMapperExpr(new ExprVar(sourceVar)),
                new AggTransform(new AggLiteral(new BindingMapperExpr(new ExprVar(targetVar))), NodeUtils.getValue));

        return result;
    },

    execQueries: function(sparqlService, subQueries, sourceVar, targetVar) {
        var query = QueryUtils.createQueryUnionSubQueries(subQueries, [sourceVar, targetVar]);

        var result;
        if(query) {
            var agg = this.createAggMapCount(sourceVar, targetVar);
            result = ServiceUtils.execAgg(sparqlService, query, agg);
            //var ls = LookupServiceUtils.createLookupServiceAgg(sparqlService, query, sourceVar, agg);
            //result = ls.lookup(); // unconstrained lookup
        } else {
            result = Promise.resolve(new HashMap());
        }

        return result;
    },

    createQueriesPreCount: function(facetRelationIndex, countVar, properties, rowLimit) {
        // Create the queries
        var defaultRelation = facetRelationIndex.getDefaultRelation();
        var propertyToRelation = facetRelationIndex.getPropertyToRelation();
//throw new Error('here' + JSON.stringify(properties));
        var result = properties.map(function(property) {
            var relation = propertyToRelation.get(property);
            if(!relation) {
                relation = defaultRelation;
            }

            var r = RelationUtils.createQueryRawSize(relation, property, countVar, rowLimit);
            return r;
        });

        return result;
    },

    createQueriesExactCount: function(facetRelationIndex, countVar, properties) {
        var sourceVar = facetRelationIndex.getSourceVar();
        var defaultRelation = facetRelationIndex.getDefaultRelation();
        var propertyToRelation = facetRelationIndex.getPropertyToRelation();

        var defaultProperties = [];
        var result = [];

        // If properties map to a relation, we can create the query right away,
        // as this indicates that special constraints apply that do not apply to any other property
        properties.forEach(function(property) {
            var relation = propertyToRelation.get(property);
            if(!relation) {
                defaultProperties.push(property);
            } else {
                var query = RelationUtils.createQueryDistinctValueCount(relation, countVar);
                result.push(query);
            }
        });

        // Those properties that did not map to a relation can be grouped into a single query
        var fr = defaultRelation;
        var filter = new ElementFilter(new E_OneOf(new ExprVar(sourceVar), defaultProperties));
        var filteredRel = new Relation(new ElementGroup([fr.getElement(), filter]), fr.getSourceVar(), fr.getTargetVar());
        var defaultQuery = RelationUtils.createQueryDistinctValueCount(filteredRel, countVar);

        result.push(defaultQuery);

        return result;
    },

};

module.exports = CountUtils;

},{"../ext/Class":2,"../rdf/NodeFactory":91,"../rdf/NodeUtils":92,"../service/list_service/ListServiceSparqlQuery":146,"../service/lookup_service/LookupService":151,"../sparql/Concept":203,"../sparql/ConceptUtils":204,"../sparql/Query":218,"../sparql/QueryUtils":220,"../sparql/Relation":221,"../sparql/RelationUtils":222,"../sparql/VarUtils":227,"../sparql/element/ElementFilter":232,"../sparql/element/ElementGroup":233,"../sparql/element/ElementSubQuery":236,"../sparql/element/ElementUnion":238,"../sparql/expr/E_OneOf":257,"../sparql/expr/ExprVar":269,"../sponate/LookupServiceUtils":287,"../sponate/ServiceUtils":294,"../sponate/agg/AggLiteral":312,"../sponate/agg/AggMap":313,"../sponate/agg/AggTransform":317,"../sponate/binding_mapper/BindingMapperExpr":320,"../util/collection/HashMap":343,"../util/shared":351,"./FacetUtils":20}],8:[function(require,module,exports){
var FacetUtils = require('./FacetUtils');
var ElementGroup = require('../sparql/element/ElementGroup');
var ElementOptional = require('../sparql/element/ElementOptional');
var Path = require('./Path');

var ElementUtils = {


    /**
     * Creates an element based on the given paths,
     * where each path can be considered as mapped to a column in a table
     *
     */
    createElementTable: function(facetConfig, paths) {
        //var facetConceptGenerator = facete.FaceteUtils.createFacetConceptGenerator(this.facetConfig);
        //var concept = facetConceptGenerator.createConceptResources(new facete.Path());
        var concept = FacetUtils.createConceptResources(facetConfig, new Path(), false);


        var rootFacetNode = this.facetConfig.getRootFacetNode();


        var pathElements = this.paths.map(function(path) {
            var facetNode = rootFacetNode.forPath(path);

            //console.log('facetNode: ', facetNode);

            var e = facetNode.getElements(true);


            // TODO On certain constraints affecting the path, we can skip the Optional
            var g = new ElementGroup(e);

            var r;
            if(e.length !== 0) {
                r = new ElementOptional(g);
            }
            else {
                r = g;
            }

            return r;
        });

        var elements = [];
        elements.push.apply(elements, concept.getElements());
        elements.push.apply(elements, pathElements);

        var tmp = new ElementGroup(elements);

        var result = tmp.flatten();

        return result;
    }
};

module.exports = ElementUtils;


},{"../sparql/element/ElementGroup":233,"../sparql/element/ElementOptional":234,"./FacetUtils":20,"./Path":21}],9:[function(require,module,exports){
var Class = require('../ext/Class');

var ElementUtils = require('../sparql/ElementUtils');

var ElementsAndExprs = Class.create({
    initialize: function(elements, exprs) {
        this.elements = elements;
        this.exprs = exprs;
    },

    getElements: function() {
        return this.elements;
    },

    getExprs: function() {
        return this.exprs;
    },

    toElements: function() {
        var result = [];

        var filterElements = ElementUtils.createFilterElements(this.exprs);

        result.push.apply(result, this.elements);
        result.push.apply(result, filterElements);

        return result;
    },

});

module.exports = ElementsAndExprs;


},{"../ext/Class":2,"../sparql/ElementUtils":207}],10:[function(require,module,exports){
var Class = require('../ext/Class');

var ConceptUtils = require('../sparql/ConceptUtils');

var FacetNode = require('./FacetNode'); 
var ConstraintManager = require('./ConstraintManager');

/**
 * The FacetConfig holds the most essential information for creating the facet tree
 *
 * Filtering by labels, ordering by scores and tagging the data are to be
 * implemented as additional layers on top of concepts created from this information
 *
 * @param {jassa.sparql.Concept} The concept specifying the initial set of resources
 * @param {jassa.facete.FacetNode} A mapping from path to allocated variables
 * @param {jassa.facete.ConstraintManager} The set of active constraints
 *
 */
var FacetConfig = Class.create({
    classLabel: 'jassa.facete.FacetConfig',
    
    initialize: function(baseConcept, rootFacetNode, constraintManager) {
        this.baseConcept = baseConcept || ConceptUtils.createSubjectConcept();
        this.rootFacetNode = rootFacetNode || FacetNode.createRoot(this.baseConcept.getVar());
        this.constraintManager = constraintManager || new ConstraintManager();
    },
    
    getBaseConcept: function() {
        return this.baseConcept;
    },
    
    setBaseConcept: function(baseConcept) {
        this.baseConcept = baseConcept;
    },
    
    getRootFacetNode: function() {
        return this.rootFacetNode;
    },
    
    setRootFacetNode: function(rootFacetNode) {
        this.rootFacetNode = rootFacetNode;
    },
    
    getConstraintManager: function() {
        return this.constraintManager;
    },
    
    setConstraintManager: function(constraintManager) {
        this.constraintManager = constraintManager;
    },
    
});

module.exports = FacetConfig;

},{"../ext/Class":2,"../sparql/ConceptUtils":204,"./ConstraintManager":5,"./FacetNode":11}],11:[function(require,module,exports){
var Class = require('../ext/Class');

var NodeFactory = require('../rdf/NodeFactory');

var ElementTriplesBlock = require('../sparql/element/ElementTriplesBlock'); 
var GenSym = require('../sparql/GenSym');
var VarUtils = require('../sparql/VarUtils');

var Path = require('./Path');
var Step = require('./Step');
var VarNode = require('./VarNode');


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
        
        this.idToChild = {};
        
        //this.idToConstraint = {};
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

    getIdStr: function() {
        // TODO concat this id with those of all parents
    },
    
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
        
        var stepId = '' + JSON.stringify(step);
        
        var child = this.idToChild[stepId];
        
        if(!child) {
            
            var subVarNode = this.varNode.forStepId(stepId);
            
            child = new FacetNode(subVarNode, step, this, this.root);
            
            /*
            child = {
                    step: step,
                    child: facet
            };*/
            
            //Unless we change something
            // we do not add the node to the parent
            this.idToChild[stepId] = child;             
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

},{"../ext/Class":2,"../rdf/NodeFactory":91,"../sparql/GenSym":212,"../sparql/VarUtils":227,"../sparql/element/ElementTriplesBlock":237,"./Path":21,"./Step":25,"./VarNode":28}],12:[function(require,module,exports){
var Class = require('../ext/Class');
var ListFilter = require('../service/ListFilter');

// @Deprecated - DON'T USE!
var FacetNodeState = Class.create({
    initialize: function(isExpanded, isInverse, listFilter) {
        this._isExpanded = !!isExpanded;
        this._isInverse = !!isInverse;
        this.listFilter = listFilter || new ListFilter();
    },

    getListFilter: function() {
        return this.listFilter;
    },

    setListFilter: function(listFilter) {
        this.listFilter = listFilter;
    },

    isExpanded: function() {
        return this._isExpanded;
    },

    setExpanded: function(isExpanded) {
        this._isExpanded = isExpanded;
    },

    isInverse: function() {
        return this._isInverse;
    },

    setInverse: function(isInverse) {
        this._isInverse = isInverse;
    }

});

module.exports = FacetNodeState;

},{"../ext/Class":2,"../service/ListFilter":119}],13:[function(require,module,exports){
var Class = require('../ext/Class');

var FacetRelationIndex = Class.create({
    initialize: function(sourceVar, defaultRelation, propertyToRelation) {
        this.sourceVar = sourceVar;
        this.defaultRelation = defaultRelation;
        this.propertyToRelation = propertyToRelation;
    },
    
    getSourceVar: function() {
        return this.sourceVar;
    },

    getDefaultRelation: function() {
        return this.defaultRelation;
    },

    getPropertyToRelation: function() {
        return this.propertyToRelation;
    },
    
});


module.exports = FacetRelationIndex;

},{"../ext/Class":2}],14:[function(require,module,exports){
var Class = require('../ext/Class');
var FacetServiceUtils = require('./FacetServiceUtils');

var FacetServiceFn = require('./facet_service/FacetServiceFn');
var FacetServiceClientIndex = require('./facet_service/FacetServiceClientIndex');

var BestLabelConfig = require('../sparql/BestLabelConfig');
var LookupServiceUtils = require('../sponate/LookupServiceUtils');
var FacetServiceTransformConcept = require('./facet_service/FacetServiceTransformConcept');

var ListServiceTransformItem = require('../service/list_service/ListServiceTransformItem');
var ListServiceTransformItems = require('../service/list_service/ListServiceTransformItems');
var MappedConceptUtils = require('../sponate/MappedConceptUtils');

var LabelUtils = require('../sparql/LabelUtils');
var KeywordSearchUtils = require('../sparql/search/KeywordSearchUtils');

var HashMap = require('../util/collection/HashMap');

var FacetServiceBuilder = Class.create({
   initialize: function(facetService, defaultSparqlService) {
       this.facetService = facetService;
       this.defaultSparqlService = defaultSparqlService;
   },

   create: function() {
       return this.facetService;
   },

   labelConfig: function(bestLiteralConfig) {
       bestLiteralConfig = bestLiteralConfig || new BestLabelConfig();

       this._labelConfigLabels(bestLiteralConfig);
       this._labelConfigFilter(bestLiteralConfig);

       return this;
   },

   tagFn: function(tagFn) {
     this.facetService = new FacetServiceFn(this.facetService, function(listService) {
         var r = new ListServiceTransformItem(listService, tagFn);
         return r;
     });

     return this;
   },


   pathToTags: function(pathToTags, mapAttr) {
       pathToTags = pathToTags || new HashMap();
       mapAttr = mapAttr || 'tags';

       this.facetService = new FacetServiceFn(this.facetService, function(listService) {
           var r = new ListServiceTransformItems(listService, function(entries) {
               entries.forEach(function(entry) {
                   var val = entry.val;
                   var path = val.path;

                   var tags = pathToTags.get(path);
                   if(!tags) {
                       tags = {};
                       pathToTags.put(path, tags);
                   }
                   val[mapAttr] = tags;
               });

               return entries;
           });
           return r;
       });

       return this;
   },

   _labelConfigFilter: function(bestLiteralConfig) {
       // TODO: Make the search function configurable
       var fnTransformSearch = function(searchString) {
           var r;
           if(searchString) {

               var relation = LabelUtils.createRelationPrefLabels(bestLiteralConfig);
               r = KeywordSearchUtils.createConceptRegex(relation, searchString);
               //var result = sparql.KeywordSearchUtils.createConceptBifContains(relation, searchString);
           } else {
               r = null;
           }

           return r;
       };

       this.facetService = new FacetServiceTransformConcept(this.facetService, fnTransformSearch);
       return this;
   },

   _labelConfigLabels: function(bestLiteralConfig, labelAttrName) {
       labelAttrName = labelAttrName || 'labelInfo';
       var self = this;

       this.facetService = new FacetServiceFn(this.facetService, function(listService) {

           var r = new ListServiceTransformItems(listService, function(entries) {

               var mappedConcept = MappedConceptUtils.createMappedConceptBestLabel(bestLiteralConfig);
               var lookupServiceNodeLabels = LookupServiceUtils.createLookupServiceMappedConcept(self.defaultSparqlService, mappedConcept);

               var properties = entries.map(function(entry) {
                   return entry.val.property;
               });

               //console.log('Properties: ' + JSON.stringify(properties));

               var s = lookupServiceNodeLabels.lookup(properties).then(function(map) {
                   entries.forEach(function(entry) {
                       entry.val[labelAttrName] = map.get(entry.val.property);
                   });

                   return entries;
               });

               return s;
           });

           return r;
       });

       return this;
   },

   // NOTE: A label config must already have been provided before calling this function
   index: function() {
       var filterSupplierFn = function(searchString) {
           var result;

           if(searchString != null) {
               var re = new RegExp(searchString, 'mi');

               result = function(entry) {
                   //var key = entry.key;
                   //var labelInfo = fnLabelInfo(key);
                   var labelInfo = entry.val.labelInfo || { id: entry.key.getUri(), displayLabel: entry.key.getUri(), hiddenLabels: []};
//console.log('labelInfo' + JSON.stringify(entry));
                   var m1 = re.test(labelInfo.id);
                   var m2 = m1 || re.test(labelInfo.displayLabel);
                   var m3 = m2 || (labelInfo.hiddenLabels && labelInfo.hiddenLabels.some(function(x) { return re.test(x); }));

                   return m3;
               };
           } else {
               result = function(entry) { return true; };
           }

           return result;
       };

       this.facetService = new FacetServiceClientIndex(this.facetService, filterSupplierFn, 100);

       return this;
   }


});

FacetServiceBuilder.core = function(sparqlService, facetConfig) {
    var facetService = FacetServiceUtils.createFacetService(sparqlService, facetConfig);
    var result = new FacetServiceBuilder(facetService, sparqlService);
    return result;
};

module.exports = FacetServiceBuilder;

},{"../ext/Class":2,"../service/list_service/ListServiceTransformItem":149,"../service/list_service/ListServiceTransformItems":150,"../sparql/BestLabelConfig":199,"../sparql/LabelUtils":215,"../sparql/search/KeywordSearchUtils":280,"../sponate/LookupServiceUtils":287,"../sponate/MappedConceptUtils":290,"../util/collection/HashMap":343,"./FacetServiceUtils":15,"./facet_service/FacetServiceClientIndex":43,"./facet_service/FacetServiceFn":44,"./facet_service/FacetServiceTransformConcept":49}],15:[function(require,module,exports){
//var Class = require('../ext/Class');

var ConceptUtils = require('../sparql/ConceptUtils');
var FacetNode = require('./FacetNode');
var FacetConceptSupplierExact = require('./facet_concept_supplier/FacetConceptSupplierExact');
//var FacetConceptSupplierMeta = require('./facet_concept_supplier/FacetConceptSupplierMeta');
var FacetConceptSupplierDeclared = require('./facet_concept_supplier/FacetConceptSupplierDeclared');

var FacetServiceSparql = require('./facet_service/FacetServiceSparql');
var FacetServiceTransformConcept = require('./facet_service/FacetServiceTransformConcept');
var FacetServiceClientIndex = require('./facet_service/FacetServiceClientIndex');
var FacetServiceLookup = require('./facet_service/FacetServiceLookup');

var LabelUtils = require('../sparql/LabelUtils');
var KeywordSearchUtils = require('../sparql/search/KeywordSearchUtils');


var FacetConfig = require('./FacetConfig');
var ConstraintManager = require('./ConstraintManager');


var BestLabelConfig = require('../sparql/BestLabelConfig');
var MappedConceptUtils = require('../sponate/MappedConceptUtils');
var LookupServiceUtils = require('../sponate/LookupServiceUtils');

var LookupServiceMulti = require('../service/lookup_service/LookupServiceMulti');
var LookupServiceKeyMap = require('../service/lookup_service/LookupServiceKeyMap');
var LookupServiceTransformKey = require('../service/lookup_service/LookupServiceTransformKey');
var LookupServiceFn = require('../service/lookup_service/LookupServiceFn');
var LookupServiceConst = require('../service/lookup_service/LookupServiceConst');


var FacetUtils = require('./FacetUtils');
var LookupServiceFacetCount = require('./lookup_service/LookupServiceFacetCount');
var LookupServiceFacetPreCount = require('./lookup_service/LookupServiceFacetPreCount');
var LookupServiceFacetExactCount = require('./lookup_service/LookupServiceFacetExactCount');

var Step = require('./Step');
var Path = require('./Path');

var FacetServiceUtils = {
    /*
    initialize: function(sparqlService, baseConcept, rootFacetNode) {
        this.sparqlService = sparqlService;
        this.baseConcept = baseConcept || ConceptUtils.createSubjectConcept();
        this.rootFacetNode = rootFacetNode || FacetNode.createRoot(this.baseConcept.getVar());


        this.lookupServiceNodeLabels = null; // TODO init

        //this.baseConcept = baseConcept || ConceptUtils.createSubjectConcept();
        //this.rootFacetNode =

    },
    */

    createFacetConceptSupplier: function(facetConfig) {

        //var result = new FacetConceptSupplierExact(facetConfig);

        var result = new FacetConceptSupplierDeclared(facetConfig);
        //var facetConceptSupplierMeta = new FacetConceptSupplierMeta(facetConceptSupplierExact);

        /*
        var isSubjectConcept = this.baseConcept.isSubjectConcept();
        var isUnconstrained = constraintManager.getConstraints().length === 0;
        if(isSubjectConcept && isUnconstrained) {
            // TODO: We could do a pre-check about whether the set of declared properties is empty

            // We could use the declared set of properties
            console.log('Detected that declared properties could be used');
            //facetConceptSupplierMeta.getPathHeadToConcept().put(new PathHead(), ConceptUtils.listDeclaredProperties);
        }*/

        return result;
    },

    createFacetService: function(sparqlService, facetConfig) { // , pathTaggerFn

        var facetConceptSupplier = FacetServiceUtils.createFacetConceptSupplier(facetConfig);



        // TODO: Make the search function configurable
//        var fnTransformSearch = function(searchString) {
//            var r;
//            if(searchString) {
//
//                var relation = LabelUtils.createRelationPrefLabels(bestLabelConfig);
//                r = KeywordSearchUtils.createConceptRegex(relation, searchString);
//                //var result = sparql.KeywordSearchUtils.createConceptBifContains(relation, searchString);
//            } else {
//                r = null;
//            }
//
//            return r;
//        };
//
        var result = new FacetServiceSparql(sparqlService, facetConceptSupplier);
//        result = new FacetServiceTransformConcept(result, fnTransformSearch);

        // NOTE: The client index will only activate if there are not too
        // many properties - otherwise it will disable itself, such as on freebase
        // result = new FacetServiceClientIndex(result, lookupServiceNodeLabels);


        // Up to this point, the facet service will only create list services
        // that return lists of properties
        // Now we decorate them to include label information and counts

        //var self = this;
        var createLookupService = function(pathHead) {

            //var basePath = pathHead ? pathHead.getPath() : new Path();
            //console.log('PathHead: ' + pathHead);

//            var lsTags;
//            if(pathTaggerFn) {
//                var pathTaggerLs = new LookupServiceFn(pathTaggerFn);
//
//                lsTags = new LookupServiceTransformKey(pathTaggerLs, function(property) {
//                    var path;
//                    if(pathHead) {
//                        var step = new Step(property.getUri(), pathHead.isInverse());
//                        path = pathHead.getPath().copyAppendStep(step);
//                    } else {
//                        path = new Path();
//                    }
//
//                    return path;
//                });
//            } else {
//                lsTags = null;
//            }

            var r;
            if(pathHead == null) {
                //console.log('Tagger for path ' + pathHead + ': ' + lsTags);
                r = new LookupServiceMulti({
                    id: new LookupServiceKeyMap(), // identity mapping
                    countInfo: new LookupServiceConst({count: 0, hasMoreItems: true}),
                    //labelInfo: new LookupServiceConst({displayLabel: 'root', hiddenLabels: ['root']}),
                    //tags : lsTags
                });
            } else {

                // TODO We could make lsPreCount and lsExactCount to depend on a complete path
                // rather than just a property - that would make tagging of facets much easier
                // Alternatively we could use a LookupServiceTransformKey which prepends the path
                // before passing it to a path-based lookup service


                var facetRelationIndex = FacetUtils.createFacetRelationIndex(facetConfig, pathHead);
                var lsPreCount = new LookupServiceFacetPreCount(sparqlService, facetRelationIndex);
                var lsExactCount = new LookupServiceFacetExactCount(sparqlService, facetRelationIndex);
                var lsCount = new LookupServiceFacetCount(lsPreCount, lsExactCount);

                r = new LookupServiceMulti({
                    id: new LookupServiceKeyMap(), // identity mapping
                    //countInfo: lsCount
                    valueCountInfo: lsCount
                    //labelInfo: lookupServiceNodeLabels,
                    //tags : lsTags
                });
            }

            return r;
        };


        result = new FacetServiceLookup(result, createLookupService);

        /* Counting */

        /*
        var facetRelationIndex = facete.FacetUtils.createFacetRelationIndex(facetConfig, pathHead);
        var lsPreCount = new facete.LookupServiceFacetPreCount(this.sparqlService, facetRelationIndex);
        var lsExactCount = new facete.LookupServiceFacetExactCount(this.sparqlService, facetRelationIndex);
        var ls = new facete.LookupServiceFacetCount(lsPreCount, lsExactCount);
        */


        //ListServiceConceptKeyLookup(ls,)


        // We still need to append information such as labels, counts and tags to the facets





        //var path = facete.Path.parse('http://fp7-pp.publicdata.eu/ontology/funding');
        //var pathHead = new facete.PathHead(facete.Path.parse(''), false);
        //var listService = facetService.createListService(pathHead);


        return result;
    }
};

module.exports = FacetServiceUtils;

},{"../service/lookup_service/LookupServiceConst":155,"../service/lookup_service/LookupServiceFn":157,"../service/lookup_service/LookupServiceKeyMap":159,"../service/lookup_service/LookupServiceMulti":161,"../service/lookup_service/LookupServiceTransformKey":165,"../sparql/BestLabelConfig":199,"../sparql/ConceptUtils":204,"../sparql/LabelUtils":215,"../sparql/search/KeywordSearchUtils":280,"../sponate/LookupServiceUtils":287,"../sponate/MappedConceptUtils":290,"./ConstraintManager":5,"./FacetConfig":10,"./FacetNode":11,"./FacetUtils":20,"./Path":21,"./Step":25,"./facet_concept_supplier/FacetConceptSupplierDeclared":39,"./facet_concept_supplier/FacetConceptSupplierExact":40,"./facet_service/FacetServiceClientIndex":43,"./facet_service/FacetServiceLookup":45,"./facet_service/FacetServiceSparql":47,"./facet_service/FacetServiceTransformConcept":49,"./lookup_service/LookupServiceFacetCount":57,"./lookup_service/LookupServiceFacetExactCount":58,"./lookup_service/LookupServiceFacetPreCount":59}],16:[function(require,module,exports){
var Class = require('../ext/Class');

var BestLabelConfig = require('../sparql/BestLabelConfig');
var FacetConfig = require('./FacetConfig');
var HashMap = require('../util/collection/HashMap');
//var FacetNodeState = require('./FacetNodeState');
var FacetTreeState = require('./FacetTreeState');
var ListFilter = require('../service/ListFilter');

var FacetTreeConfig = Class.create({
    initialize: function(facetConfig, bestLiteralConfig, facetTreeState, pathToTags, pathHeadToTags, tagFn) {
        this.facetConfig = facetConfig || new FacetConfig();
        this.bestLiteralConfig = bestLiteralConfig || new BestLabelConfig();

        this.facetTreeState = facetTreeState || new FacetTreeState();

        this.pathToTags = pathToTags || new HashMap();
        //this.pathHeadToTags = pathHeadToTags || new HashMap();
        this.tagFn = tagFn;
    },

    getFacetConfig: function() {
        return this.facetConfig;
    },

    getFacetTreeState: function() {
        return this.facetTreeState;
    },

    getBestLiteralConfig: function() {
        return this.bestLiteralConfig;
    },

    getPathToTags: function() {
        return this.pathToTags;
    },

//    getPathHeadToTags: function() {
//        return this.pathHeadToTags;
//    },

    getTagFn: function() {
        return this.tagFn;
    }
});

/*
var FacetTreeConfig = Class.create({
    initialize: function(defaultState) {
        //this.defaultState = defaultState || new FacetNodeState();
        this.pathToState = new HashMap();
    },

    getState: function(path) {
        var result = this.pathToState.get(path);
        if(!result) {
            result = new FacetNodeState();
            this.pathToState.put(path, result);
        }
        //var result = override || this.defaultState;
        return result;
    },

    setState: function(path, state) {
        this.pathToState.put(path, state);
    },

});
*/


module.exports = FacetTreeConfig;

},{"../ext/Class":2,"../service/ListFilter":119,"../sparql/BestLabelConfig":199,"../util/collection/HashMap":343,"./FacetConfig":10,"./FacetTreeState":19}],17:[function(require,module,exports){
var Step = require('./Step');
var Path = require('./Path');
var PathHead = require('./PathHead');

var shared = require('../util/shared');
var Promise = shared.Promise;

var FacetNodeState = require('./FacetNodeState');
var ListFilter = require('../service/ListFilter');

var ObjectUtils = require('../util/ObjectUtils');



var FacetTreeServiceHelpers = {//Class.create({
//    initialize: function(facetService) {
//        this.facetService = facetService;
//    },

    fetchFacetTree: function(facetService, facetTreeState, startPath) {
        var result = FacetTreeServiceHelpers.fetchFacetTreePathRec(facetService, facetTreeState, startPath).then(function(superRootFacet) {
            var r = startPath == null ? superRootFacet.outgoing.children[0] : superRootFacet;
            return r;
        });

        return result;
    },

    /**
     * Note: This method fetches the *sub*Facets at a given path
     * If the startPath is null, conceptually the children of the 'superRoot' facets are returned,
     * which is an array containing solely the 'root' facet.
     */
    fetchFacetTreePathRec: function(facetService, facetTreeState, startPath) {
        // startPath must not be undefined, but may be null to indicate the root facet
        startPath = startPath || null;

        var pathExpansions = facetTreeState.getPathExpansions();
        var pathToDirection = facetTreeState.getPathToDirection();

        var isExpanded = startPath ? pathExpansions.contains(startPath) : true;
        var dir = pathToDirection.get(startPath) || 1;

        var promises = [];
        if(isExpanded) {
            var pathHead;
            var p;

            if(dir == null || dir === 1 || dir === 2) {
                pathHead = startPath ? new PathHead(startPath, false) : null;
                p = this.fetchFacetTreePathHeadRec(facetService, facetTreeState, pathHead);
                promises.push(p);
            } else {
                promises.push(null);
            }

            if(dir === -1 || dir === 2) {
                pathHead = startPath ? new PathHead(startPath, true) : null;
                p = this.fetchFacetTreePathHeadRec(facetService, facetTreeState, pathHead);
                promises.push(p);
            } else {
                promises.push(null);
            }

        }

        return Promise.all(promises).spread(function(outgoing, incoming) {
            var r = {
                path: startPath,
                isExpanded: isExpanded,
                outgoing: outgoing,
                incoming: incoming
            };

            return r;
        });
    },


    fetchFacetTreePathHeadRec: function(facetService, facetTreeState, pathHead) {

        var pathHeadToFilter = facetTreeState.getPathHeadToFilter();
        var listFilter = pathHeadToFilter.get(pathHead) || new ListFilter(null, 10);

        //console.log('ListFilter for ' + pathHead + ': ', JSON.stringify(listFilter));
        //var pathHead = startPath ? new PathHead(startPath, state.isInverse()) : null;

        var result = Promise
            .resolve(facetService.prepareListService(pathHead))
            .then(function(listService) {
                var p1 = listService.fetchItems(listFilter.getConcept(), listFilter.getLimit(), listFilter.getOffset());
                var p2 = listService.fetchCount(listFilter.getConcept());
                return [p1, p2];
            }).spread(function(facetEntries, countInfo) {

                // FacetInfos
                // |- countInfo
                // |- labelInfo
                var facetInfos = facetEntries.map(function(entry) {
                    return entry.val;
                });

                // Pluck the ID attributes
                var subPromises = facetInfos.map(function(facetInfo) {
                    //console.log('subPath:', JSON.stringify(facetEntries));

                    var subPath = facetInfo.path;
                    if(!subPath) {
                        throw new Error('Could not obtain a path for the sub facets of ' + JSON.stringify(facetInfo));
                    }

                    var r = FacetTreeServiceHelpers.fetchFacetTreePathRec(facetService, facetTreeState, subPath);

                    return r;
                });

                var r = Promise.all(subPromises).then(function(children) {

                    facetInfos.forEach(function(facetInfo, i) {
                        var child = children[i];
                        ObjectUtils.extend(facetInfo, child);
                    });

                    var info = {
                        path: pathHead ? pathHead.getPath() : null,
                        pathHead: pathHead,
                        childCountInfo: countInfo,
                        listFilter: listFilter,
                        children: facetInfos
                    };

                    return info;
                });


                return r;
            });

        return result;
    },
};


module.exports = FacetTreeServiceHelpers;

},{"../service/ListFilter":119,"../util/ObjectUtils":332,"../util/shared":351,"./FacetNodeState":12,"./Path":21,"./PathHead":22,"./Step":25}],18:[function(require,module,exports){
var FacetTreeService = require('./facet_tree_service/FacetTreeService');
var HashMap = require('../util/collection/HashMap');
var FacetServiceBuilder = require('./FacetServiceBuilder');
var FacetNodeState = require('./FacetNodeState');


var FacetTreeServiceUtils = {

    createFacetTreeService: function(sparqlService, facetTreeConfig) {


        var facetConfig = facetTreeConfig.getFacetConfig();
        //var tagMap = new HashMap();
        var pathToTags = facetTreeConfig.getPathToTags();

        //var pathToState = facetTreeConfig.getPathToState();

        var tagFn = function(entry) {
            var userFn = facetTreeConfig.getTagFn();
            if(userFn) {
                entry = userFn(entry);
            }

//            var key = entry.key;

//            var state = pathToState.get(key);
//            if(!state) {
//                state = new FacetNodeState();
//                pathToState.put(key, state);
//            }
//
//            entry.val.tags.state = state;
            return entry;
        };

        //var facetService = new facete.FacetServiceUtils.createFacetService(sparqlService, facetConfig, tagMap.asFn());
        var facetService = FacetServiceBuilder
            .core(sparqlService, facetConfig)
            .labelConfig()
            .index()
            .pathToTags(pathToTags)
            .tagFn(tagFn)
            .create();

        //var result = new FacetTreeService(facetService, pathToState.asFn());
        var result = new FacetTreeService(facetService, facetTreeConfig.getFacetTreeState());

        return result;
    }
};


module.exports = FacetTreeServiceUtils;

},{"../util/collection/HashMap":343,"./FacetNodeState":12,"./FacetServiceBuilder":14,"./facet_tree_service/FacetTreeService":51}],19:[function(require,module,exports){
var Class = require('../ext/Class');
var ListFilter = require('../service/ListFilter');

var HashMap = require('../util/collection/HashMap');
var HashSet = require('../util/collection/HashSet');

/**
 * This class contains the core status about which nodes in a facet tree are
 * expanded, which direction are they pointing, and which filters apply to them.
 */
var FacetTreeState = Class.create({
    initialize: function(pathExpansions, pathToDirection, pathHeadToFilter) {
        this.pathExpansions = pathExpansions || new HashSet();
        this.pathToDirection = pathToDirection || new HashMap();
        this.pathHeadToFilter = pathHeadToFilter || new HashMap();

        /*
        if(!pathToExpansion) {
            this.pathToExpansion.put(null, true); //new FacetNodeState(true, false, new ListFilter()));
        }

        if(!pathToDirection) {
            this.pathToDirection.put(null, 1);
        }
        */
    },

    getPathExpansions: function() {
        return this.pathExpansions;
    },

    getPathToDirection: function() {
        return this.pathToDirection;
    },

    getPathHeadToFilter: function() {
        return this.pathHeadToFilter;
    }
});


module.exports = FacetTreeState;
},{"../ext/Class":2,"../service/ListFilter":119,"../util/collection/HashMap":343,"../util/collection/HashSet":344}],20:[function(require,module,exports){
var Concept = require('../sparql/Concept');
var Relation = require('../sparql/Relation');

var HashMap = require('../util/collection/HashMap');

var NodeFactory = require('../rdf/NodeFactory');
var Triple = require('../rdf/Triple');
var NodeUtils = require('../rdf/NodeUtils');

var ExprVar = require('../sparql/expr/ExprVar');
var E_Equals = require('../sparql/expr/E_Equals');
var NodeValue = require('../sparql/expr/NodeValue');
var NodeValueUtils = require('../sparql/NodeValueUtils');
var E_LogicalNot = require('../sparql/expr/E_LogicalNot');
var E_OneOf = require('../sparql/expr/E_OneOf');

var ElementGroup = require('../sparql/element/ElementGroup');
var ElementFilter = require('../sparql/element/ElementFilter');
var ElementTriplesBlock = require('../sparql/element/ElementTriplesBlock');

var PatternUtils = require('../sparql/PatternUtils');
var ElementUtils = require('../sparql/ElementUtils');
var VarUtils = require('../sparql/VarUtils');

var Step = require('./Step');
var StepUtils = require('./StepUtils');
var StepRelation = require('./StepRelation');

var FacetRelationIndex = require('./FacetRelationIndex');

var PathHead = require('./PathHead');

var FacetUtils = {

    /**
     * Create a concept for the set of resources at a given path.
     * Note that this is distinct from the facets and the facet values:
     * If the facets are properties, and the facet values are objects, then
     * this this is the subjects.
     *
     */
    createConceptResources: function(facetConfig, path, excludeSelfConstraints) {
        var baseConcept = facetConfig.getBaseConcept();
        var rootFacetNode = facetConfig.getRootFacetNode();
        var constraintManager = facetConfig.getConstraintManager();

        var excludePath = excludeSelfConstraints ? path : null;

        var elementsAndExprs = constraintManager.createElementsAndExprs(rootFacetNode, excludePath);
        var constraintElements = elementsAndExprs.getElements();
        var constraintExprs = elementsAndExprs.getExprs();

        var facetNode = rootFacetNode.forPath(path);
        var facetVar = facetNode.getVar();

        var baseElements = baseConcept.getElements();
        var pathElements = facetNode.getElements();

        var facetElements = [];
        facetElements.push.apply(facetElements, pathElements);
        facetElements.push.apply(facetElements, constraintElements);

        if(baseConcept.isSubjectConcept()) {
            if(facetElements.length === 0) {
                facetElements = baseElements;
            }
        } else {
            facetElements.push.apply(facetElements, baseElements);
        }

        var filterElements = constraintExprs.map(function(expr) {
            var element = new ElementFilter(expr);
            return element;
        });

        facetElements.push.apply(facetElements, filterElements);

        var finalElement = (new ElementGroup(facetElements)).flatten();

        //var finalElements = ElementUtils.flatten(facetElements);
        //finalElements = ElementUtils.flattenElements(finalElements);


        var result = new Concept(finalElement, facetVar);
        return result;
    },

    /**
     * Creates a concept that fetches all facets at a given path
     *
     * Note that the returned concept does not necessarily
     * offer access to the facet's values (see first example).
     *
     * Examples:
     * - ({?s a rdf:Property}, ?s)
     * - ({?s a ex:Foo . ?s ?p ?o }, ?p)
     *
     * TODO We should add arguments to support scanLimit and resourceLimit (such as: only derive facets based on distinct resources within the first 1000000 triples)
     *
     */
    createConceptFacets: function(facetConfig, pathHead) {
        var relation = this.createRelationFacets(facetConfig, pathHead);

        //var relation.Concept();
        var result = new Concept(relation.getElement(), relation.getSourceVar());
        return result;
    },


    /**
     * Creates a relation that relates facets to their values.
     * Example ({ ?s a Airport . ?s ?p ?o}, ?p , ?o)
     *
     * Common method to create concepts for both facets and facet values.
     *
     * This method is the core for both creating concepts representing the set
     * of facets as well as facet values.
     *
     * TODO Possibly add support for specifying the p ond o base var names
     *
     * @param path The path for which to describe the set of facets
     * @param isInverse Whether at the given path the outgoing or incoming facets should be described
     * @param enableOptimization Returns the concept (?p a Property, ?p) in cases where (?s ?p ?o, ?p) would be returned.
     * @param singleProperty Optional. Whether to create a concept where only a single property at the given path is selected. Useful for creating concepts for individual properties
     */
    createRelationFacets: function(facetConfig, pathHead, singleProperty) {

        var path = pathHead.getPath();
        var isInverse = pathHead.isInverse();

        var baseConcept = facetConfig.getBaseConcept();
        var rootFacetNode = facetConfig.getRootFacetNode();
        var constraintManager = facetConfig.getConstraintManager();

        var singleStep = null;
        if(singleProperty) {
            singleStep = new Step(singleProperty.getUri(), isInverse);
        }

        var excludePath = null;
        if(singleStep) {
            excludePath = path.copyAppendStep(singleStep);
        }

        var elementsAndExprs = constraintManager.createElementsAndExprs(rootFacetNode, excludePath);
        var constraintElements = elementsAndExprs.toElements();

        var facetNode = rootFacetNode.forPath(path);
        var facetVar = facetNode.getVar();

        var baseElements = baseConcept.getElements();

        var facetElements;
        if(baseConcept.isSubjectConcept()) {
            facetElements = constraintElements;
        } else {
            facetElements = baseElements.concat(constraintElements);
        }

        var varsMentioned = PatternUtils.getVarsMentioned(facetElements); //.getVarsMentioned();

        var propertyVar = VarUtils.freshVar('p', varsMentioned);
        var objectVar = VarUtils.freshVar('o', varsMentioned);

        //console.log('propertyVar: ' + propertyVar);

        var triple = !isInverse
            ? new Triple(facetVar, propertyVar, objectVar)
            : new Triple(objectVar, propertyVar, facetVar);

        facetElements.push(new ElementTriplesBlock([triple]));

        if(singleStep) {
            var exprVar = new ExprVar(propertyVar);
            var expr = new E_Equals(exprVar, NodeValueUtils.makeNode(singleProperty));
            facetElements.push(new ElementFilter(expr));
        }

        var pathElements = facetNode.getElements();
        facetElements.push.apply(facetElements, pathElements);

        var finalElement = (new ElementGroup(facetElements)).flatten();
        //var finalElements = ElementUtils.flatten(facetElements);
        //finalElements = sparql.ElementUtils.flattenElements(finalElements);

        //var facetConcept = new ns.Concept(finalElements, propertyVar);
        var result = new Relation(finalElement, propertyVar, objectVar);
        return result;
    },

    /**
     * The returned relation holds a reference
     * to the facet and facet value variables.
     *
     * Intended use is to first obtain the set of properties, then use this
     * method, and constrain the concept based on the obtained properties.
     *
     * Examples:
     * - ({?p a rdf:Propery . ?s ?p ?o }, ?p, ?o })
     * - ({?s a ex:Foo . ?o ?p ?s }, ?p, ?o)
     *
     *
     * @param path
     * @param isInverse
     * @param properties {jassa.rdf.Node}
     * @param isNegated {boolean} True if the properties should be considered blacklisted
     */
    createStepRelationsProperties: function(facetConfig, pathHead, properties, isNegated) {
        var result = [];

        var path = pathHead.getPath();
        var isInverse = pathHead.isInverse();


        var baseConcept = facetConfig.getBaseConcept();
        var rootFacetNode = facetConfig.getRootFacetNode();
        var constraintManager = facetConfig.getConstraintManager();

        var propertyNames = properties.map(NodeUtils.getUri);

        var facetNode = rootFacetNode.forPath(path);

        // Set up the concept for fetching facets on constrained paths
        // However make sure to filter them by the user supplied array of properties
        var rawConstrainedSteps = constraintManager.getConstrainedSteps(path);

        var constrainedSteps = rawConstrainedSteps.filter(function(step) {
            var isSameDirection = step.isInverse() === isInverse;
            if(!isSameDirection) {
                return false;
            }

            var isContained = propertyNames.indexOf(step.getPropertyName()) >= 0;

            var r = isNegated ? !isContained : isContained;
            return r;
        });

        var excludePropertyNames = constrainedSteps.map(StepUtils.getPropertyName);

        var includeProperties = [];
        var excludeProperties = [];

        properties.forEach(function(property) {
            if(excludePropertyNames.indexOf(property.getUri()) >= 0) {
                excludeProperties.push(property);
            }
            else {
                includeProperties.push(property);
            }
        });

        // The first part of the result is formed by  the constrained steps
        var constrainedStepRelations = this.createStepRelations(facetConfig, path, constrainedSteps);
        result.push.apply(result, constrainedStepRelations);

        // Set up the concept for fetching facets of all concepts that were NOT constrained
        //var genericConcept = facetFacadeNode.createConcept(true);
        var genericRelation = this.createRelationFacets(facetConfig, pathHead);

        // Combine this with the user specified array of properties
        var filterElement = this.createElementFilterBindVar(genericRelation.getSourceVar(), includeProperties, false);
        if(filterElement != null) {
            genericRelation = new Relation(
                new ElementGroup([genericRelation.getElement(), filterElement]), // TODO flatten?
                genericRelation.getSourceVar(),
                genericRelation.getTargetVar());
        }

        // Important: If there are no properties to include, we can drop the genericConcept
        if(includeProperties.length > 0 || isNegated) {
            var genericStepRelation = new StepRelation(null, genericRelation);

            result.push(genericStepRelation);
        }

        return result;
    },

    createFacetRelationIndex: function(facetConfig, pathHead) {
        var stepRelations = FacetUtils.createStepRelationsProperties(facetConfig, pathHead, [], true);

        // Retrieve the variable of the step relations
        // Note: all relations are assumed to use the same source var
        var sourceVar = stepRelations.length > 0 ? stepRelations[0].getRelation().getSourceVar() : null;

        // index by step.property
        var propertyToRelation = new HashMap();

        var defaultRelation = null;
        stepRelations.forEach(function(sr) {
            var step = sr.getStep();
            var relation = sr.getRelation();

            var p = step ? NodeFactory.createUri(step.getPropertyName()) : null;
            if(p) {
                propertyToRelation.put(p, relation);
            } else {
                defaultRelation = relation;
            }
        });

        var result = new FacetRelationIndex(sourceVar, defaultRelation, propertyToRelation);
        return result;
    },

    createElementFilterBindVar: function(v, nodes, isNegated) {
        var result = null;
        if(nodes.length > 0) {
            var expr = new E_OneOf(new ExprVar(v), nodes);

            if(isNegated) {
                expr = new E_LogicalNot(expr);
            }

            result = new ElementFilter(expr);
        }

        return result;
    },


    createStepRelations: function(facetConfig, path, constrainedSteps) {
        var self = this;

        var result = constrainedSteps.map(function(step) {
            var r = self.createStepRelation(facetConfig, path, step);
            return r;
        });

        return result;
    },

    createStepRelation: function(facetConfig, path, step) {
        var propertyName = step.getPropertyName();
        var property = NodeFactory.createUri(propertyName);

        var pathHead = new PathHead(path, step.isInverse());
        var targetConcept = this.createRelationFacets(facetConfig, pathHead, property);

        var result = new StepRelation(step, targetConcept);
        return result;
    },

};

module.exports = FacetUtils;

},{"../rdf/NodeFactory":91,"../rdf/NodeUtils":92,"../rdf/Triple":94,"../sparql/Concept":203,"../sparql/ElementUtils":207,"../sparql/NodeValueUtils":216,"../sparql/PatternUtils":217,"../sparql/Relation":221,"../sparql/VarUtils":227,"../sparql/element/ElementFilter":232,"../sparql/element/ElementGroup":233,"../sparql/element/ElementTriplesBlock":237,"../sparql/expr/E_Equals":246,"../sparql/expr/E_LogicalNot":254,"../sparql/expr/E_OneOf":257,"../sparql/expr/ExprVar":269,"../sparql/expr/NodeValue":270,"../util/collection/HashMap":343,"./FacetRelationIndex":13,"./PathHead":22,"./Step":25,"./StepRelation":26,"./StepUtils":27}],21:[function(require,module,exports){
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

},{"../ext/Class":2,"./Step":25}],22:[function(require,module,exports){
var Class = require('../ext/Class');

var Path = require('./Path');

/**
 * A path head combines a path with a direction it is facing.
 * It is used to denote the set of outgoing or incoming facets.
 */
var PathHead = Class.create({
    initialize: function(path, isInverse) {
        this.path = path;
        this._isInverse = !!isInverse; // ensure boolean
    },

    getPath: function() {
        return this.path;
    },

    isInverse: function() {
        return this._isInverse;
    },

    toString: function() {
        return '' + this.path + (this._isInverse ? ' (inverse)' : '');
    },
});

PathHead.parse = function(pathStr, isInverse) {
    var path = Path.parse(pathStr);
    var result = new PathHead(path, !!isInverse);
    return result;
};

module.exports = PathHead;

},{"../ext/Class":2,"./Path":21}],23:[function(require,module,exports){
var NodeFactory = require('../rdf/NodeFactory');
var Query = require('../sparql/Query');

var ExprVar = require('../sparql/expr/ExprVar');
var SortCondition = require('../sparql/SortCondition');

var ExprModRegistry = []; // TODO Get rid of this

var E_LogicalNot = require('../sparql/expr/E_LogicalNot');
var E_Bound = require('../sparql/expr/E_Bound');

var QueryUtils = {

    /**
     * Creates a query by applying the modifications specified by the tableMod to an element
     */
    createQueryFacet: function(element, tableMod) {

        if(!element) {
            return null;
        }
        var isDistinct = tableMod.isDistinct();


        var result = new Query();
        result.setQueryPattern(element);

        var columns = tableMod.getColumns();


        // Map from column id to SPARQL expression representing this column
        var idToColExpr = {};

        var aggColumnIds = [];
        var nonAggColumnIds = [];

        columns.forEach(function(c) {
            var columnId = c.getId();
            var v = NodeFactory.createVar(columnId);
            var ev = new ExprVar(v);


            // TODO Get aggregators working again
            var agg = c.getAggregator();
            if(agg) {
                aggColumnIds.push(columnId);

                var aggName = agg.getName();

                var aggExprFactory = ExprModRegistry[aggName];
                if(!aggExprFactory) {
                    throw new Error('No aggExprFactory for ' + aggName);
                }

                var aggExpr = aggExprFactory.createExpr(ev);

                ev = aggExpr;

                result.getProject().add(v, ev);

            } else {
                nonAggColumnIds.push(columnId);
                result.getProject().add(v);
            }


            idToColExpr[columnId] = ev;
        });

        if(aggColumnIds.length > 0) {
            nonAggColumnIds.forEach(function(nonAggColumnId) {
                var expr = idToColExpr[nonAggColumnId];
                result.getGroupBy().push(expr);
            });

            // Aggregation implies distinct
            isDistinct = false;
        }


        // Apply limit / offset
        var lo = tableMod.getLimitAndOffset();
        result.setLimit(lo.getLimit());
        result.setOffset(lo.getOffset());

        // Apply sort conditions
        var sortConditions = tableMod.getSortConditions();


        sortConditions.forEach(function(sortCondition) {
            var columnId = sortCondition.getColumnId();

            var colExpr = idToColExpr[columnId];

            if(!colExpr) {
                console.log('[ERROR] Should not happen');
                throw new Error('Should not happen');
            }

            // Ordering of null values
            //var sortCondition = cs.getSortCondition();
            var sortDir = sortCondition.getSortDir();
            var sortType = sortCondition.getSortType();

            var sortCond = null;

            switch(sortType) {
            case 'null':
                // Null ordering only works with non-aggregate columns
                if(aggColumnIds.indexOf(columnId) < 0) {

                    if(sortDir > 0) {
                        sortCond = new SortCondition(new E_LogicalNot(new E_Bound(colExpr)), 1);
                    } else if(sortDir < 0) {
                        sortCond = new SortCondition(new E_Bound(colExpr), 1);
                    }

                }

                break;

            case 'data':
                sortCond = !sortDir ? null : new SortCondition(colExpr, sortDir);

                break;

            default:
                throw new Error('Should not happen');
            }

            if(sortCond) {
                result.getOrderBy().push(sortCond);
            }


        });

        result.setDistinct(isDistinct);

        return result;
    }
};

},{"../rdf/NodeFactory":91,"../sparql/Query":218,"../sparql/SortCondition":223,"../sparql/expr/E_Bound":244,"../sparql/expr/E_LogicalNot":254,"../sparql/expr/ExprVar":269}],24:[function(require,module,exports){
//var HashMap = require('../util/collection/HashMap');
//
//var NodeFactory = require('../rdf/NodeFactory');
//
//var Concept = require('../sparql/Concept');
//var ConceptUtils = require('../sparql/ConceptUtils');
//var FacetUtils = require('./FacetUtils');
//
//var LookupServiceFacetPreCount = require('./lookup_service/LookupServiceFacetPreCount');
//
//var ListServiceSparqlQuery = require('../service/list_service/ListServiceSparqlQuery');
//
//var ServiceUtils = {
//    createLookupServiceFacetCount: function(sparqlService, facetConfig, path, isInverse) {
//        //var sourceVar = facetConfig.getRootFacetNode().forPath(path).getVar();
//
//        var stepRelations = FacetUtils.createStepRelationsProperties(facetConfig, path, isInverse, [], true);
//
//        // Retrieve the variable of the step relations
//        // Note: all relations are assumed to use the same source var
//        var sourceVar = stepRelations.length > 0 ? stepRelations[0].getRelation().getSourceVar() : null;
//        
//        // index by step.property
//        var propertyToRelation = new HashMap();
//        
//        var fallbackRelation = null;
//        stepRelations.forEach(function(sr) {
//            var step = sr.getStep();
//            var relation = sr.getRelation();
//
//            var p = step ? NodeFactory.createUri(step.getPropertyName()) : null;
//            if(p) {
//                propertyToRelation.put(p, relation);
//            } else {
//                fallbackRelation = relation;
//            }
//        });
//        
//        var result = new LookupServiceFacetPreCount(sparqlService, sourceVar, propertyToRelation, fallbackRelation);
//        
//        return result;
//    },
//        
//};
//
//module.exports = ServiceUtils;
//
//
////
//////FacetConceptUtils.createConceptFacets(path, isInverse)
////// TODO We probably want a FacetRelationSupplier here:
////// This object could then return different concepts for the paths
////var relation = FacetUtils.createRelationFacets(this.facetConfig, path, isInverse);
////
////
////
////console.log('CREATED RELATION: ' + relation);
////
////var concept = new Concept(relation.getElement(), relation.getSourceVar());
////
////
//////var propertyListService = new ListServiceSparqlQuery(this.sparqlService, query, concept.getVar(), false);
////
////
//////
//////var stepRelations = FacetUtils.createRelationsFacetValues(this.facetConfig, path, isInverse, [], true);
//////
////////var countVar = NodeFactory.createVar(/'c');
//////stepRelations.forEach(function(stepRelation) {
//////    var x = RelationUtils.createQueryDistinctValueCount(stepRelation.getRelation(), VarUtils.c);
//////    console.log('STEP RELATION: ' + x);
//////    
//////});
////
////// TODO We could provide an extension point here to order the concept by some criteria 
////
////
//////var promise = self.fetchFacetValueCounts(path, isInverse, properties, false);
////
////var query = ConceptUtils.createQueryList(concept);
////
////var result = new ListServiceSparqlQuery(this.sparqlService, query, concept.getVar(), false);
//////var result = new ListServiceConcept(this.sparqlService);
////return result;        
},{}],25:[function(require,module,exports){
var isEqual = require('lodash.isequal');

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
        //return ObjectUtils.isEqual(this, other);
        var result = isEqual(this, other);
        return result;
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
    if(str.charAt(0) === '<') {
        result = new Step(str.substring(1), true);
    } else {
        result = new Step(str, false);
    }
    return result;
};

module.exports = Step;

},{"../ext/Class":2,"../rdf/NodeFactory":91,"../rdf/Triple":94,"../sparql/element/ElementTriplesBlock":237,"../util/ObjectUtils":332,"lodash.isequal":463}],26:[function(require,module,exports){
var Class = require('../ext/Class');

/**
 * This class is used to relate (constrained) steps to their
 * corresponding relation that implements the constraints.
 *
 * @param {jassa.facete.Step} step
 * @param {jassa.sparql.Relation} relation
 */
var StepRelation = Class.create({

    initialize: function(step, relation) {
        this.step = step;
        this.relation = relation;
    },

    getStep: function() {
        return this.step;
    },

    getRelation: function() {
        return this.relation;
    },

    toString: function() {
        return this.step + ': ' + this.relation;
    },

});

module.exports = StepRelation;

},{"../ext/Class":2}],27:[function(require,module,exports){

var StepUtils = {
    getPropertyName: function(step) {
        var result = step.getPropertyName();
        return result;
    },
};

module.exports = StepUtils;

},{}],28:[function(require,module,exports){
var forEach = require('lodash.foreach');

var Class = require('../ext/Class');

var VarNode = require('./VarNode');
var Step = require('./Step');

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
    initialize: function(variableName, generator, stepId, parent, root) {
        this.variableName = variableName;
        this.generator = generator;
        this.stepId = stepId; // Null for root
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

        
        this.idToChild = {};
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

    getIdStr: function() {
        var tmp = this.parent ? this.parent.getIdStr() : '';
        
        var result = tmp + this.variableName;
        return result;
    },

    getStepId: function(step) {
        return '' + JSON.stringify(step);
    },
    
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

    forStepId: function(stepId) {
        var child = this.idToChild[stepId];
        
        if(!child) {
            
            var subName = this.generator.next();
            child = new VarNode(subName, this.generator, stepId, this);
            
            //Unless we change something
            // we do not add the node to the parent
            this.idToChild[stepId] = child;             
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

},{"../ext/Class":2,"./Step":25,"./VarNode":28,"lodash.foreach":433}],29:[function(require,module,exports){
var Class = require('../../ext/Class');

/**
 * ConstraintSpecs can be arbitrary objects, however they need to expose the
 * declared paths that they affect.
 * DeclaredPaths are the ones part of spec, affectedPaths are those after considering the constraint's sparql element. 
 * 
 */
var Constraint = Class.create({
    getName: function() {
        throw new Error('Override me');
    },
    
    getDeclaredPaths: function() {
        console.log('[ERROR] Override me');
        throw new Error('Override me');
    },
    
    createElementsAndExprs: function(facetNode) {
        throw new Error('Override me');
    },
    
    equals: function() {
        throw new Error('Override me');
    },
    
    hashCode: function() {
        throw new Error('Override me');
    }
});
    
module.exports = Constraint;

},{"../../ext/Class":2}],30:[function(require,module,exports){
var Class = require('../../ext/Class');

var Constraint = require('./Constraint');

/**
 * The class of constraint specs that are only based on exactly one path.
 * 
 * Offers the method getDeclaredPath() (must not return null)
 * Do not confuse with getDeclaredPaths() which returns the path as an array
 * 
 */
var ConstraintBasePath = Class.create(Constraint, {
    initialize: function(name, path) {
        this.name = name;
        this.path = path;
    },
    
    getName: function() {
        return this.name;
    },
    
    getDeclaredPaths: function() {
        return [this.path];
    },
    
    getDeclaredPath: function() {
        return this.path;
    }
});

module.exports = ConstraintBasePath;

},{"../../ext/Class":2,"./Constraint":29}],31:[function(require,module,exports){
var Class = require('../../ext/Class');

var ObjectUtils = require('../../util/ObjectUtils');
var ConstraintBasePath = require('./ConstraintBasePath');


var ConstraintBasePathValue = Class.create(ConstraintBasePath, {
    //classLabel: 'jassa.facete.ConstraintSpecPathValue',

    initialize: function($super, name, path, value) {
        $super(name, path);
        this.value = value;
    },

    getValue: function() {
        return this.value;
    },
    
    equals: function(that) {
        if(!that instanceof ConstraintBasePath) {
            return false;
        }
        
        var a = this.name == that.name;
        var b = this.path.equals(that.path);
        var c = this.value.equals(that.value);
        
        var r = a && b &&c;
        return r;
    },
    
    hashCode: function() {
        var result = ObjectUtils.hashCode(this, true);
        return result;
    }
});

module.exports = ConstraintBasePathValue;
    
},{"../../ext/Class":2,"../../util/ObjectUtils":332,"./ConstraintBasePath":30}],32:[function(require,module,exports){
var Class = require('../../ext/Class');

var ConstraintUtils = require('../ConstraintUtils');
var ConstraintBasePath = require('./ConstraintBasePath');

var ObjectUtils = require('../../util/ObjectUtils');

var ConstraintConcept = Class.create(ConstraintBasePath, {
    classLabel: 'jassa.facete.ConstraintConcept',

    initialize: function($super, path, concept) {
        $super('concept', path);
        this.concept = concept;
    },

    createElementsAndExprs: function(facetNode) {
        var result = ConstraintUtils.createConstraintConcept(facetNode, this.path, this.concept);
        return result;
    },

    equals: function(other) {
        var result = other && this.path.equals(other.path) && ('' + this.concept === '' + other.concept);
        return result;
    },

    hashCode: function() {
        var result = ObjectUtils.hashCode(this, true);
        return result;
    }

});

module.exports = ConstraintConcept;
},{"../../ext/Class":2,"../../util/ObjectUtils":332,"../ConstraintUtils":6,"./ConstraintBasePath":30}],33:[function(require,module,exports){
/*
    ns.ConstraintElementFactoryBBoxRange = Class.create(ns.ConstraintElementFactory, {
        initialize: function() {
            this.stepX = new ns.Step(vocab.wgs84.str.lon);
            this.stepY = new ns.Step(vocab.wgs84.str.lat);
        },
        
        createElementsAndExprs: function(rootFacetNode, spec) {
            var facetNode = rootFacetNode.forPath(spec.getPath());
            var bounds = spec.getValue();
            
            var fnX = facetNode.forStep(this.stepX);
            var fnY = facetNode.forStep(this.stepY);

            var triplesX = fnX.getTriples();        
            var triplesY = fnY.getTriples();
            
            var triples = sparql.util.mergeTriples(triplesX, triplesY);
            
            //var element = new sparql.ElementTriplesBlock(triples);
            
            // Create the filter
            var varX = fnX.getVar();
            var varY = fnY.getVar();
            
            var expr = ns.createWgsFilter(varX, varY, this.bounds, xsd.xdouble);
            
            var elements = [new sparql.ElementTriplesBlock(triples)];
            var exprs = [expr];
            
            // Create the result
            var result = new ns.ElementsAndExprs(elements, exprs);
    
            return result;
        }       
    });
*/   
},{}],34:[function(require,module,exports){
var Class = require('../../ext/Class');

var ConstraintUtils = require('../ConstraintUtils');
var ConstraintBasePathValue = require('./ConstraintBasePathValue');

var ConstraintEquals = Class.create(ConstraintBasePathValue, {
    classLabel: 'jassa.facete.ConstraintEquals',
    
    initialize: function($super, path, node) {
        $super('equals', path, node);
    },
    
    createElementsAndExprs: function(facetNode) {
        var result = ConstraintUtils.createConstraintEquals(facetNode, this.path, this.value);
        return result;
    }
});

module.exports = ConstraintEquals;
},{"../../ext/Class":2,"../ConstraintUtils":6,"./ConstraintBasePathValue":31}],35:[function(require,module,exports){
var Class = require('../../ext/Class');

var ConstraintUtils = require('../ConstraintUtils');
var ConstraintBasePath = require('./ConstraintBasePath');

var ConstraintExists = Class.create(ConstraintBasePath, {
    classLabel: 'jassa.facete.ConstraintExists',

    initialize: function($super, path) {
        $super('exists', path);
    },
    
    createElementsAndExprs: function(facetNode) {
        var result = ConstraintUtils.createConstraintExists(facetNode, this.path);
        return result;
    },

});

module.exports = ConstraintExists;
},{"../../ext/Class":2,"../ConstraintUtils":6,"./ConstraintBasePath":30}],36:[function(require,module,exports){
var Class = require('../../ext/Class');

var ConstraintUtils = require('../ConstraintUtils');
var ConstraintBasePathValue = require('./ConstraintBasePathValue');

var ConstraintLang = Class.create(ConstraintBasePathValue, {
    classLabel: 'jassa.facete.ConstraintLang',
    
    initialize: function($super, path, langStr) {
        $super('lang', path, langStr);
    },
    
    createElementsAndExprs: function(facetNode) {
        var result = ConstraintUtils.createConstraintLang(facetNode, this.path, this.value);
        return result;
    }
});

module.exports = ConstraintLang;
},{"../../ext/Class":2,"../ConstraintUtils":6,"./ConstraintBasePathValue":31}],37:[function(require,module,exports){
var Class = require('../../ext/Class');

var ConstraintUtils = require('../ConstraintUtils');
var ConstraintBasePathValue = require('./ConstraintBasePathValue');


var ConstraintRegex = Class.create(ConstraintBasePathValue, {
    classLabel: 'jassa.facete.ConstraintRegex',
    
    initialize: function($super, path, regexStr) {
        $super('regex', path, regexStr);
    },
    
    createElementsAndExprs: function(facetNode) {
        var result = ConstraintUtils.createConstraintRegex(facetNode, this.path, this.value.getLiteralLexicalForm());
        return result;
    }
});

module.exports = ConstraintRegex;

},{"../../ext/Class":2,"../ConstraintUtils":6,"./ConstraintBasePathValue":31}],38:[function(require,module,exports){
var Class = require('../../ext/Class');

/**
 * Instances of this class are used by (sparql-) concept based
 * facet services to obtain the concept at a certain pathHead.
 *
 * For example, this supplier can be configured to return the list
 * of _declared_ properties - such as (?p | ?p a rdf:Property) - for the root path,
 * rather than returning a concept representing the actual set of properties
 * - such as (?p | ?s ?p ?o)
 *
 */
var FacetConceptSupplier = Class.create({
    getConcept: function(pathHead) {
        throw new Error('Override me');
    },
});

module.exports = FacetConceptSupplier;

},{"../../ext/Class":2}],39:[function(require,module,exports){
var Class = require('../../ext/Class');

//var Concept = require('../../sparql/Concept');

var FacetConceptSupplierExact = require('./FacetConceptSupplierExact');
var CannedConceptUtils = require('../../sparql/CannedConceptUtils');


// Use the declared properties for the root path
var FacetConceptSupplierDeclared = Class.create(FacetConceptSupplierExact, {
    initialize: function($super, facetConfig) {
        $super(facetConfig);
    },

    getConcept: function($super, pathHead) {
        var facetConfig = this.facetConfig;

        var path = pathHead.getPath();
        var cm = facetConfig.getConstraintManager();
        var baseConcept = facetConfig.getBaseConcept();

        var isSubjectConcept = baseConcept.isSubjectConcept();
        var isEmptyPath = path.isEmpty();
        var isUnconstrained = cm.isEmpty();

        var canUseDeclaredProperties = isSubjectConcept && isEmptyPath && isUnconstrained;

        var result = canUseDeclaredProperties
            ? CannedConceptUtils.createConceptDeclaredProperties(baseConcept.getVar())
            : $super(pathHead)
            ;

        console.log('ARGH: ' + result);

        return result;
    },

});

module.exports = FacetConceptSupplierDeclared;

},{"../../ext/Class":2,"../../sparql/CannedConceptUtils":202,"./FacetConceptSupplierExact":40}],40:[function(require,module,exports){
var Class = require('../../ext/Class');

var Concept = require('../../sparql/Concept');

var FacetUtils = require('../FacetUtils');
var FacetConceptSupplier = require('./FacetConceptSupplier');


var FacetConceptSupplierExact = Class.create(FacetConceptSupplier, {
    initialize: function(facetConfig) {
        this.facetConfig = facetConfig;
    },
    
    getConcept: function(pathHead) {
        var relation = FacetUtils.createRelationFacets(this.facetConfig, pathHead);
        var result = new Concept(relation.getElement(), relation.getSourceVar());

        return result;
    },

});

module.exports = FacetConceptSupplierExact;

},{"../../ext/Class":2,"../../sparql/Concept":203,"../FacetUtils":20,"./FacetConceptSupplier":38}],41:[function(require,module,exports){
var Class = require('../../ext/Class');

var HashMap = require('../../util/collection/HashMap');

var FacetUtils = require('../FacetUtils');
var FacetConceptSupplier = require('./FacetConceptSupplier');

var FacetConceptSupplierMeta = Class.create({
    initialize: function(facetConceptSupplierFallback, pathHeadToConcept) {
        this.facetConceptSupplierFallback = facetConceptSupplierFallback;
        this.pathHeadToConcept = pathHeadToConcept || new HashMap();
    },

    getPathHeadToConcept: function() {
        return this.pathHeadToConcept;
    },

    getConcept: function(pathHead) {
        var override = this.pathHeadToConcept.get(pathHead);
        var result = override || this.facetConceptSupplierFallback.getConcept(pathHead);
        return result;
    },

});

module.exports = FacetConceptSupplierMeta;

},{"../../ext/Class":2,"../../util/collection/HashMap":343,"../FacetUtils":20,"./FacetConceptSupplier":38}],42:[function(require,module,exports){
var Class = require('../../ext/Class');

/**
 * A FacetService is a factory for list services based on {jassa.facete.Path} objects.
 */
var FacetService = Class.create({
    prepareListService: function(pathHead) {
        throw new Error('Not overridden');
    }
});

module.exports = FacetService;
},{"../../ext/Class":2}],43:[function(require,module,exports){
var Class = require('../../ext/Class');

var ListServiceArray = require('../../service/list_service/ListServiceArray');
var ListServiceTransformItem = require('../../service/list_service/ListServiceTransformItem');

var shared = require('../../util/shared');
var Promise = shared.Promise;

/**
 * Helper function to create an in-memory list service with regex keyword search
 * from a list of properties (jassa.rdf.Node) and a labelMap (Map<Node, LabelInfo>).
 *
 *
 */
//var createListServiceHelper = function(entries, labelMap) {
//
//    // Create an array of items with info about each property
//    var fnLabelInfo = function(key) {
//        var labelInfo = labelMap.get(key);
//
//        var r = {
//            id: key.getUri(),
//            displayLabel: labelInfo ? labelInfo.displayLabel : key.getUri(),
//            hiddenLabels: labelInfo ? labelInfo.hiddenLabels : []
//        };
//        return r;
//    };
//
//    var fnFilterSupplier = function(searchString) {
//        var result;
//
//        if(searchString != null) {
//            var re = new RegExp(searchString, 'mi');
//
//            result = function(entry) {
//                var key = entry.key;
//                var labelInfo = fnLabelInfo(key);
//
//                var m1 = re.test(labelInfo.id);
//                var m2 = m1 || re.test(labelInfo.displayLabel);
//                var m3 = m2 || (labelInfo.hiddenLabels && labelInfo.hiddenLabels.some(function(x) { return re.test(x); }));
//
//                return m3;
//            };
//        } else {
//            result = function(entry) { return true; };
//        }
//
//        return result;
//    };
//    //console.log('entries: ' + JSON.stringify(entries));
//
//    // Wrap the list service to return the plain properties again
//    var ls = new ListServiceArray(entries, fnFilterSupplier);
//    /*
//    ls = new ListServiceTransformItem(ls, function(item) {
//       return item.id;
//    });
//    */
//
//    return ls;
//};
//
//
//var createIndexedListService = function(listService, filterSupplierFn) {
//
//    var result = listService.fetchItems()
//        .then(function(entries) {
//            var keys = [];
//            entries.forEach(function(entry) {
//                //console.log('Entry: ' + JSON.stringify(entry));
//                //return entry.key;
//                var key = entry.val.property;
//                if(key) {
//                    keys.push(key);
//                }
//            });
//
//            var labelPromise = lookupServiceNodeLabels.lookup(keys);
//            return [entries, labelPromise];
//        }).spread(function(entries, labelMap) {
//
////            var pathLabelMap = new HashMap();
////            // Make a mapping from path to labelInfo rather than propertyName to LabelInfo
////            entries.forEach(function(entry) {
////                var key = entry.val.property;
////                var labelInfo = labelMap.get(key);
////
////                pathLabelMap.put(entry.key, labelInfo);
////            });
//
//            var r = createListServiceHelper(entries, labelMap);
//            return r;
//        });
//
//    return result;
//};
//
////var createIndexedListService = function(listService, lookupServiceNodeLabels) {
////
////    var result = listService.fetchItems()
////        .then(function(entries) {
////            var keys = [];
////            entries.forEach(function(entry) {
////                //console.log('Entry: ' + JSON.stringify(entry));
////                //return entry.key;
////                var key = entry.val.property;
////                if(key) {
////                    keys.push(key);
////                }
////            });
////
////            var labelPromise = lookupServiceNodeLabels.lookup(keys);
////            return [entries, labelPromise];
////        }).spread(function(entries, labelMap) {
////
//////            var pathLabelMap = new HashMap();
//////            // Make a mapping from path to labelInfo rather than propertyName to LabelInfo
//////            entries.forEach(function(entry) {
//////                var key = entry.val.property;
//////                var labelInfo = labelMap.get(key);
//////
//////                pathLabelMap.put(entry.key, labelInfo);
//////            });
////
////            var r = createListServiceHelper(entries, labelMap);
////            return r;
////        });
////
////    return result;
////};


/**
 *
 * This strategy first retrieves all properties from the underlying service,
 * then fetches their labels, and finally creates a list service that
 * performs the lookup on this in-memory cache
 *
 */
var FacetServiceClientIndex = Class.create({

    /**
     * Upon request, this facet service will retrieve *all* facets together
     * with their labels. Filtering will then happen in the client.
     *
     * @param {jassa.facete.FacetService} The underlying facetService
     *
     */
    initialize: function(facetService, filterSupplierFn, itemLimit) {
        this.facetService = facetService;
        this.filterSupplierFn = filterSupplierFn;
        this.itemLimit = itemLimit || 100;
    },


    /**
     *
     * @return {Promise<ListService[String]>} The returned list service accepts a search string
     */
    prepareListService: function(pathHead) {
        var self = this;

        var result = Promise
            .resolve(this.facetService.prepareListService(pathHead))
            .then(function(listService) {
                var check = listService.fetchCount(null, self.itemLimit); //, 1000000); // TODO Make configurable
                return [check, listService];
            })
            .spread(function(checkResult, listService) {
                var r = checkResult.hasMoreItems
                    ? listService
                    : listService.fetchItems()
                        .then(function(entries) {
                            var s = new ListServiceArray(entries, self.filterSupplierFn);
                            return s;
                        });
                return r;
            });


        return result;
    },

});

module.exports = FacetServiceClientIndex;

},{"../../ext/Class":2,"../../service/list_service/ListServiceArray":139,"../../service/list_service/ListServiceTransformItem":149,"../../util/shared":351}],44:[function(require,module,exports){
var Class = require('../../ext/Class');

var FacetService = require('./FacetService');

/**
 * A facet service that passes the listService (generated by a delegate)
 * to a given function
 */
var FacetServiceFn = Class.create(FacetService, {
    initialize: function(facetService, fn) {
        this.facetService = facetService;
        this.fn = fn;
    },

    prepareListService: function(pathHead) {
        var self = this;
        var result = this.facetService.prepareListService(pathHead).then(function(ls) {
            var r = self.fn(ls);
            return r;
        });

        return result;
    },

});

module.exports = FacetServiceFn;

},{"../../ext/Class":2,"./FacetService":42}],45:[function(require,module,exports){
var Class = require('../../ext/Class');

var FacetService = require('./FacetService');

var HashMap = require('../../util/collection/HashMap');

var ListServiceConceptKeyLookup = require('../../service/list_service/ListServiceConceptKeyLookup');
var ListServiceTransformItem = require('../../service/list_service/ListServiceTransformItem');

/**
 * A facet service that can override lookups for pathHeads to other facet services
 *
 */
var FacetServiceLookup = Class.create(FacetService, {
    /**
     * @param fnLookupService A function that yields a lookup service for a pathHead
     */
    initialize: function(facetService, fnLookupService) {
        this.facetService = facetService;
        this.fnLookupService = fnLookupService;
    },

    prepareListService: function(pathHead) {
        var lookupService = this.fnLookupService(pathHead);

        var result = this.facetService.prepareListService(pathHead).then(function(ls) {

            ls = new ListServiceConceptKeyLookup(ls, lookupService, function(entry) {
                var r = entry.val.property;
                //console.log('Property: ' + r);
                return r;
            });

//            ls = new ListServiceConceptKeyLookup(ls, lookupService);
//            , function(entry) {
//                // Perform the lookup based on the facet's property
//                var r = entry.val.property;
//                return r;
//            });


//            ls = new ListServiceTransformItem(ls, function(item) {
//                return item.key;
//            });

            return ls;
        });

        return result;
    },

});

module.exports = FacetServiceLookup;

},{"../../ext/Class":2,"../../service/list_service/ListServiceConceptKeyLookup":142,"../../service/list_service/ListServiceTransformItem":149,"../../util/collection/HashMap":343,"./FacetService":42}],46:[function(require,module,exports){
var Class = require('../../ext/Class');

var FacetService = require('./FacetService');

var HashMap = require('../../util/collection/HashMap');

/**
 * A facet service that can override lookups for pathHeads to other facet services
 *
 */
var FacetServiceMeta = Class.create(FacetService, {
    initialize: function(facetServiceFallback, pathHeadToFacetService) {
        this.facetServiceFallback = facetServiceFallback;
        this.pathHeadToFacetService = this.pathHeadToFacetService || new HashMap();
    },

    getPathHeadToFacetService: function() {
        return this.pathHeadToFacetService;
    },

    prepareListService: function(pathHead) {
        var override = this.pathHeadToFacetService.get(pathHead);

        var facetService = override || this.facetServiceFallback;

        var result = facetService.prepareListService(pathHead);

        return result;
    },

});

module.exports = FacetServiceMeta;

},{"../../ext/Class":2,"../../util/collection/HashMap":343,"./FacetService":42}],47:[function(require,module,exports){
var Class = require('../../ext/Class');

var NodeFactory = require('../../rdf/NodeFactory');

var Concept = require('../../sparql/Concept');
var ConceptUtils = require('../../sparql/ConceptUtils');

//var ListServiceConcept = require('../../service/list_service/ListServiceConcept');
var ListServiceArray = require('../../service/list_service/ListServiceArray');
var ListServiceSparqlQuery = require('../../service/list_service/ListServiceSparqlQuery');
var ListServiceTransformItem = require('../../service/list_service/ListServiceTransformItem');

var FacetService = require('./FacetService');
var FacetUtils = require('../FacetUtils');

var RelationUtils = require('../../sparql/RelationUtils');
var VarUtils = require('../../sparql/VarUtils');

var Step = require('../Step');
var Path = require('../Path');

var shared = require('../../util/shared');
var Promise = shared.Promise;

/*
var properties = [];
entries.forEach(function(entry) {
    properties.push(entry.key);
});
*/

var FacetServiceSparql = Class.create(FacetService, {
    initialize: function(sparqlService, facetConceptSupplier) {
        this.sparqlService = sparqlService;
        this.facetConceptSupplier = facetConceptSupplier;
    },

    /**
     * Returns a list service, that yields JSON documents of the following form:
     * {
     *   id: property {jassa.rdf.Node},
     *   countInfo: { count: , hasMoreItems: true/false/null }
     * }
     */
    prepareListService: function(pathHead) {

        //console.log('Preparing list service for pathHead: ' + pathHead);

        // null indicates to return the root facet
        var listService;
        if(pathHead == null) {
            var path = new Path();
            var superRootFacets = [{
                key: path,
                val: {
                    path: path,
                    property: NodeFactory.createUri('http://facete.aksw.org/resource/rootFacet')
                }
            }];

            listService = new ListServiceArray(superRootFacets, function(concept) {
                // TODO Should we allow filtering by the root facet? I doubt it.
                return function(item) {
                    return true;
                };
            });
        } else {


            var concept = this.facetConceptSupplier.getConcept(pathHead);

            var query = ConceptUtils.createQueryList(concept);

            listService = new ListServiceSparqlQuery(this.sparqlService, query, concept.getVar(), false);
            listService = new ListServiceTransformItem(listService, function(entry) {

                // Replace the keys with the appropriate paths
                var id = entry.key;

                // TODO DESIGN ISSUE Should the ids here be the property nodes or the whole paths?
                // It seems the property nodes makes life easier on this level; but only time will tell
                // So for now we use the key as the ID but already compute the path attribute here
                var step = new Step(id.getUri(), pathHead.isInverse());
                var path = pathHead.getPath().copyAppendStep(step);

                var r = {
                    key: id,
                    val: {
                        path: path,
                        property: id
                    }
                };

                // Create steps from the properties

    //            var r = {
    //                key: path,
    //                val: {
    //                    path: path,
    //                    property: entry.key
    //                }
    //            };

                return r;
            });
        }

        var result = Promise.resolve(listService);

        return result;
    },

});

module.exports = FacetServiceSparql;

},{"../../ext/Class":2,"../../rdf/NodeFactory":91,"../../service/list_service/ListServiceArray":139,"../../service/list_service/ListServiceSparqlQuery":146,"../../service/list_service/ListServiceTransformItem":149,"../../sparql/Concept":203,"../../sparql/ConceptUtils":204,"../../sparql/RelationUtils":222,"../../sparql/VarUtils":227,"../../util/shared":351,"../FacetUtils":20,"../Path":21,"../Step":25,"./FacetService":42}],48:[function(require,module,exports){
//var Class = require('../../ext/Class');
//
//var FacetService = require('./FacetService');
//
///**
// * A FacetService is a factory for list services based on {jassa.facete.Path} objects.
// */
//
//var FacetService = Class.create({
//    initialize: function(facetService, itemTagger) {
//        this.facetService = facetService;
//        this.itemTagger 
//    },
//    
//    createListService: function(path, isInverse) { // TODO Maybe replace arguments with the PathHead object?
//        var ls = this.facetService.createListService(path, isInverse);
//        var result = new ListServiceTransformConcept(ls, fnTransform);
//        return result;
//    },
//
//});
//
//module.exports = FacetService;
//        pipeTagging: function(promise) {
//            var self = this;
//            
//            var result = promise.pipe(function(items) {
//                //ns.FacetTreeUtils.applyTags(items, self.pathTagger);
//                
//                _(items).each(function(item) {
//                    //self.pathTaggerManager.applyTags(item);
//                    //ns.FacetTreeUtils.applyTags(self.pathTaggerManager, item);
//                    var tags = self.pathTaggerManager.createTags(item.getPath());
//                    item.setTags(tags);
//                });
//                
//                return items;
//            });
//
//            return result;
//        },


},{}],49:[function(require,module,exports){
var Class = require('../../ext/Class');

var ListServiceTransformConcept = require('../../service/list_service/ListServiceTransformConcept');
var FacetService = require('./FacetService');

/**
 * This facet service wraps the list service provided by the underlying facet service
 * with a transformation of the filter concept.
 *
 *  This can be used to e.g. turn a keyword search query into a sparql concept making use of bif:contains or regex
 */
var FacetServiceTransformConcept = Class.create({
    initialize: function(facetService, fnTransform) {
        this.facetService = facetService;
        this.fnTransform = fnTransform;
    },

    prepareListService: function(pathHead) { // TODO Maybe replace arguments with the PathHead object?
        var promise = this.facetService.prepareListService(pathHead);
        var self = this;
        var result = promise.then(function(ls) {
            var r = new ListServiceTransformConcept(ls, self.fnTransform);
            return r;
        });

        return result;
    },

});

module.exports = FacetServiceTransformConcept;

},{"../../ext/Class":2,"../../service/list_service/ListServiceTransformConcept":147,"./FacetService":42}],50:[function(require,module,exports){
var Class = require('../../ext/Class');

var FacetSystem = Class.create({
    createFacetService: function(constraints, baseConcept) {
        throw new Error('Override me');
    }
});

module.exports = FacetSystem;

},{"../../ext/Class":2}],51:[function(require,module,exports){
var Class = require('../../ext/Class');

var FacetTreeServiceHelpers = require('../FacetTreeServiceHelpers');

var FacetTreeService = Class.create({
    initialize: function(facetService, facetTreeState) {
        this.facetService = facetService;
        //this.facetTreeConfig = facetTreeConfig;
        //this.pathToStateFn = pathToStateFn;
        this.facetTreeState = facetTreeState;
    },

    fetchFacetTree: function(startPath) {
        //console.log('FacetTreeServiceUtils: ' + JSON.stringify(FacetTreeServiceUtils));
        //var result = FacetTreeServiceHelpers.fetchFacetTree(this.facetService, this.pathToStateFn, startPath);
        var result = FacetTreeServiceHelpers.fetchFacetTree(this.facetService, this.facetTreeState, startPath);
        return result;
    },

});


module.exports = FacetTreeService;

},{"../../ext/Class":2,"../FacetTreeServiceHelpers":17}],52:[function(require,module,exports){
var Class = require('../../ext/Class');

/**
 * Service for creating facet value concepts
 *
 * The idea is to later have implementations
 * that can replace intensional parts of the generated concept with extensions,
 * e.g. replacing 'countries in europe' with their explicit enumeration.
 * This is more important for e.g. regex and fuzzy matches, where a prior match result
 * could be used directly
 */
var FacetValueConceptService = Class.create({
    prepareConcept: function(path, excludeSelfConstraints) {
        throw new Error('Method not overridden');
    }
});

module.exports = FacetValueConceptService;

},{"../../ext/Class":2}],53:[function(require,module,exports){
var Class = require('../../ext/Class');

var FacetValueConceptService = require('./FacetValueConceptService');
var FacetUtils = require('../FacetUtils');

var shared = require('../../util/shared');
var Promise = shared.Promise;


/**
 * Service for creating facet value concepts
 *
 * This is the basic implementation.
 */
var FacetValueConceptServiceExact = Class.create({
    initialize: function(facetConfig) {
        this.facetConfig = facetConfig;
    },

    prepareConcept: Promise.method(function(path, excludeSelfConstraints) {
        var result = FacetUtils.createConceptResources(this.facetConfig, path, excludeSelfConstraints);

        return result;
    }),

});

module.exports = FacetValueConceptServiceExact;

},{"../../ext/Class":2,"../../util/shared":351,"../FacetUtils":20,"./FacetValueConceptService":52}],54:[function(require,module,exports){
var Class = require('../../ext/Class');
var Relation = require('../../sparql/Relation');
var RelationUtils = require('../../sparql/RelationUtils');
var FacetUtils = require('../FacetUtils.js');

var ElementUtils = require('../../sparql/ElementUtils');
var ConceptUtils = require('../../sparql/ConceptUtils');
var ServiceUtils = require('../../service/ServiceUtils');

var ListServiceSparqlQuery = require('../../service/list_service/ListServiceSparqlQuery');
var SortCondition = require('../../sparql/SortCondition');


var FacetValueService = Class.create({
    initialize: function(sparqlService, facetConfig, rowLimit) {
        this.sparqlService = sparqlService;
        this.rowLimit = rowLimit || 100000;
        this.facetConfig = facetConfig;
    },

    prepareTableService: function(path, excludeSelfConstraints) {
        var concept = FacetUtils.createConceptResources(this.facetConfig, path, excludeSelfConstraints);

        console.log('FacetValueConcept: ' + concept + ' config: ', this.facetConfig);

        var baseVar = this.facetConfig.getRootFacetNode().getVar();

        var self = this;

        // If there are more rows than the threshold, we disable counting (and thus ordering by count)
        // Note that we could support fetching counts only for the currently visible page
        //

        // TODO This part should be encapsulated as a strategy (or so)
        var result = ServiceUtils.fetchCountRows(this.sparqlService, concept.getElement(), this.rowLimit).then(function(countInfo) {
            var canUseCounts = countInfo.hasMoreItems === false;

            // Check if we can fetch all data at once
            // If not, we can switch to paginated mode
            //   In this mode, for each page we check which of the items can be counted
            //   (lazy fetching of counts)

            // If we could count the items, we can also support ordering them by their aggregated value
            //var canUseOrder = canUseCounts;


            var r;
            var query;
            if(canUseCounts) {
                var relation = new Relation(concept.getElement(), concept.getVar(), baseVar);

                // Create a service with counts
                var countVar = ElementUtils.freshVar(relation.getElement(), 'c');
                query = RelationUtils.createQueryDistinctValueCount(relation, countVar);

                // Create a schema with two sortable columns

                query.getOrderBy().push(new SortCondition(query.getProject().getExpr(countVar), 'desc'));


                r = new ListServiceSparqlQuery(self.sparqlService, query, concept.getVar());

            } else {
                query = ConceptUtils.createQueryList(concept);
                r = new ListServiceSparqlQuery(self.sparqlService, query, concept.getVar());

                // No support of ordering by count
                // TODO: We may be able to fetch all resources at once if there are not too many

            }

            return r;
        });

        return result;
    },

});

module.exports = FacetValueService;


},{"../../ext/Class":2,"../../service/ServiceUtils":126,"../../service/list_service/ListServiceSparqlQuery":146,"../../sparql/ConceptUtils":204,"../../sparql/ElementUtils":207,"../../sparql/Relation":221,"../../sparql/RelationUtils":222,"../../sparql/SortCondition":223,"../FacetUtils.js":20}],55:[function(require,module,exports){
'use strict';

var ns = {
    ConstraintManager: require('./ConstraintManager'),
    ConstraintUtils: require('./ConstraintUtils'),
    CountUtils: require('./CountUtils'),
    ElementUtils: require('./ElementUtils'),
    ElementsAndExprs: require('./ElementsAndExprs'),
    FacetConfig: require('./FacetConfig'),
    FacetNode: require('./FacetNode'),
    FacetNodeState: require('./FacetNodeState'),
    FacetRelationIndex: require('./FacetRelationIndex'),
    FacetServiceBuilder: require('./FacetServiceBuilder'),
    FacetServiceUtils: require('./FacetServiceUtils'),
    FacetTreeConfig: require('./FacetTreeConfig'),
    FacetTreeServiceHelpers: require('./FacetTreeServiceHelpers'),
    FacetTreeServiceUtils: require('./FacetTreeServiceUtils'),
    FacetTreeState: require('./FacetTreeState'),
    FacetUtils: require('./FacetUtils'),
    ListFilter: require('../service/ListFilter'),
    Path: require('./Path'),
    PathHead: require('./PathHead'),
    QueryUtils: require('./QueryUtils'),
    ServiceUtils: require('./ServiceUtils'),
    Step: require('./Step'),
    StepRelation: require('./StepRelation'),
    StepUtils: require('./StepUtils'),
    VarNode: require('./VarNode'),
    Constraint: require('./constraint/Constraint'),
    ConstraintBasePath: require('./constraint/ConstraintBasePath'),
    ConstraintBasePathValue: require('./constraint/ConstraintBasePathValue'),
    ConstraintConcept: require('./constraint/ConstraintConcept'),
    ConstraintElementFactoryBBoxRange: require('./constraint/ConstraintElementFactoryBBoxRange'),
    ConstraintEquals: require('./constraint/ConstraintEquals'),
    ConstraintExists: require('./constraint/ConstraintExists'),
    ConstraintLang: require('./constraint/ConstraintLang'),
    ConstraintRegex: require('./constraint/ConstraintRegex'),
    FacetConceptSupplier: require('./facet_concept_supplier/FacetConceptSupplier'),
    FacetConceptSupplierDeclared: require('./facet_concept_supplier/FacetConceptSupplierDeclared'),
    FacetConceptSupplierExact: require('./facet_concept_supplier/FacetConceptSupplierExact'),
    FacetConceptSupplierMeta: require('./facet_concept_supplier/FacetConceptSupplierMeta'),
    FacetService: require('./facet_service/FacetService'),
    FacetServiceClientIndex: require('./facet_service/FacetServiceClientIndex'),
    FacetServiceFn: require('./facet_service/FacetServiceFn'),
    FacetServiceLookup: require('./facet_service/FacetServiceLookup'),
    FacetServiceMeta: require('./facet_service/FacetServiceMeta'),
    FacetServiceSparql: require('./facet_service/FacetServiceSparql'),
    FacetServiceTagger: require('./facet_service/FacetServiceTagger'),
    FacetServiceTransformConcept: require('./facet_service/FacetServiceTransformConcept'),
    FacetSystem: require('./facet_system/FacetSystem'),
    FacetTreeService: require('./facet_tree_service/FacetTreeService'),
    FacetValueConceptService: require('./facet_value_concept_service/FacetValueConceptService'),
    FacetValueConceptServiceExact: require('./facet_value_concept_service/FacetValueConceptServiceExact'),
    FacetValueService: require('./facet_value_service/FacetValueService'),
    LookupServiceConstraintLabels: require('./lookup_service/LookupServiceConstraintLabels'),
    LookupServiceFacetCount: require('./lookup_service/LookupServiceFacetCount'),
    LookupServiceFacetExactCount: require('./lookup_service/LookupServiceFacetExactCount'),
    LookupServiceFacetPreCount: require('./lookup_service/LookupServiceFacetPreCount'),
    LookupServicePathLabels: require('./lookup_service/LookupServicePathLabels'),
    Aggregator: require('./table/Aggregator'),
    ColumnView: require('./table/ColumnView'),
    FilterString: require('./table/FilterString'),
    QueryFactoryFacetTable: require('./table/QueryFactoryFacetTable'),
    SortCondition: require('./table/SortCondition'),
    TableConfigFacet: require('./table/TableConfigFacet'),
    TableMod: require('./table/TableMod'),
    TableUtils: require('./table/TableUtils'),
};

Object.freeze(ns);

module.exports = ns;

},{"../service/ListFilter":119,"./ConstraintManager":5,"./ConstraintUtils":6,"./CountUtils":7,"./ElementUtils":8,"./ElementsAndExprs":9,"./FacetConfig":10,"./FacetNode":11,"./FacetNodeState":12,"./FacetRelationIndex":13,"./FacetServiceBuilder":14,"./FacetServiceUtils":15,"./FacetTreeConfig":16,"./FacetTreeServiceHelpers":17,"./FacetTreeServiceUtils":18,"./FacetTreeState":19,"./FacetUtils":20,"./Path":21,"./PathHead":22,"./QueryUtils":23,"./ServiceUtils":24,"./Step":25,"./StepRelation":26,"./StepUtils":27,"./VarNode":28,"./constraint/Constraint":29,"./constraint/ConstraintBasePath":30,"./constraint/ConstraintBasePathValue":31,"./constraint/ConstraintConcept":32,"./constraint/ConstraintElementFactoryBBoxRange":33,"./constraint/ConstraintEquals":34,"./constraint/ConstraintExists":35,"./constraint/ConstraintLang":36,"./constraint/ConstraintRegex":37,"./facet_concept_supplier/FacetConceptSupplier":38,"./facet_concept_supplier/FacetConceptSupplierDeclared":39,"./facet_concept_supplier/FacetConceptSupplierExact":40,"./facet_concept_supplier/FacetConceptSupplierMeta":41,"./facet_service/FacetService":42,"./facet_service/FacetServiceClientIndex":43,"./facet_service/FacetServiceFn":44,"./facet_service/FacetServiceLookup":45,"./facet_service/FacetServiceMeta":46,"./facet_service/FacetServiceSparql":47,"./facet_service/FacetServiceTagger":48,"./facet_service/FacetServiceTransformConcept":49,"./facet_system/FacetSystem":50,"./facet_tree_service/FacetTreeService":51,"./facet_value_concept_service/FacetValueConceptService":52,"./facet_value_concept_service/FacetValueConceptServiceExact":53,"./facet_value_service/FacetValueService":54,"./lookup_service/LookupServiceConstraintLabels":56,"./lookup_service/LookupServiceFacetCount":57,"./lookup_service/LookupServiceFacetExactCount":58,"./lookup_service/LookupServiceFacetPreCount":59,"./lookup_service/LookupServicePathLabels":60,"./table/Aggregator":61,"./table/ColumnView":62,"./table/FilterString":63,"./table/QueryFactoryFacetTable":64,"./table/SortCondition":65,"./table/TableConfigFacet":66,"./table/TableMod":67,"./table/TableUtils":68}],56:[function(require,module,exports){
var Class = require('../../ext/Class');
var LookupServiceBase = require('../../service/lookup_service/LookupServiceBase');
var LookupServicePathLabels = require('./LookupServicePathLabels');
var HashMap = require('../../util/collection/HashMap');
var shared = require('../../util/shared');
var Promise = shared.Promise;

var LookupServiceConstraintLabels = Class.create(LookupServiceBase, {
    initialize: function(lookupServiceNodeLabels, lookupServicePathLabels) {
        this.lookupServiceNodeLabels = lookupServiceNodeLabels;
        this.lookupServicePathLabels = lookupServicePathLabels || new LookupServicePathLabels(lookupServiceNodeLabels);
    },

    lookup: function(constraints) {
        // Note: For now we just assume subclasses of ConstraintBasePathValue

        var paths = [];
        var nodes = [];

        constraints.forEach(function(constraint) {
            var cPaths = constraint.getDeclaredPaths();
            var cNode = constraint.getValue ? constraint.getValue() : null;

            paths.push.apply(paths, cPaths);
            if(cNode) {
                nodes.push(cNode);
            }
        });

        var p1 = this.lookupServiceNodeLabels.lookup(nodes);
        var p2 = this.lookupServicePathLabels.lookup(paths);

        var result = Promise.all([
            p1,
            p2,
        ]).spread(function(nodeMap, pathMap) {
            var r = new HashMap();

            constraints.forEach(function(constraint) {
                var cPath = constraint.getDeclaredPath();
                var cNode = constraint.getValue();

                var pathLabel = pathMap.get(cPath);
                var nodeLabel = nodeMap.get(cNode);

                var cLabel = pathLabel + ' = ' + nodeLabel;
                r.put(constraint, cLabel);
            });

            return r;
        });

        return result;
    },
});

module.exports = LookupServiceConstraintLabels;

},{"../../ext/Class":2,"../../service/lookup_service/LookupServiceBase":152,"../../util/collection/HashMap":343,"../../util/shared":351,"./LookupServicePathLabels":60}],57:[function(require,module,exports){
var Class = require('../../ext/Class');

var HashMap = require('../../util/collection/HashMap');

var VarUtils = require('../../sparql/VarUtils');
var CountUtils = require('../CountUtils');

var LookupService = require('../../service/lookup_service/LookupService');

var shared = require('../../util/shared');
var Promise = shared.Promise;

var LookupServiceFacetCount = Class.create(LookupService, {
    initialize: function(lsPreCount, lsExactCount) {
        this.lsPreCount = lsPreCount;
        this.lsExactCount = lsExactCount;
    },

    lookup: function(properties) {
        var self = this;

        var result = Promise
            .resolve(this.lsPreCount.lookup(properties))
            .then(function(preMap) {
                var entries = preMap.entries();

                var winners = [];
                entries.forEach(function(entry) {
                    var key = entry.key;
                    var countInfo = entry.val;

                    if(!countInfo.hasMoreItems) {
                        winners.push(key);
                    }
                });

                // Check which properties succeeded on the pre-count
                var r = self.lsExactCount.lookup(winners);
                return [preMap, r];
            }).spread(function(preMap, exactMap) {
                var r = new HashMap();
                properties.forEach(function(property) {
                    var countInfo = exactMap.get(property);
                    countInfo = countInfo || preMap.get(property);
                    if(!countInfo) {
                        throw new Error('Should not happen');
                    }

                    r.put(property, countInfo);
                });
                return r;
            });

        return result;
    },

});


module.exports = LookupServiceFacetCount;

},{"../../ext/Class":2,"../../service/lookup_service/LookupService":151,"../../sparql/VarUtils":227,"../../util/collection/HashMap":343,"../../util/shared":351,"../CountUtils":7}],58:[function(require,module,exports){
var Class = require('../../ext/Class');

var VarUtils = require('../../sparql/VarUtils');
var CountUtils = require('../CountUtils');
var HashMap = require('../../util/collection/HashMap');

var LookupService = require('../../service/lookup_service/LookupService');

var LookupServiceFacetExactCount = Class.create(LookupService, {
    initialize: function(sparqlService, facetRelationIndex) {
        this.sparqlService = sparqlService;
        this.facetRelationIndex = facetRelationIndex;
    },

    lookup: function(properties) {
        var countVar = VarUtils.c;
        var subQueries = CountUtils.createQueriesExactCount(this.facetRelationIndex, countVar, properties, this.rowLimit);
        var exec = CountUtils.execQueries(this.sparqlService, subQueries, this.facetRelationIndex.getSourceVar(), countVar);
        
        var result = exec.then(function(map) {
            var r = new HashMap();
            
            var entries = map.entries();
            entries.forEach(function(entry) {
                var property = entry.key;
                var count = entry.val;
                
                var countInfo = {
                    count: count,
                    hasMoreItems: false
                };
                
                r.put(property, countInfo);
            });
            
            return r;
        });

        return result;
    },
});

module.exports = LookupServiceFacetExactCount;

},{"../../ext/Class":2,"../../service/lookup_service/LookupService":151,"../../sparql/VarUtils":227,"../../util/collection/HashMap":343,"../CountUtils":7}],59:[function(require,module,exports){
var Class = require('../../ext/Class');

var VarUtils = require('../../sparql/VarUtils');
var CountUtils = require('../CountUtils');
var HashMap = require('../../util/collection/HashMap');

var LookupService = require('../../service/lookup_service/LookupService');


var LookupServiceFacetPreCount = Class.create(LookupService, {
    initialize: function(sparqlService, facetRelationIndex) {
        this.sparqlService = sparqlService;
        this.facetRelationIndex = facetRelationIndex;
        this.rowLimit = 10000;
    },

    lookup: function(properties) {
        var rowLimit = this.rowLimit;

        var countVar = VarUtils.c;

        // Perform lookup with rowLimit + 1
        var subQueries = CountUtils.createQueriesPreCount(this.facetRelationIndex, countVar, properties, rowLimit + 1);
        var exec = CountUtils.execQueries(this.sparqlService, subQueries, this.facetRelationIndex.getSourceVar(), countVar);

        var result = exec.then(function(map) {
            var r = new HashMap();

            var entries = map.entries();
            entries.forEach(function(entry) {
                var property = entry.key;
                var count = entry.val;

                var hasMoreItems = count > rowLimit;
                var countInfo = {
                    count: hasMoreItems ? rowLimit : count,
                    hasMoreItems: hasMoreItems
                };

                r.put(property, countInfo);
            });

            return r;
        });

        return result;
    },

});


module.exports = LookupServiceFacetPreCount;

},{"../../ext/Class":2,"../../service/lookup_service/LookupService":151,"../../sparql/VarUtils":227,"../../util/collection/HashMap":343,"../CountUtils":7}],60:[function(require,module,exports){
var Class = require('../../ext/Class');
var flatten = require('lodash.flatten');
var uniq = require('lodash.uniq');
var LookupServiceBase = require('../../service/lookup_service/LookupServiceBase');
var NodeFactory = require('../../rdf/NodeFactory');
var HashMap = require('../../util/collection/HashMap');

/**
 * The baseLookupService must return labels for rdf.Node objects
 *
 */
var LookupServicePathLabels = Class.create(LookupServiceBase, {
    initialize: function(lookupServiceBase) {
        this.lookupServiceBase = lookupServiceBase;
    },

    lookup: function(paths) {
        // Get all unique mentioned property names and turn them to jassa nodes
        var nodes = paths.map(function(path) {
            var r = path.getSteps().map(function(step) {
                return step.getPropertyName();
            });
            return r;
        });
        nodes = flatten(nodes);
        nodes = uniq(nodes);
        nodes = nodes.map(function(propertyName) {
            return NodeFactory.createUri(propertyName);
        });

        // Do a lookup with all the nodes
        var result = this.lookupServiceBase.lookup(nodes).then(function(map) {
            var r = new HashMap();
            paths.forEach(function(path) {
                var label = path.getSteps().reduce(function(memo, step) {
                    var result = memo;

                    var property = NodeFactory.createUri(step.getPropertyName());
                    var label = map.get(property);

                    result = result === '' ? result : result + '&raquo;';
                    result += label;
                    result = !step.isInverse() ? result : result + '&sup1';

                    return result;
                }, '');

                if (label === '') {
                    label = 'Items';
                }

                r.put(path, label);
            });

            return r;
        });

        return result;
    },
});

module.exports = LookupServicePathLabels;

},{"../../ext/Class":2,"../../rdf/NodeFactory":91,"../../service/lookup_service/LookupServiceBase":152,"../../util/collection/HashMap":343,"lodash.flatten":364,"lodash.uniq":583}],61:[function(require,module,exports){
var Class = require('../../ext/Class');

var Aggregator = Class.create({
    initialize: function(name, attrs) {
        this.name = name;
        this.attrs = attrs; // Optional attributes;
    },

    getName: function() {
        return this.name;
    },

    getAttrs: function() {
        return this.attrs;
    }
});

module.exports = Aggregator;

},{"../../ext/Class":2}],62:[function(require,module,exports){
var Class = require('../../ext/Class');

/**
 * @param id Id of the column - string recommended; cannot be modified once set
 *
 */
var ColumnView = Class.create({
    initialize: function(tableMod, columnId) {
        this.tableMod = tableMod;
        this.columnId = columnId;
       /*
       this.sortCondition = sortCondition || new ns.SortCondition();
       this.aggregator = aggregator || null;
       this.filter = filter || null;
       */
    },

    getId: function() {
        return this.columnId;
    },

    getSortConditions: function() {
        var result = {};

        var id = this.columnId;

        this.tableMod.getSortConditions().forEach(function(sc) {
            var cid = sc.getColumnId();
            if(cid === id) {
                var sortType = sc.getSortType();

                result[sortType] = sc.getSortDir();
            }
        });

        return result;
    },

    getAggregator: function() {
        var result = this.tableMod.getAggregator(this.columnId);
        return result;
    },

    setAggregator: function(aggregator) {
        //this.tableMod.setAggregator(this.columnId, aggregator);
        this.tableMod.getAggregators()[this.columnId] = aggregator;
    }
});

module.exports = ColumnView;

},{"../../ext/Class":2}],63:[function(require,module,exports){
var Class = require('../../ext/Class');

/**
 * Note used yet.
 * searchMode: exact, regex, beginsWith, endsWith
 */
var FilterString = Class.create({
    initialize: function(str, mode) {
        this.str = str;
        this.mode = mode;
    }
});


},{"../../ext/Class":2}],64:[function(require,module,exports){
// I think this class can be deleted
/*

ns.QueryFactoryFacetTable = Class.create(ns.QueryFactory, {
        initialize: function(tableConfigFacet) {
            this.tableConfigFacet = tableConfigFacet;
        },

        createQuery: function() {
            var facetConfig = this.tableConfigFacet.getFacetConfig();

            // TODO Possible source of confusion: the config uses a collection for paths, but here we switch to a native array
            var paths = this.tableConfigFacet.getPaths().getArray();
            var tableMod = this.tableConfigFacet.getTableMod();


            var elementFactory = new ns.ElementFactoryFacetPaths(facetConfig, paths);

            var queryFactory = new ns.QueryFactoryTableMod(elementFactory, tableMod);

            var result = queryFactory.createQuery();

            return result;
        }
    });
*/
},{}],65:[function(require,module,exports){
var Class = require('../../ext/Class');

/**
 *
 *
 * @param sortDir Sort direction; {=0: unspecified, >0: ascending, <0 descending}
 * @param nullDir Whether to sort null values first or last
 *
 * sortType: 'data' ordinary sort of the data , 'null' sort null values first or last
 *
 */
var SortCondition = Class.create({
    initialize: function(columnId, sortDir, sortType) {
        this.columnId = columnId;
        this.sortDir = sortDir == null ? 1 : sortDir;
        this.sortType = sortType || 'data';
    },

    getColumnId: function() {
        return this.columnId;
    },

    getSortType: function() {
        return this.sortType;
    },

    setSortType: function(sortType) {
        this.sortType = sortType;
    },

    getSortDir: function() {
        return this.sortDir;
    },

    setSortDir: function(sortDir) {
        this.sortDir = sortDir;
    }
});

module.exports = SortCondition;

},{"../../ext/Class":2}],66:[function(require,module,exports){
var Class = require('../../ext/Class');

var ArrayUtils = require('../../util/ArrayUtils');
var TableMod = require('./TableMod');

var ElementUtils = require('../ElementUtils');

var Path = require('../Path');
var Concept = require('../../sparql/Concept');

// TODO: Maybe this class should be TableModFacet and inherit from TableMod?
var TableConfigFacet = Class.create({
    initialize: function(facetConfig, tableMod, paths) {
        this.facetConfig = facetConfig;
        this.tableMod = tableMod || new TableMod();
        this.paths = paths || []; //new util.ArrayList();
    },

    getFacetConfig: function() {
        return this.facetConfig;
    },

    getTableMod: function() {
        return this.tableMod;
    },

    getPaths: function() {
        return this.paths;
    },

    /**
     * Return the path for a given column id
     */
    getPath: function(colId) {
        var index = this.tableMod.getColumnIds().indexOf(colId);
        var result = this.paths[index];
        return result;
    },

    getColumnId: function(path) {
        var index = this.paths.firstIndexOf(path);
        var result = this.tableMod.getColumnIds()[index];
        return result;
    },

    removeColumn: function(colId) {
        var path = this.getPath(colId);
        this.paths.remove(path);
    },

    getColIdForPath: function(path) {
        var rootFacetNode = this.facetConfig.getRootFacetNode();
        var facetNode = rootFacetNode.forPath(path);
        var result = facetNode.getVar().getName();

        return result;
    },

    togglePath: function(path) {
        // Updates the table model accordingly
        var status = ArrayUtils.toggleItem(this.paths, path);

        var varName = this.getColIdForPath(path);

        if(status) {
            this.tableMod.addColumn(varName);
        }
        else {
            this.tableMod.removeColumn(varName);
        }
    },

    createDataConcept: function() {
        var emptyPath = new Path();
        var paths = this.paths.slice(0);

        if(!this.paths.contains(emptyPath)) {
            paths.push(emptyPath);
        }

        var dataElement = ElementUtils.createElementTable(this.facetConfig, paths);//new ElementFactoryFacetPaths(this.facetConfig, paths);
        //var dataElement = dataElementFactory.createElement();

        var rootFacetNode = this.facetConfig.getRootFacetNode();
        var dataVar = rootFacetNode.getVar();

        var result = new Concept(dataElement, dataVar);

        return result;
    }

/*
    createQueryFactory: function() {
        // create an ElementFactory based on the paths and the facetConfig
        var elementFactory = new ns.ElementFactoryFacetPaths(this.facetConfig, this.paths);

        var queryFactory = new ns.QueryFactoryTableMod(elementFactory, tableMod);

        return queryFactory;
    }
*/
});

},{"../../ext/Class":2,"../../sparql/Concept":203,"../../util/ArrayUtils":327,"../ElementUtils":8,"../Path":21,"./TableMod":67}],67:[function(require,module,exports){
var Class = require('../../ext/Class');

var ArrayUtils = require('../../util/ArrayUtils');
var ColumnView = require('./ColumnView');

var HashMap = require('../../util/collection/HashMap');

/**
 * Object that holds configuration for modifications to a table.
 * Needs to be interpreted by another object.
 *
 * The purpose of this object is to mediate between table configurations
 * possible in a user interface and result set modifications on the
 * SPARQL level.
 *
 * { myCol1: {sortDir: 1, aggName: sum, path: foo}, ... }
 * - sum(?varForFoo) As myCol1
 *
 */
var TableMod = Class.create({
    initialize: function() {
        this.columnIds = []; // Array of active column ids

        this.colIdToColView = new HashMap(); // Ids can be objects, such as vars
        this.sortConditions = []; // Array of sortConditions, applied in order of their occurrence

        this.colIdToAgg = new HashMap();

        this.limit = null;
        this.offset = null;

        this._isDistinct = true;
    },

    getLimit: function() {
        return this.limit;
    },

    setLimit: function(limit) {
        this.limit = limit;
    },

    getOffset: function() {
        return this.offset;
    },

    setOffset: function(offset) {
        this.offset = offset;
    },

    isDistinct: function() {
        return this._isDistinct;
    },

    setDistinct: function(isDistinct) {
        this._isDistinct = isDistinct;
    },

    getColumnIds: function() {
        return this.columnIds;
    },

    getColumn: function(id) {
        return this.colIdToColView[id];
    },

    // Returns the active columns
    getColumns: function() {
        var self = this;
        var result = this.columnIds.map(function(columnId) {
            var r = self.colIdToColView[columnId];

            return r;
        });


        return result;
    },

    getSortConditions: function() {
        return this.sortConditions;
    },

    getLimitAndOffset: function() {
        return this.limitAndOffset;
    },

    getAggregator: function(columnId) {
        var result = this.colIdToAgg[columnId];
        return result;
    },

    getAggregators: function() {
        return this.colIdToAgg;
    },

    //setAggregator: function()

    /**
     * Adds a column based on a ColumnState object.
     *
     * @param suppressActive default: false; true: Do not add the id to the array of active columns
     */
    addColumn: function(columnId, suppressActive) {
        var colView = this.colIdToColView[columnId];
        if(colView) {
            throw new Error('Column ' + columnId + ' already part of the table');
        }

        colView = new ColumnView(this, columnId);
        this.colIdToColView[columnId] = colView;

        if(!suppressActive) {
            this.columnIds.push(columnId);
        }

        // TODO Fail on duplicate
        /*
        var columnId = columnState.getId();
        this.columnIds.push(columnId);

        this.idToState[columnId] = columnState;
        */

        return colView;
    },

    /**
     * Removes a column by id
     *
     * Also removes dependent objects, such as sort conditions and aggregations
     */
    removeColumn: function(columnId) {
        delete this.colIdToColView[columnId];

        var self = this;
        ArrayUtils.filter(this.columnIds, function(cid) {
            var r = columnId != cid;
            return r;
        });

        ArrayUtils.filter(this.sortConditions, function(sc) {
            var r = columnId != sc.getColumnId();
        });

        delete this.colIdToAgg[columnId];
    }
});

module.exports = TableMod;

},{"../../ext/Class":2,"../../util/ArrayUtils":327,"../../util/collection/HashMap":343,"./ColumnView":62}],68:[function(require,module,exports){

var TableUtils = {
    /**
     * Create an angular grid option object from a tableMod
     */
    createNgGridColumnDefs: function(tableMod) {

        var columnViews = tableMod.getColumns();

        var result = columnViews.forEach(function(columnView) {
            var col = {
                field: columnView.getId(),
                displayName: columnView.getId()
            };

            return col;
        });

        return result;
    }
};

module.exports = TableUtils;

},{}],69:[function(require,module,exports){
var Class = require('../ext/Class');

var BboxExprFactory = Class.create({
    createExpr: function(bounds) {
        throw new Error('Not implemented');
    }
});

module.exports = BboxExprFactory;

},{"../ext/Class":2}],70:[function(require,module,exports){
var Class = require('../ext/Class');
var BboxExprFactory = require('./BboxExprFactory');
var GeoExprUtils = require('./GeoExprUtils');

var BboxExprFactoryWgs84 = Class.create(BboxExprFactory, {
    initialize: function(xVar, yVar, castNode) {
        //this.geoVar = geoVar;
        this.xVar = xVar;
        this.yVar = yVar;
        this.castNode = castNode;
    },

    createExpr: function(bounds) {
        var result = GeoExprUtils.createExprWgs84Intersects(this.xVar, this.yVar, bounds, this.castNode);
        return result;
    }
});

module.exports = BboxExprFactoryWgs84;

},{"../ext/Class":2,"./BboxExprFactory":69,"./GeoExprUtils":76}],71:[function(require,module,exports){
var Class = require('../ext/Class');
var BboxExprFactory = require('./BboxExprFactory');
var GeoExprUtils = require('./GeoExprUtils');


var BboxExprFactoryWkt = Class.create(BboxExprFactory, {
    initialize: function(wktVar, intersectsFnName, geomFromTextFnName) {
        this.wktVar = wktVar;
        this.intersectsFnName = intersectsFnName;
        this.geomFromTextFnName = geomFromTextFnName;
    },

    createExpr: function(bounds) {
        var result = GeoExprUtils.createExprOgcIntersects(this.wktVar,bounds, this.intersectsFnName, this.geomFromTextFnName);
        return result;
    }
});

module.exports = BboxExprFactoryWkt;

},{"../ext/Class":2,"./BboxExprFactory":69,"./GeoExprUtils":76}],72:[function(require,module,exports){
var Class = require('../ext/Class');
var Point = require('./Point');
var Range = require('./Range');

var Bounds = Class.create({
    initialize: function(left, bottom, right, top) {
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
    },

    containsPoint: function(point) {
        return point.x >= this.left && point.x < this.right && point.y >= this.bottom && point.y < this.top;
    },


    getCenter: function() {
        return new Point(0.5 * (this.left + this.right), 0.5 * (this.bottom + this.top));
    },

    getWidth: function() {
        return this.right - this.left;
    },

    getHeight: function() {
        return this.top - this.bottom;
    },


    /**
     * Checks for full containment (mere overlap does not yield true)
     *
     * @param bounds
     * @returns {Boolean}
     */
    contains: function(bounds) {
        return bounds.left >= this.left && bounds.right < this.right && bounds.bottom >= this.bottom && bounds.top < this.top;
    },

    rangeX: function() {
        return new Range(this.left, this.right);
    },

    rangeY: function() {
        return new Range(this.bottom, this.top);
    },

    overlap: function(bounds) {
        if(!bounds.rangeX || !bounds.rangeY) {
            console.error('Missing range');
            throw 'Error';
        }

        var ox = this.rangeX().getOverlap(bounds.rangeX());
        if(!ox) {
            return null;
        }

        var oy = this.rangeY().getOverlap(bounds.rangeY());
        if(!oy) {
            return null;
        }

        return new Bounds(ox.min, oy.min, oy.max, ox.max);
    },

    isOverlap: function(bounds) {
        var tmp = this.overlap(bounds);
        return tmp != null;
    },

    toString: function() {
    //return '[' + this.left + ', ' + this.bottom + ', ' + this.right + ', ' + this.top + ']';
        return '[' + this.left + ' - ' + this.right + ', ' + this.bottom + ' - ' + this.top + ']';
    }
});

Bounds.createFromJson = function(json) {
    var result = new Bounds(json.left, json.bottom, json.right, json.top);
    return result;
};

module.exports = Bounds;

},{"../ext/Class":2,"./Point":82,"./Range":85}],73:[function(require,module,exports){
var Class = require('../ext/Class');
var flatten = require('lodash.flatten');
var uniq = require('lodash.uniq');
var DataService = require('../service/data_service/DataService');
var geo = require('../vocab/wgs84');
var NodeFactory = require('../rdf/NodeFactory');
//var tryMergeNode = require('./try-merge-Node');
var shared = require('../util/shared');
var Promise = shared.Promise;

var Bounds = require('./Bounds');
var QuadTree = require('./QuadTree');
var GeoExprUtils = require('./GeoExprUtils');

var tryMergeNode = function() { return false; }; // TODO Implement

/**
 * Adds a quad tree cache to the lookup service
 */
var DataServiceBboxCache = Class.create(DataService, {
    initialize: function(listServiceBbox, maxGlobalItemCount, maxItemsPerTileCount, aquireDepth) {
        this.listServiceBbox = listServiceBbox;

        var maxBounds = new Bounds(-180.0, -90.0, 180.0, 90.0);
        this.quadTree = new QuadTree(maxBounds, 18, 0);

        this.maxItemsPerTileCount = maxItemsPerTileCount || 25;
        this.maxGlobalItemCount = maxGlobalItemCount || 50;
        this.aquireDepth = aquireDepth || 2;
    },

    // TODO: limit and offset currently ignored
    fetchData: function(bounds) {
        var result = this.runWorkflow(bounds).then(function(nodes) {
            var arrayOfDocs = nodes.map(function(node) {
                return node.data.docs;
            });

            // Remove null items
            var docs = arrayOfDocs.filter(function(item) {
                return item;
            });
            docs = flatten(docs, true);

            // Add clusters as regular items to the list???
            nodes.forEach(function(node) {
                if (node.isLoaded) {
                    return;
                }

                var wkt = GeoExprUtils.boundsToWkt(node.getBounds());

                var cluster = {
                    id: wkt,
                    // type: 'cluster',
                    // isZoomCluster: true,
                    zoomClusterBounds: node.getBounds(),
                    wkt: NodeFactory.createPlainLiteral(wkt),
                };

                docs.push(cluster);
            });

            return docs;
        });

        return result;
    },
    /*
fetchCount: function(bounds, threshold) {
        var result = this.listServiceBbox.fetchCount(bounds, threshold);
        return result;
};
*/
    runCheckGlobal: Promise.method(function() {
        var result;

        var rootNode = this.quadTree.getRootNode();

        if (!rootNode.checkedGlobal) {

            var globalCountTask = this.listServiceBbox.fetchCount(null, this.maxGlobalItemCount);
console.log('dammit', this.listServiceBbox);
            result = globalCountTask.then(function(countInfo) {
                var canUseGlobal = !countInfo.hasMoreItems;
                console.log('Global check counts', countInfo);
                rootNode.canUseGlobal = canUseGlobal;
                rootNode.checkedGlobal = true;

                return canUseGlobal;
            });

        } else {
            result = rootNode.canUseGlobal;
        }

        return result;
    }),

    runWorkflow: Promise.method(function(bounds) {
        var rootNode = this.quadTree.getRootNode();

        var self = this;
        return this.runCheckGlobal().then(function(canUseGlobal) {
            console.log('Can use global? ', canUseGlobal);
            var task;
            if (canUseGlobal) {
                task = self.runGlobalWorkflow(rootNode);
            } else {
                task = self.runTiledWorkflow(bounds);
            }

            return task.then(function(nodes) {
                return nodes;
            });
        });
    }),

    runGlobalWorkflow: function(node) {
        var self = this;

        var result = this.listServiceBbox.fetchItems(null).then(function(docs) {
            // console.log("Global fetching: ", geomToFeatureCount);
            self.loadTaskAction(node, docs);

            return [
                node,
            ];
        });

        return result;
    },

    /**
     * This method implements the primary workflow for tile-based fetching
     * data.
     *
     * globalGeomCount = number of geoms - facets enabled, bounds disabled.
     * if(globalGeomCount > threshold) {
     *
     *
     * nodes = aquire nodes. foreach(node in nodes) { fetchGeomCount in the
     * node - facets TODO enabled or disabled?
     *
     * nonFullNodes = nodes where geomCount < threshold foreach(node in
     * nonFullNodes) { fetch geomToFeatureCount - facets enabled
     *
     * fetch all positions of geometries in that area -- Optionally:
     * fetchGeomToFeatureCount - facets disabled - this can be cached per
     * type of interest!! } } }
     *
     */
    runTiledWorkflow: Promise.method(function(bounds) {
        var self = this;

        // console.log("Aquiring nodes for " + bounds);
        var nodes = this.quadTree.aquireNodes(bounds, this.aquireDepth);

        // console.log('Done aquiring');

        // Init the data attribute if needed
        nodes.forEach(function(node) {
            if (!node.data) {
                node.data = {};
            }
        });

        // Mark empty nodes as loaded
        nodes.forEach(function(node) {
            if (node.isCountComplete() && node.infMinItemCount === 0) {
                node.isLoaded = true;
            }
        });

        var uncountedNodes = nodes.filter(function(node) {
            return self.isCountingNeeded(node);
        });

        var countTasks = this.createCountTasks(uncountedNodes);

        return Promise.all(countTasks).then(function() {
            var nonLoadedNodes = nodes.filter(function(node) {
                return self.isLoadingNeeded(node);
            });

            var loadTasks = self.createLoadTasks(nonLoadedNodes);
            return Promise.all(loadTasks).then(function() {
                return nodes;
            });
        });
    }),

    createCountTask: function(node) {

        var self = this;
        var threshold = self.maxItemsPerTileCount; // ? self.maxItemsPerTileCount + 1 : null;

        var countPromise = this.listServiceBbox.fetchCount(node.getBounds(), threshold);
        var result = countPromise.then(function(itemCountInfo) {
            var itemCount = itemCountInfo.count;
            node.setMinItemCount(itemCountInfo.count);

            // If the value is 0, also mark the node as loaded
            if (itemCount === 0) {
                // self.initNode(node);
                node.isLoaded = true;
            }
        });

        return result;
    },

    /**
     * If either the minimum number of items in the node is above the
     * threshold or all children have been counted, then there is NO need
     * for counting
     *
     */
    isCountingNeeded: function(node) {
        // console.log("Node To Count:", node, node.isCountComplete());
        return !(this.isTooManyGeoms(node) || node.isCountComplete());
    },

    /**
     * Loading is needed if NONE of the following criteria applies: . node
     * was already loaded . there are no items in the node . there are to
     * many items in the node
     *
     */
    isLoadingNeeded: function(node) {

        // (node.data && node.data.isLoaded)
        var noLoadingNeeded = node.isLoaded || (node.isCountComplete() && node.infMinItemCount === 0) || this.isTooManyGeoms(node);

        return !noLoadingNeeded;
    },

    isTooManyGeoms: function(node) {
        // console.log("FFS", node.infMinItemCount, node.getMinItemCount());
        return node.infMinItemCount >= this.maxItemsPerTileCount;
    },

    createCountTasks: function(nodes) {
        var self = this;
        var result = nodes.map(function(node) {
            return self.createCountTask(node);
        }).filter(function(item) {
            return item;
        });

        return result;
    },

    /**
     * Sets the node's state to loaded, attaches the geomToFeatureCount to
     * it.
     *
     * @param {Object} node
     * //FIXME: @param {Object} geomToFeatureCount
     */
    loadTaskAction: function(node, docs) {
        // console.log('Data for ' + node.getBounds() + ': ', docs);
        node.data.docs = docs;
        node.isLoaded = true;
    },

    createLoadTasks: function(nodes) {
        var self = this;
        var result = nodes.map(function(node) {
            var loadTask = self.listServiceBbox.fetchItems(node.getBounds()).then(function(docs) {
                self.loadTaskAction(node, docs);
            });

            return loadTask;
        });

        return result;
    },

    /**
     * TODO Finishing this method at some point to merge nodes together
     * could be useful
     *
     */
    finalizeLoading: function(nodes) {
        // Restructure all nodes that have been completely loaded,
        var parents = [];

        nodes.forEach(function(node) {
            if (node.parent) {
                parents.push(node.parent);
            }
        });

        parents = uniq(parents);

        var each = function(child) {
            var indexOf = nodes.indexOf(child);
            if (indexOf >= 0) {
                nodes[indexOf] = undefined;
            }
        };

        var change = false;
        do {
            change = false;
            for (var i in parents) {
                var p = parents[i];

                var children = p.children;

                var didMerge = tryMergeNode(p);
                if (!didMerge) {
                    continue;
                }

                change = true;

                children.forEach(each);

                nodes.push(p);

                if (p.parent) {
                    parents.push(p.parent);
                }

                break;
            }
        } while (change === true);

        nodes = nodes.filter(function(item) {
            return item;
        });

        /*
         * $.each(nodes, function(i, node) { node.isLoaded = true; });
         */

        // console.log("All done");
        // self._setNodes(nodes, bounds);
        // callback.success(nodes, bounds);
    },
});

module.exports = DataServiceBboxCache;

},{"../ext/Class":2,"../rdf/NodeFactory":91,"../service/data_service/DataService":135,"../util/shared":351,"../vocab/wgs84":356,"./Bounds":72,"./GeoExprUtils":76,"./QuadTree":83,"lodash.flatten":364,"lodash.uniq":583}],74:[function(require,module,exports){
var Concept = require('../sparql/Concept');
var ElementString = require('../sparql/element/ElementString');
var VarUtils = require('../sparql/VarUtils');

var GeoConceptUtils = {
    conceptWgs84: new Concept(ElementString.create('?s <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?x ;  <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?y'), VarUtils.s),
    conceptGeoVocab:  new Concept(ElementString.create('?s <http://www.opengis.net/ont/geosparql#asWKT> ?w'), VarUtils.s)
};

module.exports = GeoConceptUtils;

},{"../sparql/Concept":203,"../sparql/VarUtils":227,"../sparql/element/ElementString":235}],75:[function(require,module,exports){
var LookupServiceUtils = require('../service/LookupServiceUtils');
var LookupServiceConst = require('../service/lookup_service/LookupServiceConst');
var LookupServiceTransform = require('../service/lookup_service/LookupServiceTransform');
var ListServiceAugmenter = require('../service/list_service/ListServiceAugmenter');
var AugmenterLookup = require('../service/list_service/AugmenterLookup');
var BestLabelConfig = require('../sparql/BestLabelConfig');

var ListServiceBbox = require('./ListServiceBbox');
var DataServiceBboxCache = require('./DataServiceBboxCache');
var LookupServiceUtils = require('../sponate/LookupServiceUtils');
var MappedConceptUtils = require('../sponate/MappedConceptUtils');


var GeoDataSourceUtils = {

    /**
     *
     * @param attrs Additional static attributes, such as style information
     */
    createGeoDataSourceLabels: function(sparqlService, geoMapFactory, concept, attrs) {

        if(attrs == null) {
            attrs = {};
        }

        // The 'core' service from which to retrieve the initial data
        var bboxListService = new ListServiceBbox(sparqlService, geoMapFactory, concept);

        // Wrap this service for augmenting (enriching) it with labels
        //var lookupServiceLabels = SponateLookupServiceUtils.createLookupServiceNodeLabels(sparqlService);
        var blc = new BestLabelConfig();
        var mappedConcept = MappedConceptUtils.createMappedConceptBestLabel(blc);
        var lookupServiceLabels = LookupServiceUtils.createLookupServiceMappedConcept(sparqlService, mappedConcept);


        lookupServiceLabels = new LookupServiceTransform(lookupServiceLabels, function(doc, id) {
            var result = {
                shortLabel: doc
            };
            return result;
        });

        var augmenterLabels = new AugmenterLookup(lookupServiceLabels);
        bboxListService = new ListServiceAugmenter(bboxListService, augmenterLabels);

        // Also add style information
        var lookupServiceStyle = new LookupServiceConst(attrs);

        var augmenterStyle = new AugmenterLookup(lookupServiceStyle);
        bboxListService = new ListServiceAugmenter(bboxListService, augmenterStyle);

        // Wrap the list service with clustering support
        var result = new DataServiceBboxCache(bboxListService, 1500, 500, 2);

        return result;
    }
};

module.exports = GeoDataSourceUtils;

},{"../service/LookupServiceUtils":120,"../service/list_service/AugmenterLookup":137,"../service/list_service/ListServiceAugmenter":140,"../service/lookup_service/LookupServiceConst":155,"../service/lookup_service/LookupServiceTransform":164,"../sparql/BestLabelConfig":199,"../sponate/LookupServiceUtils":287,"../sponate/MappedConceptUtils":290,"./DataServiceBboxCache":73,"./ListServiceBbox":81}],76:[function(require,module,exports){
var NodeValueUtils = require('../sparql/NodeValueUtils');
var ExprVar = require('../sparql/expr/ExprVar');
var E_Cast = require('../sparql/expr/E_Cast');
var NodeValue = require('../sparql/expr/NodeValue');
var E_LogicalAnd = require('../sparql/expr/E_LogicalAnd');
var E_Function = require('../sparql/expr/E_Function');
var E_GreaterThan = require('../sparql/expr/E_GreaterThan');
var E_LessThan = require('../sparql/expr/E_LessThan');


var GeoExprUtils = {
    /**
     * @param varX The SPARQL variable that corresponds to the longitude
     * @param varY The SPARQL variable that corresponds to the longitude
     * @param bounds The bounding box to use for filtering
     * @param castNode An optional SPAQRL node used for casting, e.g. xsd.xdouble
     */
    createExprWgs84Intersects: function(varX, varY, bounds, castNode) {
        var lon = new ExprVar(varX);
        var lat = new ExprVar(varY);

        // Cast the variables if requested
        // TODO E_Cast should not be used - use E_Function(castNode.getUri(), lon) instead - i.e. the cast type equals the cast function name
        if(castNode) {
            // FIXME: E_Cast not defined
            lon = new E_Cast(lon, castNode);
            lat = new E_Cast(lat, castNode);
        }

        var xMin = NodeValueUtils.makeDecimal(bounds.left);
        var xMax = NodeValueUtils.makeDecimal(bounds.right);
        var yMin = NodeValueUtils.makeDecimal(bounds.bottom);
        var yMax = NodeValueUtils.makeDecimal(bounds.top);

        var result = new E_LogicalAnd(
            new E_LogicalAnd(new E_GreaterThan(lon, xMin), new E_LessThan(lon, xMax)),
            new E_LogicalAnd(new E_GreaterThan(lat, yMin), new E_LessThan(lat, yMax))
        );

        return result;
    },


    createExprOgcIntersects: function(v, bounds, intersectsFnName, geomFromTextFnName) {
        var ogc = 'http://www.opengis.net/rdf#';

        intersectsFnName = intersectsFnName || (ogc + 'intersects');
        geomFromTextFnName = geomFromTextFnName || (ogc + 'geomFromText');


        var exprVar = new ExprVar(v);
        var wktStr = this.boundsToWkt(bounds);

        // FIXME: Better use typeLit with xsd:string
        var wktNodeValue = NodeValueUtils.makeString(wktStr); //new NodeValue(rdf.NodeFactory.createPlainLiteral(wktStr));

        var result = new E_Function(
                intersectsFnName,
            [exprVar, new E_Function(geomFromTextFnName, [wktNodeValue])]
        );

        return result;
    },

    /**
     * Convert a bounds object to a WKT polygon string
     *
     * TODO This method could be moved to a better place
     *
     */
    boundsToWkt: function(bounds) {
        var ax = bounds.left;
        var ay = bounds.bottom;
        var bx = bounds.right;
        var by = bounds.top;

        var result = 'POLYGON((' + ax + ' ' + ay + ',' + bx + ' ' + ay
                + ',' + bx + ' ' + by + ',' + ax + ' ' + by + ',' + ax
                + ' ' + ay + '))';

        return result;
    }
};

module.exports = GeoExprUtils;

},{"../sparql/NodeValueUtils":216,"../sparql/expr/E_Cast":245,"../sparql/expr/E_Function":247,"../sparql/expr/E_GreaterThan":248,"../sparql/expr/E_LessThan":251,"../sparql/expr/E_LogicalAnd":253,"../sparql/expr/ExprVar":269,"../sparql/expr/NodeValue":270}],77:[function(require,module,exports){
var Class = require('../ext/Class');

var Concept = require('../sparql/Concept');
var ElementGroup = require('../sparql/element/ElementGroup');
var ElementFilter = require('../sparql/element/ElementFilter');

var MappedConcept = require('../sponate/MappedConcept');

// ElementFactoryConst
// Mapping


var GeoMapFactory = Class.create({
    classLabel: 'GeoMapFactory',

    initialize: function(mappedConcept, bboxExprFactory) {
        //this.template = template;
        //this.baseElement = baseElement;
        this.mappedConcept = mappedConcept;
        this.bboxExprFactory = bboxExprFactory;
    },

    createMap: function(bounds) {
        var result = this.createMapForBounds(bounds);
        return result;
    },

    // DEPRECATED - use createMap(null)
    createMapForGlobal: function() {
        var result = this.createMapForBounds(null);
        return result;
    },

    // DEPRECATED - use createMap(bounds)
    createMapForBounds: function(bounds) {
        var mappedConcept = this.mappedConcept;
        var bboxExprFactory = this.bboxExprFactory;

        var concept = mappedConcept.getConcept();

        var agg = mappedConcept.getAgg();
        //var baseElementFactory = baseSponateView.getElementFactory();
        //var baseElement = baseElementFactory.createElement();
        var baseElement = concept.getElement();

        var element = baseElement;
        if(bounds) {
            var filterExpr = bboxExprFactory.createExpr(bounds);
            var filterElement = new ElementFilter(filterExpr);

            element = new ElementGroup([baseElement, filterElement]);
        }

        var c = new Concept(element, concept.getVar());
        var result = new MappedConcept(c, agg);
        return result;
    }
});

module.exports = GeoMapFactory;

},{"../ext/Class":2,"../sparql/Concept":203,"../sparql/element/ElementFilter":232,"../sparql/element/ElementGroup":233,"../sponate/MappedConcept":288}],78:[function(require,module,exports){
var BboxExprFactoryWkt = require('./BboxExprFactoryWkt');
var BboxExprFactoryWgs84 = require('./BboxExprFactoryWgs84');
var GeoMapUtils = require('./GeoMapUtils');
var GeoMapFactory = require('./GeoMapFactory');
var VarUtils = require('../sparql/VarUtils');
var Concept = require('../sparql/Concept');
var ElementTriplesBlock = require('../sparql/element/ElementTriplesBlock');
var NodeFactory = require('../rdf/NodeFactory');
var Triple = require('../rdf/Triple');

var rdf = require('../vocab/rdf');

//var TemplateParser = require('../sponate/TemplateParser');
var SponateUtils = require('../sponate/SponateUtils');

var intersectsFnName = 'bif:st_intersects';
var geomFromTextFnName = 'bif:st_geomFromText';

//var mapParser = new TemplateParser();


var GeoMapFactoryUtils = {

    wgs84MapFactory: new GeoMapFactory(
            GeoMapUtils.wgs84GeoView,
            new BboxExprFactoryWgs84(VarUtils.x, VarUtils.y)
    ),

    ogcVirtMapFactory: new GeoMapFactory(
            GeoMapUtils.ogcGeoView,
            new BboxExprFactoryWkt(VarUtils.w, intersectsFnName, geomFromTextFnName)
    ),

    // TODO Replace defaults with geosparql rather than virtuoso bifs
    createWktMapFactory: function(wktPredicateName, intersectsFnName, geomFromTextFnName) {
        wktPredicateName = wktPredicateName || 'http://www.opengis.net/ont/geosparql#asWKT';
        intersectsFnName = intersectsFnName || 'bif:st_intersects';
        geomFromTextFnName = geomFromTextFnName || 'bif:st_geomFromText';

        var predicate = NodeFactory.createUri(wktPredicateName);

        var geoConcept = new Concept(
            new ElementTriplesBlock([new Triple(VarUtils.s, predicate, VarUtils.w)]),
            VarUtils.s
        );


        var baseMap = SponateUtils.parseSpec({
            name: 'geoMap-' + wktPredicateName,
            template: [{
                id: '' + geoConcept.getVar(), // TODO get rid of the '' +
                wkt: VarUtils.w
            }],
            from: geoConcept.getElement()
        });


        var result = new GeoMapFactory(
                baseMap,
                new BboxExprFactoryWkt(VarUtils.w, intersectsFnName, geomFromTextFnName)
        );

        return result;
    }
};

module.exports = GeoMapFactoryUtils;

},{"../rdf/NodeFactory":91,"../rdf/Triple":94,"../sparql/Concept":203,"../sparql/VarUtils":227,"../sparql/element/ElementTriplesBlock":237,"../sponate/SponateUtils":295,"../vocab/rdf":354,"./BboxExprFactoryWgs84":70,"./BboxExprFactoryWkt":71,"./GeoMapFactory":77,"./GeoMapUtils":79}],79:[function(require,module,exports){
var VarUtils = require('../sparql/VarUtils');
var NodeFactory = require('../rdf/NodeFactory');
var Concept = require('../sparql/Concept');
var GeoConceptUtils = require('./GeoConceptUtils');

//var TemplateParser = require('../sponate/TemplateParser');
var SponateUtils = require('../sponate/SponateUtils');


var GeoMapUtils = {
    wgs84GeoView: SponateUtils.parseSpec({
        name: 'lonlat',
        template: [{
            id: '' + GeoConceptUtils.conceptWgs84.getVar(), // TODO Get rid of the '' + //'?s',
            lon: VarUtils.x,
            lat: VarUtils.y,
            wkt: [VarUtils.x, VarUtils.y, function(x, y) {
                var result = NodeFactory.createTypedLiteralFromString('POINT(' + x + ' ' + y + ')', 'http://www.opengis.net/ont/geosparql#wktLiteral');
                //var result = NodeFactory.createTypedLiteralFromString('POINT(' + b.get(VarUtils.x).getLiteralValue() + ' ' + b.get(VarUtils.y).getLiteralValue() + ')', 'http://www.opengis.net/ont/geosparql#wktLiteral');
                return result;
            }]
        }],
        from: GeoConceptUtils.conceptWgs84.getElement()
    }),

    ogcGeoView: SponateUtils.parseSpec({
        name: 'lonlat',
        template: [{
            id: '' + GeoConceptUtils.conceptGeoVocab.getVar(),
            wkt: VarUtils.w
        }],
        from: GeoConceptUtils.conceptGeoVocab.getElement()
    })
};

module.exports = GeoMapUtils;


},{"../rdf/NodeFactory":91,"../sparql/Concept":203,"../sparql/VarUtils":227,"../sponate/SponateUtils":295,"./GeoConceptUtils":74}],80:[function(require,module,exports){
var Node = require('../rdf/node/Node');
var ExprVar = require('../sparql/expr/ExprVar');
var NodeValue = require('../sparql/expr/NodeValue');
var E_LogicalAnd = require('../sparql/expr/E_LogicalAnd');
var E_LogicalOr = require('../sparql/expr/E_LogicalOr');
var E_Function = require('../sparql/expr/E_Function');
var E_Cast = require('../sparql/expr/E_Cast');
var E_GreaterThan = require('../sparql/expr/E_GreaterThan');
var E_LessThan = require('../sparql/expr/E_LessThan');

var GeoUtils = {
    boundsToWkt: function(bounds) {
        var ax = bounds.left;
        var ay = bounds.bottom;
        var bx = bounds.right;
        var by = bounds.top;

        var result = 'POLYGON((' + ax + ' ' + ay + ',' + bx + ' ' + ay +
            ',' + bx + ' ' + by + ',' + ax + ' ' + by + ',' + ax + ' ' + ay + '))';

        return result;
    },

    createFilterOgcIntersects: function(v, bounds) {
        var ogc = 'http://www.opengis.net/rdf#';

        var exprVar = new ExprVar(v);
        var wktStr = this.boundsToWkt(bounds);

        // FIXME: Better use typeLit with xsd:string
        // var nodeValue = new NodeValue(NodeFactory.createPlainLiteral(wktStr));

        var result =
            new E_Function(
                ogc + 'intersects',
                exprVar,
                new E_Function(
                    ogc + 'geomFromText',
                    wktStr
                )
            );

        return result;
    },
    
    createWgsFilter: function(varX, varY, bounds, castNode) {
        var lon = new ExprVar(varX);
        var lat = new ExprVar(varY);

        // Cast the variables if requested
        if (castNode) {
            // FIXME: ECast not defined
            lon = new E_Cast(lon, castNode);
            // FIXME: ECast not defined
            lat = new E_Cast(lat, castNode);
        }

        // FIXME: forValue not defined
        var xMin = NodeValue.makeNode(Node.forValue(bounds.left));
        // FIXME: forValue not defined
        var xMax = NodeValue.makeNode(Node.forValue(bounds.right));
        // FIXME: forValue not defined
        var yMin = NodeValue.makeNode(Node.forValue(bounds.bottom));
        // FIXME: forValue not defined
        var yMax = NodeValue.makeNode(Node.forValue(bounds.top));

        var result = new E_LogicalAnd(
            new E_LogicalAnd(new E_GreaterThan(lon, xMin), new E_LessThan(lon, xMax)),
            new E_LogicalAnd(new E_GreaterThan(lat, yMin), new E_LessThan(lat, yMax))
        );

        return result;
    },

};

module.exports = GeoUtils;

},{"../rdf/node/Node":103,"../sparql/expr/E_Cast":245,"../sparql/expr/E_Function":247,"../sparql/expr/E_GreaterThan":248,"../sparql/expr/E_LessThan":251,"../sparql/expr/E_LogicalAnd":253,"../sparql/expr/E_LogicalOr":255,"../sparql/expr/ExprVar":269,"../sparql/expr/NodeValue":270}],81:[function(require,module,exports){
var Class = require('../ext/Class');
var ListService = require('../service/list_service/ListService');
var StoreFacade = require('../sponate/facade/StoreFacade');

var ListServiceBbox = Class.create(ListService, {
    initialize: function(sparqlService, geoMapFactory, concept) {
        this.sparqlService = sparqlService;
        this.geoMapFactory = geoMapFactory;
        this.concept = concept;

        // this.fnGetBBox = fnGetBBox || defaultDocWktExtractorFn;
        // TODO How to augment the data provided by the geoMapFactory?
    },

    createListService: function(bounds) {
        var store = new StoreFacade(this.sparqlService); // ,
        // prefixes);
        var geoMap = this.geoMapFactory.createMap(bounds);
        var spec = {
            name: 'geoMap',
            template: geoMap
        };
        store.addMap(spec);
        var result = store.geoMap.getListService();
        return result;
    },

    fetchItems: function(bounds, limit, offset) {
        var listService = this.createListService(bounds);
        var result = listService.fetchItems(this.concept, limit, offset);

//        var result = listService.fetchItems(this.concept, limit, offset).then(function(r) {
//            console.log('GOT: ' + JSON.stringify(r));
//            return r;
//        });
        return result;
    },

    fetchCount: function(bounds, itemLimit, rowLimit) {
        var listService = this.createListService(bounds);
        var result = listService.fetchCount(this.concept, itemLimit, rowLimit);
        return result;
    },
});

module.exports = ListServiceBbox;

},{"../ext/Class":2,"../service/list_service/ListService":138,"../sponate/facade/StoreFacade":325}],82:[function(require,module,exports){
var Class = require('../ext/Class');

var Point = Class.create({
    initialize: function(x, y) {
        this.x = x;
        this.y = y;
    },

    getX: function() {
        return this.x;
    },

    getY: function() {
        return this.y;
    }
});

module.exports = Point;

},{"../ext/Class":2}],83:[function(require,module,exports){
var Class = require('../ext/Class');
var QuadTreeNode = require('./QuadTreeNode');

/**
 * A LooseQuadTree data structure.
 *
 * @param bounds Maximum bounds (e.g. (-180, -90) - (180, 90) for spanning the all wgs84 coordinates)
 * @param maxDepth Maximum depth of the tree
 * @param k The factor controlling the additional size of nodes in contrast to classic QuadTrees.
 * @returns {QuadTree}
 */
var QuadTree = Class.create({
    initialize: function(bounds, maxDepth, k) {
        if(k == null) {
            k = 0.25;
        }

        this.node = new QuadTreeNode(null, bounds, maxDepth, 0, k);

        // Map in which nodes objects with a certain ID are located
        // Each ID may be associated with a set of geometries
        this.idToNodes = [];
    },

    getRootNode: function() {
        return this.node;
    },

    /**
     * Retrieve the node that completely encompasses the given bounds
     *
     *
     * @param bounds
     */
    aquireNodes: function(bounds, depth) {
        return this.node.aquireNodes(bounds, depth);
    },


    query: function(bounds, depth) {
        return this.node.query(bounds, depth);
    },

    insert: function(item) {

    }
});


module.exports = QuadTree;

},{"../ext/Class":2,"./QuadTreeNode":84}],84:[function(require,module,exports){
var Class = require('../ext/Class');
var Point = require('./Point');
var Bounds = require('./Bounds');
var reduce = require('lodash.reduce');


var QuadTreeNode = Class.create({
    initialize: function(parent, bounds, maxDepth, depth, k, parentChildIndex) {
        this.parent = parent;
        this.parentChildIndex = parentChildIndex;

        this._bounds = bounds;
        this._maxDepth = maxDepth;
        this._depth = depth;
        this._k = k;  // expansion factor for loose quad tree [0, 1[ - recommended range: 0.25-0.5

        this.isLoaded = false;
        this.children = null;

        this.data = {};

        this._minItemCount = null; // Concrete minumum item count
        this.infMinItemCount = null; // Inferred minimum item count by taking the sum

        // The contained items: id->position (so each item must have an id)
        this.idToPos = {};

        this._classConstructor = QuadTreeNode;
    },

    getId: function() {
        var parent = this.parent;
        var parentId = parent ? parent.getId() : '';

        var indexId = this.parentChildIndex != null ? this.parentChildIndex : 'r'; // r for root
        var result = parentId + indexId;
        return result;
    },

    isLeaf: function() {
        return this.children == null;
    },


    addItem: function(id, pos) {
        this.idToPos[id] = pos;
    },


    addItems: function(idToPos) {
        for(var id in idToPos) {
            var pos = idToPos[id];

            this.addItem(id, pos);
        }
    },


    removeItem: function(id) {
        delete this.idToPos[id];
    },

    /**
     * Sets the minimum item count on this node and recursively updates
     * the inferred minimum item count (.infMinItemCount) on its parents.
     *
     * @param value
     */
    setMinItemCount: function(value) {
        this._minItemCount = value;
        this.infMinItemCount = value;

        if(this.parent) {
            this.parent.updateInfMinItemCount();
        }
    },

    getMinItemCount: function() {
        return this._minItemCount;
    },

    /**
     * True if either the minItemCount is set, or all children have it set
     * FIXME This description is not concise - mention the transitivity
     *
     * @returns
     */
    isCountComplete: function() {
        if(this.getMinItemCount() != null) {
            return true;
        }

        if(this.children) {
            var result = reduce(
                    this.children,
                    function(memo, child) {
                        return memo && child.isCountComplete();
                    },
                    true);

            return result;
        }

        return false;
    },

    updateInfMinItemCount: function() {
        if(!this.children && this._minItemCount != null) {
            return;
        }

        var sum = 0;

        this.children.forEach(function(child, index) {
            if(child._minItemCount != null) {
                sum += child._minItemCount;
            } else if(child.infMinItemCount) {
                sum += child.infMinItemCount;
            }
        });

        this.infMinItemCount = sum;

        if(this.parent) {
            this.parent.updateInfMinItemCount();
        }
    },

    getBounds: function() {
        return this._bounds;
    },


    getCenter: function() {
        return this._bounds.getCenter();
    },


    subdivide: function() {
        var depth = this._depth + 1;

        var c = this.getCenter();

        //console.log("k is " + this._k);

        // expansions
        var ew = this._k * 0.5 * this._bounds.getWidth();
        var eh = this._k * 0.5 * this._bounds.getHeight();

        this.children = [];

        this.children[QuadTreeNode.TOP_LEFT] = new this._classConstructor(this, new Bounds(
            this._bounds.left,
            c.y - eh,
            c.x + ew,
            this._bounds.top
        ),
        this._maxDepth, depth, this._k, QuadTreeNode.TOP_LEFT);

        this.children[QuadTreeNode.TOP_RIGHT] = new this._classConstructor(this, new Bounds(
            c.x - ew,
            c.y - eh,
            this._bounds.right,
            this._bounds.top
        ),
        this._maxDepth, depth, this._k, QuadTreeNode.TOP_RIGHT);

        this.children[QuadTreeNode.BOTTOM_LEFT] = new this._classConstructor(this, new Bounds(
            this._bounds.left,
            this._bounds.bottom,
            c.x + ew,
            c.y + eh
        ),
        this._maxDepth, depth, this._k, QuadTreeNode.BOTTOM_LEFT);

        this.children[QuadTreeNode.BOTTOM_RIGHT] = new this._classConstructor(this, new Bounds(
            c.x - ew,
            this._bounds.bottom,
            this._bounds.right,
            c.y + eh
        ),
        this._maxDepth, depth, this._k, QuadTreeNode.BOTTOM_RIGHT);


        // Uncomment for debug output
        /*
        console.log("Subdivided " + this._bounds + " into ");
        for(var i in this.children) {
            var child = this.children[i];
            console.log("    " + child._bounds);
        }
        */
    },


//    _findIndexPoint: function(point) {
//    // FIXME: bounds not defined
//        var center = this.getCenter(bounds);
//        var left = point.x < center.x;
//        var top = point.y > center.y;
//
//        var index;
//        if(left) {
//            if(top) {
//                index = Node.TOP_LEFT;
//            } else {
//                index = Node.BOTTOM_LEFT;
//            }
//        } else {
//            if(top) {
//                index = Node.TOP_RIGHT;
//            } else {
//                index = Node.BOTTOM_RIGHT;
//            }
//        }
//
//        return index;
//    },

//    _findIndex: function(bounds) {
//        var topLeft = new Point(bounds.left, bounds.top);
//        return this._findIndexPoint(topLeft);
//    },

    getOverlaps: function(bounds) {

    },



    /**
     * Return loaded and leaf nodes within the bounds
     *
     * @param bounds
     * @param depth The maximum number of levels to go beyond the level derived from the size of bounds
     * @returns {Array}
     */
    query: function(bounds, depth) {
        var result = [];

        this.queryRec(bounds, result, depth);

        return result;
    },

    queryRec: function(bounds, result, depth) {
        if(!this._bounds.isOverlap(bounds)) {
            return;
        }

        var w = bounds.getWidth() / this._bounds.getWidth();
        var h = bounds.getHeight() / this._bounds.getHeight();

        var r = Math.max(w, h);

        // Stop recursion on encounter of a loaded node or leaf node or node that exceeded the depth limit
        if(this.isLoaded || !this.children || r >= depth) {
            result.push(this);
            return;
        }

        for(var i in this.children) {
            var child = this.children[i];
            // FIXME: depth is not defined
            child.queryRec(bounds, depth, result);
        }
    },




    /**
     * If the node'size is above a certain ration of the size of the bounds,
     * it is placed into result. Otherwise, it is recursively split until
     * the child nodes' ratio to given bounds has become large enough.
     *
     * Use example:
     * If the screen is centered on a certain location, then this method
     * picks tiles (quad-tree-nodes) of appropriate size (not too big and not too small).
     *
     *
     * @param bounds
     * @param depth
     * @param result
     */
    splitFor: function(bounds, depth, result) {
        /*
        console.log("Depth = " + depth);
        console.log(this.getBounds());
        */


        /*
        if(depth > 10) {
            result.push(this);
            return;
        }*/


        if(!this._bounds.isOverlap(bounds)) {
            return;
        }

        // If the node is loaded, avoid splitting it
        if(this.isLoaded) {
            if(result) {
                result.push(this);
            }
            return;
        }

        // How many times the current node is bigger than the view rect
        var w = bounds.getWidth() / this._bounds.getWidth();
        var h = bounds.getHeight() / this._bounds.getHeight();

        var r = Math.max(w, h);
        //var r = Math.min(w, h);

        if(r >= depth || this._depth >= this._maxDepth) {
            if(result) {
                result.push(this);
                //console.log("Added a node");
            }
            return;
        }

        if(!this.children) {
            this.subdivide();
        }

        for(var i = 0; i < this.children.length; ++i) {
            var child = this.children[i];

            //console.log("Split for ",child, bounds);
            child.splitFor(bounds, depth, result);
        }
    },


    aquireNodes: function(bounds, depth) {
        var result = [];

        this.splitFor(bounds, depth, result);

        return result;
    },


    unlink: function() {
        if(!this.parent) {
            return;
        }

        for(var i in this.parent.children) {
            var child = this.parent.children[i];

            if(child == this) {
                this.parent.children = new QuadTreeNode(this.parent, this._bounds, this._depth, this._k);
            }
        }
    }
});


QuadTreeNode.TOP_LEFT = 0;
QuadTreeNode.TOP_RIGHT = 1;
QuadTreeNode.BOTTOM_LEFT = 2;
QuadTreeNode.BOTTOM_RIGHT = 3;

module.exports = QuadTreeNode;

},{"../ext/Class":2,"./Bounds":72,"./Point":82,"lodash.reduce":496}],85:[function(require,module,exports){
var Class = require('../ext/Class');

var Range = Class.create({
    initialize: function(min, max) {
        this.min = min;
        this.max = max;
    },

    getOverlap: function(other) {
        var min = Math.max(this.min, other.min);
        var max = Math.min(this.max, other.max);

        return (min > max) ? null : new Range(min, max);
    }
});

module.exports = Range;

},{"../ext/Class":2}],86:[function(require,module,exports){
'use strict';

var ns = {
    BboxExprFactory: require('./BboxExprFactory'),
    BboxExprFactoryWgs84: require('./BboxExprFactoryWgs84'),
    BboxExprFactoryWkt: require('./BboxExprFactoryWkt'),
    Bounds: require('./Bounds'),
    DataServiceBboxCache: require('./DataServiceBboxCache'),
    GeoConceptUtils: require('./GeoConceptUtils'),
    GeoDataSourceUtils: require('./GeoDataSourceUtils'),
    GeoExprUtils: require('./GeoExprUtils'),
    GeoMapFactory: require('./GeoMapFactory'),
    GeoMapFactoryUtils: require('./GeoMapFactoryUtils'),
    GeoMapUtils: require('./GeoMapUtils'),
    GeoUtils: require('./GeoUtils'),
    ListServiceBbox: require('./ListServiceBbox'),
    Point: require('./Point'),
    QuadTree: require('./QuadTree'),
    QuadTreeNode: require('./QuadTreeNode'),
    Range: require('./Range'),
};

Object.freeze(ns);

module.exports = ns;

},{"./BboxExprFactory":69,"./BboxExprFactoryWgs84":70,"./BboxExprFactoryWkt":71,"./Bounds":72,"./DataServiceBboxCache":73,"./GeoConceptUtils":74,"./GeoDataSourceUtils":75,"./GeoExprUtils":76,"./GeoMapFactory":77,"./GeoMapFactoryUtils":78,"./GeoMapUtils":79,"./GeoUtils":80,"./ListServiceBbox":81,"./Point":82,"./QuadTree":83,"./QuadTreeNode":84,"./Range":85}],87:[function(require,module,exports){
var shared = require('./util/shared');

/**
 * Defines the global variable into which the modules
 * will add their content
 *
 * A note on naming convention:
 * The root objectand classes is spelled with upper camel case.
 * modules, functions and objects are in lower camel case.
 * (modules are just namespaces, and it feels pretty obstrusive writing them in upper camel case)
 *
 */

var Jassa = function(Promise, ajaxRequest) {
    // store promise and ajax function
    shared.Promise = Promise;
    shared.ajax = ajaxRequest;

    // return jassa object
    return {
        ext: require('./ext'),
        util: require('./util'),
        rdf: require('./rdf'),
        vocab: require('./vocab'),
        sparql: require('./sparql'),
        service: require('./service'),
        sponate: require('./sponate'),
        facete: require('./facete'),
        geo: require('./geo')
    };
};

/*
Jassa.util = require('./util');
Jassa.rdf = require('./rdf');
Jassa.vocab = require('./vocab');
Jassa.sparql = require('./sparql');
Jassa.service = require('./service');
Jassa.sponate = require('./sponate');
Jassa.facete = require('./facete');
*/


module.exports = Jassa;


},{"./ext":4,"./facete":55,"./geo":86,"./rdf":102,"./service":136,"./sparql":272,"./sponate":326,"./util":350,"./util/shared":351,"./vocab":352}],88:[function(require,module,exports){
var Class = require('../ext/Class');

// constructor
var AnonId = Class.create({
    classLabel: 'AnonId',
    getLabelString: function() {
        throw new Error('not implemented');
    },
});

module.exports = AnonId;

},{"../ext/Class":2}],89:[function(require,module,exports){
var Class = require('../ext/Class');
var AnonId = require('./AnonId');

// constructor
var AnonIdStr = Class.create(AnonId, {
    classLabel: 'AnonIdStr',
    initialize: function(label) {
        this.label = label;
    },
    getLabelString: function() {
        return this.label;
    },
    toString: function() {
        return this.label;
    },
});

module.exports = AnonIdStr;

},{"../ext/Class":2,"./AnonId":88}],90:[function(require,module,exports){
var Class = require('../ext/Class');
var Node_Concrete = require('./node/Node_Concrete');

var escapeLiteralString = function(str) {
    var result = str
        .replace(/\n/g, '\\n')
        .replace(/"/g, '\\"');

    return result;
};

// constructor
var LiteralLabel = Class.create(Node_Concrete, {
    classLabel: 'jassa.rdf.LiteralLabel',

    // assign new functions

    /**
     * Note: The following should hold:
     * dtype.parse(lex) == val
     * dtype.unpars(val) == lex
     *
     * However, this class doesn't care about it.
     */
    initialize: function(val, lex, lang, dtype) {
        this.val = val;
        this.lex = lex;
        this.lang = lang;
        this.dtype = dtype;
    },
    /** Get the literal's value as a JavaScript object */
    getValue: function() {
        return this.val;
    },
    getLexicalForm: function() {
        return this.lex instanceof String ? this.lex : this.lex.toString();
    },
    getLanguage: function() {
        return this.lang;
    },
    /**
     * Return the dataype object associated with this literal.
     */
    getDatatype: function() {
        return this.dtype;
    },
    toString: function() {
        var dtypeUri = this.dtype ? this.dtype.getUri() : null;
        var litStr = escapeLiteralString(this.lex);
        var result;

        if (dtypeUri) {
            result = '"' + litStr + '"^^<' + dtypeUri + '>';
        } else {
            result = '"' + litStr + '"' + (this.lang ? '@' + this.lang : '');
        }

        return result;
    },
});

module.exports = LiteralLabel;

},{"../ext/Class":2,"./node/Node_Concrete":105}],91:[function(require,module,exports){
var AnonIdStr = require('./AnonIdStr');
var Var = require('./node/Var');
var Node = require('./node/Node');
var Node_Uri = require('./node/Node_Uri');
var Node_Blank = require('./node/Node_Blank');
var Node_Literal = require('./node/Node_Literal');
var LiteralLabel = require('./LiteralLabel');
var TypeMapper = require('./TypeMapper');
var DefaultRdfDatatypes = require('./rdf_datatype/DefaultRdfDatatypes');

// TODO Move to util package
// http://stackoverflow.com/questions/249791/regex-for-quoted-string-with-escaping-quotes
var strRegex = /"([^"\\]*(\\.[^"\\]*)*)"/;
var parseUri = function(str) { // , prefixes) {
    var result;

    if (str.charAt(0) === '<') {
        result = str.slice(1, -1);

    } else {
        throw new Error('[ERROR] Cannot deal with ' + str);
    }
    return result;
};

var NodeFactory = {
    createAnon: function(anonId) {
        return new Node_Blank(anonId);
    },

    createUri: function(uri) {
        return new Node_Uri(uri);
    },

    createVar: function(name) {
        return new Var(name);
    },

    createPlainLiteral: function(value, lang) {
        if (lang == null) {
            lang = '';
        }

        var label = new LiteralLabel(value, value, lang);

        return new Node_Literal(label);
    },

    /** The value needs to be unparsed first (i.e. converted to string) */
    createTypedLiteralFromValue: function(val, typeUri) {
        var dtype = DefaultRdfDatatypes[typeUri];

        if (!dtype) {
            var typeMapper = TypeMapper.getInstance();
            dtype = typeMapper.getSafeTypeByName(typeUri);
        }

        var lex = dtype.unparse(val);
        var lang = null;
        var literalLabel = new LiteralLabel(val, lex, lang, dtype);

        return new Node_Literal(literalLabel);
    },

    /** The string needs to be parsed first (i.e. converted to the value) */
    createTypedLiteralFromString: function(str, typeUri) {
        var dtype = DefaultRdfDatatypes[typeUri];

        if (!dtype) {
            var typeMapper = TypeMapper.getInstance();
            dtype = typeMapper.getSafeTypeByName(typeUri);
        }

        var val = dtype.parse(str);
        var lex = str;
        var lang = ''; // TODO Use null instead of empty string???
        var literalLabel = new LiteralLabel(val, lex, lang, dtype);

        return new Node_Literal(literalLabel);
    },

    createFromTalisRdfJson: function(talisJson) {
        if (!talisJson || typeof(talisJson.type) === 'undefined') {
            throw new Error('Invalid node: ' + JSON.stringify(talisJson));
        }
        var result;

        switch (talisJson.type) {
            case 'bnode':
                var anonId = new AnonIdStr(talisJson.value);
                result = new NodeFactory.createAnon(anonId);
                break;

            case 'uri':
                result = NodeFactory.createUri(talisJson.value);
                break;

            case 'literal':
                // Virtuoso at some version had a bug with langs - note: || is coalesce
                var lang = talisJson.lang || talisJson['xml:lang'];
                result = NodeFactory.createPlainLiteral(talisJson.value, lang);
                break;

            case 'typed-literal':
                result = NodeFactory.createTypedLiteralFromString(talisJson.value, talisJson.datatype);
                break;

            default:
                console.log('Unknown type: \'' + talisJson.type + '\'');
                throw new Error('Bailing out');
        }

        return result;
    },

    /**
     * Parses an RDF term and returns an rdf.Node object
     *
     * blankNode: _:
     * uri: <http://foo>
     * plainLiteral ""@foo
     * typedLiteral""^^<>
     */
    parseRdfTerm: function(str) { // , prefixes) {
        if (!str) {
            throw new Error('[ERROR] Null Pointer Exception');
        }

        str = str.trim();

        if (str.length === 0) {
            throw new Error('[ERROR] Empty string');
        }

        var c = str.charAt(0);
        var result;

        switch (c) {
            case '<':
                var uriStr = str.slice(1, -1);
                result = NodeFactory.createUri(uriStr);
                break;

            case '_':
                var anonId = new AnonIdStr(str);
                result = NodeFactory.createAnon(anonId);
                break;

            case '"':
                var matches = strRegex.exec(str);
                var match = matches[0];
                var val = match.slice(1, -1);
                var l = match.length;
                var d = str.charAt(l);

                if (!d) {
                    result = NodeFactory.createTypedLiteralFromString(val, 'http://www.w3.org/2001/XMLSchema#string');
                }

                switch (d) {
                    case '':
                    case '@':
                        var langTag = str.substr(l + 1);
                        result = NodeFactory.createPlainLiteral(val, langTag);
                        break;

                    case '^':
                        var type = str.substr(l + 2);
                        var typeStr = parseUri(type);
                        result = NodeFactory.createTypedLiteralFromString(val, typeStr);
                        break;

                    default:
                        throw new Error('[ERROR] Excepted @ or ^^');
                }
                break;

            default:
                throw new Error('Could not parse ' + str);
        }

        return result;
    }
};

module.exports = NodeFactory;

},{"./AnonIdStr":89,"./LiteralLabel":90,"./TypeMapper":96,"./node/Node":103,"./node/Node_Blank":104,"./node/Node_Literal":107,"./node/Node_Uri":108,"./node/Var":110,"./rdf_datatype/DefaultRdfDatatypes":112}],92:[function(require,module,exports){
var UriUtils = require('../util/UriUtils');

var NodeUtils = {

    getSubstitute: function(node, fnNodeMap) {
        var result = fnNodeMap(node);
        if (!result) {
            result = node;
        }

        return result;
    },

    /**
     * Push the node into to the array if it is a variable
     */
    pushVar: function(array, node) {
        if (node.isVariable()) {
            var c = false;
            array.forEach(function(item) {
                c = c || node.equals(item);
            });

            if (!c) {
                array.push(node);
            }
        }
        return array;
    },

    getLang: function(node) {
        var result = node && node.isLiteral() ? node.getLiteralLanguage() : null;
        return result;
    },

    getUri: function(node) {
        var result = node && node.isUri() ? node.getUri() : null;
        return result;
    },

    /**
     * Obtain a "pretty" string from a node object, under an optional prefixMapping.
     * Pretty means, that Uris will be converted to their short form (if a prefix mapping applies) or
     * their local name (otherwise).
     *
     * @param node
     * @param prefixMapping
     * @returns {String}
     */
    toPrettyString: function(node, prefixMapping) {
        var result;

        if(node.isUri()) {
            var uri = node.getUri();
            if(prefixMapping) {
                result = prefixMapping.shortForm(uri);

                if(result === uri) {
                    result = UriUtils.extractLabel(uri);
                }
            } else {
                result = UriUtils.extractLabel(uri);
            }
        } else {
            result = '' + this.getValue(node);
        }

        return result;
    },

    // Turn a node of any kind into a javascript literal value
    getValue: function(node) {
        var result;
        if(node == null) {
            result = null;
        } else if(node.isUri()) {
            result = node.getUri();
        } else if(node.isBlank()) {
            result = node.toString();
        } else if(node.isLiteral()) {
            result = node.getLiteralValue();
        } else {
            throw new Error('Unknow node type: ', node);
        }

        //console.log('Returned value: ' + result + '; for node: ' + node);
        return result;
    }

};

module.exports = NodeUtils;
},{"../util/UriUtils":339}],93:[function(require,module,exports){
var Class = require('../ext/Class');

// helper function
var startsWith = function(str, starts) {
    if (starts === '') {
        return true;
    }
    if (str == null || starts == null) {
        return false;
    }
    str = String(str);
    starts = String(starts);
    return str.length >= starts.length && str.slice(0, starts.length) === starts;
};
var isFunction = function(obj) {
    return typeof obj === 'function';
};
var extend = function(obj, source) {
    var prop;
    for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
    }
    return obj;
};

var PrefixMappingImpl = Class.create({
    initialize: function(prefixes) {
        this.prefixes = prefixes ? prefixes : {};
    },

    expandPrefix: function() {
        throw new Error('Not implemented yet - sorry');
    },

    getNsPrefixMap: function() {
        return this.prefixes;
    },

    getNsPrefixURI: function(prefix) {
        return this.prefixes[prefix];
    },

    /**
     * Answer the prefix for the given URI, or null if there isn't one.
     */
    getNsURIPrefix: function(uri) {
        var result = null;
        var bestNs = null;

        // TODO: forEach can't be used in case a simple dictionary/map is used;
        // moreover this will also fail if the empty fallback prefixes map {}
        // is used
//        this.prefixes.forEach(function(u, prefix) {
//            if (startsWith(uri, u)) {
//                if (!bestNs || (u.length > bestNs.length)) {
//                    result = prefix;
//                    bestNs = u;
//                }
//            }
//        });

        for (var prefix in this.prefixes) {
            if (this.prefixes.hasOwnProperty(prefix)) {
                var ns = this.prefixes[prefix];
                if (startsWith(uri, ns)) {
                    if (!bestNs || (ns.length > bestNs.length)) {
                        result = prefix;
                        bestNs = ns;
                    }
                }
            }
        }

        return result;
    },

    qnameFor: function() {

    },

    removeNsPrefix: function(prefix) {
        delete this.prefixes[prefix];
    },

    samePrefixMappingAs: function() {
        throw new Error('Not implemented yet - Sorry');
    },

    setNsPrefix: function(prefix, uri) {
        this.prefixes[prefix] = uri;

        return this;
    },

    setNsPrefixes: function(obj) {
        var json = isFunction(obj.getNsPrefixMap) ? obj.getNsPrefixMap() : obj;

        // TODO: forEach can't be used in case a simple dictionary/map is used;
        // moreover this will also fail if the empty fallback prefixes map {}
        // is used
//        var self = this;
//        json.forEach(function(uri, prefix) {
//            self.setNsPrefix(prefix, uri);
//        });
        for (var prefix in json) {
            if (json.hasOwnProperty(prefix)) {
                var ns = json[prefix];
                this.setNsPrefix(prefix, ns);
            }
        }
        return this;
    },

    shortForm: function(uri) {
        var prefix = this.getNsURIPrefix(uri);

        var result;
        if (prefix) {

            var u = this.prefixes[prefix];
            var qname = uri.substring(u.length);

            result = prefix + ':' + qname;
        } else {

            result = uri;
        }

        return result;
    },

    addPrefix: function(prefix, urlBase) {
        this.prefixes[prefix] = urlBase;
    },

    getPrefix: function(prefix) {
        var result = this.prefixes[prefix];
        return result;
    },

    addJson: function(json) {
        extend(this.prefixes, json);
    },

    getJson: function() {
        return this.prefixes;
    }
});

module.exports = PrefixMappingImpl;

},{"../ext/Class":2}],94:[function(require,module,exports){
var Class = require('../ext/Class');
var NodeUtils = require('./NodeUtils');

// constructor
var Triple = Class.create({
    classLabel: 'jassa.rdf.Triple',

    // functions
    initialize: function(subject, predicate, object) {
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
    },
    toString: function() {
        return this.subject + ' ' + this.predicate + ' ' + this.object;
    },
    copySubstitute: function(fnNodeMap) {
        var result = new Triple(
            NodeUtils.getSubstitute(this.subject, fnNodeMap),
            NodeUtils.getSubstitute(this.predicate, fnNodeMap),
            NodeUtils.getSubstitute(this.object, fnNodeMap)
        );
        return result;
    },
    getSubject: function() {
        return this.subject;
    },
    getPredicate: function() {
        return this.predicate;
    },
    getObject: function() {
        return this.object;
    },
    getVarsMentioned: function() {
        var result = [];
        NodeUtils.pushVar(result, this.subject);
        NodeUtils.pushVar(result, this.predicate);
        NodeUtils.pushVar(result, this.object);
        return result;
    },

});

module.exports = Triple;

},{"../ext/Class":2,"./NodeUtils":92}],95:[function(require,module,exports){
var uniq = require('lodash.uniq');

var TripleUtils = {
    uniqTriples: function(triples) {
        var result =  uniq(triples, false, function(x) {
            return x.toString();
        });
        return result;
    }
};

module.exports = TripleUtils;

},{"lodash.uniq":583}],96:[function(require,module,exports){
var Class = require('../ext/Class');
var DefaultRdfDatatypes = require('./rdf_datatype/DefaultRdfDatatypes');
var BaseDatatype = require('./rdf_datatype/BaseDatatype');

// TODO: expose?
var JenaParameters = {
    enableSilentAcceptanceOfUnknownDatatypes: true
};

// static instance
var staticInstance = null;

// constructor
var TypeMapper = Class.create({
    classLabel: 'jassa.rdf.TypeMapper',

    initialize: function(uriToDt) {
        this.uriToDt = uriToDt;
    },

    getSafeTypeByName: function(uri) {
        var uriToDt = this.uriToDt;
        var dtype = uriToDt[uri];

        if (dtype == null) {
            if (uri == null) {
                // Plain literal
                return null;
            } else {
                // Uknown datatype
                if (JenaParameters.enableSilentAcceptanceOfUnknownDatatypes) {
                    dtype = new BaseDatatype(uri);
                    this.registerDatatype(dtype);
                } else {
                    console.log('Attempted to created typed literal using an unknown datatype - ' + uri);
                    throw new Error('Bailing out');
                }
            }
        }
        return dtype;
    },

    registerDatatype: function(datatype) {
        var typeUri = datatype.getUri();
        this.uriToDt[typeUri] = datatype;
    }
});

TypeMapper.staticInstance = null;

TypeMapper.getInstance = function() {

    if (TypeMapper.staticInstance == null) {
        TypeMapper.staticInstance = new TypeMapper(DefaultRdfDatatypes);
    }

    return TypeMapper.staticInstance;
};

module.exports = TypeMapper;

},{"../ext/Class":2,"./rdf_datatype/BaseDatatype":111,"./rdf_datatype/DefaultRdfDatatypes":112}],97:[function(require,module,exports){
var Class = require('../../ext/Class');

// constructor
var DatatypeLabel = Class.create({
    classLabel: 'DatatypeLabel',
    parse: function() {
        throw new Error('Not implemented');
    },
    unparse: function() {
        throw new Error('Not implemented');
    }
});

module.exports = DatatypeLabel;

},{"../../ext/Class":2}],98:[function(require,module,exports){
var Class = require('../../ext/Class');
var DatatypeLabel = require('./DatatypeLabel');

// constructor
var DatatypeLabelFloat = Class.create(DatatypeLabel, {
    classLabel: 'jassa.rdf.DatatypeLabelFloat',
    parse: function(str) {
        return parseFloat(str);
    },
    unparse: function(val) {
        return val.toString();
    }
});

module.exports = DatatypeLabelFloat;

},{"../../ext/Class":2,"./DatatypeLabel":97}],99:[function(require,module,exports){
var Class = require('../../ext/Class');
var DatatypeLabel = require('./DatatypeLabel');

// constructor
var DatatypeLabelInteger = Class.create(DatatypeLabel, {
    classLabel: 'jassa.rdf.DatatypeLabelInteger',
    parse: function(str) {
        return parseInt(str, 10);
    },
    unparse: function(val) {
        return val.toString();
    }
});

module.exports = DatatypeLabelInteger;

},{"../../ext/Class":2,"./DatatypeLabel":97}],100:[function(require,module,exports){
var Class = require('../../ext/Class');
var DatatypeLabel = require('./DatatypeLabel');

// constructor
var DatatypeLabelString = Class.create(DatatypeLabel, {
    classLabel: 'jassa.rdf.DatatypeLabelString',
    parse: function(str) {
        return str;
    },
    unparse: function(val) {
        return val.toString();
    }
});

module.exports = DatatypeLabelString;

},{"../../ext/Class":2,"./DatatypeLabel":97}],101:[function(require,module,exports){
var DatatypeLabelInteger = require('./DatatypeLabelInteger');
var DatatypeLabelFloat = require('./DatatypeLabelFloat');
var DatatypeLabelString = require('./DatatypeLabelString');

var DefaultDatatypeLabels = {
    xinteger: new DatatypeLabelInteger(),
    xfloat: new DatatypeLabelFloat(),
    xdouble: new DatatypeLabelFloat(),
    xstring: new DatatypeLabelString(),
    decimal: new DatatypeLabelFloat()  // TODO Handle Decimal properly
};

// freeze
//Object.freeze(DatatypeLabels);

module.exports = DefaultDatatypeLabels;

},{"./DatatypeLabelFloat":98,"./DatatypeLabelInteger":99,"./DatatypeLabelString":100}],102:[function(require,module,exports){
'use strict';

var ns = {
    AnonId: require('./AnonId'),
    AnonIdStr: require('./AnonIdStr'),
    LiteralLabel: require('./LiteralLabel'),
    NodeFactory: require('./NodeFactory'),
    NodeUtils: require('./NodeUtils'),
    PrefixMappingImpl: require('./PrefixMappingImpl'),
    Triple: require('./Triple'),
    TripleUtils: require('./TripleUtils'),
    TypeMapper: require('./TypeMapper'),
    DatatypeLabel: require('./datatype/DatatypeLabel'),
    DatatypeLabelFloat: require('./datatype/DatatypeLabelFloat'),
    DatatypeLabelInteger: require('./datatype/DatatypeLabelInteger'),
    DatatypeLabelString: require('./datatype/DatatypeLabelString'),
    DefaultDatatypeLabels: require('./datatype/DefaultDatatypeLabels'),
    Node: require('./node/Node'),
    Node_Blank: require('./node/Node_Blank'),
    Node_Concrete: require('./node/Node_Concrete'),
    Node_Fluid: require('./node/Node_Fluid'),
    Node_Literal: require('./node/Node_Literal'),
    Node_Uri: require('./node/Node_Uri'),
    Node_Variable: require('./node/Node_Variable'),
    Var: require('./node/Var'),
    BaseDatatype: require('./rdf_datatype/BaseDatatype'),
    DefaultRdfDatatypes: require('./rdf_datatype/DefaultRdfDatatypes'),
    RdfDatatype: require('./rdf_datatype/RdfDatatype'),
    RdfDatatypeBase: require('./rdf_datatype/RdfDatatypeBase'),
    RdfDatatypeLabel: require('./rdf_datatype/RdfDatatypeLabel'),
    TypedValue: require('./rdf_datatype/TypedValue'),
};

Object.freeze(ns);

module.exports = ns;

},{"./AnonId":88,"./AnonIdStr":89,"./LiteralLabel":90,"./NodeFactory":91,"./NodeUtils":92,"./PrefixMappingImpl":93,"./Triple":94,"./TripleUtils":95,"./TypeMapper":96,"./datatype/DatatypeLabel":97,"./datatype/DatatypeLabelFloat":98,"./datatype/DatatypeLabelInteger":99,"./datatype/DatatypeLabelString":100,"./datatype/DefaultDatatypeLabels":101,"./node/Node":103,"./node/Node_Blank":104,"./node/Node_Concrete":105,"./node/Node_Fluid":106,"./node/Node_Literal":107,"./node/Node_Uri":108,"./node/Node_Variable":109,"./node/Var":110,"./rdf_datatype/BaseDatatype":111,"./rdf_datatype/DefaultRdfDatatypes":112,"./rdf_datatype/RdfDatatype":113,"./rdf_datatype/RdfDatatypeBase":114,"./rdf_datatype/RdfDatatypeLabel":115,"./rdf_datatype/TypedValue":116}],103:[function(require,module,exports){
var Class = require('../../ext/Class');
/**
 * The node base class similar to that of Apache Jena.
 *
 * TODO Rename getUri to getURI
 * TODO Make this class a pure interface - move all impled methods to an abstract base class
 * TODO Clarify who is responsible for .equals() (just do it like in Jena - Is it the base class or its derivations?)
 */
var Node = Class.create({
    classLabel: 'Node',

    getUri: function() {
        throw new Error('not a URI node');
    },

    getName: function() {
        throw new Error('is not a variable node');
    },

    getBlankNodeId: function() {
        throw new Error('is not a blank node');
    },

    getBlankNodeLabel: function() {
        // Convenience override
        return this.getBlankNodeId().getLabelString();
    },

    getLiteral: function() {
        throw new Error('is not a literal node');
    },

    getLiteralValue: function() {
        throw new Error('is not a literal node');
    },

    getLiteralLexicalForm: function() {
        throw new Error('is not a literal node');
    },

    getLiteralDatatype: function() {
        throw new Error('is not a literal node');
    },

    getLiteralDatatypeUri: function() {
        throw new Error('is not a literal node');
    },

    isBlank: function() {
        return false;
    },

    isUri: function() {
        return false;
    },

    isLiteral: function() {
        return false;
    },

    isVariable: function() {
        return false;
    },

    equals: function(that) {
        // By default we assume non-equality
        var result = false;

        if (that == null) {
            result = false;

        } else if (this.isLiteral()) {
            if (that.isLiteral()) {
                var isSameLex = this.getLiteralLexicalForm() === that.getLiteralLexicalForm();
                var isSameType = this.getLiteralDatatypeUri() === that.getLiteralDatatypeUri();
                var isSameLang = this.getLiteralLanguage() === that.getLiteralLanguage();

                result = isSameLex && isSameType && isSameLang;
            }

        } else if (this.isUri()) {
            if (that.isUri()) {
                result = this.getUri() === that.getUri();
            }

        } else if (this.isVariable()) {
            if (that.isVariable()) {
                result = this.getName() === that.getName();
            }

        } else if (this.isBlank()) {
            if (that.isBlank()) {
                result = this.getBlankNodeLabel() === that.getBlankNodeLabel();
            }

        } else {
            throw new Error('not implemented yet');
        }

        return result;
    }
});

module.exports = Node;

},{"../../ext/Class":2}],104:[function(require,module,exports){
var Class = require('../../ext/Class');
var Node_Concrete = require('./Node_Concrete');

var Node_Blank = Class.create(Node_Concrete, {
    classLabel: 'jassa.rdf.Node_Blank',
    // Note: id is expected to be an instance of AnonId
    // PW: to make the toString method work it should actually be an instance
    // of AnonIdStr (or of any other future subclass of this fancy, feature
    // rich AnonId class or any sub class of such a sub class...)
    initialize: function(anonId) {
        this.anonId = anonId;
    },

    isBlank: function() {
        return true;
    },

    getBlankNodeId: function() {
        return this.anonId;
    },

    toString: function() {
        return '_:' + this.anonId;
    }
});

module.exports = Node_Blank;

},{"../../ext/Class":2,"./Node_Concrete":105}],105:[function(require,module,exports){
var Class = require('../../ext/Class');
var Node = require('./Node');

var Node_Concrete = Class.create(Node, {
    classLabel: 'jassa.rdf.Node_Concrete',
    isConcrete: function() {
        return true;
    }
});

module.exports = Node_Concrete;

},{"../../ext/Class":2,"./Node":103}],106:[function(require,module,exports){
var Class = require('../../ext/Class');
var Node = require('./Node');

var Node_Fluid = Class.create(Node, {
    classLabel: 'jassa.rdf.Node_Fluid',
    isConcrete: function() {
        return false;
    }
});

module.exports = Node_Fluid;

},{"../../ext/Class":2,"./Node":103}],107:[function(require,module,exports){
var Class = require('../../ext/Class');
var Node_Concrete = require('./Node_Concrete');

var Node_Literal = Class.create(Node_Concrete, {
    classLabel: 'Node_Literal',
    initialize: function(literalLabel) {
        this.literalLabel = literalLabel;
    },
    isLiteral: function() {
        return true;
    },
    getLiteral: function() {
        return this.literalLabel;
    },
    getLiteralValue: function() {
        return this.literalLabel.getValue();
    },
    getLiteralLexicalForm: function() {
        return this.literalLabel.getLexicalForm();
    },
    getLiteralDatatype: function() {
        return this.literalLabel.getDatatype();
    },
    getLiteralDatatypeUri: function() {
        var dtype = this.getLiteralDatatype();
        var result = dtype ? dtype.getUri() : null;
        return result;
    },
    getLiteralLanguage: function() {
        return this.literalLabel.getLanguage();
    },
    toString: function() {
        return this.literalLabel.toString();
    }
});

module.exports = Node_Literal;

},{"../../ext/Class":2,"./Node_Concrete":105}],108:[function(require,module,exports){
var Class = require('../../ext/Class');
var Node_Concrete = require('./Node_Concrete');

var Node_Uri = Class.create(Node_Concrete, {
    classLabel: 'jassa.rdf.Node_Uri',
    initialize: function(uri) {
        this.uri = uri;
    },
    isUri: function() {
        return true;
    },
    getUri: function() {
        return this.uri;
    },
    toString: function() {
        return '<' + this.uri + '>';
    }
});

module.exports = Node_Uri;

},{"../../ext/Class":2,"./Node_Concrete":105}],109:[function(require,module,exports){
var Class = require('../../ext/Class');
var Node_Fluid = require('./Node_Fluid');

var Node_Variable = Class.create(Node_Fluid, {
    classLabel: 'jassa.rdf.Node_Variable',
    isVariable: function() {
        return true;
    }
});

module.exports = Node_Variable;

},{"../../ext/Class":2,"./Node_Fluid":106}],110:[function(require,module,exports){
var Class = require('../../ext/Class');
var Node_Variable = require('./Node_Variable');

var Var = Class.create(Node_Variable, {
    classLabel: 'Var',
    initialize: function(name) {
        this.name = name;
    },
    getName: function() {
        return this.name;
    },
    toString: function() {
        return '?' + this.name;
    }
});

module.exports = Var;

},{"../../ext/Class":2,"./Node_Variable":109}],111:[function(require,module,exports){
var Class = require('../../ext/Class');
var RdfDatatype = require('./RdfDatatype');
var TypedValue = require('./TypedValue');

// constructor
var BaseDatatype = Class.create(RdfDatatype, {
    classLabel: 'jassa.rdf.BaseDatatype',
    initialize: function(datatypeUri) {
        this.datatypeUri = datatypeUri;
    },
    getUri: function() {
        return this.datatypeUri;
    },
    unparse: function(value) {
        var result;

        if (value instanceof TypedValue) {
            result = value.getLexicalValue();

        } else {
            result = value.toString();
        }
        return result;
    },
    /** Convert a value of this datatype to lexical form. */
    parse: function(str) {
        return new TypedValue(str, this.datatypeUri);
    },
    toString: function() {
        return 'Datatype [' + this.datatypeUri + ']';
    }
});

module.exports = BaseDatatype;

},{"../../ext/Class":2,"./RdfDatatype":113,"./TypedValue":116}],112:[function(require,module,exports){
var xsd = require('../../vocab/xsd');
var DatatypeLabels = require('../datatype/DefaultDatatypeLabels');
var RdfDatatypeLabel = require('./RdfDatatypeLabel');

// init object
var DefaultRdfDatatypes = {};

// helper function
var registerRdfDatype = function(node, label) {
    var uri = node.getUri();
    DefaultRdfDatatypes[uri] = new RdfDatatypeLabel(uri, label);
};

registerRdfDatype(xsd.xint, DatatypeLabels.xinteger);
registerRdfDatype(xsd.xlong, DatatypeLabels.xinteger);
registerRdfDatype(xsd.xinteger, DatatypeLabels.xinteger);
registerRdfDatype(xsd.xstring, DatatypeLabels.xstring);
registerRdfDatype(xsd.xfloat, DatatypeLabels.xfloat);
registerRdfDatype(xsd.xdouble, DatatypeLabels.xdouble);
registerRdfDatype(xsd.decimal, DatatypeLabels.xfloat);

module.exports = DefaultRdfDatatypes;

},{"../../vocab/xsd":357,"../datatype/DefaultDatatypeLabels":101,"./RdfDatatypeLabel":115}],113:[function(require,module,exports){
var Class = require('../../ext/Class');

// constructor
var RdfDatatype = Class.create({
    classLabel: 'RdfDatatype',
    getUri: function() {
        throw new Error('Not implemented');
    },
    unparse: function() {
        throw new Error('Not implemented');
    },
    /** Convert a value of this datatype to lexical form. */
    parse: function() {
        throw new Error('Not implemented');
    }
});

module.exports = RdfDatatype;

},{"../../ext/Class":2}],114:[function(require,module,exports){
var Class = require('../../ext/Class');
var RdfDatatype = require('./RdfDatatype');

// constructor
var RdfDatatypeBase = Class.create(RdfDatatype, {
    classLabel: 'jassa.rdf.RdfDatatypeBase',
    initialize: function(uri) {
        this.uri = uri;
    },
    getUri: function() {
        return this.uri;
    }
});

module.exports = RdfDatatypeBase;

},{"../../ext/Class":2,"./RdfDatatype":113}],115:[function(require,module,exports){
/* jscs:null requireCamelCaseOrUpperCaseIdentifiers */
var Class = require('../../ext/Class');
var RdfDatatypeBase = require('./RdfDatatypeBase');

// constructor
var RdfDatatypeLabel = Class.create(RdfDatatypeBase, {
    classLabel: 'jassa.rdf.RdfDatatype_Label',
    initialize: function($super, uri, datatypeLabel) {
        $super(uri);

        this.datatypeLabel = datatypeLabel;
    },
    parse: function(str) {
        return this.datatypeLabel.parse(str);
    },
    unparse: function(val) {
        return this.datatypeLabel.unparse(val);
    }
});

module.exports = RdfDatatypeLabel;

},{"../../ext/Class":2,"./RdfDatatypeBase":114}],116:[function(require,module,exports){
var Class = require('../../ext/Class');
// constructor
var TypedValue = Class.create({
    classLabel: 'jassa.rdf.TypedValue',
    initialize: function(lexicalValue, datatypeUri) {
        this.lexicalValue = lexicalValue;
        this.datatypeUri = datatypeUri;
    },
    getLexicalValue: function() {
        return this.lexicalValue;
    },
    getDatatypeUri: function() {
        return this.datatypeUri;
    }
});

module.exports = TypedValue;

},{"../../ext/Class":2}],117:[function(require,module,exports){
var defaults = require('lodash.defaults');

var AjaxUtils = {

    createSparqlRequestAjaxSpec: function(baseUrl, defaultGraphIris, queryString, dataDefaults, ajaxDefaults) {
        // ISSUE #13 - Added HACK to make it work for at least one defaultGraph...
        var hack = defaultGraphIris;
        if(hack && hack.length === 1) {
            hack = hack[0];
        }

        var data = {
            query: queryString,
            'default-graph-uri': hack 
        };

        var result = {
            url: baseUrl,
            dataType: 'json',
            crossDomain: true,
            traditional: true,
            data: data
        };

        defaults(data, dataDefaults);
        defaults(result, ajaxDefaults);

        //console.log('Created ajax spec: ' + JSON.stringify(result));
        return result;
    }
};

module.exports = AjaxUtils;

},{"lodash.defaults":358}],118:[function(require,module,exports){
var Class = require('../ext/Class');
var ExprUtils = require('../sparql/ExprUtils');
// var ElementFilter = require('../sparql/element/element-filter');

var BindingLookup = Class.create({
    initialize: function(sparqlService, element) { // , joinExprs) {
        this.sparqlService = sparqlService;
        this.element = element;
    },

    lookupByIterator: function(itBindings) {

        // Each binding (in order) maps to the join expr,
        // Each join expr maps to its corresponding set of bindings
        // MapList<Binding, MapList<Expr

        var bindingToExprs = [];

        while (itBindings.hasNext()) {
            var binding = itBindings.nextBinding();

            var exprs = ExprUtils.bindingToExprs(binding);
            var exprsKey = exprs.join(', ');

            bindingToExprs.push({
                binding: binding,
                exprs: exprs,
                exprsKey: exprsKey
            });
        }

        // FIXME: expr not defined
        // var elementFilter = new ElementFilter(expr);

        // var subQuery = this.query.clone();
        // subQuery.getElements().push(elementFilter);

        // TODO: Add columns for variables in B
        // var rsB = this.sparqlService.execSelect(subQuery);
    }
});

module.exports = BindingLookup;

},{"../ext/Class":2,"../sparql/ExprUtils":211}],119:[function(require,module,exports){
var Class = require('../ext/Class');

var ListFilter = Class.create({
    initialize: function(concept, limit, offset) {
        this.concept = concept;
        this.limit = limit;
        this.offset = offset;
    },

    getConcept: function() {
        return this.concept;
    },

    setConcept: function(concept) {
        this.concept = concept;
    },

    getLimit: function() {
        return this.limit;
    },

    setLimit: function(limit) {
        this.limit = limit;
    },

    getOffset: function() {
        return this.offset;
    },

    setOffset: function(offset) {
        this.offset = offset;
    },
});

module.exports = ListFilter;

},{"../ext/Class":2}],120:[function(require,module,exports){
var HashMap = require('../util/collection/HashMap');
var shared = require('../util/shared');
var Promise = shared.Promise;

//var LookupServiceSparqlQuery = require('./lookup_service/LookupServiceSparqlQuery'); 

var LookupServiceUtils = {
    /**
     * Yields a promise resolving to an empty array if lookupService or keys are null
     *
     */
    lookup: function(lookupService, keys) {
        var result;

        if (!lookupService || !keys) {
            result = Promise.resolve([]);
        } else {
            result = lookupService.lookup(keys);
        }

        return result;
    },

    /**
     * Create a new promise from a list of keys and corresponding
     * valuePromises
     */
    zip: function(keys, valuePromises) {
        var result = Promise.all(valuePromises).then(function() {
            var r = new HashMap();

            for (var i = 0; i < keys.length; ++i) {
                var bounds = keys[i];
                var docs = arguments[i];

                r.put(bounds, docs);
            }

            return r;
        });

        return result;
    },

    unmapKeys: function(keys, fn, map) {
        var result = new HashMap();

        keys.forEach(function(key) {
            var k = fn(key);

            var v = map.get(k);
            result.put(key, v);
        });

        return result;
    },

    /**
     * Performs a lookup by mapping the keys first
     */
    fetchItemsMapped: function(lookupService, keys, fn) {
        var ks = keys.map(fn);

        var result = lookupService.fetchItems(ks).then(function(map) {
            var r = LookupServiceUtils.unmapKeys(keys, fn, map);
            return r;
        });

        return result;
    },

    fetchCountsMapped: function(lookupService, keys, fn) {
        var ks = keys.map(fn);

        var result = lookupService.fetchCounts(ks).then(function(map) {
            var r = LookupServiceUtils.unmapKeys(keys, fn, map);
            return r;
        });

        return result;
    },


//    createLookupServiceConcept: function(sparqlService, concept) {
//        var v = concept.getVar();
//        var query = ConceptUtils.createQueryList(query);
//        var result = new LookupServiceSparqlQuery(sparqlService, query, v);
//        return result;
//    }
};

module.exports = LookupServiceUtils;

},{"../util/collection/HashMap":343,"../util/shared":351}],121:[function(require,module,exports){
/**
 * Returns an object:
 * {
 *    limit:
 *    offset:
 *    subLimit:
 *    subOffset:
 * }
 *
 */
var PageExpandUtils = {
    computeRange: function(limit, offset, pageSize) {
        // Example: If pageSize=100 and offset = 130, then we will adjust the offset to 100, and use a subOffset of 30  
        var o = offset || 0;
        var subOffset = o % pageSize;
        o -= subOffset;
        // Adjust the limit to a page boundary; the original limit becomes the subLimit
        // And we will extend the new limit to the page boundary again.
        // Example: If pageSize=100 and limit = 130, then we adjust the new limit to 200
        var l = limit;
        var subLimit;
        if(l) {
            subLimit = l;

            var tmp = l % pageSize;
            l += pageSize - tmp;
        }

        var result = {
            limit: l,
            offset: o,
            subLimit: subLimit,
            subOffset:subOffset
        };

        return result;
    }
};

module.exports = PageExpandUtils;

},{}],122:[function(require,module,exports){
var Class = require('../ext/Class');
/**
 * Takes a query and upon calling 'next' updates its limit and offset values accordingly
 *
 */
var QueryPaginator = Class.create({
    initialize: function(query, pageSize) {
        this.query = query;

        var queryOffset = query.getOffset();
        var queryLimit = query.getLimit();

        this.nextOffset = queryOffset || 0;
        this.nextRemaining = queryLimit == null ? null : queryLimit;

        this.pageSize = pageSize;
    },

    getPageSize: function() {
        return this.pageSize;
    },

    // Returns the next limit and offset
    next: function() {
        var offset = this.nextOffset === 0 ? null : this.nextOffset;
        this.query.setOffset(offset);

        if (this.nextRemaining == null) {
            this.query.setLimit(this.pageSize);
            this.nextOffset += this.pageSize;
        } else {
            var limit = Math.min(this.pageSize, this.nextRemaining);
            this.nextOffset += limit;
            this.nextRemaining -= limit;

            if (limit === 0) {
                return null;
            }

            this.query.setLimit(limit);
        }

        return this.query;
    },
});

module.exports = QueryPaginator;

},{"../ext/Class":2}],123:[function(require,module,exports){
var Class = require('../ext/Class');
var CacheSimple = require('./cache/CacheSimple');

var RequestCache = Class.create({
    initialize: function(executionCache, resultCache) {
        this.executionCache = executionCache ? executionCache : {};
        this.resultCache = resultCache ? resultCache : new CacheSimple();
    },

    getExecutionCache: function() {
        return this.executionCache;
    },

    getResultCache: function() {
        return this.resultCache;
    },

});

module.exports = RequestCache;

},{"../ext/Class":2,"./cache/CacheSimple":130}],124:[function(require,module,exports){
var Class = require('../ext/Class');

var ResultSetPart = Class.create({
    initialize: function(varNames, bindings) {
        this.varNames = varNames || [];
        this.bindings = bindings || [];
    },

    getVarNames: function() {
        return this.varNames;
    },

    getBindings: function() {
        return this.bindings;
    },

    toString: function() {
        return 'ResultSetPart: vars=' + this.varNames + ', bindings=' + this.bindings;
    },

});

module.exports = ResultSetPart;

},{"../ext/Class":2}],125:[function(require,module,exports){
var HashMap = require('../util/collection/HashMap');
var IteratorArray = require('../util/collection/IteratorArray');
var VarUtils = require('../sparql/VarUtils');
var ResultSetArrayIteratorBinding = require('./result_set/ResultSetArrayIteratorBinding');
var ResultSetPart = require('./ResultSetPart');
var Binding = require('../sparql/Binding');

var ResultSetUtils = {

    jsonToResultSet: function(json) {

        // TODO We should check whether the json is really json, but maybe not necessarily in this method
        //console.log('Building result set from ', json);

        var varNames = json.head.vars;
        var bindings = json.results.bindings;

        var tmp = bindings.map(function(b) {
            var bindingObj = Binding.fromTalisJson(b);
            return bindingObj;
        });

        var itBinding = new IteratorArray(tmp);

        var result = new ResultSetArrayIteratorBinding(itBinding, varNames);
        return result;
    },

    partition: function(rs, v) {
        var varNames = rs.getVarNames();
        //var result = {};
        var result = new HashMap();

        while(rs.hasNext()) {
            var binding = rs.next();
            var val = binding.get(v);

            var rsp = result.get(val);
            if(rsp == null) {
                rsp = new ResultSetPart(varNames);
                result.put(val, rsp);
            }

            rsp.getBindings().push(binding);
        }

        return result;
    },

    createResultSetFromBindings: function(bindings, varNames) {
        var it = new IteratorArray(bindings);
        var result = new ResultSetArrayIteratorBinding(it, varNames);

        return result;
    },

    createEmptyResultSet: function(query) {
        var vars = query.getProjectVars();
        var varNames = VarUtils.getVarNames(vars);

        var result = this.createResultSetFromBindings([], varNames);
        return result;
    }
};

module.exports = ResultSetUtils;
},{"../sparql/Binding":200,"../sparql/VarUtils":227,"../util/collection/HashMap":343,"../util/collection/IteratorArray":347,"./ResultSetPart":124,"./result_set/ResultSetArrayIteratorBinding":177}],126:[function(require,module,exports){
var union = require('lodash.union');
var shared = require('../util/shared');
var Promise = shared.Promise;

var ResultSetArrayIteratorBinding = require('./result_set/ResultSetArrayIteratorBinding');

var ArrayUtils = require('../util/ArrayUtils');
var IteratorArray = require('../util/collection/IteratorArray');

var ExprVar = require('../sparql/expr/ExprVar');
var ElementFilter = require('../sparql/element/ElementFilter');
var E_OneOf = require('../sparql/expr/E_OneOf');
var ElementSubQuery = require('../sparql/element/ElementSubQuery');
var VarUtils = require('../sparql/VarUtils');
var Binding = require('../sparql/Binding');

var ConceptUtils = require('../sparql/ConceptUtils');
var ElementUtils = require('../sparql/ElementUtils');
var QueryUtils = require('../sparql/QueryUtils');

var ServiceUtils = {

    // FIXME constrainQueryVar, constrainQueryExprVar, chunkQuery should go to a different place, such as sparql.QueryUtils
    constrainQueryVar: function(query, v, nodes) {
        var exprVar = new ExprVar(v);
        var result = this.constrainQueryExprVar(query, exprVar, nodes);
        return result;
    },

    constrainQueryExprVar: function(query, exprVar, nodes) {
        var result = query.clone();
        var e = new ElementFilter(new E_OneOf(exprVar, nodes));
        result.getElements().push(e);

        return result;
    },

    /**
     * Returns an array of queries where the variable v has been constraint to elements in nodes.
     */
    chunkQuery: function(query, v, nodes, maxChunkSize) {
        var chunks = ArrayUtils.chunk(nodes, maxChunkSize);
        var exprVar = new ExprVar(v);

        var self = this;
        var result = chunks.map(function() { // chunk) {
            var r = self.constrainQueryExprVar(query, exprVar, nodes);
            return r;
        });

        return result;
    },

    mergeResultSets: function(arrayOfResultSets) {
        var bindings = [];
        var varNames = [];
        arrayOfResultSets.forEach(function(rs) {
            var vns = rs.getVarNames();
            varNames = union(varNames, vns);

            var arr = rs.getIterator().getArray();
            bindings.push.apply(bindings, arr);
        });

        var itBinding = new IteratorArray(bindings);
        var result = new ResultSetArrayIteratorBinding(itBinding, varNames);

        return result;
    },

    execSelectForNodes: function(sparqlService, query, v, nodes, maxChunkSize) {
        var queries = this.chunkQuery(query, v, nodes, maxChunkSize);

        var promises = queries.map(function(query) {
            var qe = sparqlService.createQueryExecution(query);
            var r = qe.execSelect();
            return r;
        });

        var masterTask = Promise.all(promises);

        var self = this;
        var result = masterTask.then(function( /* arguments will be result sets */ ) {
            var r = self.mergeResultSets(arguments);
            return r;
        });

        return result;
    },

    /**
     * TODO Rather use .close()
     *
     * @param {Object} rs
     * @returns
     */
    consumeResultSet: function(rs) {
        while (rs.hasNext()) {
            rs.nextBinding();
        }
    },

    resultSetToList: function(rs, variable) {
        var result = [];
        while (rs.hasNext()) {
            var binding = rs.nextBinding();

            var node = binding.get(variable);
            result.push(node);
        }
        return result;
    },

    // TODO: If there is only one variable in the rs, use it.
    resultSetToInt: function(rs, variable) {
        var result = null;

        if (rs.hasNext()) {
            var binding = rs.nextBinding();

            var node = binding.get(variable);

            // TODO Validate that the result actually is int.
            result = node.getLiteralValue();
        }

        return result;
    },

    fetchList: function(queryExecution, variable) {
        var self = this;
        var result = queryExecution.execSelect().then(function(rs) {
            var r = self.resultSetToList(rs, variable);
            return r;
        });

        return result;
    },

    fetchInt: function(sparqlService, query, v) {
        var qe = sparqlService.createQueryExecution(query);
        var result = this.fetchIntQe(qe, v);
        return result;
    },

    /**
     * Fetches the first column of the first row of a result set and parses it as int.
     *
     */
    fetchIntQe: function(queryExecution, variable) {
        var self = this;
        var result = queryExecution.execSelect().then(function(rs) {
            var r = self.resultSetToInt(rs, variable);
            return r;
        });

        return result;
    },

    // NOTE: If there is a rowLimit, we can't determine whether there are more items or not
    fetchCountConcept: Promise.method(function(sparqlService, concept, itemLimit, rowLimit) {

        var outputVar = ConceptUtils.freshVar(concept);

        var xitemLimit = itemLimit == null ? null : itemLimit + 1;
        var xrowLimit = rowLimit == null ? null : rowLimit + 1;

        var countQuery = ConceptUtils.createQueryCount(concept, outputVar, xitemLimit, xrowLimit);

        //var qe = sparqlService.createQueryExecution(countQuery);

        return ServiceUtils
            .fetchInt(sparqlService, countQuery, outputVar)
            .then(function(count) {
                var hasMoreItems = rowLimit != null
                    ? null
                    : (itemLimit != null ? count > itemLimit : false)
                    ;

                var r = {
                    hasMoreItems: hasMoreItems,
                    count: hasMoreItems ? itemLimit : count,
                    itemLimit: itemLimit,
                    rowLimit: rowLimit
                };

                return r;
            });
    }),

    fetchCountRows: function(sparqlService, element, rowLimit) {
        var v = ElementUtils.freshVar(element, 'c');
        var query = ElementUtils.createQueryCountRows(element, v, rowLimit + 1);
        var result = this.fetchInt(sparqlService, query, v).then(function(count) {
            var r = {
                count: Math.min(count, rowLimit),
                hasMoreItems: count > rowLimit,
                rowLimit: rowLimit
            };

            return r;
        });

        return result;
    },


    /**
     * Count the results of a query, whith fallback on timeouts
     *
     * Attempt to count the full result set based on firstTimeoutInMs
     *
     * if this fails, repeat the count attempt using the scanLimit
     *
     * TODO Finish
     */
    fetchCountQuery: Promise.method(function(sparqlService, query, firstTimeoutInMs, limit) {

        var elements = [
            new ElementSubQuery(query),
        ];

        var varsMentioned = query.getVarsMentioned();

        var varGen = VarUtils.createVarGen('c', varsMentioned);

        var outputVar = varGen.next();
        // var outputVar = rdf.NodeFactory.createVar('_cnt_');

        // createQueryCount(elements, limit, variable, outputVar, groupVars, useDistinct, options)
        var countQuery = QueryUtils.createQueryCount(elements, null, null, outputVar, null, null, null);

        var qe = sparqlService.createQueryExecution(countQuery);
        qe.setTimeout(firstTimeoutInMs);

        return ServiceUtils.fetchIntQe(qe, outputVar)
            .then(function(count) {
                return {
                    count: count,
                    limit: null,
                    hasMoreItems: false,
                };
            })
            //.catch // Prevent the eclipse default js parser to complain about this
            // https://github.com/petkaantonov/bluebird/blob/master/API.md -> For compatibility with earlier ECMAScript version, an alias .caught() is provided for .catch().
            .caught
            (function() {
                // Try counting with the fallback size
                var countQuery = QueryUtils.createQueryCount(elements, limit + 1, null, outputVar, null, null, null);
                var qe = sparqlService.createQueryExecution(countQuery);
                return ServiceUtils.fetchIntQe(qe, outputVar)
                    .then(function(count) {
                        return {
                            count: count,
                            limit: limit,
                            hasMoreItems: count > limit,
                        };
                    });
            });
    }),

    // ns.globalSparqlCacheQueue = [];

    fetchItemsConcept: function(sparqlService, concept, limit, offset) {
        var query = ConceptUtils.createQueryList(concept, limit, offset);
        var qe = sparqlService.createQueryExecution(query);

        var result = qe.execSelect().then(function(rs) {
            var r = ServiceUtils.resultSetToList(rs, concept.getVar());
            return r;
        });

        return result;
    },
};

module.exports = ServiceUtils;

},{"../sparql/Binding":200,"../sparql/ConceptUtils":204,"../sparql/ElementUtils":207,"../sparql/QueryUtils":220,"../sparql/VarUtils":227,"../sparql/element/ElementFilter":232,"../sparql/element/ElementSubQuery":236,"../sparql/expr/E_OneOf":257,"../sparql/expr/ExprVar":269,"../util/ArrayUtils":327,"../util/collection/IteratorArray":347,"../util/shared":351,"./result_set/ResultSetArrayIteratorBinding":177,"lodash.union":560}],127:[function(require,module,exports){
var Class = require('../ext/Class');


var SparqlServiceHttp = require('./sparql_service/SparqlServiceHttp');
var SparqlServicePaginate = require('./sparql_service/SparqlServicePaginate');
var SparqlServicePageExpand = require('./sparql_service/SparqlServicePageExpand');
var SparqlServiceCache = require('./sparql_service/SparqlServiceCache');
var SparqlServiceVirtFix = require('./sparql_service/SparqlServiceVirtFix');
var SparqlServiceLimit = require('./sparql_service/SparqlServiceLimit');


var SparqlServiceBuilder = Class.create({
    initialize: function(sparqlService) {
        this.sparqlService = sparqlService;
    },

    create: function() {
        return this.sparqlService;
    },

    paginate: function(pageSize) {
        this.sparqlService = new SparqlServicePaginate(this.sparqlService, pageSize);
        return this;
    },

    pageExpand: function(pageSize) {
        this.sparqlService = new SparqlServicePageExpand(this.sparqlService, pageSize);
        return this;
    },

    cache: function(requestCache) {
        this.sparqlService = new SparqlServiceCache(this.sparqlService, requestCache);
        return this;
    },

    virtFix: function() {
        this.sparqlService = new SparqlServiceVirtFix(this.sparqlService);
        return this;
    },

    limit: function(limit) {
        this.sparqlService = new SparqlServiceLimit(this.sparqlService, limit);
        return this;
    },


//    delay: function() {
//        // does not exist yet
//    },
//    failover: function() {
//
//    },

});

// var sparqlService = SparqlServiceBuilder.http().limit(100000).virtFix().cache().paginate(1000).pageExpand(100).create();
SparqlServiceBuilder.http = function(serviceUri, defaultGraphUris, ajaxOptions, httpArgs) {
    var sparqlService = new SparqlServiceHttp(serviceUri, defaultGraphUris, ajaxOptions, httpArgs);
    var result = new SparqlServiceBuilder(sparqlService);
    return result;
};

module.exports = SparqlServiceBuilder;

},{"../ext/Class":2,"./sparql_service/SparqlServiceCache":181,"./sparql_service/SparqlServiceHttp":187,"./sparql_service/SparqlServiceLimit":188,"./sparql_service/SparqlServicePageExpand":189,"./sparql_service/SparqlServicePaginate":190,"./sparql_service/SparqlServiceVirtFix":192}],128:[function(require,module,exports){
var uniq = require('lodash.uniq');
var VarUtils = require('../sparql/VarUtils');
var ServiceUtils = require('./ServiceUtils');
var IteratorArray = require('../util/collection/IteratorArray');
var ResultSetArrayIteratorBinding = require('./result_set/ResultSetArrayIteratorBinding');
var shared = require('../util/shared');
var Promise = shared.Promise;

var TableServiceUtils = {
    bindingToJsMap: function(varList, binding) {
        var result = {};

        varList.forEach(function(v) {
            var varName = v.getName();
            // result[varName] = '' + binding.get(v);
            result[varName] = binding.get(v);
        });

        return result;
    },

    createNgGridOptionsFromQuery: function(query) {
        if (!query) {
            return [];
        }

        var projectVarList = query.getProjectVars(); // query.getProjectVars().getVarList();
        var projectVarNameList = VarUtils.getVarNames(projectVarList);

        var result = projectVarNameList.map(function(varName) {
            var col = {
                field: varName,
                displayName: varName,
            };

            return col;
        });

        return result;
    },

    fetchCount: function(sparqlService, query, timeoutInMillis, secondaryCountLimit) {
        var result;
        if (!sparqlService || !query) {
            result = new Promise(function(resolve) {
                resolve(0);
            });
        } else {
            query = query.clone();

            query.setLimit(null);
            query.setOffset(null);

            result = ServiceUtils.fetchCountQuery(sparqlService, query, timeoutInMillis, secondaryCountLimit);
        }

        return result;
    },

    fetchData: function(sparqlService, query, limit, offset) {
        if (!sparqlService || !query) {
            var itBinding = new IteratorArray([]);
            var varNames = [];
            var rs = new ResultSetArrayIteratorBinding(itBinding, varNames);

            return new Promise(function(resolve) {
                resolve(rs);
            });
        }

        // Clone the query as to not modify the original object
        query = query.clone();

        query.setLimit(limit);
        query.setOffset(offset);

        var qe = sparqlService.createQueryExecution(query);

        var result = qe.execSelect().then(function(rs) {
            var data = [];

            var projectVarList = query.getProjectVars(); // query.getProjectVars().getVarList();

            while (rs.hasNext()) {
                var binding = rs.next();

                var o = TableServiceUtils.bindingToJsMap(projectVarList, binding);

                data.push(o);
            }

            return data;
        });

        return result;
    },

    collectNodes: function(rows) {
        // Collect nodes
        var result = [];
        rows.forEach(function(item) {
            item.forEach(function(node) {
                result.push(node);
            });
        });

        result = uniq(result, false, function(x) {
            return x.toString();
        });

        return result;
    },

    fetchSchemaTableConfigFacet: function(tableConfigFacet, lookupServicePathLabels) {
        var paths = tableConfigFacet.getPaths().getArray();

        // We need to fetch the column headings
        var promise = lookupServicePathLabels.lookup(paths);

        var result = promise.then(function(map) {

            var colDefs = paths.map(function(path) {
                var r = {
                    field: tableConfigFacet.getColumnId(path),
                    displayName: map.get(path),
                    path: path,
                };
                return r;
            });

            var r = {
                colDefs: colDefs,
            };

            return r;
        });

        return result;
    },

    // rows is expected to be a List<Map<String, Node>>
    transformToNodeLabels: function(lookupServiceNodeLabels, rows) {

        var nodes = this.collectNodes(rows);

        // Get the node labels
        var p = lookupServiceNodeLabels.lookup(nodes);

        // Transform every node
        var result = p.then(function(nodeToLabel) {
            var r = rows.map(function(row) {
                var r = {};
                row.forEach(function(node, key) {
                    var label = nodeToLabel.get(node);
                    r[key] = {
                        node: node,
                        displayLabel: label,
                    };
                });
                return r;
            });
            return r;
        });

        return result;
    },
};

module.exports = TableServiceUtils;

},{"../sparql/VarUtils":227,"../util/collection/IteratorArray":347,"../util/shared":351,"./ServiceUtils":126,"./result_set/ResultSetArrayIteratorBinding":177,"lodash.uniq":583}],129:[function(require,module,exports){
var Class = require('../../ext/Class');

var Cache = Class.create({
    getItem: function(key) {
        throw new Error('not implemented');
    },

    setItem: function(key, val) {
        throw new Error('not implemented');
    },

});

module.exports = Cache;

},{"../../ext/Class":2}],130:[function(require,module,exports){
var Class = require('../../ext/Class');
var Cache = require('./Cache');

/**
 * A simple cache that never forgets
 */
var CacheSimple = Class.create(Cache, {
    initialize: function(data) {
        this.data = data || {};
    },

    getItem: function(key) {
        var result = this.data[key];
        return result;
    },

    setItem: function(key, val) {
        this.data[key] = val;
    },

});

module.exports = CacheSimple;

},{"../../ext/Class":2,"./Cache":129}],131:[function(require,module,exports){
var Class = require('../../ext/Class');

var Criteria = Class.create({
    initialize: function(v) {
        this.v = v;
        this.orders = [];
        this.restrictions = [];
        this.subCriteria = [];
    },

    createCriteria: function(property, alias, joinType) {
        var result = new Criteria();

        this.subCriteria.push({
            property: property,

        });
    },

    add: function(criterion) {

    },

    getVar: function() {
        return this.v;
    },

    addOrder: function(order) {
        this.orders.push(order);
    },

    toSparqlString: function() {

    },

    createListService: function() {

    },
});

module.exports = Criteria;

},{"../../ext/Class":2}],132:[function(require,module,exports){
var Class = require('../../ext/Class');

var Order = Class.create({
    initialize: function(property, _isAscending) {
        this.property = property;
        this._isAscending = _isAscending;
    },

    isAscending: function() {
        return this._isAscending;
    }
});

module.exports = Order;

},{"../../ext/Class":2}],133:[function(require,module,exports){

var Restrictions = {
    // obj can be: a rdf.Node
    gt: function(property, obj) {

    }

};

module.exports = Restrictions;

},{}],134:[function(require,module,exports){
var Class = require('../../ext/Class');

var ServiceBuilder = Class.create({
    initialize: function(sparqlService) {

    },


});


module.exports = ServiceBuilder;

},{"../../ext/Class":2}],135:[function(require,module,exports){
var Class = require('../../ext/Class');

/**
 * A data service only provides a single method for retrieving data based on some 'key' (thing)
 * The key can be an arbitrary object that identifies a collection (e.g. a tag), a sparql concept, etc...
 */
var DataService = Class.create({
    fetchData: function() { // thing) {
        throw new Error('Not implemented');
    },

});

module.exports = DataService;

},{"../../ext/Class":2}],136:[function(require,module,exports){
'use strict';

var ns = {
    AjaxUtils: require('./AjaxUtils'),
    BindingLookup: require('./BindingLookup'),
    LookupServiceUtils: require('./LookupServiceUtils'),
    PageExpandUtils: require('./PageExpandUtils'),
    QueryPaginator: require('./QueryPaginator'),
    RequestCache: require('./RequestCache'),
    ResultSetPart: require('./ResultSetPart'),
    ResultSetUtils: require('./ResultSetUtils'),
    ServiceUtils: require('./ServiceUtils'),
    SparqlServiceBuilder: require('./SparqlServiceBuilder'),
    TableServiceUtils: require('./TableServiceUtils'),
    Cache: require('./cache/Cache'),
    CacheSimple: require('./cache/CacheSimple'),
    Criteria: require('./criteria/Criteria'),
    Order: require('./criteria/Order'),
    Restrictions: require('./criteria/Restrictions'),
    ServiceBuilder: require('./criteria/ServiceBuilder'),
    DataService: require('./data_service/DataService'),
    AugmenterLookup: require('./list_service/AugmenterLookup'),
    ListService: require('./list_service/ListService'),
    ListServiceArray: require('./list_service/ListServiceArray'),
    ListServiceAugmenter: require('./list_service/ListServiceAugmenter'),
    ListServiceConcept: require('./list_service/ListServiceConcept'),
    ListServiceConceptKeyLookup: require('./list_service/ListServiceConceptKeyLookup'),
    ListServiceFn: require('./list_service/ListServiceFn'),
    ListServiceIndexSubString: require('./list_service/ListServiceIndexSubString'),
    ListServicePageExpand: require('./list_service/ListServicePageExpand'),
    ListServiceSparqlQuery: require('./list_service/ListServiceSparqlQuery'),
    ListServiceTransformConcept: require('./list_service/ListServiceTransformConcept'),
    ListServiceTransformConceptMode: require('./list_service/ListServiceTransformConceptMode'),
    ListServiceTransformItem: require('./list_service/ListServiceTransformItem'),
    ListServiceTransformItems: require('./list_service/ListServiceTransformItems'),
    LookupService: require('./lookup_service/LookupService'),
    LookupServiceBase: require('./lookup_service/LookupServiceBase'),
    LookupServiceCache: require('./lookup_service/LookupServiceCache'),
    LookupServiceChunker: require('./lookup_service/LookupServiceChunker'),
    LookupServiceConst: require('./lookup_service/LookupServiceConst'),
    LookupServiceDelegateBase: require('./lookup_service/LookupServiceDelegateBase'),
    LookupServiceFn: require('./lookup_service/LookupServiceFn'),
    LookupServiceIdFilter: require('./lookup_service/LookupServiceIdFilter'),
    LookupServiceKeyMap: require('./lookup_service/LookupServiceKeyMap'),
    LookupServiceMap: require('./lookup_service/LookupServiceMap'),
    LookupServiceMulti: require('./lookup_service/LookupServiceMulti'),
    LookupServiceSparqlQuery: require('./lookup_service/LookupServiceSparqlQuery'),
    LookupServiceTimeout: require('./lookup_service/LookupServiceTimeout'),
    LookupServiceTransform: require('./lookup_service/LookupServiceTransform'),
    LookupServiceTransformKey: require('./lookup_service/LookupServiceTransformKey'),
    QueryCacheBindingHashSingle: require('./query_cache/QueryCacheBindingHashSingle'),
    QueryCacheNodeFactory: require('./query_cache/QueryCacheNodeFactory'),
    QueryCacheNodeFactoryImpl: require('./query_cache/QueryCacheNodeFactoryImpl'),
    QueryExecution: require('./query_execution/QueryExecution'),
    QueryExecutionCache: require('./query_execution/QueryExecutionCache'),
    QueryExecutionDelegate: require('./query_execution/QueryExecutionDelegate'),
    QueryExecutionFailover: require('./query_execution/QueryExecutionFailover'),
    QueryExecutionHttp: require('./query_execution/QueryExecutionHttp'),
    QueryExecutionPageExpand: require('./query_execution/QueryExecutionPageExpand'),
    QueryExecutionPaginate: require('./query_execution/QueryExecutionPaginate'),
    ResultSet: require('./result_set/ResultSet'),
    ResultSetArrayIteratorBinding: require('./result_set/ResultSetArrayIteratorBinding'),
    ResultSetHashJoin: require('./result_set/ResultSetHashJoin'),
    SparqlService: require('./sparql_service/SparqlService'),
    SparqlServiceBaseString: require('./sparql_service/SparqlServiceBaseString'),
    SparqlServiceCache: require('./sparql_service/SparqlServiceCache'),
    SparqlServiceConsoleLog: require('./sparql_service/SparqlServiceConsoleLog'),
    SparqlServiceFactory: require('./sparql_service/SparqlServiceFactory'),
    SparqlServiceFactoryConst: require('./sparql_service/SparqlServiceFactoryConst'),
    SparqlServiceFactoryDefault: require('./sparql_service/SparqlServiceFactoryDefault'),
    SparqlServiceFailover: require('./sparql_service/SparqlServiceFailover'),
    SparqlServiceHttp: require('./sparql_service/SparqlServiceHttp'),
    SparqlServiceLimit: require('./sparql_service/SparqlServiceLimit'),
    SparqlServicePageExpand: require('./sparql_service/SparqlServicePageExpand'),
    SparqlServicePaginate: require('./sparql_service/SparqlServicePaginate'),
    SparqlServiceReliableLimit: require('./sparql_service/SparqlServiceReliableLimit'),
    SparqlServiceVirtFix: require('./sparql_service/SparqlServiceVirtFix'),
    TableService: require('./table_service/TableService'),
    TableServiceDelegateBase: require('./table_service/TableServiceDelegateBase'),
    TableServiceFacet: require('./table_service/TableServiceFacet'),
    TableServiceListService: require('./table_service/TableServiceListService'),
    TableServiceNodeLabels: require('./table_service/TableServiceNodeLabels'),
    TableServiceQuery: require('./table_service/TableServiceQuery'),
};

Object.freeze(ns);

module.exports = ns;

},{"./AjaxUtils":117,"./BindingLookup":118,"./LookupServiceUtils":120,"./PageExpandUtils":121,"./QueryPaginator":122,"./RequestCache":123,"./ResultSetPart":124,"./ResultSetUtils":125,"./ServiceUtils":126,"./SparqlServiceBuilder":127,"./TableServiceUtils":128,"./cache/Cache":129,"./cache/CacheSimple":130,"./criteria/Criteria":131,"./criteria/Order":132,"./criteria/Restrictions":133,"./criteria/ServiceBuilder":134,"./data_service/DataService":135,"./list_service/AugmenterLookup":137,"./list_service/ListService":138,"./list_service/ListServiceArray":139,"./list_service/ListServiceAugmenter":140,"./list_service/ListServiceConcept":141,"./list_service/ListServiceConceptKeyLookup":142,"./list_service/ListServiceFn":143,"./list_service/ListServiceIndexSubString":144,"./list_service/ListServicePageExpand":145,"./list_service/ListServiceSparqlQuery":146,"./list_service/ListServiceTransformConcept":147,"./list_service/ListServiceTransformConceptMode":148,"./list_service/ListServiceTransformItem":149,"./list_service/ListServiceTransformItems":150,"./lookup_service/LookupService":151,"./lookup_service/LookupServiceBase":152,"./lookup_service/LookupServiceCache":153,"./lookup_service/LookupServiceChunker":154,"./lookup_service/LookupServiceConst":155,"./lookup_service/LookupServiceDelegateBase":156,"./lookup_service/LookupServiceFn":157,"./lookup_service/LookupServiceIdFilter":158,"./lookup_service/LookupServiceKeyMap":159,"./lookup_service/LookupServiceMap":160,"./lookup_service/LookupServiceMulti":161,"./lookup_service/LookupServiceSparqlQuery":162,"./lookup_service/LookupServiceTimeout":163,"./lookup_service/LookupServiceTransform":164,"./lookup_service/LookupServiceTransformKey":165,"./query_cache/QueryCacheBindingHashSingle":166,"./query_cache/QueryCacheNodeFactory":167,"./query_cache/QueryCacheNodeFactoryImpl":168,"./query_execution/QueryExecution":169,"./query_execution/QueryExecutionCache":170,"./query_execution/QueryExecutionDelegate":171,"./query_execution/QueryExecutionFailover":172,"./query_execution/QueryExecutionHttp":173,"./query_execution/QueryExecutionPageExpand":174,"./query_execution/QueryExecutionPaginate":175,"./result_set/ResultSet":176,"./result_set/ResultSetArrayIteratorBinding":177,"./result_set/ResultSetHashJoin":178,"./sparql_service/SparqlService":179,"./sparql_service/SparqlServiceBaseString":180,"./sparql_service/SparqlServiceCache":181,"./sparql_service/SparqlServiceConsoleLog":182,"./sparql_service/SparqlServiceFactory":183,"./sparql_service/SparqlServiceFactoryConst":184,"./sparql_service/SparqlServiceFactoryDefault":185,"./sparql_service/SparqlServiceFailover":186,"./sparql_service/SparqlServiceHttp":187,"./sparql_service/SparqlServiceLimit":188,"./sparql_service/SparqlServicePageExpand":189,"./sparql_service/SparqlServicePaginate":190,"./sparql_service/SparqlServiceReliableLimit":191,"./sparql_service/SparqlServiceVirtFix":192,"./table_service/TableService":193,"./table_service/TableServiceDelegateBase":194,"./table_service/TableServiceFacet":195,"./table_service/TableServiceListService":196,"./table_service/TableServiceNodeLabels":197,"./table_service/TableServiceQuery":198}],137:[function(require,module,exports){
var Class = require('../../ext/Class');

var ObjectUtils = require('../../util/ObjectUtils');

var AugmenterLookup = Class.create({
    initialize: function(lookupService, itemToKeyFn, mergeFn) {
        this.lookupService = lookupService;

        this.itemToKeyFn = itemToKeyFn || function(item) {
            return item.key;
        };

        this.mergeFn = mergeFn || function(base, aug) {
            var r = ObjectUtils.extend(base, aug);
            return r;
        };
    },

    augment: function(items) {
        //console.log('GOT ITEMS: ' + JSON.stringify(items));

        var keys = items.map(this.itemToKeyFn);

        var self = this;
        var result = this.lookupService.lookup(keys).then(function(map) {

            for(var i = 0; i < keys.length; ++i) {
                var key = keys[i];
                var item = items[i];

                var val = map.get(key);

                items[i] = self.mergeFn(item, val);
                //items[i] = mergeFn(item, val);
            }

            return items;
        });

        return result;
    }
});

module.exports = AugmenterLookup;

},{"../../ext/Class":2,"../../util/ObjectUtils":332}],138:[function(require,module,exports){
var Class = require('../../ext/Class');

/**
 * A list service supports fetching ranges of items and supports thresholded counting.
 */
var ListService = Class.create({
    fetchItems: function(thing, limit, offset) {
        throw new Error('Not implemented');
    },

    fetchCount: function(thing, itemLimit, rowLimit) {
        throw new Error('Not implemented');
    },
});

module.exports = ListService;

},{"../../ext/Class":2}],139:[function(require,module,exports){
var Class = require('../../ext/Class');
var ServiceUtils = require('../ServiceUtils');
var ListService = require('./ListService');

var shared = require('../../util/shared');
var Promise = shared.Promise;


var ListServiceArray = Class.create(ListService, {
    initialize: function(items, fnFilterSupplier) { // fnOutputTransform
        this.items = items;
        this.fnFilterSupplier = fnFilterSupplier; // A function that must accept a 'concept' and return a corresponding filter function

        // For output transformation use ListServiceTransformItem instead
        //this.fnOutputTransform = fnOutputTransform;
    },

    fetchItems: function(concept, limit, offset) {
        var fnFilter = this.fnFilterSupplier(concept);
        var filtered = this.items.filter(fnFilter);

        var start = offset || 0;
        var end = limit ? start + limit : filtered.length;

        var output = filtered.slice(start, end);

//        if(this.fnOutputTransform) {
//            output = output.map(this.fnOutputTransform);
//        }

        return Promise.resolve(output);
    },

    // Note: rowLimit is ignored
    // Also note, that we could change the semantics such that itemLimit actually refers to the set of
    // actually distinct items in this list in regard to a given comparator.
    // Right now we simply treat items as distinct
    fetchCount: function(concept, itemLimit, rowLimit) {
        var fnFilter = this.fnFilterSupplier(concept);
        var filtered = this.items.filter(fnFilter);

        var l = filtered.length;
        var count = itemLimit != null ? Math.min(l, itemLimit) : l;

        var countInfo = {
            count: count,
            hasMoreItems: count < l
        };

        return Promise.resolve(countInfo);
    },

});

module.exports = ListServiceArray;

},{"../../ext/Class":2,"../../util/shared":351,"../ServiceUtils":126,"./ListService":138}],140:[function(require,module,exports){
var Class = require('../../ext/Class');
var ListService = require('./ListService');


// TODO This class is redundant as it could be covered by ListService TransformItems
// Its just there because it is still referenced by legacy code
var ListServiceAugmenter = Class.create(ListService, {
    initialize: function(listService, augmenter) {
        this.listService = listService;
        this.augmenter = augmenter;
    },

    fetchItems: function(filter, limit, offset) {
        var self = this;
        var result = this.listService.fetchItems(filter, limit, offset).then(function(entries) {
//            var keys = items.map(function(item) {
//                return item.key;
//            });
//console.log('Augmenting with keys: ' + JSON.stringify(keys));
            var r = self.augmenter.augment(entries);
            return r;
        });

        return result;
    },

    fetchCount: function(filter, itemLimit, rowLimit) {
        var result = this.listService.fetchCount(filter, itemLimit, rowLimit);
        return result;
    }
});

module.exports = ListServiceAugmenter;

},{"../../ext/Class":2,"./ListService":138}],141:[function(require,module,exports){
var Class = require('../../ext/Class');
var ServiceUtils = require('../ServiceUtils');
var ListService = require('./ListService');

var ListServiceConcept = Class.create(ListService, {
    initialize: function(sparqlService) {
        this.sparqlService = sparqlService;
    },

    fetchItems: function(concept, limit, offset) {
        var result = ServiceUtils.fetchItemsConcept(this.sparqlService, concept, limit, offset);
        return result;
    },

    fetchCount: function(concept, itemLimit, rowLimit) {
        var result = ServiceUtils.fetchCountConcept(this.sparqlService, concept, itemLimit, rowLimit);
        return result;
    },

});

module.exports = ListServiceConcept;

},{"../../ext/Class":2,"../ServiceUtils":126,"./ListService":138}],142:[function(require,module,exports){
var values = require('lodash.values');

var Class = require('../../ext/Class');
var ListService = require('./ListService');
var ServiceUtils = require('../ServiceUtils');
var shared = require('../../util/shared');
var Promise = shared.Promise;
var ConceptUtils = require('../../sparql/ConceptUtils');

var ObjectUtils = require('../../util/ObjectUtils');


/**
 * Uses the keys returned by a listService for a given concept
 * to make requests to a lookupService.
 *
 */
var ListServiceConceptKeyLookup = Class.create(ListService, {
    /**
     *
     * @param keyFn Function to extract the keys from the items returned by the list service
     * @param resolveFn Function to control how to combine data returned from the list service and that returned from the lookup service
     */
    initialize: function(keyListService, keyLookupService, keyFn, resolveFn, isLeftJoin) {
        this.keyListService = keyListService;
        this.keyLookupService = keyLookupService;
        this.keyFn = keyFn || function(item) { return item; };
        this.resolveFn = function(entry, lookup) { ObjectUtils.extend(entry.val || entry, lookup); return entry; };
        this.isLeftJoin = isLeftJoin == null ? true : isLeftJoin;
    },

    fetchItems: function(concept, limit, offset) {
        var self = this;

        var result = Promise
            .resolve(this.keyListService.fetchItems(concept, limit, offset))
            .then(function(items) {
                var keys = items.map(self.keyFn);
                return [items, self.keyLookupService.lookup(keys)];
             }).spread(function(items, map) {
                var r = items.map(function(item) {
                    var key = self.keyFn(item);
                    var lookup = map.get(key);

                    var s = self.resolveFn(item, lookup);
                    return s;
                });

                // console.log('argh' + JSON.stringify(r));
                // var r = map.entries();
                return r;
             });

        return result;
    },

    fetchCount: Promise.method(function(concept, itemLimit, rowLimit) {
        var result;
        if (this.isLeftJoin) {
            result = this.keyListService.fetchCount(concept, itemLimit, rowLimit);
        } else {
            var self = this;

            result = this.keyListService.fetchItems(concept, itemLimit)
                .then(function(items) {
                    var keys = items.map(self.keyFn);

                    return self.keyLookupService.lookup(keys);
                }).then(function(map) {
                    var keyList = map.keys();
                    var count = keyList.length;

                    var r = {
                        count: count,
                        hasMoreItems: itemLimit == null ? false : null // absence of a value indicates 'unknown'
                    };

                    return r;
                });
        }

        return result;
    }),

});

module.exports = ListServiceConceptKeyLookup;

},{"../../ext/Class":2,"../../sparql/ConceptUtils":204,"../../util/ObjectUtils":332,"../../util/shared":351,"../ServiceUtils":126,"./ListService":138,"lodash.values":638}],143:[function(require,module,exports){
var Class = require('../../ext/Class');
var ListService = require('./ListService');

var ListServiceFn = Class.create(ListService, {
    initialize: function(listServiceFn) {
        this.listServiceFn = listServiceFn;
    },

    fetchItems: function(filter, limit, offset) {
        var listService = this.listServiceFn();
        var result = listService.fetchItems(filter, limit, offset);
        return result;
    },

    fetchCount: function(filter, itemLimit, rowLimit) {
        var listService = this.listServiceFn();
        var result = listService.fetchCount(filter, itemLimit, rowLimit);
        return result;
    }
});

module.exports = ListServiceFn;

},{"../../ext/Class":2,"./ListService":138}],144:[function(require,module,exports){
var Class = require('../../ext/Class');
var PageExpandUtils = require('../PageExpandUtils');
var ListService = require('./ListService');

// TODO str could subsume already existing entries
// So after doing a lookup, we could delete all subsumed items
// We can even cancel running promises!

// TODO We need to deal with promises:
// If for a given search string there already exists a promise for the exact same string
// we can just 'connect' to the running promise
// If there is none, we just start a new request
// If however our str is a substring of a running promise's search string,
// we can either connect or create a new request -> support both options

// There is too much data to fetch all at once
// We should we do?

// For new we could just use the limit/offset that was provided
// but actually we would like to limit the search with a rowLimit
// in regard to 'unreliable' filters (i.e. limiting the set of rows
// before regex and other filter which are hardly indexed)
// But this transformation could be done on the SparqlService level.
// well, or anytime-timeout


var ListServiceIndexSubString = Class.create(ListService, {
    initialize: function(delegate, filterSupplierFn, countThreshold, itemLimit, rowLimit) {
        this.delegate = delegate;

        this.filterSupplierFn = filterSupplierFn;
        this.countThreshold = countThreshold || 1000;
        this.itemLimit = itemLimit;
        this.rowLimit = rowLimit;

        this.strToPromise = {};

        // Mapping from substring to the candidates
        // TODO: Add support the 'empty' word (i.e. null)
        // promise can be: a promise for running requests, an array for cached results,
        //this.strToItems = [];
    },

    getBestCandKey: function(str) {        // Check if any of the strToItem arrays matches
        str = str || '';
        var keys = Object.keys(this.strToPromise);

        var self = this;

        var cands = keys.filter(function(key) {
            var isCand = str.indexOf(key) !== -1;
            return isCand;
        });

        // Get the candidate having the least items or a running promise
        var bestCandKey = null;
        var bestCandSize = null;
        cands.forEach(function(cand) {

            var promise = self.strToPromise[cand];
            if(promise.isFulfilled()) {
                var v = promise.value();
                var n = v ? v.length : null;
                if(n != null && (bestCandSize == null || n < bestCandSize)) {
                    bestCandKey = cand;
                    bestCandSize = n;
                }
            } else { // Rejected or pending
                // Connect to the promise unless we already have a candidate with explicit items
                // or our key is more specific than a prior candidate key
                // E.g. we search for abc, and we find promises for a and ab, then we take ab
                // If we query for abc and there is both ab and bc ->
                if(bestCandSize == null && str.indexOf(bestCandKey) !== -1) {
                    bestCandKey = str;
                }
            }
        });

        return bestCandKey;
    },

    filterEntries: function(str, entries) {
        var filterFn = this.filterSupplierFn(str);
        var result = entries.filter(filterFn);
        return result;
    },

    fetchItems: function(str, limit, offset) {
        var self = this;
        var globalPromise = this.strToPromise[''];

        if(globalPromise == null || globalPromise.isRejected()) {
            globalPromise = this.fetchItemsForStr(null);
        }

        var result =
            globalPromise
            .then(function(entries) {
                var r = entries || (str != null && self.fetchItemsForStr(str));
                return r;
            }).then(function(entries) {

              var start = offset || 0;
              var end = start + (limit || entries.length);

                var r = entries
                    ? self.filterEntries(str, entries).slice(start, end)
                    : self.delegate.fetchItems(str, limit, offset)
                    ;

                return r;
            });

        return result;
    },

    /*
    fetchItemsForGlobal: function() {
        var self = this;

        var result =
            this.delegate.fetchCount(null, this.itemLimit, this.rowLimit)
            .then(function(countInfo) {
                var r = countInfo.hasMoreItems === false
                    ? self.delegate.fetchItems()
                    : null
                    ;
                return r;
            });
        return result;
    },
    */


    fetchItemsForStr: function(str) {
        var bestCandKey = this.getBestCandKey(str);

        var result = bestCandKey != null
            ? this.strToPromise[bestCandKey]
            : result = this.fetchForStr(str)
            ;

        return result;
    },

    removeSubsumedStrs: function(str) {
        var self = this;
        // Remove any subsumed entries and kill promises
        var keys = Object.keys(this.strToPromise);
        keys.forEach(function(key) {
            if(str !== key && key.indexOf(str) !== -1) {
// var promise = self.strToPromise[key];
// TODO If we cancelled the existing promise, we should transparently switch to our new one!
// if(promise.isCancellable()) {
//                    promise.cancel();
//                }
                delete self.strToPromise[key];
            }
        });

    },

    fetchForStr: function(str) {
        var self = this;

        if(str === '') {
            str = null;
        }

        // We can try a global count first, and then decide whether we
        // have to go
        var result = this.delegate.fetchCount(str, this.itemLimit, this.rowLimit).then(function(countInfo) {

            var r = null;
            // Check if the count is below the threshold
            if(countInfo.hasMoreItems === false && countInfo.count < self.countThreshold) {
                // Fetch items for indexing
                r = self.delegate.fetchItems(str).then(function(entries) {
                    self.removeSubsumedStrs(str);
                    return entries;
                });

            }

            return r;
        });


        var key = str || '';
        this.strToPromise[key] = result;

        return result;
    },


    fetchCount: function(str, itemLimit, rowLimit) {
        var self = this;
        var bestCandKey = this.getBestCandKey(str);

        var result;

        if(bestCandKey != null) {
            var promise = this.strToPromise[bestCandKey];

            // If the promise is still running, there is a chance that it fails
            // to retrieve items

            result = promise.then(function(entries) {
                var r;

                if(!entries) {
                    // TODO In the meantime there might already
                    // be another candidate promise to which we could connect
                    r = self.delegate.fetchCount(str, itemLimit, rowLimit);
                } else {
                    var filtered = self.filterEntries(str, entries);
                    r = {
                        count: filtered.length,
                        hasMoreItems: false
                    };
                }

                return r;
            });
        } else {
            result = this.delegate.fetchCount(str, itemLimit, rowLimit);
        }

        return result;
    }
});


module.exports = ListServiceIndexSubString;

},{"../../ext/Class":2,"../PageExpandUtils":121,"./ListService":138}],145:[function(require,module,exports){
var Class = require('../../ext/Class');
var PageExpandUtils = require('../PageExpandUtils');
var ListService = require('./ListService');

var ListServicePageExpand = Class.create(ListService, {
    initialize: function(listService, pageSize) {
        this.listService = listService;
        this.pageSize = pageSize;
    },

    fetchItems: function(concept, limit, offset) {
        var x = PageExpandUtils.computeRange(limit, offset, this.pageSize);
        
        var p = this.listService.fetchItems(concept, x.limit, x.offset);
        var result = p.then(function(items) {

            var end = x.subLimit ? x.subOffset + x.subLimit : items.length;
            var r = items.slice(x.subOffset, end); 
            
            return r;
        });
        
        return result;
    },

    fetchCount: function(concept, itemLimit, rowLimit) {
        var result = this.listService.fetchCount(concept, itemLimit, rowLimit);
        return result;
    },

});

module.exports = ListServicePageExpand;

},{"../../ext/Class":2,"../PageExpandUtils":121,"./ListService":138}],146:[function(require,module,exports){
var Class = require('../../ext/Class');
var values = require('lodash.values');
var shared = require('../../util/shared');
var Promise = shared.Promise;

var Concept = require('../../sparql/Concept');
var ConceptUtils = require('../../sparql/ConceptUtils');
var ServiceUtils = require('../ServiceUtils');
var ResultSetUtils = require('../ResultSetUtils');
var ListService = require('./ListService');

/**
 * A list service that is configured with a query + var,
 * and which can filter the result set according to the provided concept in fetchItems.
 *
 * Each item is of type sevice.ResultSetPart and contains the result set rows where
 * var is of a certain value
 *
 * NOTE: AttrConcept could have an element of type ElementSubQuery, which we can treat in specially for optimization
 *
 * Note: The service is not responsible for ordering by var (in order to have the result set rows pre-grouped)
 *
 * isInnerJoin controls whether the attributes are optional or mandatory:
 * If isInnerJoin is false, attributes are considered optional, and e.g. fetchCount will solely rely on the provided concept
 * If it is true, an inner join between the attributes and the concept will be made, and e.g. fetchCount will return the number of items in their intersection
 *
 * ConceptTypes: FilterConcept: No triple-patterns - just filters on the concept.getVar()
 *               QueryConcept: Concept with a ElementSubQuery as its element
 *               SubjectConcept: Concept which is isomorph to the concept ({?s ?p ?o}, ?s)
 * @param isLeftJoin true indidcates that the attributes are optional
 */
var ListServiceSparqlQuery = Class.create(ListService, {
    initialize: function(sparqlService, attrQuery, attrVar, isLeftJoin) {
        if(attrQuery.getLimit() || attrQuery.getOffset()) {
            throw new Error('Limit and offset in attribute queries not yet supported');
        }

        this.sparqlService = sparqlService;
        this.attrQuery = attrQuery;
        this.attrVar = attrVar;
        this.isLeftJoin = isLeftJoin; //isLeftJoin == null ? true : isLeftJoin;
    },


    /*
    createQueryAttrAsSubQuery: function() {
        var subQuery = new Query();
        subQuery.setQueryPattern(new ElementSubQuery(this.attrQuery));
        subQuery.setQueryResultStar(this.attrQuery.isQueryResultStar());

        var entries = subQuery.getProject().entries();
        entries.forEach(function(expr, v) {
            subQuery.getProject().add(v, expr);
        });

        return subQuery;
    },
    */

    fetchItems: function(filterConcept, limit, offset) {
        var attrVar = this.attrVar;

        if(!filterConcept) {
            filterConcept = ConceptUtils.createSubjectConcept();
        }

        var query = ConceptUtils.createAttrQuery(this.attrQuery, attrVar, this.isLeftJoin, filterConcept, limit, offset);

        var qe = this.sparqlService.createQueryExecution(query);

        var result = qe.execSelect().then(function(rs) {
            var map = ResultSetUtils.partition(rs, attrVar);
            var entries = map.entries();

            var r = values(entries);
            return r;
            // partition the result set according to the attrConcept.getVar();
        });

        return result;
    },

    fetchCount: function(filterConcept, itemLimit, rowLimit) {

        if(!filterConcept) {
            filterConcept = ConceptUtils.createSubjectConcept();
        }

        var countConcept;
        if(this.isLeftJoin) {
            var query = ConceptUtils.createAttrQuery(this.attrQuery, this.attrVar, this.isLeftJoin, filterConcept, itemLimit, null);

            countConcept = new Concept(query.getQueryPattern(), this.attrVar);
        } else {
            var attrConcept = new Concept(this.attrQuery.getQueryPattern(), this.attrVar);
            countConcept = ConceptUtils.createCombinedConcept(attrConcept, filterConcept, true, false, false);
//            console.log('FILTER ' + filterConcept);
//            console.log('ATTR ' + attrConcept);
//            console.log('COUNT ' + countConcept);
//            console.log('ROW ' + rowLimit);
        }

        var result = ServiceUtils.fetchCountConcept(this.sparqlService, countConcept, itemLimit, rowLimit);
        return result;
    },

});

module.exports = ListServiceSparqlQuery;

},{"../../ext/Class":2,"../../sparql/Concept":203,"../../sparql/ConceptUtils":204,"../../util/shared":351,"../ResultSetUtils":125,"../ServiceUtils":126,"./ListService":138,"lodash.values":638}],147:[function(require,module,exports){
var Class = require('../../ext/Class');
var ListService = require('./ListService');

/**
 * A list service that transforms the input concept to another
 * which gets passed to the underlying list service
 *
 */
var ListServiceTransformConcept = Class.create(ListService, {
    initialize: function(listService, fnTransformConcept) {
        this.listService = listService;
        this.fnTransformConcept = fnTransformConcept;

        if(!fnTransformConcept) {
            throw new Error('No transformation function provided');
        }
    },

    fetchItems: function(inConcept, limit, offset) {
        var outConcept = this.fnTransformConcept(inConcept);
        var result = this.listService.fetchItems(outConcept, limit, offset);
        return result;
    },

    fetchCount: function(inConcept, itemLimit, rowLimit) {
        var outConcept = this.fnTransformConcept(inConcept);
        var result = this.listService.fetchCount(outConcept, itemLimit, rowLimit);
        return result;
    },

});

module.exports = ListServiceTransformConcept;

},{"../../ext/Class":2,"./ListService":138}],148:[function(require,module,exports){
var Class = require('../../ext/Class');
var ListService = require('./ListService');

var KeywordSearchUtils = require('../../sparql/search/KeywordSearchUtils');

var defaultIdToFilterFn = {
    regex: KeywordSearchUtils.createConceptRegexLabelOnly,
    fulltext: KeywordSearchUtils.createConceptBifContains
};

var ListServiceTransformConceptMode = Class.create({
    initialize: function(listService, labelRelationFn, idToFilterFn) {
        this.listService = listService;
        this.labelRelationFn = labelRelationFn;
        this.idToFilterFn = idToFilterFn || defaultIdToFilterFn;
    },

    createConcept: function(filter) {
        var result;

        if(filter == null || filter.searchString == null || filter.searchString.trim() === '') {
            result = null;
        } else {
            var labelRelation = this.labelRelationFn();

            var mode = filter.mode ? filter.mode : 'default';
            var fn = this.idToFilterFn[mode];

            if(!fn) {
                throw new Error('No filter function registered for mode "' + mode + '"');
            }

            result = fn(labelRelation, filter.searchString);
        }

        return result;
    },

    fetchItems: function(filter, limit, offset) {
        var concept = this.createConcept(filter);
        var result = this.listService.fetchItems(concept, limit, offset);
        return result;
    },

    fetchCount: function(filter, itemLimit, rowLimit) {
        var concept = this.createConcept(filter);
        var result = this.listService.fetchCount(concept, itemLimit, rowLimit);
        return result;
    }
});

module.exports = ListServiceTransformConceptMode;

},{"../../ext/Class":2,"../../sparql/search/KeywordSearchUtils":280,"./ListService":138}],149:[function(require,module,exports){
var Class = require('../../ext/Class');
var ListService = require('./ListService');

/**
 * A list service that transforms the input concept to another
 * which gets passed to the underlying list service
 * 
 */
var ListServiceTransformItem = Class.create(ListService, {
    initialize: function(listService, fnTransformItem) {
        this.listService = listService;
        this.fnTransformItem = fnTransformItem;
    },

    fetchItems: function(concept, limit, offset) {

        var self = this;
        var result = this.listService.fetchItems(concept, limit, offset).then(function(items) {
            var r = items.map(self.fnTransformItem);
            return r;
        });

        return result;
    },

    fetchCount: function(concept, itemLimit, rowLimit) { 
        var result = this.listService.fetchCount(concept, itemLimit, rowLimit);
        return result;
    },

});

module.exports = ListServiceTransformItem;

},{"../../ext/Class":2,"./ListService":138}],150:[function(require,module,exports){
var Class = require('../../ext/Class');
var ListService = require('./ListService');

var shared = require('../../util/shared');
var Promise = shared.Promise;

/**
 * A list service that transforms the input concept to another
 * which gets passed to the underlying list service
 *
 */
var ListServiceTransformItems = Class.create(ListService, {
    initialize: function(listService, fnTransformItems) {
        this.listService = listService;
        this.fnTransformItems = fnTransformItems;
    },

    fetchItems: Promise.method(function(concept, limit, offset) {

        var self = this;
        var result = this.listService.fetchItems(concept, limit, offset).then(function(items) {
            var r = self.fnTransformItems(items);
            return r;
        });

        return result;
    }),

    fetchCount: function(concept, itemLimit, rowLimit) {
        var result = this.listService.fetchCount(concept, itemLimit, rowLimit);
        return result;
    },

});

module.exports = ListServiceTransformItems;

},{"../../ext/Class":2,"../../util/shared":351,"./ListService":138}],151:[function(require,module,exports){
var Class = require('../../ext/Class');

var LookupService = Class.create({
    getIdStr: function() { // id) {
        throw new Error('Not overridden');
    },

    /**
     * This method must return a promise for a Map<Id, Data>
     */
    lookup: function(key) {
        throw new Error('Not overridden');
    },
});

module.exports = LookupService;

},{"../../ext/Class":2}],152:[function(require,module,exports){
var Class = require('../../ext/Class');
var LookupService = require('./LookupService');

/**
 * This function must convert ids to unique strings
 * Only the actual service (e.g. sparql or rest) needs to implement it
 * Layers on top of it (e.g. caching, delaying) will then delegate to the
 * inner-most getIdStr function.
 *
 */
var LookupServiceBase = Class.create(LookupService, {
    getIdStr: function(id) {
        var result = id.toString();
        return result;
    },
});

module.exports = LookupServiceBase;

},{"../../ext/Class":2,"./LookupService":151}],153:[function(require,module,exports){
var Class = require('../../ext/Class');
var _uniq = require('lodash.uniq');
var LookupServiceDelegateBase = require('./LookupServiceDelegateBase');
var RequestCache = require('../RequestCache');
var HashMap = require('../../util/collection/HashMap');
var shared = require('../../util/shared');
var Promise = shared.Promise;

/**
 * This function must convert ids to unique strings
 * Only the actual service (e.g. sparql or rest) needs to implement it
 * Layers on top of it (e.g. caching, delaying) will then delegate to the
 * inner-most getIdStr function.
 *
 */
var LookupServiceCache = Class.create(LookupServiceDelegateBase, {
    initialize: function($super, delegate, requestCache) {
        $super(delegate);
        this.requestCache = requestCache || new RequestCache();
    },

    /**
     * This method must return a promise for the documents
     */
    lookup: function(ids) {
        var self = this;

        // console.log('cache status [BEFORE] ' + JSON.stringify(self.requestCache));

        // Make ids unique
        var uniq = _uniq(ids, false, function(id) {
            var idStr = self.getIdStr(id);
            return idStr;
        });

        var resultMap = new HashMap();

        var resultCache = this.requestCache.getResultCache();
        var executionCache = this.requestCache.getExecutionCache();

        // Check whether we need to wait for promises that are already executing
        var open = [];
        var waitForIds = [];
        var waitForPromises = [];

        uniq.forEach(function(id) {
            var idStr = self.getIdStr(id);

            var data = resultCache.getItem(idStr);
            if (!data) {

                var promise = executionCache[idStr];
                if (promise) {
                    waitForIds.push(id);

                    var found = waitForPromises.find(function(p) {
                        var r = (p === promise);
                        return r;
                    });

                    if (!found) {
                        waitForPromises.push(promise);
                    }
                } else {
                    open.push(id);
                    waitForIds.push(id);
                }
            } else {
                resultMap.put(id, data);
            }
        });

        if (open.length > 0) {
            var p = this.fetchAndCache(open);
            waitForPromises.push(p);
        }

        var result = Promise.all(waitForPromises).then(function() {
            var maps = arguments;
            waitForIds.forEach(function(id) {

                var data = null;
                maps.find(function(map) {
                    data = map.get(id);
                    return Boolean(data);
                });

                if (data) {
                    resultMap.put(id, data);
                }
            });

            return resultMap;
        });

        return result;
    },

    /**
     * Function for actually retrieving data from the underlying service and updating caches as needed.
     *
     * Don't call this method directly; it may corrupt caches!
     */
    fetchAndCache: function(ids) {
        var resultCache = this.requestCache.getResultCache();
        var executionCache = this.requestCache.getExecutionCache();

        var self = this;

        var p = this.delegate.lookup(ids);
        var result = p.then(function(map) {

            var r = new HashMap();

            ids.forEach(function(id) {
                // var id = self.getIdFromDoc(doc);
                var idStr = self.getIdStr(id);
                var doc = map.get(id);
                resultCache.setItem(idStr, doc);
                r.put(id, doc);
            });

            ids.forEach(function(id) {
                var idStr = self.getIdStr(id);
                delete executionCache[idStr];
            });

            return r;
        });

        ids.forEach(function(id) {
            var idStr = self.getIdStr(id);
            executionCache[idStr] = result;
        });

        return result;
    },
});

module.exports = LookupServiceCache;

},{"../../ext/Class":2,"../../util/collection/HashMap":343,"../../util/shared":351,"../RequestCache":123,"./LookupServiceDelegateBase":156,"lodash.uniq":583}],154:[function(require,module,exports){
var Class = require('../../ext/Class');
var uniq = require('lodash.uniq');
var ArrayUtils = require('../../util/ArrayUtils');
var HashMap = require('../../util/collection/HashMap');
var LookupServiceDelegateBase = require('./LookupServiceDelegateBase');
var shared = require('../../util/shared');
var Promise = shared.Promise;

var LookupServiceChunker = Class.create(LookupServiceDelegateBase, {
    initialize: function($super, delegate, maxChunkSize) {
        $super(delegate);
        this.maxChunkSize = maxChunkSize;
    },

    lookup: function(keys) {
        var self = this;

        // Make ids unique
        var ks = uniq(keys, false, function(key) {
            var keyStr = self.getIdStr(key);
            return keyStr;
        });

        var chunks = ArrayUtils.chunk(ks, this.maxChunkSize);

        var promises = chunks.map(function(chunk) {
            var r = self.delegate.lookup(chunk);
            return r;
        });

        var result = Promise.app(promises).then(function() {
            var r = new HashMap();
            arguments.forEach(function(map) {
                r.putAll(map);
            });

            return r;
        });

        return result;
    },
});

module.exports = LookupServiceChunker;

},{"../../ext/Class":2,"../../util/ArrayUtils":327,"../../util/collection/HashMap":343,"../../util/shared":351,"./LookupServiceDelegateBase":156,"lodash.uniq":583}],155:[function(require,module,exports){
var Class = require('../../ext/Class');
var LookupServiceBase = require('./LookupServiceBase');
var HashMap = require('../../util/collection/HashMap');
var shared = require('../../util/shared');
var Promise = shared.Promise;

var LookupServiceConst = Class.create(LookupServiceBase, {
    initialize: function(data) {
        this.data = data;
    },

    lookup: function(keys) {
        var map = new HashMap();
        var self = this;
        keys.forEach(function(key) {
            map.put(key, self.data);
        });

        var result = Promise.resolve(map);
        return result;
    },
});

module.exports = LookupServiceConst;

},{"../../ext/Class":2,"../../util/collection/HashMap":343,"../../util/shared":351,"./LookupServiceBase":152}],156:[function(require,module,exports){
var Class = require('../../ext/Class');
var LookupService = require('./LookupService');

var LookupServiceDelegateBase = Class.create(LookupService, {
    initialize: function(delegate) {
        this.delegate = delegate;
    },

    getIdStr: function(id) {
        var result = this.delegate.getIdStr(id);
        return result;
    },
});

module.exports = LookupServiceDelegateBase;

},{"../../ext/Class":2,"./LookupService":151}],157:[function(require,module,exports){
var Class = require('../../ext/Class');
var LookupServiceBase = require('./LookupServiceBase');

var HashMap = require('../../util/collection/HashMap');

var shared = require('../../util/shared');
var Promise = shared.Promise;


/**
 * Lookup Service which draws data from a function.
 * Keys will be omitted if undefined is returned.
 */
var LookupServiceFn = Class.create(LookupServiceBase, {
    initialize: function(fn) {
        this.fn = fn;
    },

    lookup: Promise.method(function(keys) {
        var result = new HashMap();

        var self = this;
        keys.forEach(function(key) {
            var val = self.fn(key);
            if(typeof val !== 'undefined') {
                result.put(key, val);
            }
        });

        return result;
    }),

});

module.exports = LookupServiceFn;

},{"../../ext/Class":2,"../../util/collection/HashMap":343,"../../util/shared":351,"./LookupServiceBase":152}],158:[function(require,module,exports){
var Class = require('../../ext/Class');
var LookupServiceDelegateBase = require('./LookupServiceDelegateBase');

/**
 * Lookup Service which can filter keys. Used to e.g. get rid of invalid URIs which would
 * cause SPARQL queries to fail
 */
var LookupServiceIdFilter = Class.create(LookupServiceDelegateBase, {
    initialize: function($super, delegate, predicateFn) {
        $super(delegate);
        this.predicateFn = predicateFn;
    },

    lookup: function(keys) {
        var newKeys = keys.filter(this.predicateFn);
        var result = this.delegate.lookup(newKeys);
        return result;
    },
});

module.exports = LookupServiceIdFilter;

},{"../../ext/Class":2,"./LookupServiceDelegateBase":156}],159:[function(require,module,exports){
var Class = require('../../ext/Class');
var LookupService = require('./LookupService');

var ObjectUtils = require('../../util/ObjectUtils');

var HashMap = require('../../util/collection/HashMap');

var shared = require('../../util/shared');
var Promise = shared.Promise;

/**
 * Lookup service which passes keys through a function (identity by default)
 * and maps them to the result
 */
var LookupServiceKeyMap = Class.create(LookupService, {
    initialize: function(fnTransformKey) {
        this.fnTransformKey = fnTransformKey || ObjectUtils.identity;
    },

    lookup: function(keys) {
        var map = new HashMap();

        var self = this;
        keys.forEach(function(key) {
            var val = self.fnTransformKey(key);
            map.put(key, val);
        });

        return Promise.resolve(map);
    },
});

module.exports = LookupServiceKeyMap;

},{"../../ext/Class":2,"../../util/ObjectUtils":332,"../../util/collection/HashMap":343,"../../util/shared":351,"./LookupService":151}],160:[function(require,module,exports){
var Class = require('../../ext/Class');
var LookupServiceBase = require('./LookupServiceBase');

var HashMap = require('../../util/collection/HashMap');

var shared = require('../../util/shared');
var Promise = shared.Promise;


/**
 * Lookup Service which draws data from a map object.
 */
var LookupServiceMap = Class.create(LookupServiceBase, {
    initialize: function(map) {
        this.map = map;
    },

    lookup: Promise.method(function(keys) {
        var result = new HashMap();

        var self = this;
        keys.forEach(function(key) {
            var val = self.map.get(key);
            result.put(key, val);
        });

        return result;
    }),

});

module.exports = LookupServiceMap;

},{"../../ext/Class":2,"../../util/collection/HashMap":343,"../../util/shared":351,"./LookupServiceBase":152}],161:[function(require,module,exports){
var Class = require('../../ext/Class');
var LookupService = require('./LookupService');

var HashMap = require('../../util/collection/HashMap');

var shared = require('../../util/shared');
var Promise = shared.Promise;


/**
 * A lookup service that is configured with a map from
 * attributes to lookup services, e.g.
 * {
 *     id: identityLookupService, // A lookup service that maps a key back to itself
 *     name: nameLookupService
 *     friends: friendsLookupService
 * }
 *
 * when lookup is called, each of the lookup services is called,
 * and
 */
var LookupServiceMulti = Class.create(LookupService, {
    initialize: function(attrToLookupService) {
        this.attrToLookupService = attrToLookupService;
    },

    lookup: function(keys) {

        var self = this;
        var props = {};

        var attrs = Object.keys(this.attrToLookupService);
        attrs.forEach(function(attr) {
            var ls = self.attrToLookupService[attr];
            if(ls) {
                props[attr] = ls.lookup(keys);
            } else {
                props[attr] = null;
            }
        });

        var result = Promise.props(props).then(function(data) {
            // data now is a map from attributes to maps (the lookup results)
            // e.g. { name: Map<key, value>, address: Map<key, value>}
            // we transpose this to Map<Key, {name:..., address: ....}>

            var r = new HashMap();

            keys.forEach(function(key) {
                var obj = {};

                attrs.forEach(function(attr) {
                    var map = data[attr];
                    var val = map ? map.get(key) : null;

                    obj[attr] = val;
                });

                r.put(key, obj);
            });

            return r;
        });

        return result;
    },
});

module.exports = LookupServiceMulti;

},{"../../ext/Class":2,"../../util/collection/HashMap":343,"../../util/shared":351,"./LookupService":151}],162:[function(require,module,exports){
var Class = require('../../ext/Class');

var shared = require('../../util/shared');
var Promise = shared.Promise;

var HashMap = require('../../util/collection/HashMap');

var ExprVar = require('../../sparql/expr/ExprVar');
var E_OneOf = require('../../sparql/expr/E_OneOf');
var ElementFilter = require('../../sparql/element/ElementFilter');
var ElementGroup = require('../../sparql/element/ElementGroup');

var ResultSetUtils = require('../ResultSetUtils');
var LookupServiceBase = require('./LookupServiceBase');

var LookupServiceSparqlQuery = Class.create(LookupServiceBase, {
    initialize: function(sparqlService, query, v) {
        this.sparqlService = sparqlService;
        this.query = query;
        this.v = v;
    },

    /**
     * @param uris An array of rdf.Node objects that represent URIs
     */
    lookup: function(uris) {
        //console.log('LOOKUP: ' + JSON.stringify(uris));
        var containsNull = uris.some(function(item) {
            var r = item == null;
            return r;
        });

        if(containsNull) {
            throw new Error('Lookup requests must not include null values as it most likely indicates a problem');
        }


        var v = this.v;
        var result;
        if(uris.length === 0) {
            result = Promise.resolve(new HashMap());
        } else {
            var q = this.query.clone();

            //console.log('Uris: ' + uris.length + ' ' + JSON.stringify(uris));
            //throw new Error('here');

            var filter = new ElementFilter(new E_OneOf(new ExprVar(v), uris));

            var element = new ElementGroup([q.getQueryPattern(), filter]);
            q.setQueryPattern(element);

            var qe = this.sparqlService.createQueryExecution(q);
            result = qe.execSelect().then(function(rs) {
                var r = ResultSetUtils.partition(rs, v);
                return r;
            });
        }

        return result;
    }
});

module.exports = LookupServiceSparqlQuery;

},{"../../ext/Class":2,"../../sparql/element/ElementFilter":232,"../../sparql/element/ElementGroup":233,"../../sparql/expr/E_OneOf":257,"../../sparql/expr/ExprVar":269,"../../util/collection/HashMap":343,"../../util/shared":351,"../ResultSetUtils":125,"./LookupServiceBase":152}],163:[function(require,module,exports){
var Class = require('../../ext/Class');
var LookupServiceDelegateBase = require('./LookupServiceDelegateBase');
var HashMap = require('../../util/collection/HashMap');
var shared = require('../../util/shared');
var Promise = shared.Promise;

var defer = function() {
    var resolve;
    var reject;
    var promise = new Promise(function() {
        resolve = arguments[0];
        reject = arguments[1];
    });
    return {
        resolve: resolve,
        reject: reject,
        promise: promise,
    };
};

/**
 * Wrapper that collects ids for a certain amount of time before passing it on to the
 * underlying lookup service.
 */
var LookupServiceTimeout = Class.create(LookupServiceDelegateBase, {
    initialize: function($super, delegate, delayInMs, maxRefreshCount) {
        $super(delegate);
        this.delayInMs = delayInMs;
        this.maxRefreshCount = maxRefreshCount || 0;

        this.idStrToId = {};
        this.currentDeferred = null;
        this.currentPromise = null;
        this.currentTimer = null;
        this.currentRefreshCount = 0;
    },

    getIdStr: function(id) {
        var result = this.delegate.getIdStr(id);
        return result;
    },

    lookup: function(ids) {
        if (!this.currentDeferred) {
            this.currentDeferred = defer();
            this.currentPromise = this.currentDeferred.promise();
        }

        var self = this;
        ids.forEach(function(id) {
            var idStr = self.getIdStr(id);
            var val = self.idStrToId[idStr];
            if (!val) {
                self.idStrToId[idStr] = id;
            }
        });

        if (!this.currentTimer) {
            this.startTimer();
        }

        // Filter the result by the ids which we requested
        var result = this.currentPromise.then(function(map) {
            var r = new HashMap();
            ids.forEach(function(id) {
                var val = map.get(id);
                r.put(id, val);
            });
            return r;
        });

        return result;
    },

    startTimer: function() {

        var self = this;
        var seenRefereshCount = this.currentRefreshCount;
        var deferred = self.currentDeferred;

        this.currentTimer = setTimeout(function() {

            if (self.maxRefreshCount < 0 || seenRefereshCount < self.maxRefreshCount) {
                // clearTimeout(this.currentTimer);
                ++self.currentRefreshCount;
                self.startTimer();
                return;
            }

            var ids = [];
            for (var key in self.idStrToId) {
                ids.push(self.idStrToId[key]);
            }

            self.idStrToId = {};
            self.currentRefreshCount = 0;
            self.currentDeferred = null;
            self.currentTimer = null;

            self.delegate
                .lookup(ids)
                .then(function(map) {
                    deferred.resolve(map);
                });
        }, this.delayInMs);
    },
});

module.exports = LookupServiceTimeout;

},{"../../ext/Class":2,"../../util/collection/HashMap":343,"../../util/shared":351,"./LookupServiceDelegateBase":156}],164:[function(require,module,exports){
var Class = require('../../ext/Class');
var LookupServiceDelegateBase = require('./LookupServiceDelegateBase');

// In-place transform the values for the looked up documents
var LookupServiceTransform = Class.create(LookupServiceDelegateBase, {
    initialize: function($super, delegate, fnTransform, fnNullHandler) {
        $super(delegate);
        this.fnTransform = fnTransform;
        this.fnNullHandler = fnNullHandler;
    },

    lookup: function(ids) {
        var fnTransform = this.fnTransform;
        var fnNullHandler = this.fnNullHandler;
        
        var result = this.delegate.lookup(ids).then(function(map) {

            ids.forEach(function(id) {
                var val = map.get(id);
                if(val != null) {
                    var t = fnTransform(val, id);
                    map.put(id, t);
                } else if (fnNullHandler) {
                    val = fnNullHandler(id);
                    if(val != null) {
                        map.put(id, val);
                    }
                    //console.log('Null value in transformation for key ' + id, id);
                    
                }
            });

            return map;
        });

        return result;
    },

});

module.exports = LookupServiceTransform;

},{"../../ext/Class":2,"./LookupServiceDelegateBase":156}],165:[function(require,module,exports){
var Class = require('../../ext/Class');
var LookupServiceDelegateBase = require('./LookupServiceDelegateBase');

var HashMap = require('../../util/collection/HashMap');


// In-place transform the values for the looked up documents
var LookupServiceTransformKey = Class.create(LookupServiceDelegateBase, {
    initialize: function($super, delegate, fnKey) {
        $super(delegate);
        this.fnKey = fnKey;
    },

    lookup: function(keys) {
        var self = this;

        var altToKey = new HashMap();

        keys.forEach(function(key) {
            var alt = self.fnKey(key);

            altToKey.put(alt, key);
        });

        var altKeys = altToKey.keys();

        var result = this.delegate.lookup(altKeys).then(function(map) {
            var r = new HashMap();

            map.entries().forEach(function(entry) {
                var key = altToKey.get(entry.key);
                r.put(key, entry.val);
            });

            return r;
        });

        return result;
    },

});

module.exports = LookupServiceTransformKey;

},{"../../ext/Class":2,"../../util/collection/HashMap":343,"./LookupServiceDelegateBase":156}],166:[function(require,module,exports){
/* jshint evil: true */
var Class = require('../../ext/Class');
var ExprEvaluatorImpl = require('../../sparql/ExprEvaluatorImpl');
var IteratorArray = require('../../util/collection/IteratorArray');
var ResultSetArrayIteratorBinding = require('../result_set/ResultSetArrayIteratorBinding');
var E_OneOf = require('../../sparql/expr/E_OneOf');
var ElementFilter = require('../../sparql/element/ElementFilter');
var shared = require('../../util/shared');
var Promise = shared.Promise;

var QueryCacheBindingHashSingle = Class.create({
    initialize: function(sparqlService, query, indexExpr) {
        this.sparqlService = sparqlService;
        this.query = query;

        // this.indexVarName = indexVarName;
        this.indexExpr = indexExpr;

        this.maxChunkSize = 50;

        // this.indexVar = rdf.

        this.exprEvaluator = new ExprEvaluatorImpl();

        this.nodeToBindings = {}; // new Cache(); // FIXME: add cache thingy

        // Cache for nodes for which no data existed
        this.nodeMisses = {}; // new Cache(); // FIXME: add cache thingy
    },

    fetchResultSet: function(nodes) {
        var self = this;
        var nodeToBindings = this.nodeToBindings;

        var stats = this.analyze(nodes);

        var resultBindings = [];

        // Fetch data from the cache
        stats.cachedNodes.forEach(function(node) {
            var bindings = nodeToBindings.getItem(node.toString());
            resultBindings.push.apply(resultBindings, bindings);
        });

        // Fetch data from the chunks

        var fetchTasks = stats.nonCachedChunks.map(function(chunk) {
            var promise = self.fetchChunk(chunk);
            return promise;
        });

        var masterTask = Promise.all(fetchTasks);

        var exprEvaluator = this.exprEvaluator;
        var indexExpr = this.indexExpr;

        // TODO Cache the misses
        return masterTask.then(function() {
            var seenKeys = {};

            for (var i = 0; i < arguments.length; ++i) {
                var rs = arguments[i];
                while (rs.hasNext()) {
                    var binding = rs.nextBinding();

                    resultBindings.push(binding);

                    var keyNode = exprEvaluator.eval(indexExpr, binding);

                    var hashKey = keyNode.toString();

                    // Keep track of which nodes we have encountered
                    seenKeys[hashKey] = keyNode;

                    var cacheEntry = nodeToBindings.getItem(hashKey);
                    if (cacheEntry == null) {
                        cacheEntry = [];
                        nodeToBindings.setItem(hashKey, cacheEntry);
                    }

                    cacheEntry.push(binding);
                }
            }

            var itBinding = new IteratorArray(resultBindings);
            var r = new ResultSetArrayIteratorBinding(itBinding);

            return r;
        });
    },

    fetchChunk: function(nodes) {
        var query = this.query.clone();

        var filterExpr = new E_OneOf(this.indexExpr, nodes);
        var filterElement = new ElementFilter([
            filterExpr,
        ]);
        query.getElements().push(filterElement);

        var qe = this.sparqlService.createQueryExecution(query);

        var result = qe.execSelect();
        return result;
        // var v = rdf.NodeFactory.createVar(this.index);
    },

    /**
     * Given an array of nodes, this method returns:
     * (a) the array of nodes for which cache entries exist
     * (b) the array of nodes for which NO cache entries exist
     * (c) the array of nodes for which it is known that no data exists
     * (c) chunked arrays of nodes for which no cache entries exist
     * (d) the maxChunkSize used to create the chunks
     *
     * @param {Array} nodes
     * @returns
     */
    analyze: function(nodes) {
        var nodeToBindings = this.nodeToBindings;

        var cachedNodes = [];
        var nonCachedNodes = [];

        nodes.forEach(function(node) {
            var entry = nodeToBindings.getItem(node.toString());
            if (entry == null) {
                nonCachedNodes.push(node);
            } else {
                cachedNodes.push(node);
            }
        });

        var maxChunkSize = this.maxChunkSize;

        var nonCachedChunks = [];
        for (var i = 0; i < nonCachedNodes.length; i += maxChunkSize) {
            var chunk = nodes.slice(i, i + maxChunkSize);

            nonCachedChunks.push(chunk);
        }

        var result = {
            cachedNodes: cachedNodes,
            nonCachedNodes: nonCachedNodes,
            nonCachedChunks: nonCachedChunks,
            maxChunkSize: maxChunkSize,
        };

        return result;
    },
});

module.exports = QueryCacheBindingHashSingle;

},{"../../ext/Class":2,"../../sparql/ExprEvaluatorImpl":209,"../../sparql/element/ElementFilter":232,"../../sparql/expr/E_OneOf":257,"../../util/collection/IteratorArray":347,"../../util/shared":351,"../result_set/ResultSetArrayIteratorBinding":177}],167:[function(require,module,exports){
var Class = require('../../ext/Class');

var QueryCacheNodeFactory = Class.create({
    createQueryCache: function() { // sparqlService, query, indexExpr) {
        throw new Error('Not overridden');
    },
});

module.exports = QueryCacheNodeFactory;

},{"../../ext/Class":2}],168:[function(require,module,exports){
var Class = require('../../ext/Class');
var QueryCacheNodeFactory = require('./QueryCacheNodeFactory');
var QueryCacheBindingHashSingle = require('./QueryCacheBindingHashSingle');

var QueryCacheNodeFactoryImpl = Class.create(QueryCacheNodeFactory, {
    initialize: function() {
        this.keyToCache = {}; // new Cache(); // FIXME: add Cache thingy (currently depends on localstorage)
    },

    createQueryCache: function(sparqlService, query, indexExpr) {
        // FIXME: SparqlService.getServiceState() not defined
        var key = 'cache:/' + sparqlService.getServiceId() + '/' + sparqlService.getServiceState() + '/' + query + '/' + indexExpr;

        console.log('cache requested with id: ' + key);

        var cache = this.keyToCache.getItem(key);
        if (cache == null) {
            cache = new QueryCacheBindingHashSingle(sparqlService, query, indexExpr);
            this.keyToCache.addItem(key, cache);
        }

        return cache;
    },
});

module.exports = QueryCacheNodeFactoryImpl;

},{"../../ext/Class":2,"./QueryCacheBindingHashSingle":166,"./QueryCacheNodeFactory":167}],169:[function(require,module,exports){
var Class = require('../../ext/Class');

var QueryExecution = Class.create({
    execSelect: function() {
        throw new Error('Not overridden');
    },

    execAsk: function() {
        throw new Error('Not overridden');
    },

    execDescribeTriples: function() {
        throw new Error('Not overridden');
    },

    execConstructTriples: function() {
        throw new Error('Not overridden');
    },

    setTimeout: function() {
        throw new Error('Not overridden');
    },
});

module.exports = QueryExecution;

},{"../../ext/Class":2}],170:[function(require,module,exports){
var Class = require('../../ext/Class');
var QueryExecution = require('./QueryExecution');
var IteratorArray = require('../../util/collection/IteratorArray');
var ResultSetArrayIteratorBinding = require('../result_set/ResultSetArrayIteratorBinding');
var shared = require('../../util/shared');
var Promise = shared.Promise;

/**
 * A query execution that does simple caching based on the query strings.
 *
 *
 */
var QueryExecutionCache = Class.create(QueryExecution, {
    initialize: function(queryExecution, cacheKey, requestCache) {
        this.queryExecution = queryExecution;

        this.cacheKey = cacheKey;
        this.requestCache = requestCache;

    },

    createResultSetFromCacheData: function(cacheData) {
        var itBinding = new IteratorArray(cacheData.bindings);
        var varNames = cacheData.varNames;
        var rs = new ResultSetArrayIteratorBinding(itBinding, varNames);

        return rs;
    },

    setTimeout: function(timeoutInMillis) {
        this.queryExecution.setTimeout(timeoutInMillis);
    },

    execSelect: function() {
        var cacheKey = this.cacheKey;

        var requestCache = this.requestCache;
        var resultCache = requestCache.getResultCache();
        var executionCache = requestCache.getExecutionCache();

        // Check the cache whether the same query is already running
        // Re-use its promise if this is the case

        // TODO Reusing promises must take timeouts into account

        var executionPromise = executionCache[cacheKey];

        if (!executionPromise) {
            // Check if there is an entry in the result cache
            var cacheData = resultCache.getItem(cacheKey);
            if (cacheData) {
                executionPromise = Promise.resolve(cacheData);
            } else {
                var request = this.queryExecution.execSelect();

                var trans = request.then(function(rs) {
                    var cacheData = {
                        bindings: rs.getBindings(),
                        varNames: rs.getVarNames(),
                    };

                    return cacheData;
                });

                var skipInsert = false;

                executionPromise = trans.then(function(cacheData) {
                    skipInsert = true;

                    delete executionCache[cacheKey];
                    resultCache.setItem(cacheKey, cacheData);

                    return cacheData;
                });

                if (!skipInsert) {
                    executionCache[cacheKey] = executionPromise;
                }
            }
        } else {
            // Note: Multiple query execution could happen from angular apply loops that execute too often
            // So this could indicate performance issues
            console.log('[INFO] Joined query execution for: ' + cacheKey);
        }

        var self = this;
        var result = executionPromise.then(function(cacheData) {
            var rs = self.createResultSetFromCacheData(cacheData);
            //!!! return Promise.resolve(rs);
            return rs;
        });

        return result;
    },
});

module.exports = QueryExecutionCache;

},{"../../ext/Class":2,"../../util/collection/IteratorArray":347,"../../util/shared":351,"../result_set/ResultSetArrayIteratorBinding":177,"./QueryExecution":169}],171:[function(require,module,exports){
var Class = require('../../ext/Class');
var QueryExecution = require('./QueryExecution');

var QueryExecutionDelegate = Class.create(QueryExecution, {
    initialize: function(sparqlService, query) {
        this.sparqlService = sparqlService;
        this.query = query;

        this.timeout = null;
    },

    setTimeout: function(timeout) {
        this.timeout = timeout;
    },

    createQueryExecution: function(q) {
        var result = this.sparqlService.createQueryExecution(q || this.query);
        result.setTimeout(this.timeout);
        return result;
    },

    /*
    execConstruct: function() {
        var result = this.sparqlService.execConstruct(this.query);
        return result;
    },
    */

    execSelect: function() {
        var result = this.createQueryExecution().execSelect(this.query);
        return result;
    },

    /*
    execDescribe: function() {
        var result = this.sparqlService.execDescribe(this.query);
        return result;
    },
    */

    execAsk: function() {
        var result = this.createQueryExecution().execAsk(this.query);
        return result;
    },

});

module.exports = QueryExecutionDelegate;

},{"../../ext/Class":2,"./QueryExecution":169}],172:[function(require,module,exports){
var Class = require('../../ext/Class');
var QueryExecution = require('./QueryExecution');
var QueryPaginator = require('../QueryPaginator');
var IteratorArray = require('../../util/collection/IteratorArray');
var ResultSetArrayIteratorBinding = require('../result_set/ResultSetArrayIteratorBinding');
var shared = require('../../util/shared');
var Promise = shared.Promise;


/**
 * TODO Specify and implement the behavior:
 *
 * - Start a new request if the prior one does not return within a specified time
 *     and use the fastest response
 *
 * - If there is an server-error with an endpoint,
 *
 * - Give a chance for an endpoint to recover (e.g. perform retry after a certain amount of time)
 *
 * - Start all queries simultaneously and use the fastest response
 *
 * -> requestDelay parameter
 *
 */
var QueryExecutionFailover = Class.create(QueryExecution, {
    initialize: function(sparqlServices) {
        this.sparqlServices = sparqlServices;
        this.timeoutInMillis = null;
    },

    execSelect: function() {
        var result = this.sparqlServices.createQueryExecution(this.query);
        result.setTimeout(this.timeoutInMillis);

        return result;
    },

    setTimeout: function(timeoutInMillis) {
        this.timeoutInMillis = timeoutInMillis;
    },
});

module.exports = QueryExecutionFailover;

},{"../../ext/Class":2,"../../util/collection/IteratorArray":347,"../../util/shared":351,"../QueryPaginator":122,"../result_set/ResultSetArrayIteratorBinding":177,"./QueryExecution":169}],173:[function(require,module,exports){
/* jshint maxparams: 6 */
var Class = require('../../ext/Class');
var QueryExecution = require('./QueryExecution');
var ResultSetUtils = require('../ResultSetUtils');
var AjaxUtils = require('../AjaxUtils');

var shared = require('../../util/shared');
var ajax = shared.ajax;
var Promise = shared.Promise;

var QueryExecutionHttp = Class.create(QueryExecution, {
    initialize: function(queryString, serviceUri, defaultGraphUris, ajaxOptions, httpArgs) {
        this.queryString = queryString;
        this.serviceUri = serviceUri;
        this.defaultGraphUris = defaultGraphUris;

        this.ajaxOptions = ajaxOptions || {};
        this.httpArgs = httpArgs;
    },

    /**
     *
     * @returns {Promise<sparql.ResultSet>}
     */
    execSelect: function() {
        var result = this.execAny().then(function(raw) {
            var r;
            try {
                r = ResultSetUtils.jsonToResultSet(raw);
            } catch(e) {
                console.log('Error processing result set. Response was: ', raw);
                throw e;
            }
            return r;
        });

        return result;
    },

    execAsk: function() {
        var result = this.execAny().then(function(json) {
            return json.boolean;
        });

        return result;
    },

    // Returns an iterator of triples
    execConstructTriples: function() {
        throw new Error('Not implemented yet');
        // return this.execAny(queryString);
    },

    execDescribeTriples: function() {
        throw new Error('Not implemented yet');
        // return this.execAny(queryString);
    },

    setTimeout: function(timeoutInMillis) {
        this.ajaxOptions.timeout = timeoutInMillis;
    },

    getTimeout: function() {
        return this.ajaxOptions.timeout;
    },

    execAny: function() {
        var ajaxSpec = AjaxUtils.createSparqlRequestAjaxSpec(this.serviceUri, this.defaultGraphUris, this.queryString, this.httpArgs, this.ajaxOptions);
        var result = ajax(ajaxSpec);
        return result;
    },
});

module.exports = QueryExecutionHttp;

},{"../../ext/Class":2,"../../util/shared":351,"../AjaxUtils":117,"../ResultSetUtils":125,"./QueryExecution":169}],174:[function(require,module,exports){
var Class = require('../../ext/Class');
var QueryExecutionDelegate = require('./QueryExecutionDelegate');
var PageExpandUtils = require('../PageExpandUtils');
var IteratorArray = require('../../util/collection/IteratorArray');
var ResultSetArrayIteratorBinding = require('../result_set/ResultSetArrayIteratorBinding');

var QueryExecutionPageExpand = Class.create(QueryExecutionDelegate, {
    initialize: function($super, sparqlService, query, pageSize) {
        $super(sparqlService, query);
        this.pageSize = pageSize;
    },

    /**
     * Send the query, and only return the subset result set in the given sub range.
     *
     */
    execSelect: function() {
        var q = this.query.clone();
        var x = PageExpandUtils.computeRange(q.getLimit(), q.getOffset(), this.pageSize);

        q.setLimit(x.limit);
        q.setOffset(x.offset);

        var qe = this.createQueryExecution(q);
        var p = qe.execSelect();
        var result = p.then(function(rs) {
            var bindings = rs.getIterator().getArray();

            var end = x.subLimit ? x.subOffset + x.subLimit : bindings.length;
            var subBindings = bindings.slice(x.subOffset, end);

            var varNames = rs.getVarNames();
            var it = new IteratorArray(subBindings);
            var r = new ResultSetArrayIteratorBinding(it, varNames);

            return r;
        });

        return result;
    }
});

module.exports = QueryExecutionPageExpand;

},{"../../ext/Class":2,"../../util/collection/IteratorArray":347,"../PageExpandUtils":121,"../result_set/ResultSetArrayIteratorBinding":177,"./QueryExecutionDelegate":171}],175:[function(require,module,exports){
var Class = require('../../ext/Class');
var QueryExecution = require('./QueryExecution');
var QueryPaginator = require('../QueryPaginator');
var IteratorArray = require('../../util/collection/IteratorArray');
var ResultSetArrayIteratorBinding = require('../result_set/ResultSetArrayIteratorBinding');
var shared = require('../../util/shared');
var Promise = shared.Promise;

/**
 * Utility class to create an iterator over an array.
 *
 */
var QueryExecutionPaginate = Class.create(QueryExecution, {
    initialize: function(sparqlService, query, pageSize) {
        this.defaultPageSize = 1000;
        this.sparqlService = sparqlService;
        this.query = query;
        this.pageSize = pageSize;
        this.timeoutInMillis = null;
    },

    executeSelectRec: Promise.method(function(queryPaginator, prevResult) {
        var query = queryPaginator.next();
        //console.log('Query Pagination: ' + query);
        if (!query) {
            return prevResult;
        }

        var self = this;

        var qe = this.sparqlService.createQueryExecution(query);
        qe.setTimeout(this.timeoutInMillis);

        var result = qe.execSelect().then(function(rs) {
            if (!rs) {
                throw new Error('Null result set for query: ' + query);
            }

            // If result set size equals pageSize, request more data
            var r;
            if (!prevResult) {
                //!!! r = Promise.resolve(rs);
                r = rs;
            } else {
                // Extract the arrays that backs the result set ...
                var oldArr = prevResult.getIterator().getArray();
                var newArr = rs.getIterator().getArray();

                // ... and concatenate them
                var nextArr = oldArr.concat(newArr);

                //                    if(totalLimit) {
                //                        nextArr.splice(0, totalLimit);
                //                    }

                var itBinding = new IteratorArray(nextArr);
                //!!! r = Promise.resolve(new ResultSetArrayIteratorBinding(itBinding));
                r = new ResultSetArrayIteratorBinding(itBinding);
            }

            var rsSize = rs.getIterator().getArray().length;
            // console.debug('rsSize, PageSize: ', rsSize, self.pageSize);
            var pageSize = queryPaginator.getPageSize();

            // result size is empty or less than the pageSize or
            // limit reached
            var hasReachedEnd = rsSize === 0 || rsSize < pageSize;
            if (!hasReachedEnd) {
                r = self.executeSelectRec(queryPaginator, rs);
            }

            return r;
        });

        return result;
    }),

    execSelect: function() {
        var clone = this.query.clone();
        var pageSize = this.pageSize || QueryExecutionPaginate.defaultPageSize;
        var paginator = new QueryPaginator(clone, pageSize);

        //return Promise.method(this.executeSelectRec(paginator, null));
        return this.executeSelectRec(paginator, null);
    },

    setTimeout: function(timeoutInMillis) {
        this.timeoutInMillis = timeoutInMillis;

        if (!QueryExecutionPaginate.timeoutMsgShown) {
            console.log('[WARN] Only preliminary timeout implementation for paginated query execution.');
            QueryExecutionPaginate.timeoutMsgShown = true;
        }
    },
});

module.exports = QueryExecutionPaginate;

},{"../../ext/Class":2,"../../util/collection/IteratorArray":347,"../../util/shared":351,"../QueryPaginator":122,"../result_set/ResultSetArrayIteratorBinding":177,"./QueryExecution":169}],176:[function(require,module,exports){
var Class = require('../../ext/Class');
var Iterator = require('../../util/collection/Iterator');

/**
 * Utility class to create an iterator over an array.
 *
 */
var ResultSet = Class.create(Iterator, {
    getVarNames: function() {
        throw new Error('Override me');
    },
});

module.exports = ResultSet;

},{"../../ext/Class":2,"../../util/collection/Iterator":345}],177:[function(require,module,exports){
var Class = require('../../ext/Class');
var ResultSet = require('./ResultSet');

/**
 * Utility class to create an iterator over an array.
 *
 */
var ResultSetArrayIteratorBinding = Class.create(ResultSet, {
    initialize: function(itBinding, varNames) {
        this.itBinding = itBinding;
        this.varNames = varNames;
    },

    hasNext: function() {
        return this.itBinding.hasNext();
    },

    next: function() {
        return this.nextBinding();
    },

    nextBinding: function() {
        return this.itBinding.next();
    },

    getVarNames: function() {
        return this.varNames;
    },

    getBindings: function() {
        return this.itBinding.getArray();
    },

    // Return the binding array
    getIterator: function() {
        // return this.itBinding.getArray();
        return this.itBinding;
    },
});

module.exports = ResultSetArrayIteratorBinding;

},{"../../ext/Class":2,"./ResultSet":176}],178:[function(require,module,exports){
var Class = require('../../ext/Class');
var IteratorAbstract = require('../../util/collection/IteratorAbstract');

var ResultSetHashJoin = Class.create(IteratorAbstract, {
    // Expression must be expressed in terms of variable appearing in (the bindings of) rsA and elementB
    /**
     *
     * Example:
     *   Given the condition (?a < ?b) with ?a being provided by rsA, and elementB = {?x numberOfSeats ?b}
     *   Then the buffer will be filled with values of (?a), such as [1, 2, 3, 4, 5]...
     *   For each value in the buffer, we create an element {?x numberOfSeats ?b . Filter(?b < 1 ||  ?b < 2 || ?b < 3 ...) }
     *
     * TODO Combine serviceB and elementB into 'thingWhereWeCanLookupTuplesByBindings'
     */
    initialize: function(rsA, serviceB, elementB, expr) {
        this.rsA = rsA;
        this.serviceB = serviceB;
        this.elementB = elementB;
        this.expr = expr;

        rsA.getVarsMentioned();
        expr.getVarsMentioned();
    },

    $prefetch: function() {
        // var maxBufferSize = 20;
        // var buffer = [];

        // Fill the buffer
        // FIXME: rsA not defined
        // while (rsA.hasNext()) {
        // }

        // If either the buffer is full or there are no more bindings in rsa,
        // Execute the join
        // FIXME: rsa not defined
        // if (buffer.isFull() || !rsa.hasNext()) {
        // }
    },
});

module.exports = ResultSetHashJoin;

},{"../../ext/Class":2,"../../util/collection/IteratorAbstract":346}],179:[function(require,module,exports){
var Class = require('../../ext/Class');

var SparqlService = Class.create({
    getServiceId: function() {
        throw new Error('[ERROR] Method not overridden');
    },

    getStateHash: function() {
        throw new Error('[ERROR] Method not overridden');
    },

    createQueryExecution: function() {
        throw new Error('[ERROR] Method not overridden');
    },
});

module.exports = SparqlService;

},{"../../ext/Class":2}],180:[function(require,module,exports){
var Class = require('../../ext/Class');
var SparqlService = require('./SparqlService');

var SparqlServiceBaseString = Class.create(SparqlService, {
    /**
     * Base class for processing query strings.
     */
    createQueryExecution: function(queryStrOrObj) {
        var result;
        if (Object.toString(queryStrOrObj) === '[object String]') {
            result = this.createQueryExecutionStr(queryStrOrObj);
        } else {
            result = this.createQueryExecutionObj(queryStrOrObj);
        }

        return result;
    },

    createQueryExecutionObj: function(queryObj) {
        var queryStr = queryObj.toString();
        var result = this.createQueryExecutionStr(queryStr);

        return result;
    },

    createQueryExecutionStr: function() { // queryStr) {
        throw new Error('Not implemented');
    },
});

module.exports = SparqlServiceBaseString;

},{"../../ext/Class":2,"./SparqlService":179}],181:[function(require,module,exports){
var Class = require('../../ext/Class');
var SparqlService = require('./SparqlService');
var RequestCache = require('../RequestCache');
var QueryExecutionCache = require('../query_execution/QueryExecutionCache');

/**
 * Result Cache stores result sets - this is an instance of a class
 *
 * Execution Cache holds all running queries' promises - this is just an associative array - i.e. {}
 * Once the promises are resolved, the corresponding entries are removed from the execution cache
 *
 * TODO Its not really a cache but more a registry
 *
 */
var SparqlServiceCache = Class.create(SparqlService, {
    initialize: function(sparqlService, requestCache) { // , resultCache, executionCache) {
        this.sparqlService = sparqlService;
        this.requestCache = requestCache || new RequestCache();
    },

    getServiceId: function() {
        return this.sparqlService.getServiceId();
    },

    getStateHash: function() {
        return this.sparqlService.getStateHash();
    },

    hashCode: function() {
        return 'cached:' + this.sparqlService.hashCode();
    },

    createQueryExecution: function(query) {
        var serviceId = this.sparqlService.getServiceId();
        var stateHash = this.sparqlService.getStateHash();
        var queryStr = '' + query;

        var cacheKey = serviceId + '-' + stateHash + queryStr;

        var qe = this.sparqlService.createQueryExecution(query);

        var result = new QueryExecutionCache(qe, cacheKey, this.requestCache);

        return result;
    },
});

module.exports = SparqlServiceCache;

},{"../../ext/Class":2,"../RequestCache":123,"../query_execution/QueryExecutionCache":170,"./SparqlService":179}],182:[function(require,module,exports){
var Class = require('../../ext/Class');
var SparqlService = require('./SparqlService');

/**
 * Sparql Service wrapper that expands limit/offset in queries
 * to larger boundaries. Intended to be used in conjunction with a cache.
 *
 */
var SparqlServiceConsoleLog = Class.create(SparqlService, {
    initialize: function(sparqlService) {
        this.sparqlService = sparqlService;
    },

    getServiceId: function() {
        return this.sparqlService.getServiceId();
    },
    
    getStateHash: function() {
        return this.sparqlService.getStateHash();
    },

    hashCode: function() {
        return 'console-log:' + this.sparqlService.hashCode();
    },

    createQueryExecution: function(query) {
        console.log('SparqlServiceConsoleLog saw query: ' + query);
        var result = this.sparqlService.createQueryExecution(query);
        return result;
    }
});

module.exports = SparqlServiceConsoleLog;

},{"../../ext/Class":2,"./SparqlService":179}],183:[function(require,module,exports){
var Class = require('../../ext/Class');

var SparqlServiceFactory = Class.create({
    createSparqlService: function() {
        throw new Error('Not overridden');
    },
});

module.exports = SparqlServiceFactory;

},{"../../ext/Class":2}],184:[function(require,module,exports){
var Class = require('../../ext/Class');

var SparqlServiceFactoryConst = Class.create({
    initialize: function(sparqlService) {
        this.sparqlService = sparqlService;
    },

    createSparqlService: function() {
        var result = this.sparqlService;

        if (result == null) {
            throw new Error('[ERROR] Creation of a SPARQL service requested, but none was provided');
        }

        return result;
    },

    setSparqlService: function(sparqlService) {
        this.sparqlService = sparqlService;
    },
});

module.exports = SparqlServiceFactoryConst;

},{"../../ext/Class":2}],185:[function(require,module,exports){
var Class = require('../../ext/Class');
var SparqlServiceHttp = require('./SparqlServiceHttp');
var SparqlServiceCache = require('./SparqlServiceCache');

var SparqlServiceFactoryDefault = Class.create({
    initialize: function() {
        this.hashToCache = {};
    },

    createSparqlService: function(sparqlServiceIri, defaultGraphIris) {
        var tmp = new SparqlServiceHttp(sparqlServiceIri, defaultGraphIris);
        tmp = new SparqlServiceCache(tmp);

        var hash = tmp.getStateHash();

        var cacheEntry = this.hashToCache[hash];

        var result;
        if (cacheEntry) {
            result = cacheEntry;
        } else {
            this.hashToCache[hash] = tmp;
            result = tmp;
        }

        return result;
    },
});

module.exports = SparqlServiceFactoryDefault;

},{"../../ext/Class":2,"./SparqlServiceCache":181,"./SparqlServiceHttp":187}],186:[function(require,module,exports){
var Class = require('../../ext/Class');
var SparqlService = require('./SparqlService');
var QueryExecutionFailover = require('../query_execution/QueryExecutionFailover');

/**
 *
 */
var SparqlServiceFailover = Class.create(SparqlService, {
    initialize: function(sparqlServices) {
        this.sparqlServices = sparqlServices;
    },

    getServiceId: function() {
        return this.sparqlService.getServiceId();
    },

    getStateHash: function() {
        return this.sparqlService.getStateHash();
    },

    hashCode: function() {
        return 'failover:' + this.sparqlService.hashCode();
    },

    createQueryExecution: function(query) {
        return new QueryExecutionFailover(this.sparqlServices);
    },

});

module.exports = SparqlServiceFailover;

},{"../../ext/Class":2,"../query_execution/QueryExecutionFailover":172,"./SparqlService":179}],187:[function(require,module,exports){
var Class = require('../../ext/Class');
var defaults = require('lodash.defaults');
var SparqlServiceBaseString = require('./SparqlServiceBaseString');
var QueryExecutionHttp = require('../query_execution/QueryExecutionHttp');
var JSONCanonical = require('../../ext/JSONCanonical');

var SparqlServiceHttp = Class.create(SparqlServiceBaseString, {
    initialize: function(serviceUri, defaultGraphUris, ajaxOptions, httpArgs) {
        this.serviceUri = serviceUri;
        this.defaultGraphUris = defaultGraphUris;
        // this.setDefaultGraphs(defaultGraphUris);

        this.ajaxOptions = ajaxOptions;
        this.httpArgs = httpArgs;
    },

    getServiceId: function() {
        return this.serviceUri;
    },

    /**
     * This method is intended to be used by caches,
     *
     * A service is not assumed to return the same result for
     * a query if this method returned different hashes.
     *
     * The state hash does not include the serviceId
     *
     */
    getStateHash: function() {
        var result = JSONCanonical.stringify(this.defaultGraphUris);
        result += JSONCanonical.stringify(this.httpArgs);
        return result;
    },

    hashCode: function() {
        return this.getServiceId() + '/' + this.getStateHash();
    },

    setDefaultGraphs: function(uriStrs) {
        this.defaultGraphUris = uriStrs; // ? uriStrs : [];
    },

    getDefaultGraphs: function() {
        return this.defaultGraphUris;
    },

    createQueryExecutionStr: function(queryStr) {
        var ajaxOptions = defaults({}, this.ajaxOptions);

        var result = new QueryExecutionHttp(queryStr, this.serviceUri, this.defaultGraphUris, ajaxOptions, this.httpArgs);
        return result;
    },

    createQueryExecutionObj: function($super, query) {
        if (true) {
            if (query.flatten) {
                var before = query;
                query = before.flatten();
            }
        }

        var result = $super(query);
        return result;
    },
});

module.exports = SparqlServiceHttp;

},{"../../ext/Class":2,"../../ext/JSONCanonical":3,"../query_execution/QueryExecutionHttp":173,"./SparqlServiceBaseString":180,"lodash.defaults":358}],188:[function(require,module,exports){
var Class = require('../../ext/Class');

var SparqlService = require('./SparqlService');

/**
 *
 */
var SparqlServiceLimit = Class.create(SparqlService, {
    initialize: function(sparqlService, maxLimit) {
        this.sparqlService = sparqlService;
        this.maxLimit = maxLimit;
    },

    getServiceId: function() {
        return this.sparqlService.getServiceId();
    },

    getStateHash: function() {
        return this.sparqlService.getStateHash();
    },

    hashCode: function() {
        return 'maxLimit:' + this.sparqlService.hashCode();
    },

    createQueryExecution: function(query) {
        var limit = query.getLimit();

        if(limit == null || limit > this.maxLimit) {
            query = query.clone();
            query.setLimit(this.maxLimit);
        }

        var result = this.sparqlService.createQueryExecution(query);
        return result;
    },

});

module.exports = SparqlServiceLimit;

},{"../../ext/Class":2,"./SparqlService":179}],189:[function(require,module,exports){
var Class = require('../../ext/Class');
var QueryExecutionPageExpand = require('../query_execution/QueryExecutionPageExpand');
var SparqlService = require('./SparqlService');

/**
 * Sparql Service wrapper that expands limit/offset in queries
 * to larger boundaries. Intended to be used in conjunction with a cache.
 *
 */
var SparqlServicePageExpand = Class.create(SparqlService, {
    initialize: function(sparqlService, pageSize) {
        this.sparqlService = sparqlService;
        this.pageSize = pageSize;
    },

    getServiceId: function() {
        return this.sparqlService.getServiceId();
    },
    
    getStateHash: function() {
        return this.sparqlService.getStateHash();
    },

    hashCode: function() {
        return 'page-expand:' + this.sparqlService.hashCode();
    },

    createQueryExecution: function(query) {
        var result = new QueryExecutionPageExpand(this.sparqlService, query, this.pageSize);
        return result;
    }
});

module.exports = SparqlServicePageExpand;

},{"../../ext/Class":2,"../query_execution/QueryExecutionPageExpand":174,"./SparqlService":179}],190:[function(require,module,exports){
var Class = require('../../ext/Class');
var SparqlService = require('./SparqlService');
var QueryExecutionPaginate = require('../query_execution/QueryExecutionPaginate');

/**
 * Utility class to create an iterator over an array.
 *
 */
var SparqlServicePaginate = Class.create(SparqlService, {
    initialize: function(sparqlService, pageSize) {
        this.defaultPageSize = 1000;
        this.sparqlService = sparqlService;
        this.pageSize = pageSize;
    },

    getServiceId: function() {
        return this.sparqlService.getServiceId();
    },

    getStateHash: function() {
        return this.sparqlService.getStateHash();
    },

    hashCode: function() {
        return 'paginate:' + this.sparqlService.hashCode();
    },

    createQueryExecution: function(query) {
        var result = new QueryExecutionPaginate(this.sparqlService, query, this.pageSize);
        return result;
    },
});

module.exports = SparqlServicePaginate;

},{"../../ext/Class":2,"../query_execution/QueryExecutionPaginate":175,"./SparqlService":179}],191:[function(require,module,exports){
var Class = require('../../ext/Class');
var SparqlService = require('./SparqlService');

var ElementGroup = require('../../sparql/element/ElementGroup');


/**
 * This function attempts to divide a query's graph pattern into
 * a 'core' graph pattern which should be selective, and a set of filters which
 * are non-selective.
 * The intent is to be able to limit the set of resources before applying non-
 * selective filters.
 *
 * Original:
 * {
 *     ?x ?y ?z .
 *     Filter(regex(?x, 'foo').
 *     Filter(?Bar = 'baz');
 * }
 *
 * Transformed:
 *
 * {
 *   { Select * {
 *    ?x ?y ?z
 *    Filter(?Bar = 'baz');
 *   } Limit 100000
 *   Filter(regex(?x, 'foo'). // unreliable filters moved outside
 * }
 *
 */
var SparqlServiceReliableLimit = Class.create({
    initialize: function(delegate) {

    },

    createQueryExecution: function(query) {

    },

    applyTransform: function(query) {
        var e = query.getQueryPattern();

        if(e instanceof ElementGroup) {
            var elements = e.getArgs();

            var r = []; // reliable filters
            var u = []; // unreliable filters
            // optionals

            elements.forEach(function() {

            });


        }

    }
});

module.exports = SparqlServiceReliableLimit;

},{"../../ext/Class":2,"../../sparql/element/ElementGroup":233,"./SparqlService":179}],192:[function(require,module,exports){
var Class = require('../../ext/Class');
var SparqlService = require('./SparqlService');
var ExprAggregator = require('../../sparql/expr/ExprAggregator');
var Query = require('../../sparql/Query');
var ElementSubQuery = require('../../sparql/element/ElementSubQuery');

/**
 * Transforms query using sorting with limit/offset
 *
 * Select { ... } Order By {sortConditions} Limit {limit} Offset {offset} ->
 *
 * Select * { { Select { ... } Order By {sortConditions} } } Limit {limit} Offset {offset}
 *
 * Warning: This transformation may not work cross-database:
 * Database management systems may discard ordering on sub queries (which is SQL compliant). 
 *
 */
var SparqlServiceVirtFix = Class.create(SparqlService, {
    initialize: function(sparqlService) {
        this.sparqlService = sparqlService;
    },

    getServiceId: function() {
        return this.sparqlService.getServiceId();
    },
    
    getStateHash: function() {
        return this.sparqlService.getStateHash();
    },

    hashCode: function() {
        return 'virtfix:' + this.sparqlService.hashCode();
    },

//    hasAggregate: function(query) {
//        var entries = query.getProject().entries();
//        
//        var result = entries.some(function(entry) {
//            var expr = entry.expr;
//            if(expr instanceof ExprAggregator) { // TODO At some point allow: if query.getAggregators().length > 0
//                return true;
//            }
//        });
//        
//        return result;
//    },

    createQueryExecution: function(query) {

        var orderBy = query.getOrderBy();
        var limit = query.getLimit();
        var offset = query.getOffset();

        // 2014-08-13 This query failed on http://dbpedia.org/sparql Select * { ?s ?p ?o } Offset 1
        // with Virtuoso 22023 Error SR350: TOP parameter < 0
        // We add an extra high limit to the query
        var isLimitUpdateNeeded = offset != null && limit == null;
        var hasAggregate = query.getAggregators().length > 0; //this.hasAggregate(query);
        var isTransformNeeded = orderBy.length > 0 && (limit || offset) || hasAggregate;

        var isCloneNeeded = isLimitUpdateNeeded || isTransformNeeded;

        var q = isCloneNeeded ? query.clone() : query;

        if(isLimitUpdateNeeded) {
            limit = 2000000000;
            q.setLimit(limit);
        }

        if(isTransformNeeded) {
            var subQuery = q;
            subQuery.setLimit(null);
            subQuery.setOffset(null);
            
            var e = new ElementSubQuery(subQuery);

            q = new Query();
            q.setQueryPattern(e);            
            q.setLimit(limit);
            q.setOffset(offset);
            q.setQueryResultStar(true);                
        }

        var result = this.sparqlService.createQueryExecution(q);
        return result;
    },

});

module.exports = SparqlServiceVirtFix;

},{"../../ext/Class":2,"../../sparql/Query":218,"../../sparql/element/ElementSubQuery":236,"../../sparql/expr/ExprAggregator":261,"./SparqlService":179}],193:[function(require,module,exports){
var Class = require('../../ext/Class');

var TableService = Class.create({
    /**
     * Expected to return an object:
     *
     * {
     *    columns: [{id: 's', tags: your data}, {id: 'p'}]
     *    tags: your data
     * }
     */
    fetchSchema: function() {
        throw new Error('Override me');
    },

    /**
     * Expected to return a promise which yields a countInfo for the number of rows
     * (up to rowLimit)
     */
    fetchCount: function(rowLimit) {
        throw new Error('Override me');
    },

    /**
     * Expected to return a promise which yields an array of objects (maps) from field name to field data
     */
    fetchData: function(limit, offset) {
        throw new Error('Override me');
    },
});

module.exports = TableService;

},{"../../ext/Class":2}],194:[function(require,module,exports){
var Class = require('../../ext/Class');
var TableService = require('./TableService');

var TableServiceDelegateBase = Class.create(TableService, {
    initialize: function(delegate) {
        this.delegate = delegate;
    },

    fetchSchema: function() {
        var result = this.delegate.fetchSchema();
        return result;
    },

    /**
     * Expected to return a promise which yields an integral value for the total number of rows
     */
    fetchCount: function() {
        var result = this.delegate.fetchCount();
        return result;
    },

    /**
     * Expected to return a promise which yields an array of objects (maps) from field name to field data
     */
    fetchData: function() {
        var result = this.delegate.fetchData();
        return result;
    },
});

module.exports = TableServiceDelegateBase;

},{"../../ext/Class":2,"./TableService":193}],195:[function(require,module,exports){
var Class = require('../../ext/Class');
var TableServiceNodeLabels = require('./TableServiceNodeLabels');
var TableServiceUtils = require('../TableServiceUtils');

/***
 * A table service, that decorates the schema of the underlying table service
 * with column headings based on the corresponding facet path
 */
var TableServiceFacet = Class.create(TableServiceNodeLabels, {

    // ns.TableServiceFacet = Class.create(ns.TableService, {
    initialize: function($super, tableServiceQuery, tableConfigFacet, lookupServiceNodeLabels, lookupServicePathLabels) {
        $super(tableServiceQuery, lookupServiceNodeLabels);
        // this.tableServiceQuery = tableServiceQuery;
        this.tableConfigFacet = tableConfigFacet;
        // this.lookupServiceNodeLabels = lookupServiceNodeLabels;
        this.lookupServicePathLabels = lookupServicePathLabels;
    },

    fetchSchema: function() {
        // Ignores the schema of the underlying table Service
        var result = TableServiceUtils.fetchSchemaTableConfigFacet(this.tableConfigFacet, this.lookupServicePathLabels);
        return result;
    },
});

module.exports = TableServiceFacet;

},{"../../ext/Class":2,"../TableServiceUtils":128,"./TableServiceNodeLabels":197}],196:[function(require,module,exports){
var Class = require('../../ext/Class');

/**
 *
 *
 */
var TableServiceListService = Class.create({
    initialize: function(listService) {
        this.listService = listService;
    },

    fetchCount: function(itemLimit, rowLimit) {
        this.listService.fetchCount(null, itemLimit, rowLimit);
    },

    fetchData: function() {

    },



});

module.exports = TableServiceListService;

},{"../../ext/Class":2}],197:[function(require,module,exports){
var Class = require('../../ext/Class');
var TableServiceDelegateBase = require('./TableServiceDelegateBase');
var TableServiceUtils = require('../TableServiceUtils');

var TableServiceNodeLabels = Class.create(TableServiceDelegateBase, {
    initialize: function($super, delegate, lookupServiceNodeLabels) {
        $super(delegate);
        this.lookupServiceNodeLabels = lookupServiceNodeLabels;
    },

    fetchData: function(limit, offset) {
        var promise = this.delegate.fetchData(limit, offset);

        var self = this;
        var result = promise.then(function(rows) {
            var r = TableServiceUtils.transformToNodeLabels(self.lookupServiceNodeLabels, rows);
            return r;
        });

        return result;
    },
});

module.exports = TableServiceNodeLabels;

},{"../../ext/Class":2,"../TableServiceUtils":128,"./TableServiceDelegateBase":194}],198:[function(require,module,exports){
var Class = require('../../ext/Class');
var TableService = require('./TableService');
var TableServiceUtils = require('../TableServiceUtils');
var shared = require('../../util/shared');
var Promise = shared.Promise;

var TableServiceQuery = Class.create(TableService, {
    /**
     * TODO Possibly add primaryCountLimit - i.e. a limit that is never counted beyond, even if the backend might be fast enough
     */
    initialize: function(sparqlService, query, timeoutInMillis, secondaryCountLimit) {
        this.sparqlService = sparqlService;
        this.query = query;
        this.timeoutInMillis = timeoutInMillis || 3000;
        this.secondaryCountLimit = secondaryCountLimit || 1000;
    },

    fetchSchema: function() {
        var schema = {
            colDefs: TableServiceUtils.createNgGridOptionsFromQuery(this.query),
        };

        return new Promise(function(resolve) {
            resolve(schema);
        });
    },

    fetchCount: function() {
        var result = TableServiceUtils.fetchCount(this.sparqlService, this.query, this.timeoutInMillis, this.secondaryCountLimit);
        return result;
    },

    fetchData: function(limit, offset) {
        var result = TableServiceUtils.fetchData(this.sparqlService, this.query, limit, offset);
        return result;
    },
});

module.exports = TableServiceQuery;

},{"../../ext/Class":2,"../../util/shared":351,"../TableServiceUtils":128,"./TableService":193}],199:[function(require,module,exports){
var Class = require('../ext/Class');

var rdfs = require('../vocab/rdfs');
var VarUtils = require('./VarUtils');

var BestLabelConfig = Class.create({
    initialize: function(langs, predicates, objectVar, subjectVar, predicateVar) {
        this.langs = langs || ['en', ''];
        this.predicates = predicates || [rdfs.label];
        this.subjectVar = subjectVar || VarUtils.x;
        this.predicateVar = predicateVar || VarUtils.y;
        this.objectVar = objectVar || VarUtils.z;
    },

    getLangs: function() {
        return this.langs;
    },

    getPredicates: function() {
        return this.predicates;
    },

    getSubjectVar: function() {
        return this.subjectVar;
    },
    
    getPredicateVar: function() {
        return this.predicateVar;
    },

    getObjectVar: function() {
        return this.objectVar;
    },
    
    toString: function() {
        var result = ['BestLabelConfig', this.langs, this.predicates, this.subjectVar, this.predicateVar, this.objectVar].join(', ');
        return result;
    }
});

module.exports = BestLabelConfig;


},{"../ext/Class":2,"../vocab/rdfs":355,"./VarUtils":227}],200:[function(require,module,exports){
var NodeFactory = require('../rdf/NodeFactory');
var Var = require('../rdf/node/Var');

/**
 * A binding is a map from variables to entries.
 * An entry is a on object {v: sparql.Var, node: sparql.Node }
 *
 * The main speciality of this object is that
 * .entries() returns a *sorted* array of variable bindings (sorted by the variable name).
 *  .toString() re-uses the ordering.
 *
 * This means, that two bindings are equal if their strings are equal.
 *
 * TODO We could generalize this behaviour into some 'base class'.
 *
 *
 */
var Binding = function(varNameToEntry) {
    this.varNameToEntry = varNameToEntry ? varNameToEntry : {};
};

/**
 * Create method in case the variables are not objects
 *
 * TODO Replace with an ordinary hashMap.
 */
Binding.create = function(varNameToNode) {

    var tmp = {};
    for (var vStr in varNameToNode) {
        var node = varNameToNode[vStr];
        tmp[vStr] = {
            v: NodeFactory.createVar(vStr),
            node: node,
        };
    }

    var result = new Binding(tmp);
    return result;
};

Binding.fromTalisJson = function(b) {

    var tmp = {};
    for (var k in b) {
        var val = b[k];
        // var v = rdf.Node.v(k);
        var node = NodeFactory.createFromTalisRdfJson(val);
        tmp[k] = node;
    }

    var result = Binding.create(tmp);

    return result;
};

Binding.prototype = {
    put: function(v, node) {
        this.varNameToEntry[v.getName()] = {
            v: v,
            node: node,
        };
    },

    get: function(v) {
        if (!(v instanceof Var)) {
            throw new Error('var not an instance of Var');
        }
        var varName = v.getName();

        var entry = this.varNameToEntry[varName];

        var result = entry ? entry.node : null;

        return result;
    },

    entries: function() {
        var tmp = [];
        for (var k in this.varNameToEntry) {
            var val = this.varNameToEntry[k];
            tmp.push(val);
        }
        var result = tmp.sort(function(entry1, entry2) {
            return entry1.v.getName() > entry2.v.getName() ? 1 : -1;
        });
        return result;
    },

    toString: function() {
        var e = this.entries();

        // var result = "[" + e.join()

        var tmp = e.map(function(item) {
            return '"' + item.v.getName() + '": "' + item.node + '"';
        });

        var result = '{' + tmp.join(', ') + '}';

        return result;
    },

    getVars: function() {
        var result = [];

        for (var k in this.varNameToEntry) {
            var entry = this.varNameToEntry[k];
            result.push(entry.v);
        }

        return result;
    },
};

module.exports = Binding;

},{"../rdf/NodeFactory":91,"../rdf/node/Var":110}],201:[function(require,module,exports){
var xsd = require('../vocab/xsd');
var NodeFactory = require('../rdf/NodeFactory');
var Binding = require('./Binding');

var BindingUtils = {

    cloneBinding: function(binding) {
        var result = new Binding();
        var entries = binding.entries();
        entries.forEach(function(entry) {
            // TODO Replace with entry.key and entry.val
            result.put(entry.v, entry.node);
        });

        return result;
    },

    cloneBindings: function(bindings) {
        var result = bindings.map(function(binding) {
            var r = BindingUtils.cloneBinding(binding);
            return r;
        });

        return result;
    },

    /**
     * In place-addition of an 'index' mapping.
     *
     * @param bindings
     * @param v
     * @param offset
     * @returns
     */
    addRowIds: function(bindings, v, offset) {
        offset = offset || 0;

        bindings.forEach(function(binding, index) {
            var i = offset + index;
            var node = NodeFactory.createTypedLiteralFromString('' + i, xsd.xinteger);
            binding.put(v, node);
        });

        return bindings;
    },
};

module.exports = BindingUtils;

},{"../rdf/NodeFactory":91,"../vocab/xsd":357,"./Binding":200}],202:[function(require,module,exports){
var rdf = require('../vocab/rdf');
var owl = require('../vocab/owl');

var Triple = require('../rdf/Triple');

var ElementTriplesBlock = require('../sparql/element/ElementTriplesBlock');
var ElementFilter = require('../sparql/element/ElementFilter');
var ElementGroup = require('../sparql/element/ElementGroup');
var E_LogicalOr = require('../sparql/expr/E_LogicalOr');
var E_Equals = require('../sparql/expr/E_Equals');
var ExprVar = require('../sparql/expr/ExprVar');

var Concept = require('../sparql/Concept');

var NodeValueUtils = require('../sparql/NodeValueUtils');
var VarUtils = require('../sparql/VarUtils');

var CannedConceptUtils = {

    /**
     * Parser.parseGraphPattern(
     * {
     *   ?s a ?o .
     *   Filter(?o = rdf:Property || ?o = owl:DatatypeProperty || ?o = owl:ObjectProperty || ?o = owl:AnnotationProperty)
     *   # Alternative:
     *   Filter(?o In (rdf:Property, owl:DatatypeProperty, owl:ObjectProperty, owl:AnnotationProperty))
     * }
     *
     */
    createConceptDeclaredProperties: function(s, o) {
        s = s || VarUtils.s;
        o = o || VarUtils.o;

        var eo = new ExprVar(o);

        var rdfProperty = NodeValueUtils.makeNode(rdf.Property);
        var owlDatatypeProperty = NodeValueUtils.makeNode(owl.DatatypeProperty);
        var owlObjectProperty = NodeValueUtils.makeNode(owl.ObjectProperty);
        var owlAnnotationProperty = NodeValueUtils.makeNode(owl.AnnotationProperty);

        var result = new Concept(
            new ElementGroup([
                new ElementTriplesBlock([new Triple(s, rdf.type, o)]),
                new ElementFilter(
                    new E_LogicalOr(
                        new E_Equals(eo, rdfProperty),
                        new E_LogicalOr(
                            new E_Equals(eo, owlDatatypeProperty),
                            new E_LogicalOr(
                                new E_Equals(eo, owlObjectProperty),
                                new E_Equals(eo, owlAnnotationProperty)
                            )
                        )
                    )
                )
            ]),
            s);

        return result;
    }

    // TODO We need to integrate the rdfstore js parser, so we can do Concept.parse();
//    createConceptDeclaredProperties: function() {
//
//        var types = [rdf.Property, owl.AnnotationProperty, owl.DatatypeProperty, owl.ObjectProperty];
//
//        var o = VarUtils.o;
//        var exprVar = new ExprVar(o);
//        var typeExprs = _(types).map(function(node) {
//            var nodeValue = NodeValue.makeNode(node);
//            var expr = new E_Equals(exprVar, nodeValue);
//        return expr;
//
//
//        var filterExpr = ExprUtils.orify(typeExprs);
//
//        triple = new Triple(propertyVar, vocab.rdf.type, v);
//
//        var element = new ElementGroup([
//            new ElementTriplesBlock([triple]),
//            new ElementFilter(filterExpr)
//        ]);
//
//        //console.log('ELEMENTE' + element);
//
//        facetElements.push(element);
//
//    },


};


module.exports = CannedConceptUtils;

},{"../rdf/Triple":94,"../sparql/Concept":203,"../sparql/NodeValueUtils":216,"../sparql/VarUtils":227,"../sparql/element/ElementFilter":232,"../sparql/element/ElementGroup":233,"../sparql/element/ElementTriplesBlock":237,"../sparql/expr/E_Equals":246,"../sparql/expr/E_LogicalOr":255,"../sparql/expr/ExprVar":269,"../vocab/owl":353,"../vocab/rdf":354}],203:[function(require,module,exports){
var Class = require('../ext/Class');

var ElementUtils = require('./ElementUtils');
var ElementGroup = require('./element/ElementGroup');
var ElementTriplesBlock = require('./element/ElementTriplesBlock');


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

//    combineWith: function(that) {
//        var result = ConceptUtils.createCombinedConcept(this, that);
//        return result;
//    },

    createOptimizedConcept: function() {
        var element = this.getElement();
        var newElement = element.flatten();

  // FIXME: ConceptInt class is not defined
        var result = new Concept(newElement, this.variable);

        return result;
    },

//    asQuery: function(limit, offset) {
//        var result = ConceptUtils.createQueryList(this, limit, offset);
//        return result;
//    },

    
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

},{"../ext/Class":2,"./ElementUtils":207,"./element/ElementGroup":233,"./element/ElementTriplesBlock":237}],204:[function(require,module,exports){
var Node = require('../rdf/node/Node');
var NodeFactory = require('../rdf/NodeFactory');
var Triple = require('../rdf/Triple');

var HashMap = require('../util/collection/HashMap');

var rdf = require('./../vocab/rdf');

var VarUtils = require('./VarUtils');

var ElementUtils = require('./ElementUtils');

var ExprAggregator = require('./expr/ExprAggregator');
var AggCount = require('./agg/AggCount');

var ExprVar = require('./expr/ExprVar');
var E_Equals = require('./expr/E_Equals');

var ElementTriplesBlock = require('./element/ElementTriplesBlock');
var ElementOptional = require('./element/ElementOptional');
var ElementSubQuery = require('./element/ElementSubQuery');
var ElementGroup = require('./element/ElementGroup');
var ElementFilter = require('./element/ElementFilter');

var QueryUtils = require('./QueryUtils');
var NodeValueUtils = require('./NodeValueUtils');

var Query = require('./Query');

var Concept = require('./Concept');

/**
 * Combines the elements of two concepts, yielding a new concept.
 * The new concept used the variable of the second argument.
 *
 */
var ConceptUtils = {

    createVarMap: function(attrConcept, filterConcept) {
        var attrElement = attrConcept.getElement();
        var filterElement = filterConcept.getElement();

        var attrVar = attrConcept.getVar();

        var attrVars = attrElement.getVarsMentioned();
        var filterVars = filterElement.getVarsMentioned();

        var attrJoinVars = [attrConcept.getVar()];
        var filterJoinVars = [filterConcept.getVar()];

        var result = ElementUtils.createJoinVarMap(attrVars, filterVars, attrJoinVars, filterJoinVars); //, varNameGenerator);

        return result;
    },

    createRenamedConcept: function(attrConcept, filterConcept) {

        var varMap = this.createVarMap(attrConcept, filterConcept);

        var attrVar = attrConcept.getVar();
        var filterElement = filterConcept.getElement();
        var newFilterElement = ElementUtils.createRenamedElement(filterElement, varMap);

        var result = new Concept(newFilterElement, attrVar);

        return result;
    },

    renameVars: function(concept, varMap) {
        var fnSubst = VarUtils.fnSubst(varMap);

        var newVar = fnSubst(concept.getVar());
        var newElement = concept.getElement().copySubstitute(fnSubst);

        var result = new Concept(newElement, newVar);
        return result;

    },


    /**
     * Combines two concepts into a new one. Thereby, one concept plays the role of the attribute concepts whose variable names are left untouched,
     * The other concept plays the role of the 'filter' which limits the former concept to certain items.
     *
     *
     */
    createCombinedConcept: function(attrConcept, filterConcept, renameVars, attrsOptional, filterAsSubquery) {
        // TODO Is it ok to rename vars here? // TODO The variables of baseConcept and tmpConcept must match!!!
        // Right now we just assume that.
        var attrVar = attrConcept.getVar();
        var filterVar = filterConcept.getVar();

        if(!filterVar.equals(attrVar)) {
            var varMap = new HashMap();
            varMap.put(filterVar, attrVar);
            filterConcept = this.renameVars(filterConcept, varMap);
        }

        var tmpConcept;
        if(renameVars) {
            tmpConcept = this.createRenamedConcept(attrConcept, filterConcept);
        } else {
            tmpConcept = filterConcept;
        }


        var tmpElements = tmpConcept.getElements();


        // Small workaround (hack) with constraints on empty paths:
        // In this case, the tmpConcept only provides filters but
        // no triples, so we have to include the base concept
        //var hasTriplesTmp = tmpConcept.hasTriples();
        //hasTriplesTmp &&
        var attrElement = attrConcept.getElement();

        var e;
        if(tmpElements.length > 0) {

            if(tmpConcept.isSubjectConcept()) {
                e = attrConcept.getElement(); //tmpConcept.getElement();
            } else {

                var newElements = [];

                if(attrsOptional) {
                    attrElement = new ElementOptional(attrConcept.getElement());
                }
                newElements.push(attrElement);

                if(filterAsSubquery) {
                    tmpElements = [new ElementSubQuery(tmpConcept.asQuery())];
                }


                //newElements.push.apply(newElements, attrElement);
                newElements.push.apply(newElements, tmpElements);


                e = new ElementGroup(newElements);
                e = e.flatten();
            }
        } else {
            e = attrElement;
        }

        var concept = new Concept(e, attrVar);

        return concept;
    },

    createSubjectConcept: function(s, p, o) {

        //var s = sparql.Node.v("s");
        s = s || VarUtils.s;
        p = p || VarUtils._p_;
        o = o || VarUtils._o_;

        var conceptElement = new ElementTriplesBlock([new Triple(s, p, o)]);

        //pathManager = new facets.PathManager(s.value);

        var result = new Concept(conceptElement, s);

        return result;
    },

    /**
     *
     * @param typeUri A jassa.rdf.Node or string denoting the URI of a type
     * @param subjectVar Optional; variable of the concept, specified either as string or subclass of jassa.rdf.Node
     */
    createTypeConcept: function(typeUri, subjectVar) {
        var type = typeUri instanceof Node ? typeUri : NodeFactory.createUri(typeUri);
        var vs = !subjectVar ? NodeFactory.createVar('s') :
            (subjectVar instanceof Node ? subjectVar : NodeFactory.createVar(subjectVar));

        var result = new Concept(new ElementTriplesBlock([new Triple(vs, rdf.type, type)]), vs);
        return result;
    },

    /**
     * Creates a query based on the concept
     * TODO: Maybe this should be part of a static util class?
     */
    createQueryList: function(concept, limit, offset) {
//        var element = concept.getElement();
//        if(element instanceof ElementOptional) {
//            element = element.getOptionalElement();
//        }

        var result = new Query();
        result.setDistinct(true);

        result.setLimit(limit);
        result.setOffset(offset);

        result.getProject().add(concept.getVar());
        result.setQueryPattern(concept.getElement());

        return result;
    },

    freshVar: function(concept, baseVarName) {
        baseVarName = baseVarName || 'c';

        var varsMentioned = concept.getVarsMentioned();

        var varGen = VarUtils.createVarGen(baseVarName, varsMentioned);
        var result = varGen.next();

        return result;
    },

    // Util for cerateQueryCount
    wrapAsSubQuery: function(query, v) {
        var esq = new ElementSubQuery(query);

        var result = new Query();
        result.setQuerySelectType();
        result.getProject().add(v);
        result.setQueryPattern(esq);

        return result;
    },

    createQueryCount: function(concept, outputVar, itemLimit, rowLimit) {
        var subQuery = this.createQueryList(concept);

        if(rowLimit != null) {
            subQuery.setDistinct(false);
            subQuery.setLimit(rowLimit);

            subQuery = this.wrapAsSubQuery(subQuery, concept.getVar());
            subQuery.setDistinct(true);
        }

        if(itemLimit != null) {
            subQuery.setLimit(itemLimit);
        }

        var esq = new ElementSubQuery(subQuery);

        var result = new Query();
        result.setQuerySelectType();
        result.getProject().add(outputVar, new ExprAggregator(null, new AggCount()));//new ExprAggregator(concept.getVar(), new AggCount()));
        result.setQueryPattern(esq);

        return result;
    },



    /**
     * Create a query to check the 'raw-size' of the concept for one of its values -i.e. the number of non-distinct occurrences
     *
     * Select ?s (Count(*) As ?countVar) {
     *   Select ?s {
     *       conceptElement
     *       Filter(?s = valueOfNode)
     *   } Limit rowLimit
     * }
     *
     * if the rowLimit is omitted, this becomes
     *
     * Select ?s (Count(*) As ?countVar) {
     *       conceptElement
     *       Filter(?s = valueOfNode)
     * }
     *
     */
    createQueryRawSize: function(concept, sourceValue, countVar, rowLimit) {
        var s = concept.getVar();
        var baseElement = concept.getElement();

        var es = new ExprVar(s);
        var nv = NodeValueUtils.makeNode(sourceValue);
        var filter = new ElementFilter(new E_Equals(es, nv));

        var subElement = (new ElementGroup([baseElement, filter])).flatten();

        if(rowLimit != null) {
            var subQuery = new Query();
            subQuery.setQuerySelectType();
            subQuery.getProject().add(s);
            //subQuery.getProject.add(o);
            subQuery.setQueryPattern(subElement);
            subQuery.setLimit(rowLimit);

            subElement = new ElementSubQuery(subQuery);
        }

        var result = new Query();
        result.setQuerySelectType();
        result.getProject().add(s);
        result.getProject().add(countVar, new ExprAggregator(null, new AggCount()));
        result.setQueryPattern(subElement);
        result.getGroupBy().push(es);

        return result;
    },
/*
Concrete example for above:

Select ?p (Count(*) As ?c) {
  { Select ?p {
    ?s ?p ?o .
    Filter(?p = rdf:type)
  } Limit 1000 }
} Group By ?p

without rowLimit:

Select ?p (Count(*) As ?c) {
  ?s ?p ?o .
  Filter(?p = rdf:type)
} Group By ?p


 */

    isGroupedOnlyByVar: function(query, groupVar) {
        var result = false;

        var hasOneGroup = query.getGroupBy().length === 1;
        if(hasOneGroup) {
            var expr = query.getGroupBy()[0];
            if(expr instanceof ExprVar) {
                var v = expr.asVar();

                result = v.equals(groupVar);
            }
        }

        return result;
    },

    isDistinctConceptVar: function(query, conceptVar) {
        var isDistinct = query.isDistinct();

        var projectVars = query.getProjectVars();

        var hasSingleVar = !query.isQueryResultStar() && projectVars && projectVars.length === 1;
        var result = isDistinct && hasSingleVar && projectVars[0].equals(conceptVar);
        return result;
    },


    /**
     * Checks whether the query's projection is distinct (either by an explicit distinct or an group by)
     * and only has a single
     * variable matching a requested one
     *
     */
    isConceptQuery: function(query, conceptVar) {
        var isDistinctGroupByVar = this.isGroupedOnlyByVar(query, conceptVar);
        var isDistinctConceptVar = this.isDistinctConceptVar(query, conceptVar);

        var result = isDistinctGroupByVar || isDistinctConceptVar;
        return result;
    },

    /**
     * Filters a variable of a given query against a given concept
     *
     * If there is a grouping on the attrVar, e.g.
     * Select ?s Count(Distinct ?x) { ... }
     *
     *
     * @param attrQuery
     * @param attrVar
     * @param isLeftJoin
     * @param filterConcept
     * @param limit
     * @param offset
     * @returns
     */
    /*
    createAttrQuery: function(attrQuery, attrVar, isLeftJoin, filterConcept, limit, offset) {
        var result = isLeftJoin
            ? this.createAttrQueryLeftJoin(attrQuery, attrVar, filterConcept, limit, offset)
            : this.createAttrQueryJoin(attrQuery, attrVar, filterConcept, limit, offset);

        return result;
    },

    createAttrQueryLeftJoin: function(attrQuery, attrVar, filterConcept, limit, offset) {
        throw new Error('Not implemented yet');
    },
    */

    // TODO This method sucks, as it tries to handle too many cases, figure out how to improve it
    /*jshint maxdepth:10 */
    createAttrQuery: function(attrQuery, attrVar, isLeftJoin, filterConcept, limit, offset) {

        var attrConcept = new Concept(new ElementSubQuery(attrQuery), attrVar);

        var renamedFilterConcept = ConceptUtils.createRenamedConcept(attrConcept, filterConcept);


        // Selet Distinct ?ori ?gin? alProj { Select (foo as ?ori ...) { originialElement} }

        // Whether each value for attrVar uniquely identifies a row in the result set
        // In this case, we just join the filterConcept into the original query
        var isAttrVarPrimaryKey = this.isConceptQuery(attrQuery, attrVar);

        var result;
        if(isAttrVarPrimaryKey) {
            // Case for e.g. Get the number of products offered by vendors in Europe
            // Select ?vendor Count(Distinct ?product) { ... }

            result = attrQuery.clone();

            if(!renamedFilterConcept.isSubjectConcept()) {
                var newElement = new ElementGroup([attrQuery.getQueryPattern(), renamedFilterConcept.getElement()]);
                newElement = newElement.flatten();
                result.setQueryPattern(newElement);
            }

            result.setLimit(limit);
            result.setOffset(offset);
        } else {
            // Case for e.g. Get all products offered by some 10 vendors
            // Select ?vendor ?product { ... }

            var requireSubQuery = limit != null || offset != null;


            var newFilterElement;
            if(requireSubQuery) {
                var subConcept;
                if(isLeftJoin) {
                    subConcept = renamedFilterConcept;
                } else {
                    // If we do an inner join, we need to include the attrQuery's element in the sub query

                    var subElement;
                    if(renamedFilterConcept.isSubjectConcept()) {
                        subElement = attrQuery.getQueryPattern();
                    } else {
                        subElement = new ElementGroup([attrQuery.getQueryPattern(), renamedFilterConcept.getElement()]);
                    }

                    subConcept = new Concept(subElement, attrVar);
                }

                var subQuery = ConceptUtils.createQueryList(subConcept, limit, offset);
                newFilterElement = new ElementSubQuery(subQuery);
            }
            else {
                newFilterElement = renamedFilterConcept.getElement();
            }

//            var canOptimize = isAttrVarPrimaryKey && requireSubQuery && !isLeftJoin;
//
//            var result;
//
//            //console.log('Optimize: ', canOptimize, isAttrConceptQuery, requireSubQuery, isLeftJoin);
//            if(canOptimize) {
//                // Optimization: If we have a subQuery and the attrQuery's projection is only 'DISTINCT ?attrVar',
//                // then the subQuery is already the result
//                result = newFilterElement.getQuery();
//            } else {


            var query = attrQuery.clone();

            var attrElement = query.getQueryPattern();

            var newAttrElement;
            if(!requireSubQuery && (!filterConcept || filterConcept.isSubjectConcept())) {
                newAttrElement = attrElement;
            }
            else {
                if(isLeftJoin) {
                    newAttrElement = new ElementGroup([
                        newFilterElement,
                        new ElementOptional(attrElement)
                    ]);
                } else {
                    newAttrElement = new ElementGroup([
                        attrElement,
                        newFilterElement
                    ]);
                }
            }

            query.setQueryPattern(newAttrElement);
            result = query;
        }

        // console.log('Argh Query: ' + result, limit, offset);
        return result;
    },

};

module.exports = ConceptUtils;


},{"../rdf/NodeFactory":91,"../rdf/Triple":94,"../rdf/node/Node":103,"../util/collection/HashMap":343,"./../vocab/rdf":354,"./Concept":203,"./ElementUtils":207,"./NodeValueUtils":216,"./Query":218,"./QueryUtils":220,"./VarUtils":227,"./agg/AggCount":228,"./element/ElementFilter":232,"./element/ElementGroup":233,"./element/ElementOptional":234,"./element/ElementSubQuery":236,"./element/ElementTriplesBlock":237,"./expr/E_Equals":246,"./expr/ExprAggregator":261,"./expr/ExprVar":269}],205:[function(require,module,exports){
//
//var DiffUtils = {
//    getState: function(isExpected, isActual) {
//        var result;
//
//        if(isExpected) {
//            if(isActual) {
//                result = 'covered';
//            } else {
//                result = 'uncovered';
//            }
//        } else {
//            if(isActual) {
//                result = 'excessive';
//            } else {
//                result = 'invalid';
//            }
//        }
//
//        return result;
//    },
//
//    /**
//     * This methods expects the following structure for both of the arguments:
//     * Map<Node, Map<Node, List<Node>>>
//     *
//     * @param expected
//     * @param actual
//     * @returns
//     */
//    createDiff: function(expected, actual) {
//
//
//        var result = DiffUtils.diffResource(expected, actual, function(expected, actual) {
//            var result = DiffUtils.diffResource(expected, actual, function(expected, actual) {
//                var result = DiffUtils.diffObjects(_.values(expected), _.values(actual));
//                return result;
//            });
//            return result;
//        });
//
//        return result;
//    },
//
//    /**
//     * Expects hashmaps as input
//     *
//     * @param expected
//     * @param actual
//     * @param fnProcessChildren
//     * @returns {Array}
//     */
//    diffResource: function(expected, actual, fnProcessChildren) {
//        var result = [];
//
//        // Get all subjects
//        var items =
//            _.chain(_.keys(expected))
//            .union(_.keys(actual))
//            .uniq()
//            .sort()
//            .value();
//
//        //console.log("[diffResource] items: ", items)
//
//        for(var i = 0; i < items.length; ++i) {
//            var item = items[i];
//
//            //console.log('[diffResource] item:', item);
//
//            var isExpected = item in expected;
//            var isActual = item in actual;
//
//            var state = DiffUtils.getState(isExpected, isActual);
//
//            var expectedChildren = item in expected ? expected[item] : {};
//            var actualChildren = item in actual ? actual[item] : {};
//
//            var children = fnProcessChildren(expectedChildren, actualChildren);
//
//            result.push({
//                item: item,
//                state: state,
//                children: children
//            });
//        }
//
//        return result;
//    },
//
//    diffObjects: function(expected, actual) {
//
//        var union = [];
//        union.push.apply(all, expected);
//        union.push.apply(all, actual);
//
////		var items = _.chain().union(expected, actual).uniq(false, rdfObjectToString).sortBy(rdfObjectToString).value();
//
//        var uniq = _.uniq(union, false, rdfObjectToString);
//        var items = _.sortBy(uniq, rdfObjectToString);
//        //console.log("items", items, expected, actual);
//
//
//        var result = [];
//
//        for(var i = 0; i < items.length; ++i) {
//            var item = items[i];
//
//            var isExpected = myIndexOf(expected, item) != -1;
//            var isActual = myIndexOf(actual, item) != -1;
//            //console.log("On item: ", item, isExpected, isActual);
//
//            var state = ns.getState(isExpected, isActual);
//
//            var resultItem = {
//                item: item,
//                state:state
//            };
//
//            result.push(resultItem);
//        }
//
//        return result;
//    },
//
//
//    /* Forget about the rest of the code - No more rendering in Js thanks to Angular
//    ns.renderResource = function(item) {
//        var str = item.item;
//        for(var key in predicatesURLs){
//            if(str.indexOf(key) !== -1){
//                str = str.replace(key, predicatesURLs[key]+":");
//                break;
//            }
//        }
//        var text = utils.escapeHTML(str);
//        var result = '<span class="' + item.state + '">' + text + '</span>';
//
//        return result;
//    }
//
//    ns.renderObject = function(item) {
//        var json = item.item;
//        var node = sparql.Node.fromJson(json);
//        var str = node.toString();
//        var text = utils.escapeHTML(str);
//        var result = '<span class="' + item.state + '">' + text + '</span>';
//
//        return result;
//    }
//
//    ns.renderDiff = function(subjects) {
//
//        var result = '';
//
//        // collapsible details
//        result += '<div class="accordion" id="resultAccordion'+widgetsCount+'">';
//        result += '<div class="accordion-group">';
//        result += '<div class="accordion-heading">';
//        //result += '<a class="accordion-toggle" data-toggle="collapse" data-parent="#resultAccordion'+widgetsCount+'" href="#collapseDetails'+widgetsCount+'">Show details</a>';
//        result += '</div>';
//        result += '<div id="collapseDetails'+widgetsCount+'" class="accordion-body">'; //collapse
//        result += '<div class="accordion-inner">';
//
//        // data rendering stuff
//        result += '<ul class="separated bullets-none">';
//
//        for(var i = 0; i < subjects.length; ++i) {
//            var subject = subjects[i];
//
//            result += '</li>';
////				result += '<tr>'
////				result += '<td>';
//            result += ns.renderResource(subject);
//            //result += '</td><td>';
//
//            var predicateStr = '<table class="separated-vertical" style="margin-left:15px; margin-bottom: 15px;">';
//
//            // TODO color
//            var predicates = subject.children;
//
//            for(var j = 0; j < predicates.length; ++j) {
//                var predicate = predicates[j];
//
//                predicateStr += '<tr>';
//                predicateStr += '<td style=" vertical-align: top;">' + ns.renderResource(predicate) + '</td>';
//
//                var objectStr = '<td><ul class="separated bullets-none">';
//
//                var objects = predicate.children;
//                for(var k = 0; k < objects.length; ++k) {
//                    var object = objects[k];
//
//                    var str = ns.renderObject(object);
//
//                    objectStr += '<li>' + str + '</li>';
//                }
//
//                objectStr += '</ul></td>';
//
//                predicateStr += objectStr;
//                predicateStr += '</tr>';
//            }
//
//            predicateStr += '</table>';
//
//            result += predicateStr;
//
//            //result += '</td>';
//            //result += '</tr>';
//            result += '</li>';
//
//        }
//
//        //result += "</table>"
//        result += '</ul>';
//
//        // close collapsible
//        result += '</div>';
//        result += '</div>';
//        result += '</div>';
//        result += '</div>';
//
//        // increase widget count
//        widgetsCount++;
//
//        return result;
//    }
//*/
//
//};
//
//module.exports = DiffUtils;
//

},{}],206:[function(require,module,exports){
var ElementHelpers = {

    joinElements: function(separator, elements) {
        var strs = elements.map(function(element) {
            return element.toString();
        });
        var filtered = strs.filter(function(str) {
            return str.length !== 0;
        });

        return filtered.join(separator);
    },

};

module.exports = ElementHelpers;

},{}],207:[function(require,module,exports){
// lib deps
var uniq = require('lodash.uniq');

// project deps
var ElementTriplesBlock = require('./element/ElementTriplesBlock');
var ElementFilter = require('./element/ElementFilter');
var ElementGroup = require('./element/ElementGroup');
var ElementSubQuery = require('./element/ElementSubQuery');
var TripleUtils = require('./../rdf/TripleUtils');
var VarUtils = require('./VarUtils');
var GenSym = require('./GenSym');
var GeneratorBlacklist = require('./GeneratorBlacklist');
var HashBidiMap = require('../util/collection/HashBidiMap');
//var ObjectUtils = require('../util/ObjectUtils'); // node-equals
var NodeFactory = require('../rdf/NodeFactory');

var Query = require('./Query');
var ExprAggregator = require('./expr/ExprAggregator');
var AggCount = require('./agg/AggCount');

var ElementUtils = {

    createQueryCountRows: function(element, countVar, rowLimit) {
        var e;
        if(rowLimit == null) {
            e = element;
        } else {
            var subQuery = new Query();
            subQuery.setQuerySelectType();
            subQuery.setQueryPattern(element);
            subQuery.setQueryResultStar(true);
            subQuery.setLimit(rowLimit);
            e = new ElementSubQuery(element);
        }

        var result = new Query();
        result.setQuerySelectType();
        result.setQueryPattern(e);
        result.getProject().add(countVar, new ExprAggregator(null, new AggCount()));

        return result;
    },

    createFilterElements: function(exprs) {
        var result = exprs.map(function(expr) {
            var r = new ElementFilter(expr);
            return r;
        });

        return result;
    },

    // TODO Get rid of this method
    // @Deprecated
    createElementsTriplesBlock: function(triples) {
        var result = [];

        if (triples.length > 0) {
            var element = new ElementTriplesBlock(triples);
            result.push(element);
        }

        return result;
    },

    /**
     * Returns a map that maps *each* variable from vbs to a name that does not appear in vas.
     */
    createDistinctVarMap: function(vas, vbs, generator) {
        var vans = vas.map(VarUtils.getVarName);

        if (generator == null) {
            var g = new GenSym('v');
            generator = new GeneratorBlacklist(g, vans);
        }

        // Rename all variables that are in common
        // FIXME: fnNodeEquals is not defined (commented out in sponate-utils.js as of 2014-06-05)
        var result = new HashBidiMap();
        // var rename = {};

        vbs.forEach(function(oldVar) {
            var vbn = oldVar.getName();

            var newVar;
            if (vans.indexOf(vbn) !== -1) {
                var newName = generator.next();
                newVar = NodeFactory.createVar(newName);

            } else {
                newVar = oldVar;
            }

            // rename[vcn] = newVar;

            // TODO Somehow re-use existing var objects...
            // var oldVar = ns.Node.v(vcn);

            result.put(oldVar, newVar);
        });

        return result;
    },

    /**
     * distinctMap is the result of making vbs and vas distinct
     *
     * [?s ?o] [?s ?p] join on ?o = ?s
     *
     * Step 1: Make overlapping vars distinct
     * [?s ?o] [?x ?p] -> {?s: ?x, ?p: ?p}
     *
     * Step 2: Make join vars common again
     * [?s ?o] [?x ?s] -> {?s: ?x, ?p: ?s}
     */
    createJoinVarMap: function(sourceVars, targetVars, sourceJoinVars, targetJoinVars, generator) {

        if (sourceJoinVars.length !== targetJoinVars.length) {
            console.log('[ERROR] Cannot join on different number of columns');
            throw 'Bailing out';
        }

        var result = ElementUtils.createDistinctVarMap(sourceVars, targetVars, generator);

        for (var i = 0; i < sourceJoinVars.length; ++i) {
            var sourceJoinVar = sourceJoinVars[i];
            var targetJoinVar = targetJoinVars[i];

            // Map targetVar to sourceVar
            result.put(targetJoinVar, sourceJoinVar);
            // rename[targetVar.getName()] = sourceVar;
        }

        return result;
    },

    /**
     * Var map must be a bidi map
     */
    createRenamedElement: function(element, varMap) {
        var fnSubst = VarUtils.fnSubst(varMap);

        // debugger;
        var newElement = element.copySubstitute(fnSubst);

        return newElement;
    },

    /**
     * Returns a new array of those triples, that are directly part of the given array of elements.
     *
     */
    getElementsDirectTriples: function(elements) {
        var result = [];
        for(var i = 0; i < elements.length; ++i) {
            var element = elements[i];
            if(element instanceof ElementTriplesBlock) {
                result.push.apply(result, element.triples);
            }
        }

        return result;
    },

    freshVar: function(element, baseVarName) {
        var gen = this.freshVarGen(element, baseVarName);
        var result = gen.next();
        console.log('freshVar: ' + result);
        return result;
    },


    /**
     * Creates a generator for fresh variables not appearing in the element
     */
    freshVarGen: function(element, baseVarName) {
        baseVarName = baseVarName || 'v';

        var blacklistVars = element.getVarsMentioned();
        var result = VarUtils.freshVarGen(baseVarName, blacklistVars);
        return result;
    }
};

module.exports = ElementUtils;

},{"../rdf/NodeFactory":91,"../util/collection/HashBidiMap":342,"./../rdf/TripleUtils":95,"./GenSym":212,"./GeneratorBlacklist":214,"./Query":218,"./VarUtils":227,"./agg/AggCount":228,"./element/ElementFilter":232,"./element/ElementGroup":233,"./element/ElementSubQuery":236,"./element/ElementTriplesBlock":237,"./expr/ExprAggregator":261,"lodash.uniq":583}],208:[function(require,module,exports){
/* jshint evil: true */
var Class = require('../ext/Class');

var ExprEvaluator = Class.create({
    eval: function() { // expr, binding) {
        throw new Error('Not overridden');
    },
});

module.exports = ExprEvaluator;

},{"../ext/Class":2}],209:[function(require,module,exports){
/* jshint evil: true */
var Class = require('../ext/Class');
var NodeValue = require('./expr/NodeValue');
var NodeValueUtils = require('./NodeValueUtils');
var ExprEvaluator = require('./ExprEvaluator');

var ExprEvaluatorImpl = Class.create(ExprEvaluator, {
    eval: function(expr, binding) {
        var result;
        var e;

        if (expr.isVar()) {
            e = expr.getExprVar();
            result = this.evalExprVar(e, binding);
        } else if (expr.isFunction()) {
            e = expr.getFunction();
            result = this.evalExprFunction(e, binding);
        } else if (expr.isConstant()) {
            e = expr.getConstant();
            // FIXME: this.evalConstant not defined
            result = this.evalConstant(e, binding);
        } else {
            throw new Error('Unsupported expr type');
        }

        return result;
    },

    evalExprVar: function(expr, binding) {
        // console.log('Expr' + JSON.stringify(expr));
        var v = expr.asVar();

        var node = binding.get(v);

        var result;
        if (node == null) {
            // console.log('No Binding for variable "' + v + '" in ' + expr + ' with binding ' + binding);
            // throw 'Bailing out';
            return NodeValue.nvNothing;
            // return null;
        } else {
            result = NodeValueUtils.makeNode(node);
        }

        return result;
    },

    evalExprFunction: function() { // expr, binding) {
    },

    evalNodeValue: function() { // expr, binding) {
    },
});

module.exports = ExprEvaluatorImpl;

},{"../ext/Class":2,"./ExprEvaluator":208,"./NodeValueUtils":216,"./expr/NodeValue":270}],210:[function(require,module,exports){
var ExprHelpers = {

    newBinaryExpr: function(Ctor, args) {
        if (args.length !== 2) {
            throw new Error('Invalid argument');
        }

        var newLeft = args[0];
        var newRight = args[1];

        var result = new Ctor(newLeft, newRight);
        return result;
    },

    newUnaryExpr: function(Ctor, args) {
        if (args.length !== 1) {
            throw new Error('Invalid argument');
        }

        var newExpr = args[0];

        var result = new Ctor(newExpr);
        return result;
    },

    joinElements: function(separator, elements) {
        var strs = elements.map(function(element) {
            return element.toString();
        });
        var filtered = strs.filter(function(str) {
            return str.length !== 0;
        });

        return filtered.join(separator);
    },

};

module.exports = ExprHelpers;

},{}],211:[function(require,module,exports){
var ExprVar = require('./expr/ExprVar');
var NodeValue = require('./expr/NodeValue');
var NodeValueUtils = require('./NodeValueUtils');
var E_Equals = require('./expr/E_Equals');

var E_LogicalAnd = require('./expr/E_LogicalAnd');
var E_LogicalOr = require('./expr/E_LogicalOr');

var ExprUtils = {

    copySubstitute: function(expr, binding) {
        var fn = function(node) {

            var result = null;

            if (node.isVar()) {
                // var varName = node.getName();
                // var subst = binding.get(varName);
                var subst = binding.get(node);

                if (subst != null) {
                    result = subst;
                }
            }

            if (result == null) {
                result = node;
            }

            return result;
        };

        var result = expr.copySubstitute(fn);
        return result;
    },

    /**
     *
     * If varNames is omitted, all vars of the binding are used
     */
    bindingToExprs: function(binding, vars) {
        if (vars == null) {
            vars = binding.getVars();
        }

        var result = [];
        vars.forEach(function(v) {
            var exprVar = new ExprVar(v);
            var node = binding.get(v);

            // TODO What if node is NULL
            var nodeValue = NodeValueUtils.makeNode(node);

            var expr = new E_Equals(exprVar, nodeValue);

            result.push(expr);
        });

        return result;
    },

    opify: function(exprs, fnCtor) {
        var open = exprs;
        var next = [];

        while (open.length > 1) {

            for (var i = 0; i < open.length; i += 2) {

                var a = open[i];

                if (i + 1 === open.length) {
                    next.push(a);
                    break;
                }

                var b = open[i + 1];

                var newExpr = fnCtor(a, b);

                next.push(newExpr); // ;new ns.E_LogicalOr(a, b));
            }

            open = next;
            next = [];
        }

        return open[0];
    },

    andify: function(exprs) {
        var result = this.opify(exprs, function(a, b) {
            return new E_LogicalAnd(a, b);
        });

        return result;
    },

    orify: function(exprs) {
        var result = this.opify(exprs, function(a, b) {
            return new E_LogicalOr(a, b);
        });

        return result;
    },

};

module.exports = ExprUtils;

},{"./NodeValueUtils":216,"./expr/E_Equals":246,"./expr/E_LogicalAnd":253,"./expr/E_LogicalOr":255,"./expr/ExprVar":269,"./expr/NodeValue":270}],212:[function(require,module,exports){
var Class = require('../ext/Class');
var Generator = require('./Generator');

/**
 * Another class that mimics Jena's behaviour.
 *
 * @param prefix
 * @param start
 * @returns {ns.GenSym}
 */
var GenSym = Class.create(Generator, {
    initialize: function(prefix, start) {
        this.prefix = prefix ? prefix : 'v';
        this.nextValue = start ? start : 0;
    },

    next: function() {
        ++this.nextValue;

        var result = this.prefix + '_' + this.nextValue;

        return result;
    },
});

GenSym.create = function(prefix) {
    var result = new GenSym(prefix, 0);
    return result;
};

module.exports = GenSym;

},{"../ext/Class":2,"./Generator":213}],213:[function(require,module,exports){
var Class = require('../ext/Class');

var Generator = Class.create({
    next: function() {
        throw new Error('Override me');
    },
});

module.exports = Generator;

},{"../ext/Class":2}],214:[function(require,module,exports){
var Class = require('../ext/Class');
var Generator = require('./Generator');

/**
 *
 * @param generator
 * @param blacklist Array of strings
 * @returns {ns.GeneratorBlacklist}
 */
var GeneratorBlacklist = Class.create(Generator, {
    initialize: function(generator, blacklist) {
        this.generator = generator;
        this.blacklist = blacklist;
    },

    next: function() {
        var result;

        do {
            result = this.generator.next();
        } while (this.blacklist.indexOf(result) !== -1);

        return result;
    },
});

module.exports = GeneratorBlacklist;

},{"../ext/Class":2,"./Generator":213}],215:[function(require,module,exports){
var Triple = require('../rdf/Triple');
var NodeFactory = require('../rdf/NodeFactory');

var NodeValueUtils = require('./NodeValueUtils');
var ExprVar = require('./expr/ExprVar');
var E_OneOf = require('./expr/E_OneOf');
var E_LangMatches = require('./expr/E_LangMatches');
var E_LogicalOr = require('./expr/E_LogicalOr');
var E_Lang = require('./expr/E_Lang');
var E_Bound = require('./expr/E_Bound');
var E_Regex = require('./expr/E_Regex');
var E_Str = require('./expr/E_Str');

var ExprUtils = require('./ExprUtils');

var Concept = require('./Concept');
var Relation = require('./Relation');
var ConceptUtils = require('./ConceptUtils');

var ElementTriplesBlock = require('./element/ElementTriplesBlock');
var ElementGroup = require('./element/ElementGroup');
var ElementOptional = require('./element/ElementOptional');
var ElementFilter = require('./element/ElementFilter');

var VarUtils = require('./VarUtils');

var LabelUtils = {

    createRelationPrefLabels: function(bestLabelConfig) {

        var prefLangs = bestLabelConfig.getLangs();
        var prefPreds = bestLabelConfig.getPredicates();

        var s = bestLabelConfig.getSubjectVar();
        var p = bestLabelConfig.getPredicateVar();
        var o = bestLabelConfig.getObjectVar();
        
        
        var subjectExpr = new ExprVar(s);
        var propertyExpr = new ExprVar(p);
        var labelExpr = new ExprVar(o);

        // Second, create the element
        var langTmp = prefLangs.map(function(lang) {
            var r = new E_LangMatches(new E_Lang(labelExpr), NodeValueUtils.makeString(lang));
            return r;
        });
            
        // Combine multiple expressions into a single logicalOr expression.
        var langConstraint = ExprUtils.orify(langTmp);
        
        //var propFilter = new sparql.E_LogicalAnd(
        var propFilter = new E_OneOf(propertyExpr, prefPreds);
        //);
        
        var els = [];
        els.push(new ElementTriplesBlock([ new Triple(s, p, o)] ));
        els.push(new ElementFilter(propFilter));
        els.push(new ElementFilter(langConstraint));
        
        var langElement = new ElementGroup(els);
        
        //var result = new Concept(langElement, s);
        var result = new Relation(langElement, s, o);
        return result;
    },
};

module.exports = LabelUtils;

},{"../rdf/NodeFactory":91,"../rdf/Triple":94,"./Concept":203,"./ConceptUtils":204,"./ExprUtils":211,"./NodeValueUtils":216,"./Relation":221,"./VarUtils":227,"./element/ElementFilter":232,"./element/ElementGroup":233,"./element/ElementOptional":234,"./element/ElementTriplesBlock":237,"./expr/E_Bound":244,"./expr/E_Lang":249,"./expr/E_LangMatches":250,"./expr/E_LogicalOr":255,"./expr/E_OneOf":257,"./expr/E_Regex":258,"./expr/E_Str":259,"./expr/ExprVar":269}],216:[function(require,module,exports){
var NodeFactory = require('../rdf/NodeFactory');
var NodeValue = require('./expr/NodeValue');
var NodeValueNode = require('./expr/NodeValueNode');
var AnonIdStr = require('../rdf/AnonIdStr');
var xsd = require('../vocab/xsd');

var NodeValueUtils = {
    nvNothing: new NodeValue(NodeFactory.createAnon(new AnonIdStr('node value nothing'))),

    createLiteral: function(val, typeUri) {
        var node = NodeFactory.createTypedLiteralFromValue(val, typeUri);
        var result = new NodeValueNode(node);
        return result;
    },

    makeString: function(str) {
        return NodeValueUtils.createLiteral(str, xsd.xstring.getUri());
    },

    makeInteger: function(val) {
        return NodeValueUtils.createLiteral(val, xsd.xint.getUri());
    },

    makeDecimal: function(val) {
        return NodeValueUtils.createLiteral(val, xsd.decimal.getUri());
    },

    makeFloat: function(val) {
        return NodeValueUtils.createLiteral(val, xsd.xfloat.getUri());
    },

    makeNode: function(node) {
        var result = new NodeValueNode(node);
        return result;
    },

};

module.exports = NodeValueUtils;

},{"../rdf/AnonIdStr":89,"../rdf/NodeFactory":91,"../vocab/xsd":357,"./expr/NodeValue":270,"./expr/NodeValueNode":271}],217:[function(require,module,exports){
var union = require('lodash.union');

var isFunction = function(obj) {
    return typeof obj === 'function';
};

var PatternUtils = {
    getVarsMentioned: function(elements) {

        var result = elements.reduce(function(memo, element) {

            var fn = element.getVarsMentioned;
            if (!fn || !isFunction(fn)) {
                console.log('[ERROR] .getVarsMentioned not found on object ', element);
            }

            var vs = element.getVarsMentioned();
            var r = union(memo, vs);
            return r;
        }, []);

        return result;
    },
};

module.exports = PatternUtils;

},{"lodash.union":560}],218:[function(require,module,exports){
var Class = require('../ext/Class');
var union = require('lodash.union');
var ObjectUtils = require('../util/ObjectUtils');
var VarExprList = require('./VarExprList');
var ArrayUtils = require('../util/ArrayUtils');
var ElementHelpers = require('./ElementHelpers');
var ElementUtils = require('./ElementUtils');
var QueryType = require('./QueryType');
var ExprAggregator = require('./expr/ExprAggregator');

var Query = Class.create({
    classLabel: 'jassa.sparql.Query',

    initialize: function() {
        this.type = 0; // select, construct, ask, describe

        this.distinct = false;
        this.reduced = false;

        this.queryResultStar = false;

        // TODO Rename to project(ion)
        this.projectVars = new VarExprList();
        // this.projectVars = []; // The list of variables to appear in the projection
        // this.projectExprs = {}; // A map from variable to an expression

        // this.projection = {}; // Map from var to expr; map to null for using the var directly

        // this.order = []; // A list of expressions

        this.groupBy = [];
        this.orderBy = [];

        //this.elements = [];
        this.queryPattern = null;

        this.constructTemplate = null;

        this.limit = null;
        this.offset = null;

        //this.allocAggregateId = 0;
    },

    /**
     * Return {jassa.sparql.Expr}
     */
    /*
    allocAggregate: function(agg) {
        var id = allocAggregateId++;

        var v = NodeFactory.createVar('.' + id);
        new ExprAggregator =
    },
    */
    getAggregators: function() {
        var entries = this.getProject().entries();

        var result = [];
        entries.forEach(function(entry) {
            var expr = entry.expr;
            if(expr instanceof ExprAggregator) { // TODO At some point allow: if query.getAggregators().length > 0
                var agg = expr.getAggregator();
                result.push(agg);
            }
        });

        return result;
    },

    setQuerySelectType: function() {
        this.type = 0;
    },

    isQueryResultStar: function() {
        return this.queryResultStar;
    },

    setQueryResultStar: function(queryResultStar) {
        this.queryResultStar = queryResultStar;
    },

    getQueryPattern: function() {
        return this.queryPattern;
    },

    setQueryPattern: function(element) {
        this.queryPattern = element;
    },

    getProjectVars: function() {
        var result = this.projectVars ? this.projectVars.getVars() : null;
        return result;
    },

    // TODO Remove this method
    setProjectVars: function(projectVars) {
        this.projectVars = projectVars;
    },

    getProject: function() {
        return this.projectVars;
    },

    getGroupBy: function() {
        return this.groupBy;
    },

    getOrderBy: function() {
        return this.orderBy;
    },

    getLimit: function() {
        return this.limit;
    },

    getOffset: function() {
        return this.offset;
    },

    toStringOrderBy: function() {
        var result = (this.orderBy && this.orderBy.length > 0) ? 'Order By ' + this.orderBy.join(' ') + ' ' : '';
        // console.log('Order: ', this.orderBy);
        return result;
    },

    toStringGroupBy: function() {
        var result = (this.groupBy && this.groupBy.length > 0) ? 'Group By ' + this.groupBy.join(' ') + ' ' : '';
        // console.log('Order: ', this.orderBy);
        return result;
    },

    clone: function() {
        return this.copySubstitute(ObjectUtils.identity);
    },

    flatten: function() {
        var result = this.clone();

//        var tmp = result.elements.map(function(element) {
//            return element.flatten();
//        });
//
//        var newElements = ElementUtils.flattenElements(tmp);

        result.queryPattern = this.queryPattern ? this.queryPattern.flatten() : null;

        return result;
    },

    getVarsMentioned: function() {

        if(!Query.warnGetVarsMentioned) {
            console.log('[WARN] sparql.Query.getVarsMentioned(): Not implemented properly yet. Things may break!');
            Query.warnGetVarsMentioned = true;
        }
        // TODO Also include projection, group by, etc in the output - not just the elements

        var result = this.queryPattern.getVarsMentioned();
//        var result = this.elements.reduce(function(memo, element) {
//            var evs = element.getVarsMentioned();
//            var r = union(memo, evs);
//            return r;
//        }, []);

        return result;
    },

    copySubstitute: function(fnNodeMap) {
        var result = new Query();
        result.type = this.type;
        result.distinct = this.distinct;
        result.reduced = this.reduced;
        result.queryResultStar = this.queryResultStar;
        result.limit = this.limit;
        result.offset = this.offset;

        result.projectVars = this.projectVars.copySubstitute(fnNodeMap);

        if (this.constructTemplate) {
            result.constructTemplate = this.constructTemplate.copySubstitute(fnNodeMap);
        }

        result.orderBy = this.orderBy == null ? null : this.orderBy.map(function(item) {
            return item.copySubstitute(fnNodeMap);
        });

        result.groupBy = this.groupBy == null ? null : this.groupBy.map(function(item) {
            return item.copySubstitute(fnNodeMap);
        });

        result.queryPattern = this.queryPattern.copySubstitute(fnNodeMap);
//        result.elements = this.elements.map(function(element) {
//            //              console.log('Element: ', element);
//            //              debugger;
//            var r = element.copySubstitute(fnNodeMap);
//            return r;
//        });

        return result;
    },

    /**
     * Convenience function for setting limit, offset and distinct from JSON
     *
     * @param {Object} options
     */
    setOptions: function(options) {
        if (typeof options === 'undefined') {
            return;
        }

        if (typeof options.limit !== 'undefined') {
            this.setLimit(options.limit);
        }

        if (typeof(options.offset) !== 'undefined') {
            this.setOffset(options.offset);
        }

        if (typeof(options.distinct) !== 'undefined') {
            this.setDistinct(options.distinct);
        }
    },

    setOffset: function(offset) {
        this.offset = offset ? offset : null;
    },

    setLimit: function(limit) {
        if (limit === 0) {
            this.limit = 0;
        } else {
            this.limit = limit ? limit : null;
        }
    },

    isDistinct: function() {
        return this.distinct;
    },

    setDistinct: function(enable) {
        this.distinct = (enable === true);
    },

    isReduced: function() {
        return this.reduced;
    },

    setReduced: function(enable) {
        this.reduced = (enable === true);
    },

    toString: function() {
        switch (this.type) {
            case QueryType.Select:
                return this.toStringSelect();
            case QueryType.Construct:
                return this.toStringConstruct();

        }
    },

    toStringProjection: function() {
        var result = this.queryResultStar ? '*' : this.projectVars.toString();
        return result;
    },

    toStringLimitOffset: function() {
        var result = '';

        if (this.limit != null) {
            result += ' Limit ' + this.limit;
        }

        if (this.offset != null) {
            result += ' Offset ' + this.offset;
        }

        return result;
    },

    toStringSelect: function() {
        var distinctStr = this.distinct ? 'Distinct ' : '';

        // console.log('Elements: ', this.elements);
        //ElementHelpers.joinElements(' . ', this.elements) +
        var result = 'Select ' + distinctStr + this.toStringProjection() + ' {' +
            this.queryPattern +
            '} ' + this.toStringGroupBy() + this.toStringOrderBy() + this.toStringLimitOffset();

        return result;
    },

    toStringConstruct: function() {
        var result = 'Construct ' + this.constructTemplate + ' {' +
            this.queryPattern +
            '}' + this.toStringOrderBy() + this.toStringLimitOffset();

        return result;
    },
});

module.exports = Query;

},{"../ext/Class":2,"../util/ArrayUtils":327,"../util/ObjectUtils":332,"./ElementHelpers":206,"./ElementUtils":207,"./QueryType":219,"./VarExprList":225,"./expr/ExprAggregator":261,"lodash.union":560}],219:[function(require,module,exports){
var QueryType = {};
QueryType.Unknown = -1;
QueryType.Select = 0;
QueryType.Construct = 1;
QueryType.Ask = 2;
QueryType.Describe = 3;

module.exports = QueryType;

},{}],220:[function(require,module,exports){
var ExprVar = require('./expr/ExprVar');

var ExprAggregator = require('./expr/ExprAggregator');
var AggCount = require('./agg/AggCount');

var ElementGroup = require('./element/ElementGroup');
var ElementUnion = require('./element/ElementUnion');
var ElementSubQuery = require('./element/ElementSubQuery');

var Query = require('./Query');

var QueryUtils = {
    // This method is dangerous as it attempts to handle to many cases
    // don't use
    createQueryCount: function(elements, limit, variable, outputVar, groupVars, useDistinct, options) {
        var element = elements.length === 1 ? elements[0] : new ElementGroup(elements);

        var exprVar = variable ? new ExprVar(variable) : null;


        var queryPattern;

        var needsSubQuery = limit || useDistinct || (groupVars && groupVars.length > 0);
        if(needsSubQuery) {

            var subQuery = new Query();
            subQuery.setQueryPattern(element);

            if(groupVars) {
                for(var i = 0; i < groupVars.length; ++i) {
                    var groupVar = groupVars[i];
                    subQuery.getProject().add(groupVar);
                    //subQuery.groupBy.push(groupVar);
                }
            }

            if(variable) {
                subQuery.getProject().add(variable);
            }

            if(subQuery.getProjectVars().length === 0) {
                subQuery.setQueryResultStar(true);
            }

            subQuery.setDistinct(useDistinct);
            subQuery.setLimit(limit);

            queryPattern = new ElementSubQuery(subQuery);
        } else {
            queryPattern = new ElementGroup(elements);
        }



        var result = new Query();
        result.setQueryPattern(queryPattern);

        if(groupVars) {
            groupVars.forEach(function(groupVar) {
                result.getProject().add(groupVar);
                result.getGroupBy().push(new ExprVar(groupVar));
            });
        }

        result.getProject().add(outputVar, new ExprAggregator(null, new AggCount()));

        return result;
    },


    createQueryUnionSubQueries: function(subQueries, projectVars) {
        var result;

        if(subQueries.length === 0) {
            result = null;
        } else {

            if(subQueries.length === 1) {
                result = subQueries[0];
            } else {
                // Convenience assumption if no project vars are provided
                projectVars = projectVars || subQueries[0].getProjectVars();

                // Create a union over the sub queries
                var subElements = subQueries.map(function(subQuery) {
                    var r = new ElementSubQuery(subQuery);
                    return r;
                });

                var union = new ElementUnion(subElements);

                result = new Query();
                result.setQuerySelectType();
                projectVars.forEach(function(v) {
                    result.getProject().add(v);
                });
                //result.getProject().add(sourceVar);
                //result.getProject().add(targetVar);
                result.setQueryPattern(union);
            }
        }

        return result;
    },

};

module.exports = QueryUtils;

},{"./Query":218,"./agg/AggCount":228,"./element/ElementGroup":233,"./element/ElementSubQuery":236,"./element/ElementUnion":238,"./expr/ExprAggregator":261,"./expr/ExprVar":269}],221:[function(require,module,exports){
var Class = require('../ext/Class');

/**
 * A (binary) relation represents correspondences between two sets of resources
 *
 * The main intention of relations is to map a concept, such as 'Airports',
 * to a related conecept, such as the set of labels. 
 */
var Relation = Class.create({
    initialize: function(element, sourceVar, targetVar) {
        this.element = element;
        this.sourceVar = sourceVar;
        this.targetVar = targetVar;
    },

    getElement: function() {
        return this.element;
    },

    getSourceVar: function() {
        return this.sourceVar;
    },

    getTargetVar: function() {
        return this.targetVar;
    },

    toString: function() {
        var result = '(' + [this.element, this.sourceVar, this.targetVar].join('; ') + ')';
        return result;
    }
});

module.exports = Relation;

},{"../ext/Class":2}],222:[function(require,module,exports){
//var Class = require('../ext/Class');
var Relation = require('./Relation');

var Query = require('./Query');
var ExprVar = require('./expr/ExprVar');
var ExprAggregator = require('./expr/ExprAggregator');
var ElementSubQuery = require('./element/ElementSubQuery');
var AggCountVarDistinct = require('./agg/AggCountVarDistinct');

var Concept = require('./Concept');
var ConceptUtils = require('./ConceptUtils');

var RelationUtils = {
    /**
     * Creates a query
     * 
     * Select ?s (Count(Distinct ?o) As ?countVar){
     *     relation
     * }
     * 
     */
    createQueryDistinctValueCount: function(relation, countVar) {
        var result = new Query();

        var varExprList = result.getProject();
        varExprList.add(relation.getSourceVar());
        varExprList.add(countVar, new ExprAggregator(null, new AggCountVarDistinct(new ExprVar(relation.getTargetVar()))));
        result.setQueryPattern(relation.getElement());
        result.getGroupBy().push(new ExprVar(relation.getSourceVar()));

        return result; 
    },
    
    
    /**
     * Wraps a relation with a limit
     * 
     * Select ?s ?o {
     *    / original relation with vars ?s and ?o /
     * } Limit rowLimit
     * 
     */
    createQueryRawSize: function(relation, sourceNode, countVar, rowLimit) {
        var concept = new Concept(relation.getElement(), relation.getSourceVar());
        
        var result = ConceptUtils.createQueryRawSize(concept, sourceNode, countVar, rowLimit); 
        return result;
    },

    /**
     * Creates a query
     * 
     * Select ?s (Count(*) As ?countVar) {
     *     { Select ?s { relation . Filter(?s = sourceValue} Limit rowLimit}
     * }
     * 
     * If no rowLimit is provided, the subselect is omitted
     */
    createQueryValueCount: function(relation, sourceValue, countVar, rowLimit) {
        var wrapped = this.createRelationWithLimit(relation, rowLimit);
        
        var result = new Query();

        var varExprList = result.getProject();
        varExprList.add(relation.getSourceVar());
        varExprList.add(countVar, new ExprAggregator(null, new AggCountVarDistinct(new ExprVar(relation.getTargetVar()))));
        result.setQueryPattern(relation.getElement());
        result.getGroupBy().push(new ExprVar(relation.getSourceVar()));
    },

    
    // TODO Add a method that can align source / target variables of relations
    // so that unions over them can be easily created
    
    /**
     * Same as above, except that the query is conveniently
     * wrapped as a relation object.
     */
    createRelationDistinctValueCount: function(relation, countVar) {
        var query = this.createQueryDistinctValueCount(relation, countVar);
        var element = new ElementSubQuery(query);
        var result = new Relation(element, relation.getSourceVar(), countVar);
        return result;
    },
};


module.exports = RelationUtils;

},{"./Concept":203,"./ConceptUtils":204,"./Query":218,"./Relation":221,"./agg/AggCountVarDistinct":229,"./element/ElementSubQuery":236,"./expr/ExprAggregator":261,"./expr/ExprVar":269}],223:[function(require,module,exports){
var Class = require('../ext/Class');

var SortCondition = Class.create({
    classLabel: 'jassa.sparql.SortCondition',
    initialize: function(expr, direction) {
        this.expr = expr;
        this.direction = direction;
    },

    getExpr: function() {
        return this.expr;
    },

    getDirection: function() {
        return this.direction;
    },

    toString: function() {
        var result;
        if(this.direction === 'asc') {
            result = 'Asc(' + this.expr + ')';
        } else if(this.direction === 'desc') {
            result = 'Desc(' + this.expr + ')';
        } else {
            result = '' + this.expr;
        }
        return result;
    },

    copySubstitute: function(fnNodeMap) {
        var exprCopy = this.expr.copySubstitute(fnNodeMap);
        var result = new SortCondition(exprCopy, this.direction);
        return result;
    },

});

module.exports = SortCondition;

},{"../ext/Class":2}],224:[function(require,module,exports){
var Class = require('../ext/Class');
var NodeFactory = require('../rdf/NodeFactory');
var VarUtils = require('./VarUtils');

/**
 * An string object that supports variable substitution and extraction
 * to be used for ElementString and ExprString
 *
 */
var SparqlString = Class.create({
    classLabel: 'jassa.sparql.SparqlString',

    initialize: function(value, varsMentioned) {
        this.value = value;
        this.varsMentioned = varsMentioned ? varsMentioned : [];
    },

    toString: function() {
        return this.value;
    },

    getString: function() {
        return this.value;
    },

    copySubstitute: function(fnNodeMap) {
        var str = this.value;
        var newVarsMentioned = [];

        // Avoid double substitution of variables by using some unlikely prefix
        // instead of the question mark
        var placeholder = '@@@@';
        var reAllPlaceholders = new RegExp(placeholder, 'g');

        this.varsMentioned.forEach(function(v) {

            // A variable must not end in \w (this equals: _, [0-9], [a-z] or [a-Z])
            var reStr = '\\?' + v.getName() + '([^\\w])?';
            var re = new RegExp(reStr, 'g');

            var node = fnNodeMap(v);
            if (node) {
                // console.log('Node is ', node);

                var replacement;
                if (node.isVariable()) {
                    // console.log('Var is ' + node + ' ', node);

                    replacement = placeholder + node.getName();

                    newVarsMentioned.push(node);
                } else {
                    replacement = node.toString();
                }

                str = str.replace(re, replacement + '$1');
            } else {
                newVarsMentioned.push(v);
            }
        });

        str = str.replace(reAllPlaceholders, '?');

        return new SparqlString(str, newVarsMentioned);
    },

    getVarsMentioned: function() {
        return this.varsMentioned;
    }
});

SparqlString.create = function(str, varNames) {
    var vars;
    if (varNames != null) {
        vars = varNames.map(function(varName) {
            return NodeFactory.createVar(varName);
        });
    } else {
        vars = VarUtils.extractSparqlVars(str);
    }
    // vars = vars ? vars :

    var result = new SparqlString(str, vars);
    return result;
};


module.exports = SparqlString;

},{"../ext/Class":2,"../rdf/NodeFactory":91,"./VarUtils":227}],225:[function(require,module,exports){
var Class = require('../ext/Class');
var HashMap = require('../util/collection/HashMap');

var VarExprList = Class.create({
    initialize: function() {
        this.vars = [];
        //this.varToExpr = {};
        this.varToExpr = new HashMap();
    },

    contains: function(v) {
        var result = this.vars.some(function(item) {
            var r = item.equals(v);
            return r;
        });

        return result;
    },

    getVars: function() {
        return this.vars;
    },

    getExpr: function(v) {
        var result = this.varToExpr.get(v);
        return result;
    },

    getExprMap: function() {
        return this.varToExpr;
    },

    add: function(v, expr) {
        this.vars.push(v);

        if (expr) {
            //this.varToExpr[v.getName()] = expr;
            this.varToExpr.put(v, expr);
        }
    },

    addAll: function(vars) {
        this.vars.push.apply(this.vars, vars);
    },

    entries: function() {
        var self = this;
        var result = this.vars.map(function(v) {
            var expr = self.varToExpr.get(v);

            return {
                v: v,
                expr: expr,
            };
        });

        return result;
    },

    copySubstitute: function(fnNodeMap) {
        var result = new VarExprList();

        var entries = this.entries();
        for (var i = 0; i < entries.length; ++i) {
            var entry = entries[i];
            var newVar = fnNodeMap(entry.v);
            var newExpr = entry.expr ? entry.expr.copySubstitute(fnNodeMap) : null;

            result.add(newVar, newExpr);
        }

        return result;
    },

    toString: function() {
        var arr = [];
        var projEntries = this.entries();
        for (var i = 0; i < projEntries.length; ++i) {
            var entry = projEntries[i];
            var v = entry.v;
            var expr = entry.expr;

            if (expr) {
                arr.push('(' + expr + ' As ' + v + ')');
            } else {
                arr.push(v.toString());
            }
        }

        var result = arr.join(' ');
        return result;
    },
});

module.exports = VarExprList;

},{"../ext/Class":2,"../util/collection/HashMap":343}],226:[function(require,module,exports){
var Class = require('../ext/Class'); 

var NodeFactory = require('../rdf/NodeFactory');

var VarGen = Class.create({
    initialize: function(genSym) {
        this.genSym = genSym;
    },

    next: function() {
        var name = this.genSym.next();
        var result = NodeFactory.createVar(name);
        return result;
    }
});

module.exports = VarGen;

},{"../ext/Class":2,"../rdf/NodeFactory":91}],227:[function(require,module,exports){
var GenSym = require('./GenSym');
var GeneratorBlacklist = require('./GeneratorBlacklist');
var VarGen = require('./VarGen');
var NodeFactory = require('../rdf/NodeFactory');
var StringUtils = require('../util/StringUtils');

var VarUtils = {
    // Some conveniently predefined variables
    g: NodeFactory.createVar('g'),
    s: NodeFactory.createVar('s'),
    p: NodeFactory.createVar('p'),
    o: NodeFactory.createVar('o'),

    _s_: NodeFactory.createVar('_s_'),
    _p_: NodeFactory.createVar('_p_'),
    _o_: NodeFactory.createVar('_o_'),

    v: NodeFactory.createVar('v'),
    w: NodeFactory.createVar('w'),
    x: NodeFactory.createVar('x'),
    y: NodeFactory.createVar('y'),
    z: NodeFactory.createVar('z'),

    a: NodeFactory.createVar('a'),
    b: NodeFactory.createVar('b'),
    c: NodeFactory.createVar('c'),


    /**
     * Convert an array of variable names to variable objects
     *
     */
    createVars: function(varNames) {
        var result = varNames.map(function(varName) {
            return NodeFactory.createVar(varName);
        });

        return result;
    },

    getVarName: function(v) {
        return v.getName();
    },

    /**
     * Convert an array of variable objects into an array of variable names
     *
     *
     */
    getVarNames: function(vars) {
        var result = vars.map(function(v) {
            return v.getName();
        });

        return result;
    },

    /**
     * Create a generator which yields fresh variables that is not contained in the array 'vars'.
     * The new var name will have the given prefix
     *
     */
    createVarGen: function(prefix, excludeVars) {
        if (!prefix) {
            prefix = 'v';
        }

        var excludeVarNames = this.getVarNames(excludeVars);
        var generator = GenSym.create(prefix);
        var genVarName = new GeneratorBlacklist(generator, excludeVarNames);

        var result = new VarGen(genVarName);

        return result;
    },

    varPattern: /\?(\w+)/g,

    /**
     * Extract SPARQL variables from a string
     *
     * @param {String} str
     * @returns {Array}
     */
    extractSparqlVars: function(str) {
        var varNames = StringUtils.extractAllRegexMatches(this.varPattern, str, 1);
        var result = [];
        for (var i = 0; i < varNames.length; ++i) {
            var varName = varNames[i];
            var v = NodeFactory.createVar(varName);
            result.push(v);
        }

        return result;
    },

    /**
     * Create a generator for fresh variable names
     *
     */
    freshVarGen: function(baseVarName, blacklistVars) {
        var blacklistNames = VarUtils.getVarNames(blacklistVars);

        var genSym = GenSym.create(baseVarName);
        var genFreshName = new GeneratorBlacklist(genSym, blacklistNames);
        var result = new VarGen(genFreshName);

        return result;
    },

    /**
     * Allocate a single fresh variable
     */
    freshVar: function(baseVarName, blacklistVars) {
        var varGen = this.freshVarGen(baseVarName, blacklistVars);
        var result = varGen.next();
        return result;
    },

    fnSubst: function(varMap) {
        var result = function(v) {
            var r = varMap.get(v); // [v.getName()];
            return r;
        };

        return result;
    },

};

module.exports = VarUtils;

},{"../rdf/NodeFactory":91,"../util/StringUtils":337,"./GenSym":212,"./GeneratorBlacklist":214,"./VarGen":226}],228:[function(require,module,exports){
var Class = require('../../ext/Class');

/**
 * If null, '*' will be used
 *
 * TODO Not sure if modelling aggregate functions as exprs is a good thing to do.
 *
 * @param subExpr
 * @returns {ns.ECount}
 */
var AggCount = Class.create({
    initialize: function() {
    },

    copySubstitute: function(fnNodeMap) {
        return new AggCount();
    },

    getVarsMentioned: function() {
        return [];
    },

    toString: function() {
        return 'Count(*)';
    },

});

module.exports = AggCount;

},{"../../ext/Class":2}],229:[function(require,module,exports){
var Class = require('../../ext/Class');

var AggCountVarDistinct = Class.create({
    initialize: function(expr) {
        this.expr = expr;
    },

    copySubstitute: function(fnNodeMap) {
        var subExprCopy = this.expr.copySubstitute(fnNodeMap);

        var result = new AggCountVarDistinct(subExprCopy);
        return result;
    },

    getVarsMentioned: function() {
        return this.expr.getVarsMentioned();
    },

    toString: function() {
        var result = 'Count(Distinct ' + this.expr + ')';
        return result;
    },

});

module.exports = AggCountVarDistinct;

},{"../../ext/Class":2}],230:[function(require,module,exports){
var Class = require('../../ext/Class');

var Element = Class.create({
    classLabel: 'jassa.sparql.Element',
});

module.exports = Element;

},{"../../ext/Class":2}],231:[function(require,module,exports){
var Class = require('../../ext/Class');
var union = require('lodash.union');
var NodeUtils = require('../../rdf/NodeUtils');
var Element = require('./Element'); 

var ElementBind = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementBind',

    initialize: function(variable, expression){
        this.expr = expression;
        this.variable = variable;
    },

    getArgs: function(){
        return [];
    },

    getExpr: function(){
        return this.expr;
    },

    getVar: function(){
        return this.variable;
    },

    getVarsMentioned: function(){
        return union(this.expr.getVarsMentioned(), this.variable);
    },

    copy: function(){
        return new ElementBind(this.variable,this.expr);
    },

    copySubstitute: function(fnNodeMap) {
        return new ElementBind(NodeUtils.getSubstitute(this.variable,  fnNodeMap),this.expr.copySubstitute(fnNodeMap));
    },

    flatten: function(){
        return this;
    },

    toString: function(){
        return 'bind(' + this.expr + ' as ' + this.variable  +  ')';
    }

});

module.exports = ElementBind;

},{"../../ext/Class":2,"../../rdf/NodeUtils":92,"./Element":230,"lodash.union":560}],232:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprUtils = require('../ExprUtils');
var Element = require('./Element');

var ElementFilter = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementFilter',
    initialize: function(expr) {
        if (Array.isArray(expr)) {
            throw new Error('[WARN] Array argument for filter is deprecated');
        }

        this.expr = expr;
    },

    getArgs: function() {
        return [];
    },

    copy: function(args) {
        if (args.length !== 0) {
            throw new Error('Invalid argument');
        }

        //  FIXME: Should we clone the attributes too?
        var result = new ElementFilter(this.expr);
        return result;
    },

    copySubstitute: function(fnNodeMap) {
        var newExpr = this.expr.copySubstitute(fnNodeMap);
        return new ElementFilter(newExpr);
    },

    getVarsMentioned: function() {
        return this.expr.getVarsMentioned();
    },

    flatten: function() {
        return this;
    },

    toString: function() {
        // var expr = ns.andify(this.exprs);
        return 'Filter(' + this.expr + ')';
    },
});

module.exports = ElementFilter;

},{"../../ext/Class":2,"../ExprUtils":211,"./Element":230}],233:[function(require,module,exports){
var uniq = require('lodash.uniq');

var Class = require('../../ext/Class');
var Element = require('./Element');
var ElementFilter = require('./ElementFilter');
var ElementTriplesBlock = require('./ElementTriplesBlock');
var TripleUtils = require('../../rdf/TripleUtils');
var ElementHelpers = require('./../ElementHelpers');
var PatternUtils = require('../PatternUtils');

var ElementGroup = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementGroup',
    initialize: function(elements) {
        this.elements = elements ? elements : [];

        if(!Array.isArray(this.elements)) {
            throw new Error(this.classLabel + ' expects a single argument of type array, got [' + arguments.length + '] args; ' + typeof elements + ': ' + elements);
        }

    },

    addElement: function(element) {
        this.elements.push(element);
    },

    getArgs: function() {
        return this.elements;
    },

    copy: function(args) {
        var result = new ElementGroup(args);
        return result;
    },

    copySubstitute: function(fnNodeMap) {
        var newElements = this.elements.map(function(x) {
            return x.copySubstitute(fnNodeMap);
        });
        return new ElementGroup(newElements);
    },

    getVarsMentioned: function() {
        var result = PatternUtils.getVarsMentioned(this.elements);
        return result;
    },

    toString: function() {
        // return this.elements.join(" . ");
        return ElementHelpers.joinElements(' . ', this.elements);
    },

    flatten: function() {

        // Recursively call flatten the children
        var els = this.elements.map(function(element) {
            var r = element.flatten();
            return r;
        });

        // Flatten out ElementGroups by 1 level; collect filters
        var tmps = [];
        els.forEach(function(item) {
            if (item instanceof ElementGroup) {
                tmps.push.apply(tmps, item.elements);
            } else {
                tmps.push(item);
            }
        });

        var triples = [];
        var filters = [];
        var rest = [];

        // Collect the triple blocks
        tmps.forEach(function(item) {
            if (item instanceof ElementTriplesBlock) {
                triples.push.apply(triples, item.getTriples());
            } else if (item instanceof ElementFilter) {
                filters.push(item);
            } else {
                rest.push(item);
            }
        });

        var newElements = [];

        if (triples.length > 0) {
            var ts = TripleUtils.uniqTriples(triples);

            newElements.push(new ElementTriplesBlock(ts));
        }

        newElements.push.apply(newElements, rest);

        var uniqFilters = uniq(filters, false, function(x) {
            return x.toString();
        });
        newElements.push.apply(newElements, uniqFilters);

        var result = (newElements.length === 1) ? newElements[0] : new ElementGroup(newElements);

        return result;
    },
});

module.exports = ElementGroup;

},{"../../ext/Class":2,"../../rdf/TripleUtils":95,"../PatternUtils":217,"./../ElementHelpers":206,"./Element":230,"./ElementFilter":232,"./ElementTriplesBlock":237,"lodash.uniq":583}],234:[function(require,module,exports){
var Class = require('../../ext/Class');
var Element = require('./Element');

var ElementOptional = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementOptional',
    initialize: function(optionalElement) {
        this.optionalElement = optionalElement;

        if (!(optionalElement instanceof Element)) {
            throw new Error(this.classLabel + ' only accepts an instance of Element as the argument');
        }

    },

    getArgs: function() {
        return [
            this.optionalElement,
        ];
    },

    copy: function(args) {
        if (args.length !== 1) {
            throw new Error('Invalid argument');
        }

        // FIXME: Should we clone the attributes too?
        var result = new ElementOptional(args[0]);
        return result;
    },

    getVarsMentioned: function() {
        return this.optionalElement.getVarsMentioned();
    },

    copySubstitute: function(fnNodeMap) {
        return new ElementOptional(this.optionalElement.copySubstitute(fnNodeMap));
    },

    flatten: function() {
        var result = new ElementOptional(this.optionalElement.flatten());
        return result;
    },

    toString: function() {
        return 'Optional {' + this.optionalElement + '}';
    },
});

module.exports = ElementOptional;

},{"../../ext/Class":2,"./Element":230}],235:[function(require,module,exports){
var Class = require('../../ext/Class');
var Element = require('./Element');

var SparqlString = require('../SparqlString');


/**
 * An element that injects a string "as is" into a query.
 *
 */
var ElementString = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementString',

    initialize: function(sparqlString) {
//          if(_(sparqlString).isString()) {
//              debugger;
//          }
        this.sparqlString = sparqlString;
    },

    getArgs: function() {
        return [];
    },

    copy: function(args) {
        if(args.length !== 0) {
            throw new Error('Invalid argument');
        }

        // FIXME: Should we clone the attributes too?
        //var result = new ns.ElementString(this.sparqlString);
        return this;
    },

    toString: function() {
        return this.sparqlString.getString();
    },

    copySubstitute: function(fnNodeMap) {
        var newSparqlString = this.sparqlString.copySubstitute(fnNodeMap);
        return new ElementString(newSparqlString);
    },

    getVarsMentioned: function() {
        return this.sparqlString.getVarsMentioned();
    },

    flatten: function() {
        return this;
    }
});


ElementString.create = function(str, varNames) {
    var sparqlStr = SparqlString.create(str, varNames);
    var result = new ElementString(sparqlStr);
    return result;
};

module.exports = ElementString;

},{"../../ext/Class":2,"../SparqlString":224,"./Element":230}],236:[function(require,module,exports){
var Class = require('../../ext/Class');
var Element = require('./Element');

var ElementSubQuery = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementSubQuery',
    initialize: function(query) {
        this.query = query;
    },

    getQuery: function() {
        return this.query;
    },

    getArgs: function() {
        return [];
    },

    copy: function(args) {
        if (args.length !== 0) {
            throw new Error('Invalid argument');
        }

        // FIXME: Should we clone the attributes too?
        var result = new ElementSubQuery(this.query);
        return result;
    },

    toString: function() {
        return '{ ' + this.query + ' }';
    },

    copySubstitute: function(fnNodeMap) {
        return new ElementSubQuery(this.query.copySubstitute(fnNodeMap));
    },

    flatten: function() {
        return new ElementSubQuery(this.query.flatten());
    },

    getVarsMentioned: function() {
        return this.query.getVarsMentioned();
    },
});

module.exports = ElementSubQuery;

},{"../../ext/Class":2,"./Element":230}],237:[function(require,module,exports){
// libs
var union = require('lodash.union');
var Class = require('../../ext/Class');

// project deps
var TripleUtils = require('../../rdf/TripleUtils');
var Element = require('./Element');

var ElementTriplesBlock = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementTriplesBlock',
    initialize: function(triples) {
        this.triples = triples ? triples : [];
    },

    getArgs: function() {
        return [];
    },

    copy: function(args) {
        if (args.length !== 0) {
            throw new Error('Invalid argument');
        }

        var result = new ElementTriplesBlock(this.triples);
        return result;
    },

    getTriples: function() {
        return this.triples;
    },

    addTriples: function(otherTriples) {
        this.triples = this.triples.concat(otherTriples);
    },

    uniq: function() {
        this.triples = TripleUtils.uniqTriples(this.triples);
        // this.triples = _.uniq(this.triples, false, function(x) { return x.toString(); });
    },

    copySubstitute: function(fnNodeMap) {
        var newElements = this.triples.map(function(x) {
            return x.copySubstitute(fnNodeMap);
        });
        return new ElementTriplesBlock(newElements);
    },

    getVarsMentioned: function() {
        var result = [];
        this.triples.forEach(function(triple) {
            result = union(result, triple.getVarsMentioned());
        });

        return result;
    },

    flatten: function() {
        var ts = TripleUtils.uniqTriples(this.triples);
        var result = new ElementTriplesBlock(ts);
        return result;
    },

    toString: function() {
        return this.triples.join(' . ');
    },
});

module.exports = ElementTriplesBlock;

},{"../../ext/Class":2,"../../rdf/TripleUtils":95,"./Element":230,"lodash.union":560}],238:[function(require,module,exports){
var uniq = require('lodash.uniq');

var Class = require('../../ext/Class');
var Element = require('./Element');
var ElementFilter = require('./ElementFilter');
var ElementTriplesBlock = require('./ElementTriplesBlock');
var TripleUtils = require('../../rdf/TripleUtils');
var ElementHelpers = require('./../ElementHelpers');
var PatternUtils = require('../PatternUtils');

var ElementUnion = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementUnion',
    initialize: function(elements) {
        this.elements = elements ? elements : [];

        if(!Array.isArray(this.elements)) {
            throw new Error(this.classLabel + ' expects a single argument of type array, got [' + arguments.length + '] args; ' + typeof elements + ': ' + elements);
        }

    },

    addElement: function(element) {
        this.elements.push(element);
    },

    getArgs: function() {
        return this.elements;
    },

    copy: function(args) {
        var result = new ElementUnion(args);
        return result;
    },

    copySubstitute: function(fnNodeMap) {
        var newElements = this.elements.map(function(x) {
            return x.copySubstitute(fnNodeMap);
        });
        return new ElementUnion(newElements);
    },

    getVarsMentioned: function() {
        var result = PatternUtils.getVarsMentioned(this.elements);
        return result;
    },

    toString: function() {
        // return this.elements.join(" . ");
        //var result = this.
        //return ElementHelpers.joinElements(' Union ', this.elements);
        var result = '{' + this.elements.join(' } Union {') + '}';
        return result;
    },

    flatten: function() {

        // Recursively call flatten the children
        var els = this.elements.map(function(element) {
            var r = element.flatten();
            return r;
        });

        var result = new ElementUnion(els);
        return result;
    },

});

module.exports = ElementUnion;

},{"../../ext/Class":2,"../../rdf/TripleUtils":95,"../PatternUtils":217,"./../ElementHelpers":206,"./Element":230,"./ElementFilter":232,"./ElementTriplesBlock":237,"lodash.uniq":583}],239:[function(require,module,exports){
var Class = require('../../ext/Class');

var ElementFactory = Class.create({
    createElement: function() {
        throw new Error('Not overridden');
    },
});

module.exports = ElementFactory;

},{"../../ext/Class":2}],240:[function(require,module,exports){
var Class = require('../../ext/Class');
var ElementGroup = require('../element/ElementGroup');
var ElementFactory = require('./ElementFactory');

/**
 * Element factory that simplify combines the elements of its sub element factories.
 * Does not do any variable renaming
 *
 * options: {
 *     simplify: Perform some transformations, such as removing duplicates
 *     forceGroup: always return an instance of ElementGroup, even if it would have only a single member
 * }
 *
 *
 * @param options
 * @param elementFactories: Array of elementFactories
 */
var ElementFactoryCombine = Class.create(ElementFactory, {
    initialize: function(simplify, elementFactories, forceGroup) {
        this.simplify = simplify;
        this.elementFactories = elementFactories;
        this.forceGroup = forceGroup;
    },

    isSimplify: function() {
        return this.simplify;
    },

    getElementFactories: function() {
        return this.elementFactories;
    },

    isForceGroup: function() {
        return this.forceGroup;
    },

    createElement: function() {
        var els = this.elementFactories.map(function(elementFactory) {
            var r = elementFactory.createElement();
            return r;
        });
        var elements = els.filter(function(x) {
            return x != null;
        });

        var result = new ElementGroup(elements);

        // Simplify the element
        if (this.simplify) {
            result = result.flatten();
        }

        // Remove unneccesary ElementGroup unless it is enforced
        if (!this.forceGroup) {
            var members = result.getArgs();
            if (members.length === 1) {
                result = members[0];
            }
        }

        return result;
    },
});

module.exports = ElementFactoryCombine;

},{"../../ext/Class":2,"../element/ElementGroup":233,"./ElementFactory":239}],241:[function(require,module,exports){
var Class = require('../../ext/Class');
var ElementFactory = require('./ElementFactory');

/**
 * Element factory returning an initially provided object
 */
var ElementFactoryConst = Class.create(ElementFactory, {
    initialize: function(element) {
        this.element = element;
    },

    createElement: function() {
        return this.element;
    },
});

module.exports = ElementFactoryConst;

},{"../../ext/Class":2,"./ElementFactory":239}],242:[function(require,module,exports){
var Class = require('../../ext/Class');
var JoinType = require('../join/JoinType');
var ElementUtils = require('../ElementUtils');
var ElementOptional = require('../element/ElementOptional');
var ElementGroup = require('../element/ElementGroup');
var ElementFactory = require('./ElementFactory');

/**
 * This factory creates an element Based on two elements (a, b) and corresponding join variables.
 *
 * The variables in the first element are retained, whereas those of the
 * second element are renamed as needed.
 *
 * The purpose of this class is to support joining a concept created from faceted search
 * with a sponate sparql element.
 *
 * Example:
 * {?x a Castle} join {?y rdfs:label} on (?x = ?y)
 * after the join, the result will be
 * {?y a Castle . ?y rdfs:label}
 *
 *
 *
 *
 */
var ElementFactoryJoin = Class.create(ElementFactory, {
    initialize: function(elementFactoryA, elementFactoryB, joinVarsA, joinVarsB, joinType) {
        this.elementFactoryA = elementFactoryA;
        this.elementFactoryB = elementFactoryB;
        this.joinVarsA = joinVarsA;
        this.joinVarsB = joinVarsB;
        this.joinType = joinType ? joinType : JoinType.INNER_JOIN;
    },

    createElement: function() {
        var elementA = this.elementFactoryA.createElement();
        var elementB = this.elementFactoryB.createElement();

        var varsA = elementA.getVarsMentioned();
        var varsB = elementB.getVarsMentioned();

        var varMap = ElementUtils.createJoinVarMap(varsB, varsA, this.joinVarsB, this.joinVarsA); // , varNameGenerator);

        elementA = ElementUtils.createRenamedElement(elementA, varMap);

        if (this.joinType === JoinType.LEFT_JOIN) {
            elementB = new ElementOptional(elementB);
        }

        var result = new ElementGroup([
            elementA,
            elementB,
        ]);

        return result;
    },
});

module.exports = ElementFactoryJoin;

},{"../../ext/Class":2,"../ElementUtils":207,"../element/ElementGroup":233,"../element/ElementOptional":234,"../join/JoinType":279,"./ElementFactory":239}],243:[function(require,module,exports){
var Class = require('../../ext/Class');
var JoinType = require('../join/JoinType');
var JoinBuilder = require('../join/JoinBuilder');
var ElementGroup = require('../element/ElementGroup');
var ElementFactory = require('./ElementFactory');

/**
 * Variables of conceptB are renamed
 *
 */
var ElementFactoryJoinConcept = Class.create(ElementFactory, {
    initialize: function(conceptFactoryA, conceptFactoryB, joinType) {
        this.conceptFactoryA = conceptFactoryA;
        this.conceptFactoryB = conceptFactoryB;
        this.joinType = joinType || JoinType.INNER_JOIN;
    },

    createElement: function() {
        var conceptA = this.conceptFactoryA.createConcept();
        var conceptB = this.conceptFactoryB.createConcept();

        var elementA = conceptA.getElement();
        var elementB = conceptB.getElement();

        if (conceptB.isSubjectConcept()) {
            return elementA;
        }

        var joinVarsA = [
            conceptA.getVar(),
        ];
        var joinVarsB = [
            conceptB.getVar(),
        ];

        var rootJoinNode = JoinBuilder.create(elementA);
        var joinNode = rootJoinNode.joinAny(this.joinType, joinVarsA, elementB, joinVarsB);

        var joinBuilder = joinNode.getJoinBuilder();
        var elements = joinBuilder.getElements();
        var result = new ElementGroup(elements);

        return result;
    },
});

module.exports = ElementFactoryJoinConcept;

},{"../../ext/Class":2,"../element/ElementGroup":233,"../join/JoinBuilder":273,"../join/JoinType":279,"./ElementFactory":239}],244:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprHelpers = require('../ExprHelpers');

var E_Bound = Class.create({
    initialize: function(expr) {
        this.expr = expr;
    },

    copySubstitute: function(fnNodeMap) {
        return new E_Bound(this.expr.copySubstitute(fnNodeMap));
    },

    getVarsMentioned: function() {
        var result = this.expr.getVarsMentioned();
        return result;
    },
    
    getArgs: function() {
        return [
            this.expr,
        ];
    },

    copy: function(args) {
        var result = ExprHelpers.newUnaryExpr(E_Bound, args);
        return result;
    },

    toString: function() {
        return 'bound(' + this.expr + ')';
    },
});

module.exports = E_Bound;

},{"../../ext/Class":2,"../ExprHelpers":210}],245:[function(require,module,exports){
var Class = require('../../ext/Class');
/*
 * TODO ECast should be removed -
 * a cast expression should be modeled as a function taking a single argument which is the value to cast.
 *
 */

var E_Cast = Class.create({
    initialize: function(expr, node) {
        this.expr = expr;
        this.node = node;
    },

    copySubstitute: function(fnNodeMap) {
        return new E_Cast(this.expr.copySubstitute(fnNodeMap), this.node.copySubstitute(fnNodeMap));
    },
});

module.exports = E_Cast;

},{"../../ext/Class":2}],246:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprFunction2 = require('./ExprFunction2');

var E_Equals = Class.create(ExprFunction2, {
    initialize: function($super, left, right) {
        $super('=', left, right);
    },

    copySubstitute: function(fnNodeMap) {
        return new E_Equals(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
    },

    $copy: function(left, right) {
        return new E_Equals(left, right);
    },

    toString: function() {
        return '(' + this.left + ' = ' + this.right + ')';
    },

    eval: function() { // binding) {
        // TODO Evaluate the expression
    },
});

module.exports = E_Equals;

},{"../../ext/Class":2,"./ExprFunction2":265}],247:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprFunctionN = require('./ExprFunctionN');

var E_Function = Class.create(ExprFunctionN, {
    initialize: function($super, name, args) {
        $super(name, args);
    },

    copy: function(newArgs) {
        var result = new E_Function(this.name, newArgs);
        return result;
    },
});

module.exports = E_Function;

},{"../../ext/Class":2,"./ExprFunctionN":267}],248:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprFunction2 = require('./ExprFunction2');
var ExprHelpers = require('../ExprHelpers');

var E_GreaterThan = Class.create(ExprFunction2, {
    initialize: function($super, left, right) {
        $super('>', left, right);
    },

    copySubstitute: function(fnNodeMap) {
        return new E_GreaterThan(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
    },

    copy: function(args) {
        return ExprHelpers.newBinaryExpr(E_GreaterThan, args);
    },

    toString: function() {
        return '(' + this.left + ' > ' + this.right + ')';
    },
});

module.exports = E_GreaterThan;

},{"../../ext/Class":2,"../ExprHelpers":210,"./ExprFunction2":265}],249:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprHelpers = require('../ExprHelpers');

var E_Lang = Class.create({
    initialize: function(expr) {
        this.expr = expr;
    },

    copySubstitute: function(fnNodeMap) {
        return new E_Lang(this.expr.copySubstitute(fnNodeMap));
    },

    getArgs: function() {
        return [
            this.expr,
        ];
    },

    copy: function(args) {
        var result = ExprHelpers.newUnaryExpr(E_Lang, args);
        return result;
    },

    toString: function() {
        return 'lang(' + this.expr + ')';
    },

    getVarsMentioned: function() {
        return this.expr.getVarsMentioned();
    },
});

module.exports = E_Lang;

},{"../../ext/Class":2,"../ExprHelpers":210}],250:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprHelpers = require('../ExprHelpers');
var PatternUtils = require('../PatternUtils');

var E_LangMatches = Class.create({
    initialize: function(left, right) {
        this.left = left;
        this.right = right;
    },

    copySubstitute: function(fnNodeMap) {
        return new E_LangMatches(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
    },

    getArgs: function() {
        return [
            this.left,
            this.right,
        ];
    },

    copy: function(args) {
        return ExprHelpers.newBinaryExpr(E_LangMatches, args);
    },

    toString: function() {
        return 'langMatches(' + this.left + ', ' + this.right + ')';
    },

    getVarsMentioned: function() {
        var result = PatternUtils.getVarsMentioned(this.getArgs());
        return result;
    },
});

module.exports = E_LangMatches;

},{"../../ext/Class":2,"../ExprHelpers":210,"../PatternUtils":217}],251:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprFunction2 = require('./ExprFunction2');
var ExprHelpers = require('../ExprHelpers');

var E_LessThan = Class.create(ExprFunction2, {
    initialize: function($super, left, right) {
        $super('<', left, right);
    },

    copySubstitute: function(fnNodeMap) {
        return new E_LessThan(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
    },

    copy: function(args) {
        return ExprHelpers.newBinaryExpr(E_LessThan, args);
    },

    toString: function() {
        return '(' + this.left + ' < ' + this.right + ')';
    },
});

module.exports = E_LessThan;

},{"../../ext/Class":2,"../ExprHelpers":210,"./ExprFunction2":265}],252:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprHelpers = require('../ExprHelpers');

var E_Like = Class.create({
    initialize: function(expr, pattern) {
        this.expr = expr;
        this.pattern = pattern;
    },

    copySubstitute: function(fnNodeMap) {
        return new E_Like(this.expr.copySubstitute(fnNodeMap), this.pattern);
    },

    getVarsMentioned: function() {
        return this.expr.getVarsMentioned();
    },

    getArgs: function() {
        return [
            this.expr,
        ];
    },

    copy: function(args) {

        var result = ExprHelpers.newUnaryExpr(E_Like, args);
        return result;
    },

    toString: function() {
        var patternStr = this.pattern.replace('\'', '\\\'');

        return '(' + this.expr + ' Like \'' + patternStr + '\')';
    },
});

module.exports = E_Like;

},{"../../ext/Class":2,"../ExprHelpers":210}],253:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprHelpers = require('../ExprHelpers');
var ExprFunction2 = require('./ExprFunction2');

var E_LogicalAnd = Class.create(ExprFunction2, {
    initialize: function($super, left, right) {
        $super('&&', left, right);
    },

    copySubstitute: function(fnNodeMap) {
        return new E_LogicalAnd(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
    },

    copy: function(args) {
        return ExprHelpers.newBinaryExpr(E_LogicalAnd, args);
    },

    toString: function() {
        return '(' + this.left + ' && ' + this.right + ')';
    },
});

module.exports = E_LogicalAnd;

},{"../../ext/Class":2,"../ExprHelpers":210,"./ExprFunction2":265}],254:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprHelpers = require('../ExprHelpers');
var ExprFunction1 = require('./ExprFunction1');

var E_LogicalNot = Class.create(ExprFunction1, {
    initialize: function(expr) {
        this.expr = expr;
    },

    copySubstitute: function(fnNodeMap) {
        return new E_LogicalNot(this.expr.copySubstitute(fnNodeMap));
    },

    getArgs: function() {
        return [
            this.expr,
        ];
    },

    copy: function(args) {
        var result = ExprHelpers.newUnaryExpr(E_LogicalNot, args);
        return result;
    },

    toString: function() {
        return '(!' + this.expr + ')';
    },
});

module.exports = E_LogicalNot;

},{"../../ext/Class":2,"../ExprHelpers":210,"./ExprFunction1":264}],255:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprFunction2 = require('./ExprFunction2');
var ExprHelpers = require('../ExprHelpers');

var E_LogicalOr = Class.create(ExprFunction2, {
    initialize: function($super, left, right) {
        $super('||', left, right);
    },

    copySubstitute: function(fnNodeMap) {
        var a = this.left.copySubstitute(fnNodeMap);
        var b = this.right.copySubstitute(fnNodeMap);
        var result = new E_LogicalOr(a, b); 
        return result;
    },

    getArgs: function() {
        return [
            this.left,
            this.right,
        ];
    },

    copy: function(args) {
        return ExprHelpers.newBinaryExpr(E_LogicalOr, args);
    },

    toString: function() {
        return '(' + this.left + ' || ' + this.right + ')';
    },
});

module.exports = E_LogicalOr;

},{"../../ext/Class":2,"../ExprHelpers":210,"./ExprFunction2":265}],256:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprFunction0 = require('./ExprFunction0');

var E_NotExists = Class.create(ExprFunction0, {
    initialize: function($super, element) {
        $super('jassa.sparql.E_NotExists');
        this.element = element;
    },

    getVarsMentioned: function() {
        return this.element.getVarsMentioned();
    },

    $copy: function() {
        return new E_NotExists(this.element);
    },

    toString: function() {
        return 'Not Exists (' + this.element + ') ';
    },

});

module.exports = E_NotExists;

},{"../../ext/Class":2,"./ExprFunction0":263}],257:[function(require,module,exports){
var Class = require('../../ext/Class');
var Expr = require('./Expr');

// helper
var getSubstitute = function(node, fnNodeMap) {
    var result = fnNodeMap(node);
    if (!result) {
        result = node;
    }
    return result;
};

// TODO Change to ExprFunctionN
// TODO rhs should be exprList instead of nodes
var E_OneOf = Class.create(Expr, {
    // TODO Jena uses an ExprList as the second argument
    initialize: function(lhsExpr, nodes) {

        this.lhsExpr = lhsExpr;
        // this.variable = variable;
        if(!Array.isArray(nodes)) {
            throw new Error('nodes must be an array');
        }

        this.nodes = nodes;
    },

    getVarsMentioned: function() {
        // return [this.variable];
        var result = this.lhsExpr.getVarsMentioned();
        return result;
    },

    copySubstitute: function(fnNodeMap) {
        var newElements = this.nodes.map(function(x) {
            return getSubstitute(x, fnNodeMap);
        });
        return new E_OneOf(this.lhsExpr.copySubstitute(fnNodeMap), newElements);
    },

    toString: function() {

        if (!this.nodes || this.nodes.length === 0) {
            //
            return 'FALSE';
        } else {
            return '(' + this.lhsExpr + ' in (' + this.nodes.join(', ') + '))';
        }
    },
});

module.exports = E_OneOf;

},{"../../ext/Class":2,"./Expr":260}],258:[function(require,module,exports){
var Class = require('../../ext/Class');
var Expr = require('./Expr');

// TODO Should be ExprFunctionN
var E_Regex = Class.create(Expr, {
    initialize: function(expr, pattern, flags) {
        this.expr = expr;
        this.pattern = pattern;
        this.flags = flags;
    },

    copySubstitute: function(fnNodeMap) {
        return new E_Regex(this.expr.copySubstitute(fnNodeMap), this.pattern, this.flags);
    },

    getVarsMentioned: function() {
        return this.expr.getVarsMentioned();
    },

    getArgs: function() {
        return [
            this.expr,
        ];
    },

    copy: function(args) {
        if (args.length !== 1) {
            throw new Error('Invalid argument');
        }

        var newExpr = args[0];
        var result = new E_Regex(newExpr, this.pattern, this.flags);
        return result;
    },

    toString: function() {
        var patternStr = this.pattern.replace('\"', '\\\"');
        var flagsStr = this.flags ? ', "' + this.flags.replace('\"', '\\\"') + '"' : '';

        return 'regex(' + this.expr + ', "' + patternStr + '"' + flagsStr + ')';
    },
});

module.exports = E_Regex;

},{"../../ext/Class":2,"./Expr":260}],259:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprFunction1 = require('./ExprFunction1');

var E_Str = Class.create(ExprFunction1, {
    initialize: function($super, subExpr) {
        $super('str', subExpr);
    },

    getVarsMentioned: function() {
        return this.subExpr.getVarsMentioned();
    },

    copy: function(args) {
        return new E_Str(args[0]);
    },

    toString: function() {
        return 'str(' + this.subExpr + ')';
    },
});

module.exports = E_Str;

},{"../../ext/Class":2,"./ExprFunction1":264}],260:[function(require,module,exports){
var Class = require('../../ext/Class');
/**
 * Expr classes, similar to those in Jena
 *
 * Usally, the three major cases we need to discriminate are:
 * - Varibles
 * - Constants
 * - Functions
 *
 */
var Expr = Class.create({
    isFunction: function() {
        return false;
    },

    isVar: function() {
        return false;
    },

    isConstant: function() {
        return false;
    },

    getFunction: function() {
        throw new Error('Override me');
    },

    getExprVar: function() {
        throw new Error('Override me');
    },

    getConstant: function() {
        throw new Error('Override me');
    },

    copySubstitute: function() {
        throw new Error('Override me');
    },

    copy: function() {
        throw new Error('Override me');
    },
});

module.exports = Expr;

},{"../../ext/Class":2}],261:[function(require,module,exports){
var Class = require('../../ext/Class');
var NodeUtils = require('../../rdf/NodeUtils');
var ExprHelpers = require('../ExprHelpers');

var ExprAggregator = Class.create({
    initialize: function(v, aggregator) {
        this.v = v; // I don't know what jena uses the var for
        this.agg = aggregator;
    },

    copySubstitute: function(fnNodeMap) {
        var newV = NodeUtils.getSubstitute(this.v, fnNodeMap);
        var newAgg = this.agg.copySubstitute(fnNodeMap);
        var result = new ExprAggregator(newV, newAgg);
        return result;
    },

    getAggregator: function() {
        return this.agg;
    },
    
    getArgs: function() {
        return [];
    },

    copy: function(args) {
        var result = new ExprAggregator(this.v, this.agg);
        return result;
    },

    toString: function() {
        return this.agg.toString();
    },

    getVarsMentioned: function() {
        // TODO Include this.v in the result?
        var result = this.agg.getVarsMentioned();
        return result;
    },

});

module.exports = ExprAggregator;

},{"../../ext/Class":2,"../../rdf/NodeUtils":92,"../ExprHelpers":210}],262:[function(require,module,exports){
var Class = require('../../ext/Class');
var Expr = require('./Expr');

var ExprFunction = Class.create(Expr, {
    getName: function() {
        throw new Error('Implement me');
    },

    isFunction: function() {
        return true;
    },

    getFunction: function() {
        return this;
    },
});

module.exports = ExprFunction;

},{"../../ext/Class":2,"./Expr":260}],263:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprFunctionBase = require('./ExprFunctionBase');

var ExprFunction0 = Class.create(ExprFunctionBase, {
    initialize: function($super, name) {
        $super(name);
    },
    getArgs: function() {
        return [];
    },

    copy: function(args) {
        if (args && args.length > 0) {
            throw new Error('Invalid argument');
        }

        var result = this.$copy(args);
        return result;
    },
});

module.exports = ExprFunction0;

},{"../../ext/Class":2,"./ExprFunctionBase":266}],264:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprFunctionBase = require('./ExprFunctionBase');

var ExprFunction1 = Class.create(ExprFunctionBase, {
    initialize: function($super, name, subExpr) {
        $super(name);

        this.subExpr = subExpr;
    },

    getArgs: function() {
        return [
            this.subExpr,
        ];
    },

    copy: function(args) {
        if (args.length !== 1) {
            throw new Error('Invalid argument');
        }

        var result = this.$copy(args);
        return result;
    },

    getSubExpr: function() {
        return this.subExpr;
    },
});

module.exports = ExprFunction1;

},{"../../ext/Class":2,"./ExprFunctionBase":266}],265:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprFunctionBase = require('./ExprFunctionBase');

var ExprFunction2 = Class.create(ExprFunctionBase, {
    initialize: function($super, name, left, right) {
        $super(name);

        this.left = left;
        this.right = right;
    },

    getArgs: function() {
        return [
            this.left,
            this.right,
        ];
    },

    copy: function(args) {
        if (args.length !== 2) {
            throw new Error('Invalid argument');
        }

        var result = this.$copy(args[0], args[1]);
        return result;
    },

    getLeft: function() {
        return this.left;
    },

    getRight: function() {
        return this.right;
    },
});

module.exports = ExprFunction2;

},{"../../ext/Class":2,"./ExprFunctionBase":266}],266:[function(require,module,exports){
var Class = require('../../ext/Class');
var PatternUtils = require('../PatternUtils');
var ExprFunction = require('./ExprFunction');

var ExprFunctionBase = Class.create(ExprFunction, {
    initialize: function(name) {
        this.name = name;
    },

    copySubstitute: function(fnNodeMap) {
        var args = this.getArgs();
        var newArgs = args.map(function(arg) {
            var r = arg.copySubstitute(fnNodeMap);
            return r;
        });

        var result = this.copy(newArgs);
        return result;
    },

    getVarsMentioned: function() {
        var result = PatternUtils.getVarsMentioned(this.getArgs());
        return result;
    },

    toString: function() {
        var result = this.name + '(' + this.getArgs().join(', ') + ')';
        return result;
    },
});

module.exports = ExprFunctionBase;

},{"../../ext/Class":2,"../PatternUtils":217,"./ExprFunction":262}],267:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprFunctionBase = require('./ExprFunctionBase');

var ExprFunctionN = Class.create(ExprFunctionBase, {
    initialize: function($super, name, args) {
        $super(name, args);

        this.args = args;
    },

    getArgs: function() {
        return this.args;
    },
});

module.exports = ExprFunctionN;

},{"../../ext/Class":2,"./ExprFunctionBase":266}],268:[function(require,module,exports){
var Class = require('../../ext/Class');
var SparqlString = require('../SparqlString');
var Expr = require('./Expr');

var ExprString = Class.create(Expr, {
    classLabel: 'jassa.sparql.ExprString',
    initialize: function(sparqlString) {
        this.sparqlString = sparqlString;
    },

    copySubstitute: function(fnNodeMap) {
        var newSparqlString = this.sparqlString.copySubstitute(fnNodeMap);
        return new ExprString(newSparqlString);
    },

    getVarsMentioned: function() {
        return this.sparqlString.getVarsMentioned();
    },

    getArgs: function() {
        return [];
    },

    copy: function(args) {
        if (args.length !== 0) {
            throw new Error('Invalid argument');
        }

        return this;
    },

    toString: function() {
        return '(!' + this.expr + ')';
    },

    create: function(str, varNames) {
        var result = new ExprString(SparqlString.create(str, varNames));
        return result;
    },
});

module.exports = ExprString;

},{"../../ext/Class":2,"../SparqlString":224,"./Expr":260}],269:[function(require,module,exports){
var Class = require('../../ext/Class');
var Expr = require('./Expr');
var NodeValueUtils = require('./../NodeValueUtils');

var ExprVar = Class.create(Expr, {
    classLabel: 'ExprVar',

    initialize: function(v) {
        this.v = v;
    },

    eval: function(binding) {
        var node = binding.get(this.v);
        var result = NodeValueUtils.makeNode(node);
        //if(result == null) {
        //    console.log('[WARN] ExprVar ' + this.v + ' evaluated to null');
        //}
        return result;
    },

    copySubstitute: function(fnNodeMap) {
        var node = fnNodeMap(this.v);

        var result;
        if (node == null) {
            result = this;
        } else if (node.isVariable()) {
            result = new ExprVar(node);
        } else {
            result = NodeValueUtils.makeNode(node);
        }

        // var result = (n == null) ? this : //node;//rdf.NodeValue.makeNode(node);

        return result;
        // return new ns.ExprVar(this.v.copySubstitute(fnNodeMap));
        // return this;
    },

    getArgs: function() {
        return [];
    },

    copy: function(args) {
        if (args && args.length > 0) {
            throw new Error('Invalid argument');
        }

        var result = new ExprVar(this.v);
        return result;
    },

    isVar: function() {
        return true;
    },

    getExprVar: function() {
        return this;
    },

    asVar: function() {
        return this.v;
    },

    getVarsMentioned: function() {
        return [
            this.v,
        ];
    },

    toString: function() {
        return this.v.toString();
    },
});

module.exports = ExprVar;

},{"../../ext/Class":2,"./../NodeValueUtils":216,"./Expr":260}],270:[function(require,module,exports){
var Class = require('../../ext/Class');
var Expr = require('./Expr');
var xsd = require('../../vocab/xsd');
var NodeFactory = require('../../rdf/NodeFactory');

// TODO Not sure about the best way to design this class
// Jena does it by subclassing for each type e.g. NodeValueDecimal

// TODO Do we even need this class? There is NodeValueNode now!

var NodeValue = Class.create(Expr, {
    initialize: function(node) {
        this.node = node;
    },

    isConstant: function() {
        return true;
    },

    getConstant: function() {
        return this;
    },

    getArgs: function() {
        return [];
    },

    getVarsMentioned: function() {
        return [];
    },

    asNode: function() {
        throw new Error('makeNode is not overridden');
    },

    copySubstitute: function() { // fnNodeMap) {
        // TODO Perform substitution based on the node value
        // But then we need to map a node to a nodeValue first...
        return this;
        // return new ns.NodeValue(this.node.copySubstitute(fnNodeMap));
    },

    toString: function() {
        var node = this.node;

        var result;
        if (node.isLiteral()) {
            if (node.getLiteralDatatypeUri() === xsd.xstring.getUri()) {
                var lex = node.getLiteralLexicalForm();

                //lex = lex.replace('\n', '\\n');

                result = '\'' + lex + '\'';
            } else if (node.dataType === xsd.xdouble.value) {
                // TODO This is a hack - why is it here???
                return parseFloat(this.node.value);
            }
        } else {
            result = node.toString();
        }
        // TODO Numeric values do not need the full rdf term representation
        // e.g. '50'^^xsd:double - this method should output 'natural/casual'
        // representations
        return result;
    },

    eval: function(binding) {
        return this;
    }
});


module.exports = NodeValue;

},{"../../ext/Class":2,"../../rdf/NodeFactory":91,"../../vocab/xsd":357,"./Expr":260}],271:[function(require,module,exports){
var Class = require('../../ext/Class');
var xsd = require('../../vocab/xsd');
var NodeValue = require('./NodeValue');

var NodeValueNode = Class.create(NodeValue, {
    initialize: function(node) {
        this.node = node;
    },

    asNode: function() {
        return this.node;
    },

    toString: function() {
        var node = this.node;

        var result = null;
        if (node.isLiteral()) {
            if (node.getLiteralDatatypeUri() === xsd.xstring.getUri()) {
                result = '"' + node.getLiteralLexicalForm() + '"';
            }
        }

        if (result == null) {
            result = node.toString();
        }

        return result;
    },
});

//NodeValueNode.nvNothing = new NodeValue(NodeFactory.createAnon(new AnonIdStr('node value nothing')));

module.exports = NodeValueNode;

},{"../../ext/Class":2,"../../vocab/xsd":357,"./NodeValue":270}],272:[function(require,module,exports){
'use strict';

var ns = {
    BestLabelConfig: require('./BestLabelConfig'),
    Binding: require('./Binding'),
    BindingUtils: require('./BindingUtils'),
    CannedConceptUtils: require('./CannedConceptUtils'),
    Concept: require('./Concept'),
    ConceptUtils: require('./ConceptUtils'),
    DiffUtils: require('./DiffUtils'),
    ElementHelpers: require('./ElementHelpers'),
    ElementUtils: require('./ElementUtils'),
    ExprEvaluator: require('./ExprEvaluator'),
    ExprEvaluatorImpl: require('./ExprEvaluatorImpl'),
    ExprHelpers: require('./ExprHelpers'),
    ExprUtils: require('./ExprUtils'),
    GenSym: require('./GenSym'),
    Generator: require('./Generator'),
    GeneratorBlacklist: require('./GeneratorBlacklist'),
    LabelUtils: require('./LabelUtils'),
    NodeValueUtils: require('./NodeValueUtils'),
    PatternUtils: require('./PatternUtils'),
    Query: require('./Query'),
    QueryType: require('./QueryType'),
    QueryUtils: require('./QueryUtils'),
    Relation: require('./Relation'),
    RelationUtils: require('./RelationUtils'),
    SortCondition: require('./SortCondition'),
    SparqlString: require('./SparqlString'),
    VarExprList: require('./VarExprList'),
    VarGen: require('./VarGen'),
    VarUtils: require('./VarUtils'),
    AggCount: require('./agg/AggCount'),
    AggCountVarDistinct: require('./agg/AggCountVarDistinct'),
    Element: require('./element/Element'),
    ElementBind: require('./element/ElementBind'),
    ElementFilter: require('./element/ElementFilter'),
    ElementGroup: require('./element/ElementGroup'),
    ElementOptional: require('./element/ElementOptional'),
    ElementString: require('./element/ElementString'),
    ElementSubQuery: require('./element/ElementSubQuery'),
    ElementTriplesBlock: require('./element/ElementTriplesBlock'),
    ElementUnion: require('./element/ElementUnion'),
    ElementFactory: require('./element_factory/ElementFactory'),
    ElementFactoryCombine: require('./element_factory/ElementFactoryCombine'),
    ElementFactoryConst: require('./element_factory/ElementFactoryConst'),
    ElementFactoryJoin: require('./element_factory/ElementFactoryJoin'),
    ElementFactoryJoinConcept: require('./element_factory/ElementFactoryJoinConcept'),
    E_Bound: require('./expr/E_Bound'),
    E_Cast: require('./expr/E_Cast'),
    E_Equals: require('./expr/E_Equals'),
    E_Function: require('./expr/E_Function'),
    E_GreaterThan: require('./expr/E_GreaterThan'),
    E_Lang: require('./expr/E_Lang'),
    E_LangMatches: require('./expr/E_LangMatches'),
    E_LessThan: require('./expr/E_LessThan'),
    E_Like: require('./expr/E_Like'),
    E_LogicalAnd: require('./expr/E_LogicalAnd'),
    E_LogicalNot: require('./expr/E_LogicalNot'),
    E_LogicalOr: require('./expr/E_LogicalOr'),
    E_NotExists: require('./expr/E_NotExists'),
    E_OneOf: require('./expr/E_OneOf'),
    E_Regex: require('./expr/E_Regex'),
    E_Str: require('./expr/E_Str'),
    Expr: require('./expr/Expr'),
    ExprAggregator: require('./expr/ExprAggregator'),
    ExprFunction: require('./expr/ExprFunction'),
    ExprFunction0: require('./expr/ExprFunction0'),
    ExprFunction1: require('./expr/ExprFunction1'),
    ExprFunction2: require('./expr/ExprFunction2'),
    ExprFunctionBase: require('./expr/ExprFunctionBase'),
    ExprFunctionN: require('./expr/ExprFunctionN'),
    ExprString: require('./expr/ExprString'),
    ExprVar: require('./expr/ExprVar'),
    NodeValue: require('./expr/NodeValue'),
    NodeValueNode: require('./expr/NodeValueNode'),
    JoinBuilder: require('./join/JoinBuilder'),
    JoinBuilderUtils: require('./join/JoinBuilderUtils'),
    JoinInfo: require('./join/JoinInfo'),
    JoinNode: require('./join/JoinNode'),
    JoinNodeInfo: require('./join/JoinNodeInfo'),
    JoinTargetState: require('./join/JoinTargetState'),
    JoinType: require('./join/JoinType'),
    KeywordSearchUtils: require('./search/KeywordSearchUtils'),
};

Object.freeze(ns);

module.exports = ns;

},{"./BestLabelConfig":199,"./Binding":200,"./BindingUtils":201,"./CannedConceptUtils":202,"./Concept":203,"./ConceptUtils":204,"./DiffUtils":205,"./ElementHelpers":206,"./ElementUtils":207,"./ExprEvaluator":208,"./ExprEvaluatorImpl":209,"./ExprHelpers":210,"./ExprUtils":211,"./GenSym":212,"./Generator":213,"./GeneratorBlacklist":214,"./LabelUtils":215,"./NodeValueUtils":216,"./PatternUtils":217,"./Query":218,"./QueryType":219,"./QueryUtils":220,"./Relation":221,"./RelationUtils":222,"./SortCondition":223,"./SparqlString":224,"./VarExprList":225,"./VarGen":226,"./VarUtils":227,"./agg/AggCount":228,"./agg/AggCountVarDistinct":229,"./element/Element":230,"./element/ElementBind":231,"./element/ElementFilter":232,"./element/ElementGroup":233,"./element/ElementOptional":234,"./element/ElementString":235,"./element/ElementSubQuery":236,"./element/ElementTriplesBlock":237,"./element/ElementUnion":238,"./element_factory/ElementFactory":239,"./element_factory/ElementFactoryCombine":240,"./element_factory/ElementFactoryConst":241,"./element_factory/ElementFactoryJoin":242,"./element_factory/ElementFactoryJoinConcept":243,"./expr/E_Bound":244,"./expr/E_Cast":245,"./expr/E_Equals":246,"./expr/E_Function":247,"./expr/E_GreaterThan":248,"./expr/E_Lang":249,"./expr/E_LangMatches":250,"./expr/E_LessThan":251,"./expr/E_Like":252,"./expr/E_LogicalAnd":253,"./expr/E_LogicalNot":254,"./expr/E_LogicalOr":255,"./expr/E_NotExists":256,"./expr/E_OneOf":257,"./expr/E_Regex":258,"./expr/E_Str":259,"./expr/Expr":260,"./expr/ExprAggregator":261,"./expr/ExprFunction":262,"./expr/ExprFunction0":263,"./expr/ExprFunction1":264,"./expr/ExprFunction2":265,"./expr/ExprFunctionBase":266,"./expr/ExprFunctionN":267,"./expr/ExprString":268,"./expr/ExprVar":269,"./expr/NodeValue":270,"./expr/NodeValueNode":271,"./join/JoinBuilder":273,"./join/JoinBuilderUtils":274,"./join/JoinInfo":275,"./join/JoinNode":276,"./join/JoinNodeInfo":277,"./join/JoinTargetState":278,"./join/JoinType":279,"./search/KeywordSearchUtils":280}],273:[function(require,module,exports){
/* jshint maxparams: 6 */
var Class = require('../../ext/Class');
var HashBidiMap = require('../../util/collection/HashBidiMap');
var GenSym = require('../GenSym');
var GeneratorBlacklist = require('../GeneratorBlacklist');
var ElementUtils = require('../ElementUtils');
var ElementGroup = require('../element/ElementGroup');
var ElementOptional = require('../element/ElementOptional');
var VarUtils = require('../VarUtils');
var JoinNode = require('./JoinNode');
var JoinTargetState = require('./JoinTargetState');
var JoinInfo = require('./JoinInfo');
var JoinType = require('./JoinType');

// constructor
var JoinBuilder = Class.create({
    initialize: function(rootElement, rootElementVars, rootAlias, defaultRootJoinVars) {
        // Null elements can be used for pseudo-joins that only allocated variables
        // TODO Instead of null elements we now support default join variables for the root node
        if (rootElement == null) {
            console.log('[Error] Root element must not be null');
            throw new Error('Bailing out');
        }

        this.usedVarNames = [];
        this.usedVars = [];

        this.aliasGenerator = new GenSym('a');
        this.varNameGenerator = new GeneratorBlacklist(new GenSym('v'), this.usedVarNames);

        this.aliasToState = {};

        this.rootAlias = rootAlias ? rootAlias : this.aliasGenerator.next();

        // var rootElementVars = targetElement.getVarsMentioned();
        if (defaultRootJoinVars == null) {
            defaultRootJoinVars = [];
        }

        var rootState = this.createTargetState(this.rootAlias, new HashBidiMap(), defaultRootJoinVars, rootElement, rootElementVars, defaultRootJoinVars);

        this.aliasToState[this.rootAlias] = rootState;

        this.rootNode = rootState.getJoinNode(); // new ns.JoinNode(rootAlias);
    },

    getRootNode: function() {
        return this.rootNode;
    },

    getJoinNode: function(alias) {
        var state = this.aliasToState[alias];

        var result = state ? state.getJoinNode() : null;

        return result;
    },

    getState: function(alias) {
        return this.aliasToState[alias];
    },

    getElement: function(alias) {
        var state = this.aliasToState[alias];
        var result = state ? state.getElement() : null;
        return result;
    },

    addVars: function(vars) {

        var self = this;
        vars.forEach(function(v) {
            var varName = v.getName();
            var isContained = self.usedVarNames.indexOf(varName) !== -1;
            if (!isContained) {
                self.usedVarNames.push(varName);
                self.usedVars.push(v);
            }
        });
    },

    createTargetState: function(targetAlias, sourceVarMap, sourceJoinVars, targetElement, oldTargetVars, targetJoinVars) {
        var sjv = sourceJoinVars.map(function(v) {
            var rv = sourceVarMap.get(v);
            return rv;
        });

        var targetVarMap = ElementUtils.createJoinVarMap(this.usedVars, oldTargetVars, sjv, targetJoinVars, this.varNameGenerator);

        var newTargetElement = null;
        if (targetElement != null) {
            newTargetElement = ElementUtils.createRenamedElement(targetElement, targetVarMap);
        }

        var newTargetVars = targetVarMap.getInverse().keys();
        this.addVars(newTargetVars);

        var result = new JoinNode(this, targetAlias, targetJoinVars);

        var targetState = new JoinTargetState(targetVarMap, result, newTargetElement, newTargetVars);
        return targetState;
    },

    addJoin: function(joinType, sourceAlias, sourceJoinVars, targetElement, targetJoinVars, targetAlias) {
        var sourceState = this.aliasToState[sourceAlias];
        var sourceVarMap = sourceState.getVarMap();

        if (!targetAlias) {
            targetAlias = this.aliasGenerator.next();
        }

        var targetElementVars = targetElement.getVarsMentioned();

        var targetState = this.createTargetState(targetAlias, sourceVarMap, sourceJoinVars, targetElement, targetElementVars, targetJoinVars);

        // TODO support specification of join types (i.e. innerJoin, leftJoin)
        var joinInfo = new JoinInfo(targetAlias, joinType);
        sourceState.getJoinInfos().push(joinInfo);

        this.aliasToState[targetAlias] = targetState;

        var result = targetState.getJoinNode();
        return result;
    },

    getElementsRec: function(node) {
        var resultElements = [];

        var element = node.getElement();
        if (element != null) {

            resultElements.push(element);
        }

        var children = node.getJoinNodeInfos();

        var self = this;
        children.forEach(function(child) {
            var childNode = child.getJoinNode();
            var childElements = self.getElementsRec(childNode);

            var childElement = new ElementGroup(childElements);

            var joinType = child.getJoinType();
            switch (joinType) {
                case JoinType.LEFT_JOIN:
                    childElement = new ElementOptional(childElement);
                    break;
                case JoinType.INNER_JOIN:
                    break;
                default:
                    throw new Error('[ERROR] Unsupported join type: ' + joinType);
            }
            resultElements.push(childElement);
        });

        return resultElements;
    },

    getElements: function() {
        var rootNode = this.getRootNode();

        var result = this.getElementsRec(rootNode);

        return result;
    },

    getAliasToVarMap: function() {
        var result = {};
        this.aliasToState.forEach(function(state, alias) {
            result[alias] = state.varMap;
        });

        return result;
    },

    create: function(rootElement, rootAlias, defaultJoinVars) {

        var vars = rootElement.getVarsMentioned();

        var joinBuilder = new JoinBuilder(rootElement, vars, rootAlias, defaultJoinVars);
        var result = joinBuilder.getRootNode();

        return result;
    },

    /**
     * Creates a join node with a 'null' element,
     * however with a set of allocated variables.
     *
     *
     */
    createWithEmptyRoot: function(varNames, rootAlias) {
        // FIXME: varNamesToNodes not defined
        var vars = VarUtils.varNamesToNodes(varNames);

        var joinBuilder = new JoinBuilder(null, vars, rootAlias);
        var result = joinBuilder.getRootNode();

        return result;
    },
});

module.exports = JoinBuilder;

},{"../../ext/Class":2,"../../util/collection/HashBidiMap":342,"../ElementUtils":207,"../GenSym":212,"../GeneratorBlacklist":214,"../VarUtils":227,"../element/ElementGroup":233,"../element/ElementOptional":234,"./JoinInfo":275,"./JoinNode":276,"./JoinTargetState":278,"./JoinType":279}],274:[function(require,module,exports){
var JoinBuilderUtils = {
    getChildren: function(node) {
        // FIXME: getJoinNodes not defined
        return node.getJoinNodes();
    },
};

module.exports = JoinBuilderUtils;

},{}],275:[function(require,module,exports){
var Class = require('../../ext/Class');

// constructor
var JoinInfo = Class.create({
    initialize: function(alias, joinType) {
        this.alias = alias;
        this.joinType = joinType;
    },

    getAlias: function() {
        return this.alias;
    },

    getJoinType: function() {
        return this.joinType;
    },

    toString: function() {
        return this.joinType + ' ' + this.alias;
    },
});

module.exports = JoinInfo;

},{"../../ext/Class":2}],276:[function(require,module,exports){
var Class = require('../../ext/Class');
var JoinNodeInfo = require('./JoinNodeInfo');
var JoinType = require('./JoinType');

// constructor
var JoinNode = Class.create({
    initialize: function(joinBuilder, alias, targetJoinVars) {
        this.joinBuilder = joinBuilder;
        this.alias = alias;
        this.targetJoinVars = targetJoinVars;
    },

    getJoinBuilder: function() {
        return this.joinBuilder;
    },

    /**
     * Returns the variables on which this node is joined to the parent
     *
     * For the root node, this is the set of default vars on which joins
     * can be performed
     *
     */
    getJoinVars: function() {
        return this.targetJoinVars;
    },

    getElement: function() {
        return this.joinBuilder.getElement(this.alias);
    },

    getVarMap: function() {
        return this.joinBuilder.getVarMap(this.alias);
    },

    // Returns all join node object
    // joinBuilder = new joinBuilder();
    // node = joinBuilder.getRootNode();
    // node.join([?s], element, [?o]);
    //    ?s refers to the original element wrapped by the node
    //    ?o also refers to the original element of 'element'
    //
    // joinBuilder.getRowMapper();
    // joinBuilder.getElement();
    // TODO: Result must include joinType
    getJoinNodeInfos: function() {
        var state = this.joinBuilder.getState(this.alias);

        var self = this;
        var result = state.getJoinInfos().map(function(joinInfo) {
            var alias = joinInfo.getAlias();
            var targetJoinNode = self.joinBuilder.getJoinNode(alias);

            var r = new JoinNodeInfo(targetJoinNode, joinInfo.getJoinType());
            return r;
        });

        return result;
    },

    joinAny: function(joinType, sourceJoinVars, targetElement, targetJoinVars, targetAlias) {
        var result = this.joinBuilder.addJoin(joinType, this.alias, sourceJoinVars, targetElement, targetJoinVars, targetAlias);

        return result;
    },

    join: function(sourceJoinVars, targetElement, targetJoinVars, targetAlias) {
        var result = this.joinAny(JoinType.INNER_JOIN, sourceJoinVars, targetElement, targetJoinVars, targetAlias);
        return result;
    },

    leftJoin: function(sourceJoinVars, targetElement, targetJoinVars, targetAlias) {
        var result = this.joinAny(JoinType.LEFT_JOIN, sourceJoinVars, targetElement, targetJoinVars, targetAlias);
        return result;
    },

    joinTree: function() {},
    leftJoinTree: function() {},
    joinTreeAny: function() {},
});

module.exports = JoinNode;

},{"../../ext/Class":2,"./JoinNodeInfo":277,"./JoinType":279}],277:[function(require,module,exports){
var Class = require('../../ext/Class');
// constructor
var JoinNodeInfo = Class.create({
    initialize: function(joinNode, joinType) {
        this.joinNode = joinNode;
        this.joinType = joinType;
    },

    getJoinNode: function() {
        return this.joinNode;
    },

    getJoinType: function() {
        return this.joinType;
    },

    toString: function() {
        return this.joinType + ' ' + this.joinNode;
    },
});

module.exports = JoinNodeInfo;

},{"../../ext/Class":2}],278:[function(require,module,exports){
var Class = require('../../ext/Class');
// constructor
var JoinTargetState = Class.create({
    initialize: function(varMap, joinNode, element, elementVars) {
        this.varMap = varMap;
        this.joinNode = joinNode;
        this.element = element;
        this.elementVars = elementVars;

        this.joinInfos = [];
    },

    getVarMap: function() {
        return this.varMap;
    },

    getJoinNode: function() {
        return this.joinNode;
    },

    getElement: function() {
        return this.element;
    },

    getElementVars: function() {
        return this.elementVars;
    },

    getJoinInfos: function() {
        return this.joinInfos;
    },
});

module.exports = JoinTargetState;

},{"../../ext/Class":2}],279:[function(require,module,exports){
var JoinType = {
    INNER_JOIN: 'inner_join',
    LEFT_JOIN: 'left_join',
};

module.exports = JoinType;

},{}],280:[function(require,module,exports){
var ExprVar = require('../expr/ExprVar');
var E_LangMatches = require('../expr/E_LangMatches');
var E_LogicalOr = require('../expr/E_LogicalOr');
var E_Lang = require('../expr/E_Lang');
var E_Bound = require('../expr/E_Bound');
var E_Regex = require('../expr/E_Regex');
var E_Str = require('../expr/E_Str');
var E_Function = require('../expr/E_Function');

var Concept = require('../Concept');

var ElementGroup = require('../element/ElementGroup');
var ElementOptional = require('../element/ElementOptional');
var ElementFilter = require('../element/ElementFilter');

var NodeValueUtils = require('../NodeValueUtils');

var LabelUtils = require('../LabelUtils');

var KeywordSearchUtils = {
    /**
     * ?s ?p ?o // your relation
     * Filter(Regex(Str(?o), 'searchString'))
     * 
     * if includeSubject is true, the output becomes:
     * 
     * Optional {
     *     ?s ?p ?o // your relation
     *     Filter(Regex(Str(?o), 'searchString'))
     * }
     * Filter(Regex(Str(?s), 'searchString') || Bound(?o))
     * 
     * 
     * 
     * @param relation
     * @returns
     */
    createConceptRegex: function(relation, searchString, includeSubject) {
        var result = includeSubject
            ? this.createConceptRegexIncludeSubject(relation, searchString)
            : this.createConceptRegexLabelOnly(relation, searchString);

        return result;
    },
   
    createConceptRegexLabelOnly: function(relation, searchString) {
        
        var result;
        if(searchString) {
            var element =
                new ElementGroup([
                    relation.getElement(),
                    new ElementFilter(
                        new E_Regex(new E_Str(new ExprVar(relation.getTargetVar())), searchString, 'i'))
               ]);
            
            result = new Concept(element, relation.getSourceVar());
        } else {
            result = null;
        }

        return result;
    },

    createConceptRegexIncludeSubject: function(relation, searchString) {
        var result;

        if(searchString) {
            var relEl = relation.getElement();
            var s = relation.getSourceVar();
            var o = relation.getTargetVar();
    
            // var nv = NodeValueUtils.makeString(searchString);
    
            var es = new ExprVar(s);
            var eo = new ExprVar(o);
            
            var innerExpr = new E_Regex(new E_Str(eo), searchString, 'i');
            
            var outerExpr = new E_LogicalOr(
                new E_Regex(new E_Str(es), searchString, 'i'),
                new E_Bound(eo));
            
    
            var element = new ElementGroup([
                new ElementOptional(
                    new ElementGroup([relEl, new ElementFilter(innerExpr)])),
                new ElementFilter(outerExpr)
            ]);
    
            result = new Concept(element, s);
        } else {
            result = null;
        }
        
        return result;
    },

    /**
     * ?s ?p ?o // relation
     * Filter(<bif:contains>(?o, 'searchString')
     */
    createConceptBifContains: function(relation, searchString) {
        var result;

        if(searchString) {
            var relEl = relation.getElement();
            var o = relation.getTargetVar();
            
            var eo = new ExprVar(o);
            var nv = NodeValueUtils.makeString(searchString);
            
            var element =
                new ElementGroup([
                    relation.getElement(),
                    new ElementFilter(new E_Function('<bif:contains>', [eo, nv]))
                ]);
    
            var s = relation.getSourceVar();
            result = new Concept(element, s);
        } else {
            result = null;
        }

        return result;
    }
};

module.exports = KeywordSearchUtils;

},{"../Concept":203,"../LabelUtils":215,"../NodeValueUtils":216,"../element/ElementFilter":232,"../element/ElementGroup":233,"../element/ElementOptional":234,"../expr/E_Bound":244,"../expr/E_Function":247,"../expr/E_Lang":249,"../expr/E_LangMatches":250,"../expr/E_LogicalOr":255,"../expr/E_Regex":258,"../expr/E_Str":259,"../expr/ExprVar":269}],281:[function(require,module,exports){
var AccRef = require('./acc/AccRef');
var AccTransform = require('./acc/AccTransform');

var AccUtils = {


    unwrapAccTransform: function(acc) {
        var result = acc;
        while(result instanceof AccTransform) {
            result = result.getSubAcc();
        }

        return result;
    },


    /**
     *
     * @param acc An accumulator or an array of accumulators
     * @param result
     * @returns {Array}
     */
    getRefs: function(acc, result) {
        //console.log('Acc: ', acc);
        result = result || [];

        if(Array.isArray(acc)) {
            acc.forEach(function(item) {
                AccUtils.getRefs(item, result);
            });
        } else if(acc instanceof AccRef) {
            result.push(acc);
        } else {
            var subAccs = acc.getSubAccs();
            AccUtils.getRefs(subAccs, result);
        }

        return result;
    },

};

module.exports = AccUtils;
},{"./acc/AccRef":304,"./acc/AccTransform":305}],282:[function(require,module,exports){
var AggRef = require('./agg/AggRef');
var AggTransform = require('./agg/AggTransform');


var AggUtils = {
    unwrapAggTransform: function(agg) {
        var result = agg;
        while(result instanceof AggTransform) {
            result = result.getSubAgg();
        }

        return result;
    },

    getRefs: function(agg, result) {
        result = result || [];

        if(agg instanceof AggRef) {
            result.push(agg);
        } else {
            var subAggs = agg.getSubAggs();
            subAggs.forEach(function(subAgg) {
                AggUtils.getRefs(subAgg, result);
            });
        }

        return result;
    },

};

module.exports = AggUtils;
},{"./agg/AggRef":316,"./agg/AggTransform":317}],283:[function(require,module,exports){
var Class = require('../ext/Class');

var ObjectUtils = require('../util/ObjectUtils');

/**
 * A path of attributes.
 *
 * Just an array of attribute names.
 *
 *
 */
var AttrPath = Class.create({
    classLabel: 'jassa.sponate.AttrPath',

    initialize: function(steps) {
        this.steps = steps ? steps : [];
    },

    getSteps: function() {
        return this.steps;
    },

    toString: function() {
        return this.steps.join('.');
    },

    slice: function(start, end) {
        var result = this.steps.slice(start, end);
        return result;
    },

    first: function() {
        return this.steps[0];
    },

    at: function(index) {
        return this.steps[index];
    },

    isEmpty: function() {
        return this.steps.length === 0;
    },

    size: function() {
        return this.steps.length;
    },

    concat: function(that) {
        var tmp = this.steps.concat(that.getSteps());
        var result = new AttrPath(tmp);
        return result;
    },

    /**
     * Retrieve the value of a path in a json document
     *
     */
    find: function(doc) {
        var result = doc;

        var steps = this.steps;
        for (var i = 0; i < steps.length; ++i) {
            var attr = steps[i];

            if (!ObjectUtils.isObject(result)) {
                throw new Error('[ERROR] Cannot access attribute of non-object', this.steps, doc, result);
            }

            result = result[attr];
        }

        return result;
    },

});

AttrPath.parse = function(str) {
    var steps = str.split('.');

    return new AttrPath(steps);
};

module.exports = AttrPath;

},{"../ext/Class":2,"../util/ObjectUtils":332}],284:[function(require,module,exports){
var Class = require('../ext/Class');

var MappedConceptSource = require('./MappedConceptSource');

var MappedConcept = require('./MappedConcept');
var AggUtils = require('./AggUtils');

var ObjectUtils = require('../util/ObjectUtils');
var RefSpec = require('./RefSpec');

var BindingMapperExpr = require('./binding_mapper/BindingMapperExpr');
var ExprVar = require('../sparql/expr/ExprVar');

var AggMap = require('./agg/AggMap');


var forEach = require('lodash.foreach');


/**
 * A sponate context is a container for mappings, prefixes
 * and configuration options
 */
var Context = Class.create({
    initialize: function(prefixMapping) {
        this.prefixMapping = prefixMapping;
        this.nameToSource = {};

        // This is for the registration of templates
        // Maybe should be moved to StoreFacade
        //this.nameToMappedConcept = nameToMappedConcept || {};
    },

    /*
    getMappedConcept: function(name) {
        return this.nameToMappedConcept[name];
    },
    */

    getSource: function(name) {
        return this.nameToSource[name];
    },
//    addMappedConcept: function() {
//
//    },

    createResolvedContext: function() {
        var result = new Context(this.prefixMapping);

        forEach(this.nameToSource, function(source, name) {

            var mc = source.getMappedConcept();
            var agg = mc.getAgg();
            var aggClone = agg.clone();

            var b = new MappedConcept(mc.getConcept(), aggClone);
            var s = new MappedConceptSource(b, source.getSparqlService());

            result.addSource(name, s);
        });

        forEach(result.nameToSource, function(source, name) {
            result.processRefs(name, source);
        });


        return result;
    },

    processRefs: function(baseName, source) {
        var mappedConcept = source.getMappedConcept();
        var sparqlService = source.getSparqlService();
        var agg = mappedConcept.getAgg();

        var refs = AggUtils.getRefs(agg);

        var self = this;

        refs.forEach(function(ref) {
            var refSpec = ref.getRefSpec();
            //console.log('TEMPLATE REF SPEC ' + JSON.stringify(refSpec));

            var target = refSpec.getTarget();

            // Evaluate function targets
            if(ObjectUtils.isFunction(target)) {
                target = target();
            }

            if(target instanceof MappedConcept) {
                // TODO mappedConcepts used as references are AggObject,
                // however we expect AggMap's - so we have to wrap them

                var aggMap = target.getAgg();
                var aggObject = aggMap.getSubAgg();//target.getAgg();

                //var aggObject = target.getAgg();

                var attrToAgg = aggObject.getAttrToAgg();
                var aggIdLiteral = AggUtils.unwrapAggTransform(attrToAgg.id);
                var idMapper = aggIdLiteral.getBindingMapper();


                aggMap = new AggMap(idMapper, aggObject);

                var newTarget = new MappedConcept(target.getConcept(), aggMap);

                // Allocate a new name and source for this anonymous mapped concept
                var i = 0;
                var name;
                while(self.getSource(name = (baseName + '_' + i))) {
                    ++i;
                }

                ref.setRefSpec(new RefSpec(name, refSpec.getAttr()));
                //console.log('NEW REF SPEC: ' + JSON.stringify(ref));
                //refSpec.setTarget(name);

                var bindingMapper = ref.getBindingMapper();
                if(!bindingMapper) {
                    var c = mappedConcept.getConcept();//newTarget.getConcept();
                    var v = c.getVar();
                    bindingMapper = new BindingMapperExpr(new ExprVar(v));
                    ref.setBindingMapper(bindingMapper);
                }

                var newSource = new MappedConceptSource(newTarget, sparqlService);
                self.nameToSource[name] = newSource;


                //console.log('STATE: ' + JSON.stringify(self.nameToSource, null, 4));
            }
            else if(!ObjectUtils.isString(target)) {
                throw new Error('Unknown target type: ', target);
            }
        });
    },

//    addTemplate: function(spec) {
//        var name = spec.name;
//        if(!name) {
//            throw new Error('Sponate spec must have a name');
//        }
//
//        var mappedConcept = SponateUtils.parseSpec(spec, this.prefixMapping);
//
//        this.nameToMappedConcept[name] = mappedConcept;
//    },
//
    addSource: function(name, source) {
        this.nameToSource[name] = source;

        //console.log('MAPPED CONCEPT ' + name + ': ' + JSON.stringify(mappedConcept, null, null));

//        var source = new MappedConceptSource(mappedConcept, sparqlService);

        //this.processRefs(name, source);
    },
});

module.exports = Context;

},{"../ext/Class":2,"../sparql/expr/ExprVar":269,"../util/ObjectUtils":332,"./AggUtils":282,"./MappedConcept":288,"./MappedConceptSource":289,"./RefSpec":293,"./agg/AggMap":313,"./binding_mapper/BindingMapperExpr":320,"lodash.foreach":433}],285:[function(require,module,exports){
var Class = require('../ext/Class');

var ListServiceUtils = require('./ListServiceUtils');
var AccUtils = require('./AccUtils');

var HashMap = require('../util/collection/HashMap');
var HashSet = require('../util/collection/HashSet');

var LookupServiceUtils = require('./LookupServiceUtils');
var ListServiceUtils = require('./ListServiceUtils');

var ListServiceTransformItems = require('../service/list_service/ListServiceTransformItems');

var ObjectUtils = require('../util/ObjectUtils');

// var _ = require('lodash');
var forEach = require('lodash.foreach');

var shared = require('../util/shared');
var Promise = shared.Promise;

var Slot = Class.create({
    initialize : function(obj, attr, meta) {
        this.obj = obj;
        this.attr = attr;

        this.meta = meta;
    },

    setValue : function(value) {
        this.obj[this.attr] = value;
    },

    getValue : function() {
        return this.obj[this.attr];
    },

    getMeta : function() {
        return this.meta;
    },

    toString : function() {
        return JSON.stringify(this);
    }
});

var Engine = {
    indexAccMap : function(state, sourceName, nodeToAcc) {
        var map = state[sourceName];
        if (!map) {
            map = new HashMap();
            state[sourceName] = map;
        }

        map.putAll(nodeToAcc);
    },

    mergeRefs : function(open, refs) {
        refs.forEach(function(ref) {
            var refSpec = ref.getRefSpec();
            var sourceName = refSpec.getTarget();
            var refValue = ref.getRefValue();

            var set;
            if (!(sourceName in open)) {
                set = new HashSet();
                open[sourceName] = set;
            } else {
                set = open[sourceName];
            }

            set.add(refValue);
        });
    },

    // Return a new array of refs that are not already covered by the state
    // i.e. only return those refs which still need to be resolved
    filterRefs : function(state, refs) {
        var result = [];

        refs.forEach(function(ref) {
            var refSpec = ref.getRefSpec();
            var sourceName = refSpec.getTarget();
            var refValue = ref.getRefValue();

            var map = state[sourceName];

            var isResolved = map && map.containsKey(refValue);
            if (!isResolved) {
                result.push(ref);
            }
        });

        return result;
    },

    buildObjs : function(state) {
        var result = {};

        // Retrieve the value of each acc and extend the original object with it
        // At this point we do not resolve references yet
        forEach(state, function(srcMap, sourceName) {

            var objMap = new HashMap();
            result[sourceName] = objMap;

            srcMap.entries().forEach(function(entry) {
                var id = entry.key;
                var acc = entry.val;

                var val = acc.getValue();
                objMap.put(id, val);
            });
        });

        return result;
    },

    /**
     * For each object retrieve its lazy slots and reverse the order, so that
     * we can evaluate the lazy functions in a depth first manner (i.e. parent lazy transform
     * will only be executed after the child transforms have been applied)
     */
    buildLazySlots: function(sourceToIdtoObj, attr, result) {
        result = result || [];

        forEach(sourceToIdtoObj, function(srcMap, sourceName) {
            srcMap.values().forEach(function(obj) {
                var tmp = Engine.buildSlots(obj, attr);
                tmp = tmp.reverse();
                result.push.apply(result, tmp);
            });
        });

        return result;
    },

    buildSlots : function(obj, attr, result) {
        result = result || [];

        if (Array.isArray(obj)) {

            obj.forEach(function(item, index) {
                if(item && item[attr]) {
                    var slot = new Slot(obj, index, item[attr]);
                    result.push(slot);
                } else {
                    Engine.buildSlots(item, attr, result);
                }
            });

        } else if (ObjectUtils.isObject(obj)) {

            forEach(obj, function(v, k) {
                if (v && v[attr]) {
                    var slot = new Slot(obj, k, v[attr]);
                    result.push(slot);
                } else {
                    Engine.buildSlots(v, attr, result);
                }
            });

        } /*
             * else { // Nothing to do }
             */

        return result;
    },

    createLookupService : function(decls, sourceName) {
        var source = decls.getSource(sourceName);
        if (!source) {
            throw new Error('No source mapping with name ' + sourceName
                    + ' found');
        }

        var sparqlService = source.getSparqlService();
        var mappedConcept = source.getMappedConcept();
        var result = LookupServiceUtils.createLookupServiceMappedConceptAcc(
                sparqlService, mappedConcept);
        return result;
    },

    createListService : function(decls, sourceName, isLeftJoin) {

        // var sourceName = query.getSourceName();

        var source = decls.getSource(sourceName);
        if (!source) {
            throw new Error('No source mapping with name ' + sourceName
                    + ' found');
        }

        var sparqlService = source.getSparqlService();
        var mappedConcept = source.getMappedConcept();

        if(mappedConcept.getConcept().getVar().getName() === 'rowId') {
            throw new Error('rowId cannot be used as the root ID of a MappedConcept');
        }

        var listServiceAcc = ListServiceUtils.createListServiceAcc(
                sparqlService, mappedConcept, isLeftJoin);

        var self = this;

        var result = new ListServiceTransformItems(listServiceAcc, function(accEntries) {
            var r = Promise
                .resolve(self.collectState(decls, sourceName, accEntries))
                .spread(function(rootIds, state, p) {
                    var s = self.postProcess(state, sourceName, rootIds);
                    return s;
                });

            return r;
        });

        return result;
    },

    collectState : function(decls, sourceName, accEntries) {
        // Do the initial concept based lookup
        var state = {};

        // Get the initial ids
        var rootIds = accEntries.map(function(accEntry) { // TODO We could use
                                                            // _.pluck here
            return accEntry.key;
        });

        // Collect the accs
        var map = new HashMap();
        var open = {};

        accEntries.forEach(function(accEntry) {
            var acc = accEntry.val;

            // Note: We expect instances of AccMap here!
            var state = acc.getState();

            map.putAll(state);

            var refs = AccUtils.getRefs(acc);

            Engine.mergeRefs(open, refs);
        });

        // console.log('OPEN: ' + JSON.stringify(open, null, 4));

        state[sourceName] = map;
        var p = this.resolveRefs(decls, open, state);
        return [ rootIds, state, p ];
    },

    postProcess : function(state, sourceName, rootIds) {

        // Retain all references
        var accRefs = [];
        forEach(state, function(srcMap) {
            var accs = srcMap.values();
            var refs = AccUtils.getRefs(accs);

            accRefs.push.apply(accRefs, refs);
        });

        //console.log('AccRefs: ', accRefs);

        accRefs.forEach(function(accRef) {
            var refSpec = accRef.getRefSpec();
            var targetName = refSpec.getTarget();
            var refValue = accRef.getRefValue();

            accRef.setBaseValue({
                _ref : {
                    targetName : targetName,
                    refValue : refValue,
                    attr : refSpec.getAttr()
                }
            });
        });

        var sourceToIdToObj = Engine.buildObjs(state);

        //try {
        var refSlots = Engine.buildSlots(sourceToIdToObj, '_ref');

        var lazySlots = Engine.buildLazySlots(sourceToIdToObj, '_lazy');

//        } catch(err) {
//            console.log('err: ', err);
//        }
        //console.log('Got ' + slots.length + ' slots');

        refSlots.forEach(function(slot) {
            var meta = slot.getMeta();

            var idToObj = sourceToIdToObj[meta.targetName];
            var obj = idToObj.get(meta.refValue);

            var attr = meta.attr;
            obj = (obj != null && attr != null) ? obj[attr] : obj;

            //console.log('SLOT: ' + meta + ' ' + meta.attr + ' ' + obj);

            slot.setValue(obj);
        });


        lazySlots.forEach(function(slot) {
            var meta = slot.getMeta();

            var fn = meta.fn;
            var v = meta.value;

            var replacement = fn(v);
            slot.setValue(replacement);
        });

        // Apply lazy functions
       //var slots = Engine.buildSlots(sourceToIdToObj, '_lazy');

        // Prepare the result
        var result = rootIds.map(function(rootId) {
            var idToObj = sourceToIdToObj[sourceName];
            var obj = idToObj.get(rootId);
            var r = {
                key : rootId,
                val : obj
            };
            return r;
        });

        return result;
    },

    exec : function(decls, query) {
        var sourceName = query.getSourceName();
        var listService = this.createListService(decls, sourceName, query
                .isLeftJoin());

        var limit = query.getLimit();
        var offset = query.getOffset();
        var filterConcept = query.getFilterConcept();

        var result = listService.fetchItems(filterConcept, limit, offset);

        return result;
    },

    /**
     * open is a Map<SourceName, Set<ObjectId>> state is a Map<SourceName,
     * Map<ObjectId, Document>>
     */
    resolveRefs : Promise.method(function(decls, open, state) {

        var self = this;
        var sourceNames = Object.keys(open);

        // console.log('SOURCE NAMES: ', sourceNames);

        var subPromises = sourceNames.map(function(sourceName) {

            // console.log('XXXNAMES: ' + sourceName);

            var set = open[sourceName];

            var lookupService = self.createLookupService(decls, sourceName);
            var nodes = set.entries();

            var subPromise = lookupService.lookup(nodes).then(
                    function(nodeToAcc) {
                        var accs = nodeToAcc.values();
                        // console.log('accs: ' + JSON.stringify(accs));
                        // if(true) { throw new Error('foo'); }

                        Engine.indexAccMap(state, sourceName, nodeToAcc);
                        var refs = AccUtils.getRefs(accs);
                        var openRefs = Engine.filterRefs(state, refs);
                        var next = {};
                        Engine.mergeRefs(next, openRefs);

                        return self.resolveRefs(decls, next, state);
                    });

            return subPromise;
        });

        return Promise.all(subPromises);
    }),

};

module.exports = Engine;

},{"../ext/Class":2,"../service/list_service/ListServiceTransformItems":150,"../util/ObjectUtils":332,"../util/collection/HashMap":343,"../util/collection/HashSet":344,"../util/shared":351,"./AccUtils":281,"./ListServiceUtils":286,"./LookupServiceUtils":287,"lodash.foreach":433}],286:[function(require,module,exports){
var Concept = require('../sparql/Concept');
var ConceptUtils = require('../sparql/ConceptUtils');
var ServiceUtils = require('./ServiceUtils');

var ListServiceSparqlQuery = require('../service/list_service/ListServiceSparqlQuery');
var ListServiceTransformItem = require('../service/list_service/ListServiceTransformItem');

var NodeFactory = require('../rdf/NodeFactory');
var BindingUtils = require('../sparql/BindingUtils');


var ListServiceUtils = {

    createListServiceAcc: function(sparqlService, mappedConcept, isLeftJoin) {
        isLeftJoin = !!isLeftJoin;

        var concept = mappedConcept.getConcept();
        var query = ConceptUtils.createQueryList(concept);

        var agg = mappedConcept.getAgg();

        var rowId = NodeFactory.createVar('rowId');

        // TODO Set up a projection using the grouping variable and the variables referenced by the aggregator
        query.setQueryResultStar(true);

        var ls = new ListServiceSparqlQuery(sparqlService, query, concept.getVar(), isLeftJoin);
        var result = new ListServiceTransformItem(ls, function(entry) {
            var key = entry.key;

            var bindings = entry.val.getBindings();

            // Clone the bindings to avoid corrupting caches
            bindings = BindingUtils.cloneBindings(bindings);

            // Augment them with a rowId attribute
            BindingUtils.addRowIds(bindings, rowId);

            var acc = agg.createAcc();
            bindings.forEach(function(binding) {
                acc.accumulate(binding);
            });

            var r = {key: key, val: acc};
            return r;
        });

        //var result = this.createLookupServiceAgg(sparqlService, query, concept.getVar(), mappedConcept.getAgg());
        return result;
    },

    createListServiceMappedConcept: function(sparqlService, mappedConcept, isLeftJoin) {
        var ls = this.createListServiceAcc(sparqlService, mappedConcept, isLeftJoin);

        // Add a transformer that actually retrieves the value from the acc structure
        var result = new ListServiceTransformItem(ls, function(accEntries) {
            var r = accEntries.map(function(accEntry) {
                var s = accEntry.val.getValue();
                return s;
            });

            return r;
        });

        return result;

        /*
        isLeftJoin = !!isLeftJoin;

        var concept = mappedConcept.getConcept();
        var query = ConceptUtils.createQueryList(concept);

        var agg = mappedConcept.getAgg();

        // TODO Set up a projection using the grouping variable and the variables referenced by the aggregator
        query.setQueryResultStar(true);

        var ls = new ListServiceSparqlQuery(sparqlService, query, concept.getVar(), isLeftJoin);
        var result = new ListServiceTransformItem(ls, function(entry) {
            var bindings = entry.val.getBindings();
            var acc = agg.createAcc();
            var r = ServiceUtils.processBindings(bindings, acc);

            return r;
        });

        //var result = this.createLookupServiceAgg(sparqlService, query, concept.getVar(), mappedConcept.getAgg());
        return result;
        */
    }
};

module.exports = ListServiceUtils;

},{"../rdf/NodeFactory":91,"../service/list_service/ListServiceSparqlQuery":146,"../service/list_service/ListServiceTransformItem":149,"../sparql/BindingUtils":201,"../sparql/Concept":203,"../sparql/ConceptUtils":204,"./ServiceUtils":294}],287:[function(require,module,exports){
var ConceptUtils = require('../sparql/ConceptUtils');
var LookupServiceSparqlQuery = require('../service/lookup_service/LookupServiceSparqlQuery');
var LookupServiceTransform = require('../service/lookup_service/LookupServiceTransform');
//var HashMap = require('../util/collection/HashMap');

var AccUtils = require('./AccUtils');

var LookupServiceUtils = {

        /*
    createTransformAggResultSetPart: function(agg) {
        //var fn = LookupServiceUtils.createTransformAccResultSetPart(agg);

        var result = function(resultSetPart) {
            var acc = fn(resultSetPart);

            var r = acc.getValue();
            return r;
        };

        return result;
    },
    */

    createTransformAccResultSetPart: function(agg) {

        var result = function(resultSetPart) {
            // AccMap expected here
            var acc = agg.createAcc();
            //console.log('resultSetPart', resultSetPart);

            var bindings = resultSetPart.getBindings();
            bindings.forEach(function(binding) {
                acc.accumulate(binding);
            });

            //console.log('LSVAL: ' + JSON.stringify(agg));
            //var r = acc.getState();
            //return r;
            return acc;
        };

        return result;
    },


    /**
     * public static <T> LookupService<Node, T> createLookupService(QueryExecutionFactory sparqlService, MappedConcept<T> mappedConcept)
     */
    createLookupServiceMappedConcept: function(sparqlService, mappedConcept) {
        var ls = this.createLookupServiceMappedConceptAcc(sparqlService, mappedConcept);

        var result = new LookupServiceTransform(ls, function(acc) {
            var r = acc.getValue();
            return r;
        });

        return result;
        /*
        var concept = mappedConcept.getConcept();
        var query = ConceptUtils.createQueryList(concept);

        // TODO Set up a projection using the grouping variable and the variables referenced by the aggregator
        query.setQueryResultStar(true);

        var result = this.createLookupServiceAgg(sparqlService, query, concept.getVar(), mappedConcept.getAgg());

        return result;
*/
//        var ls = new LookupServiceSparqlQuery(sparqlService, query, concept.getVar());
//        var agg = mappedConcept.getAgg();
//        var fnTransform = this.createTransformAggResultSetPart(agg);
//
//        var result = new LookupServiceTransform(ls, fnTransform);
//        return result;
    },

    /*
    createLookupServiceAgg: function(sparqlService, query, groupVar, agg) {
        var ls = new LookupServiceSparqlQuery(sparqlService, query, groupVar);
        var fnTransform = this.createTransformAggResultSetPart(agg);

        var result = new LookupServiceTransform(ls, fnTransform);
        return result;
    },
    */


    createLookupServiceMappedConceptAcc: function(sparqlService, mappedConcept) {
        var concept = mappedConcept.getConcept();
        var query = ConceptUtils.createQueryList(concept);
        var groupVar = concept.getVar();

        // TODO Set up a projection using the grouping variable and the variables referenced by the aggregator
        query.setQueryResultStar(true);

        var aggMap = mappedConcept.getAgg();
        var subAgg = aggMap.getSubAgg();

        var ls = new LookupServiceSparqlQuery(sparqlService, query, groupVar);
        //var ls = this.createLookupServiceAcc(sparqlService, query, concept.getVar(), mappedConcept.getAgg());
        var fnTransform = this.createTransformAccResultSetPart(subAgg);

        var result = new LookupServiceTransform(ls, fnTransform);
        return result;
    },

};

module.exports = LookupServiceUtils;

},{"../service/lookup_service/LookupServiceSparqlQuery":162,"../service/lookup_service/LookupServiceTransform":164,"../sparql/ConceptUtils":204,"./AccUtils":281}],288:[function(require,module,exports){
var Class = require('../ext/Class');

/**
 * Combines a concept with an aggregator
 */
var MappedConcept = Class.create({
    initialize: function(concept, agg) {
        this.concept = concept;
        this.agg = agg;
    },
    
    getConcept: function() {
        return this.concept;
    },
    
    getAgg: function() {
        return this.agg;
    },

});

module.exports = MappedConcept;
},{"../ext/Class":2}],289:[function(require,module,exports){
var Class = require('../ext/Class');

var MappedConceptSource = Class.create({
    initialize: function(mappedConcept, sparqlService) {
        this.mappedConcept = mappedConcept;
        this.sparqlService = sparqlService;
    },

    getMappedConcept: function() {
        return this.mappedConcept;
    },

    getSparqlService: function() {
        return this.sparqlService;
    },

});

module.exports = MappedConceptSource;

},{"../ext/Class":2}],290:[function(require,module,exports){
var NodeUtils = require('../rdf/NodeUtils');

var LabelUtils = require('../sparql/LabelUtils');
var VarUtils = require('../sparql/VarUtils');
var ExprVar = require('../sparql/expr/ExprVar');

var AggArray = require('./agg/AggArray');
var AggLiteral = require('./agg/AggLiteral');
var AggMap = require('./agg/AggMap');
var AggObject = require('./agg/AggObject');
var AggBestLabel = require('./agg/AggBestLabel');
var AggTransform = require('./agg/AggTransform');

var BindingMapperExpr = require('./binding_mapper/BindingMapperExpr');
var BindingMapperTransform = require('./binding_mapper/BindingMapperTransform');

var Concept = require('../sparql/Concept');
var MappedConcept = require('./MappedConcept');

var NodeUtils = require('../rdf/NodeUtils');

var MappedConceptUtils = {

    createMappedConceptBestLabel: function(bestLabelConfig) {
        var relation = LabelUtils.createRelationPrefLabels(bestLabelConfig);

        var s = relation.getSourceVar();
        var o = relation.getTargetVar();

        var agg =
            new AggObject({
                id: new AggTransform(new AggLiteral(new BindingMapperExpr(new ExprVar(s))), NodeUtils.getValue),
                displayLabel: new AggTransform(new AggBestLabel(bestLabelConfig), NodeUtils.getValue),
                hiddenLabels: new AggArray(
                    new AggTransform(new AggLiteral(new BindingMapperExpr(new ExprVar(o))), NodeUtils.getValue))
            });

        agg = new AggMap(new BindingMapperExpr(new ExprVar(s)), agg);


        var labelConcept = new Concept(relation.getElement(), relation.getSourceVar());
        var result = new MappedConcept(labelConcept, agg);

        return result;
    },

};

module.exports = MappedConceptUtils;

},{"../rdf/NodeUtils":92,"../sparql/Concept":203,"../sparql/LabelUtils":215,"../sparql/VarUtils":227,"../sparql/expr/ExprVar":269,"./MappedConcept":288,"./agg/AggArray":308,"./agg/AggBestLabel":310,"./agg/AggLiteral":312,"./agg/AggMap":313,"./agg/AggObject":314,"./agg/AggTransform":317,"./binding_mapper/BindingMapperExpr":320,"./binding_mapper/BindingMapperTransform":322}],291:[function(require,module,exports){
var Class = require('../ext/Class');

/**
 * A reference to another sponate mapping
 *
 */
var MappingRef = Class.create({
    initialize: function(mapName, tableRef, attrPath) {
        this.mapName = mapName;
        this.tableRef = tableRef;
    },

    getMapName: function() {
        return this.mapName;
    },

    getTableRef: function() {
        return this.tableRef;
    },

    getAttrPath: function() {
        return this.attrPath;
    },

    toString: function() {
        var result = this.patternRef + '/' + this.tableRef + '@' + this.attrPath;
        return result;
    },

});

module.exports = MappingRef;

},{"../ext/Class":2}],292:[function(require,module,exports){
var Class = require('../ext/Class');

var Query = Class.create({
    initialize: function(sourceName, criteria, limit, offset, filterConcept, _isLeftJoin, nodes) {
        this.sourceName = sourceName;
        this.criteria = criteria;
        this.limit = limit;
        this.offset = offset;

        this.filterConcept = filterConcept;
        this._isLeftJoin = _isLeftJoin;

        // Note: For each element in the nodes array, corresponding data will be made available.
        // Thus, if nodes is an empty array, no results will be fetched; set to null to ignore the setting
        this.nodes = nodes;
    },

    shallowClone: function() {
        var r = new Query(this.sourceName, this.criteria, this.limit, this.offset, this.filterConcept, this._isLeftJoin, this.nodes);
        return r;
    },

    getSourceName: function() {
        return this.sourceName;
    },

    setSourceName: function(sourceName) {
        this.sourceName = sourceName;
    },

    getCriteria: function() {
        return this.criteria;
    },

    setCriteria: function(criteria) {
        this.criteria = criteria;
    },

    getLimit: function() {
        return this.limit;
    },

    setLimit: function(limit) {
        this.limit = limit;
    },

    getOffset: function() {
        return this.offset;
    },

    setOffset: function(offset) {
        this.offset = offset;
    },

    getFilterConcept: function() {
        return this.filterConcept;
    },

    setFilterConcept: function(filterConcept) {
        this.filterConcept = filterConcept;
    },

    isLeftJoin: function() {
        return this._isLeftJoin;
    },

    setLeftJoin: function(isLeftJoin) {
        this._isLeftJoin = isLeftJoin;
    },

    getNodes: function() {
        return this.nodes;
    },

    setNodes: function(nodes) {
        this.nodes = nodes;
    },

});

module.exports = Query;

},{"../ext/Class":2}],293:[function(require,module,exports){
var Class = require('../ext/Class');

var RefSpec = Class.create({
   initialize: function(target, attr) { //, parser) {
       //this.parser = parser;

       // Target can be (temporarily) an arbitrary object - but eventually
       // it usually becomes a string denoting the id of the target
       this.target = target;
       this.attr = attr;
   },

//   getParser: function() {
//       return this.parser;
//   },

   getTarget: function() {
       return this.target;
   },

   getAttr: function() {
       return this.attr;
   },

});

/**
 * Specification of a reference.
 *
 *
 */
/*
var RefSpec = Class.create({

    initialize: function(sourceMapRef, targetMapRef, isArray, joinTableRef) {
        this.sourceMapRef = sourceMapRef;
        this.targetMapRef = targetMapRef;
        this.isArray = isArray;
        this.joinTableRef = joinTableRef;
    },

    getSourceMapRef: function() {
        return this.sourceMapRef;
    },

    getTargetMapRef: function() {
        return this.targetMapRef;
    },

    isArray: function() {
        return this.isArray;
    },

    getJoinTableRef: function() {
        return this.joinTableRef;
    },

    toString: function() {
        var result = this.sourceMapRef + ' references ' + this.targetMapRef + ' via ' + this.joinTableRef + ' as array? ' + this.isArray;
        return result;
    },

});
*/

module.exports = RefSpec;

},{"../ext/Class":2}],294:[function(require,module,exports){

var ServiceUtils = {
    processResultSet: function(rs, acc) {
        
        while(rs.hasNext()) {
            var binding = rs.next();
            acc.accumulate(binding);
        }
        
        var result = acc.getValue();
        return result;
    },

    processBindings: function(bindings, acc) {
        bindings.forEach(function(binding) {
            acc.accumulate(binding);
        });
        
        var result = acc.getValue();
        return result;
    },
    
    execAgg: function(sparqlService, query, agg) {
        var acc = agg.createAcc();
        var result = this.execAcc(sparqlService, query, acc);
        return result;
    },
    
    execAcc: function(sparqlService, query, acc) {
        var qe = sparqlService.createQueryExecution(query);
        var result = qe.execSelect().then(function(rs) {
            var r = ServiceUtils.processResultSet(rs, acc);
            return r;
        });
        
        return result;
    }
};

module.exports = ServiceUtils;

},{}],295:[function(require,module,exports){
var ObjectUtils = require('../util/ObjectUtils');
var PrefixUtils = require('../util/PrefixUtils');

var Element = require('../sparql/element/Element');
var ElementString = require('../sparql/element/ElementString');

var TemplateParser = require('./TemplateParser');

var ListServiceUtils = require('./ListServiceUtils');
var AggMap = require('./agg/AggMap');
var MappedConcept = require('./MappedConcept');
var ExprVar = require('../sparql/expr/ExprVar');

var Concept = require('../sparql/Concept');

var AggUtils = require('./AggUtils');

var SponateUtils = {



    /**
     * Parses a sponate mapping spec object into a MappedConcept.
     *
     */
    parseSpec: function(spec, prefixMapping, templateParser) {
        var template = spec.template;

        var result
            = (template instanceof MappedConcept)
            ? template
            : this.parseSpecCore(spec, prefixMapping, templateParser)
            ;

        return result;
    },

    parseSpecCore: function(spec, prefixMapping, templateParser) {

        templateParser = templateParser || new TemplateParser();

        var template = spec.template;
        var from = spec.from;

        // Parse the 'from' attribute into an ElementFactory
        // TODO Move to util class
        var element;
        if(ObjectUtils.isString(from)) {

            var elementStr = from;

            if(prefixMapping != null) {
                var prefixes = prefixMapping.getNsPrefixMap();
                //var vars = sparql.extractSparqlVars(elementStr);
                elementStr = PrefixUtils.expandPrefixes(prefixes, elementStr);
            }

            element = new ElementString.create(elementStr);

            //elementFactory = new sparql.ElementFactoryConst(element);
        }
        else if(from instanceof Element) {
            element = from;
        }
//        else if(from instanceof ElementFactory) {
//            throw new Error('ElementFactories / functions in the FROM part not supported anymore');
//        }
        else if(ObjectUtils.isFunction(from)) {
            throw new Error('ElementFactories / functions in the FROM part not supported anymore');
        }
        else {
            throw new Error('Unknown argument type for FROM attribute', from);
        }

        //this.context.mapTableNameToElementFactory(name, elementFactory);

        // TODO The support joining the from element

        var tmp = templateParser.parseAgg(template);

        // Remove the outer most transformation wrapping an AggMap!
        var agg = AggUtils.unwrapAggTransform(tmp);

        // Extract the ID attribute
        var idExpr;


        //var tmp = AggUtils.unwrapAggTransform(agg);
        if(agg instanceof AggMap) {
            var keyBindingMapper = agg.getKeyBindingMapper();
            idExpr = keyBindingMapper.getExpr(); // TODO Check for whether the mapper provides getExpr()
        }
        else {
            throw new Error('Could not obtain ID attribute from aggregator');
        }

        var idVar;
        if(idExpr instanceof ExprVar) {
            idVar = idExpr.asVar();
        }
        else {
            throw new Error('Variable required for ID attribute, got an expression instead: ' + idExpr);
        }

        var concept = new Concept(element, idVar);

        var result = new MappedConcept(concept, agg);
        return result;
    },

};

module.exports = SponateUtils;

},{"../sparql/Concept":203,"../sparql/element/Element":230,"../sparql/element/ElementString":235,"../sparql/expr/ExprVar":269,"../util/ObjectUtils":332,"../util/PrefixUtils":333,"./AggUtils":282,"./ListServiceUtils":286,"./MappedConcept":288,"./TemplateParser":296,"./agg/AggMap":313}],296:[function(require,module,exports){
var uniq = require('lodash.uniq');

var Class = require('../ext/Class');

var ObjectUtils = require('../util/ObjectUtils');

var NodeUtils = require('../rdf/NodeUtils');
var Node = require('../rdf/node/Node');
var Var = require('../rdf/node/Var');
var NodeFactory = require('../rdf/NodeFactory');

var Expr = require('../sparql/expr/Expr');
var ExprVar = require('../sparql/expr/ExprVar');
var NodeValue = require('../sparql/expr/NodeValue');
var NodeValueUtils = require('../sparql/NodeValueUtils');

var AggLiteral = require('./agg/AggLiteral');
//var AggObject = require('./agg/AggObject');
var AggObjectCustom = require('./agg/AggObjectCustom');
var AggMap = require('./agg/AggMap');
var AggCustomAgg = require('./agg/AggMap');
var AggRef = require('./agg/AggRef');
var AggArray = require('./agg/AggArray');
var AggArrayStatic = require('./agg/AggArrayStatic');
var AggTransform = require('./agg/AggTransform');
var AggTransformLazy = require('./agg/AggTransformLazy');

var AggUtils = require('./AggUtils');

var RefSpec = require('./RefSpec');

var BindingMapperExpr = require('./binding_mapper/BindingMapperExpr');

// var AccFactoryFn = require('./AccFactoryFn');

/**
 * A 'template' is a type of specification for an aggregator
 *
 */
var TemplateParser = Class.create({

    initialize: function() {
        this.attrs = {
            id: 'id',
            ref: '$ref',
        };
    },

    /**
     * An array can indicate each of the following meanings:
     *  - [ string ] If the argument is a string, we have an array of literals,
     * whereas the string will be interpreted as an expression.
     *  - [ object ]
     *
     * If the argument is an object, the following intepretation rules apply:
     *  - If there is an 'id' attribute, we interpret it as an array of objects,
     * with the id as the grouping key, and a subAgg corresponding to the object [{
     * id: '?s' }]
     *  - If there is a 'ref' attribute, we intepret the object as a
     * specification of a reference
     *
     *  - If neither 'id' nor 'ref' is specified ... TODO i think then the
     * object should be interpreted as some kind of *explicit* specification,
     * wich 'id' and 'ref' variants being syntactic sugar for them
     *
     */
    parseArray: function(val) {
        var self = this;

        // Check if the last argument of the array is function
        var lastItem = val[val.length - 1];
        var isFn = ObjectUtils.isFunction(lastItem);

        var result;
        if(isFn) {
            result = this.parseArrayTransform(val);
        } else {


            // If none of the elements in the array has an id or $ref attribute, then we have a static array
            // TODO We could support objects that have a static (variable-free) id attribute

            var isDynamic = val.some(function(item) {
                var r = item.id || item.$ref || ObjectUtils.isString(item);
                return r;
            });

            result = !isDynamic
                ? this.parseArrayStatic(val)
                : this.parseArrayDynamic(val);

    //        result = this.parseArrayDynamic(val);
        }

        return result;
    },

    parseArrayTransform: function(arr) {
        var l = arr.length - 1;
        var fn = arr[l];

        var self = this;
        var argArr = arr.slice(0, l);
        var subAggs = argArr.map(function(item) {
            var r = self.parseAgg(item);
            return r;
        });

        var arrayAgg = new AggArrayStatic(subAggs);

        var result = new AggTransformLazy(arrayAgg, function(args) {
            var r = fn.apply(null, args);
            return r;
        });

        return result;
    },

    parseArrayStatic: function(arr) {
        var self = this;

        // Assume a 'static' array
        var tmp = arr.map(function(item) {
            var r = self.parseAgg(item);
            return r;
        });

        var result = new AggArrayStatic(tmp);

        return result;
    },

    parseArrayDynamic: function(val) {

        if (val.length !== 1) {
            throw new Error('[ERROR] Arrays must have exactly one element that is either a string or an object', val);
        }

        var config = val[0];

        var result;
        if (ObjectUtils.isString(config)) {

            result = this.parseArrayLiteral(config);

        } else if (Array.isArray(config)) {
            if(config.length === 1) {
                var subConfig = config[0];
                // We encountered [[ ]], which indicates an associative array
                result = this.parseArrayConfig(subConfig);

                // If the subConfig only contains the elements id and $value, we
                // turn it into a 'plain' map

                var keys = Object.keys(subConfig);
                var isPlainMap = keys.length === 2 && keys.indexOf('id') >=0 && keys.indexOf('$value') >= 0;
                // console.log('IS PLAIN MAP', isPlainMap);
                result = new AggTransform(result, function(arr) {
                    var r = {};
                    arr.forEach(function(item) {
                        r[item.id] = isPlainMap
                            ? item.$value
                            : item;
                    });
                    return r;
                });

            } else {
                throw new Error('Not implemented');
            }

        } else if (ObjectUtils.isObject(config)) {

            result = this.parseArrayConfig(config);

        } else {
            throw new Error('Bailing out');
        }

        return result;
    },


    parseArrayConfig: function(config) {

        var idAttr = this.attrs.id;
        var refAttr = this.attrs.ref;

        var hasId = config[idAttr] != null;
        var hasRef = config[refAttr] != null;

        if (hasId && hasRef) {
            throw new Error('[ERROR] id and ref are mutually exclusive');
        }

        var result;
        if (hasId) {

            var subAgg = this.parseObject(config);
            // console.log(config, JSON.stringify(subAgg));

            // Expects a AggLiteral with a BindingMapperExpr
            var attrToAgg = subAgg.getAttrToAgg();
            var idAgg = attrToAgg[idAttr];

            // TODO This is more like a hack - we should ensure in advance that
            // ID attributes do not make use of transformations
            idAgg = AggUtils.unwrapAggTransform(idAgg);

            var idBm = idAgg.getBindingMapper();
            // var idExpr = bm.getExpr();
            result = new AggMap(idBm, subAgg);


            result = new AggTransform(result, function(map) {
                // var map = acc.getValue();
                return map.values();
            });


        } else if (hasRef) {
            result = this.parseArrayRef(config);
        } else {
            throw new Error('[ERROR] Not implemented');
        }

        return result;
    },

    /**
     * Here we only keep track that we encountered a reference. We cannot
     * validate it here, as we lack information
     *
     *
     */
    parseArrayRef: function(config) {
        var ref = config[this.attrs.ref];
        // We need to get the 'on' expr of the reference
        var aggRef = this.parseRef(ref);
        var idBm = aggRef.getBindingMapper();
        var result = new AggMap(idBm, aggRef);

        result = new AggTransform(result, function(map) {
            return map.values();
        });

        return result;
    },

    parseArrayLiteral: function(exprStr) {
        // var expr = this.parseExprString(exprStr);
        var aggLiteral = this.parseLiteral(exprStr);

        var result =
            new AggTransform(
                new AggArray(aggLiteral),
                function(arr) { return uniq(arr, function(x) { return '' + x; });});

        return result;
    },

    parseLiteral: function(val) {
        var items = val.split('|').map(function(item) { return item.trim(); });
        var exprStr = items[0];

        var expr = this.parseExprString(exprStr);

        var result = new AggLiteral(new BindingMapperExpr(expr));

        var options = items[1];
        if(options !== 'node') {
            result = new AggTransform(result, NodeUtils.getValue);
        }

        return result;
    },

    /**
     * An object is an entity having a set of fields, whereas fields can be of
     * different types
     *
     */
    parseObject: function(val) {

        var ref = val[this.attrs.ref];

        var result = ref != null
            ? this.parseRef(ref)
            : this.parseObjectData(val)
            ;

        return result;
    },

    parseRef: function(val) {
        var target = val.target;
        if(!target) {
            throw new Error('Missing target attribute in ref: ', val);
        }

        var refSpec = new RefSpec(target, val.attr);
        var onStr = val.on;

        var bindingMapper = null;
        if(onStr) {
            var joinExpr = this.parseExprString(onStr);
            bindingMapper = new BindingMapperExpr(joinExpr);
        }

        var result = new AggRef(bindingMapper, refSpec);
        // console.log('PARSED REF SPEC: ' + JSON.stringify(refSpec), val.attr);

        return result;
    },

    parseObjectData: function(val) {
        var attrToAgg = {};

        var self = this;
        var attrs = Object.keys(val);
        attrs.forEach(function(attr) {
            var v = val[attr];
            var subAgg = self.parseAgg(v);

            if(subAgg == null) {
                throw new Error('Failed to create aggregator for attribute [' + attr + '] in ' + JSON.stringify(val));
            }

            attrToAgg[attr] = subAgg;
        });

        var result = new AggObjectCustom(attrToAgg, this);

        return result;
    },

// parseAgg: function(fieldName, val) {
// // if the value is an array, create an array field
// // TODO An array field can be either an array of literals or of objects
// // How to represent them?
// // Maybe we could have Object and Literal Fields plus a flag whether these
// are arrays?
// // So then we wouldn't have a dedicated arrayfield.
// // if the value is an object, create an object reference field
//
// // friends: ArrayField(
// },

    parseAgg: function(val) {

        // console.log('PARSING: ' + JSON.stringify(val));

        var result;

        if (ObjectUtils.isString(val)) {
            result = this.parseLiteral(val);
        } else if (Array.isArray(val)) {
            result = this.parseArray(val);
        } else if (ObjectUtils.isFunction(val)) {
            //result = this.parseAggSupplier(val);
            throw new Error('Implement this case: ' + JSON.stringify(val));
            // result = new AggCustomAgg(new AccFactoryFn(val));
        } else if (val instanceof Node && val.isVariable()) {
            var expr = new ExprVar(val);
            result = new AggLiteral(new BindingMapperExpr(expr));
        } else if (val instanceof Expr) {
            result = new AggLiteral(new BindingMapperExpr(val));
        } else if (ObjectUtils.isObject(val)) {
            var fnCustomAggFactory = val.createAgg;
            if (fnCustomAggFactory) {
                result = new AggCustomAgg(val);
                // console.log('aggregator support not implemented');
                // throw 'Bailing out';
            } else {
                result = this.parseObject(val);
            }
        } else {
            console.log('[ERROR] Unknown item type: ', val);
            throw new Error('Unkown item type');
        }

        return result;
    },

    parseExpr: function(obj) {
        var result;

        if (ObjectUtils.isString(obj)) {
            result = this.parseExprString(obj);
        } else if(obj instanceof Node && obj.isVariable()) {
            result = new ExprVar(obj);
        } else {
            throw new Error('Could not parse expression: ', obj);
        }

        return result;
    },

    parseExprString: function(str) {
        var result;

        var c = str.charAt(0);

        if (c === '?') {
            var varName = str.substr(1);
            var v = NodeFactory.createVar(varName);
            result = new ExprVar(v);

        } else if(c === '"' || c === '\'') {
            // TODO Check for properly closed string
            result = str.substring(1, str.length - 1);

            result = NodeValueUtils.makeString(result);
        } else {
            result = NodeValueUtils.makeString(str);
            // TODO: This must be a node value
            // result = sparql.Node.plainLit(str);
        }

        // TODO Handle special strings, such as ?\tag

        // console.log('Parsed', str, 'to', result);

        return result;
    },

});

module.exports = TemplateParser;

},{"../ext/Class":2,"../rdf/NodeFactory":91,"../rdf/NodeUtils":92,"../rdf/node/Node":103,"../rdf/node/Var":110,"../sparql/NodeValueUtils":216,"../sparql/expr/Expr":260,"../sparql/expr/ExprVar":269,"../sparql/expr/NodeValue":270,"../util/ObjectUtils":332,"./AggUtils":282,"./RefSpec":293,"./agg/AggArray":308,"./agg/AggArrayStatic":309,"./agg/AggLiteral":312,"./agg/AggMap":313,"./agg/AggObjectCustom":315,"./agg/AggRef":316,"./agg/AggTransform":317,"./agg/AggTransformLazy":318,"./binding_mapper/BindingMapperExpr":320,"lodash.uniq":583}],297:[function(require,module,exports){
var Class = require('../../ext/Class');

/**
 * An accumulator computes a value from a set of sparql bindings.
 * This could be a count or an average, or - in the case of Sponate - a JavaScript object.
 */
var Acc = Class.create({
    classLabel: 'jassa.sponate.acc',

    /**
     *
     * @param {jassa.sparql.Binding} binding A sparql.Binding object to be accumulateed by this accumulator
     *
     * @returns
     */
    accumulate: function(binding) {
        throw new Error('override me');
    },

    getValue: function() {
        throw new Error('override me');
    },
    
    getSubAccs: function() {
        throw new Error('override me');
    },

});

module.exports = Acc;

},{"../../ext/Class":2}],298:[function(require,module,exports){
var Class = require('../../ext/Class');

var BindingMapperIndex = require('../binding_mapper/BindingMapperIndex');
var Acc = require('./Acc');

// TODO Clarify the relation to AggMap
var AccArray = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccFn',

    initialize: function(subAgg, indexBindingMapper) {
        var self = this;

        this.i = 0;

        this.subAgg = subAgg;
        this.indexBindingMapper = indexBindingMapper || new BindingMapperIndex();

        this.subAccs = [];
    },

    accumulate: function(binding) {
        var index = this.indexBindingMapper.map(binding, this.i++);

        // If the index is null, we skip accumulation of the binding
        if(index != null) {
            var subAcc = this.subAccs[index];
            if(!subAcc) {
                subAcc = this.subAgg.createAcc();
                this.subAccs[index] = subAcc;
            }

            subAcc.accumulate(binding);
        }
    },

    getValue: function() {
        var result = [];

        this.subAccs.forEach(function(acc, i) {
           var v = acc.getValue();
           if(v != null) {
               result[i] = v;
           }
        });

        return result;
    },

    getSubAccs: function() {
        var result = [];
        this.subAccs.forEach(function(acc) {
            if(acc) {
                result.push(acc);
            }
        });

        return result;
    },

});

module.exports = AccArray;

},{"../../ext/Class":2,"../binding_mapper/BindingMapperIndex":321,"./Acc":297}],299:[function(require,module,exports){
var Class = require('../../ext/Class');

var Acc = require('./Acc');

var AccArrayStatic = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccArrayStatic',

    initialize: function(subAccs) {
        this.subAccs = subAccs;
    },

    accumulate: function(binding) {
        this.subAccs.forEach(function(subAcc) {
            subAcc.accumulate(binding);
        });
    },

    getValue: function() {
        var result = this.subAccs.map(function(acc) {
           var r = acc.getValue();
           return r;
        });

        return result;
    },

    getSubAccs: function() {
        return this.subAccs;
    },

});

module.exports = AccArrayStatic;

},{"../../ext/Class":2,"./Acc":297}],300:[function(require,module,exports){
var Class = require('../../ext/Class');

var NodeUtils = require('../../rdf/NodeUtils');
var Acc = require('./Acc');


// zip - but only for two arrays
var zip = function(a, b) {
    var result = [];

    var n = Math.max(a.length, b.length);

    for(var i = 0; i < n; ++i) {
        var item = [a[i], b[i]];
        result.push(item);
    }

    return result;
};

var compareArray = function(as, bs, op) {
    var result = false;

    var n = Math.max(as.length, bs.length);
    for(var i = 0; i < n; ++i) {
        var a = as[i];
        var b = bs[i];

        if (op(a, b)) {
            if (op(b, a)) {
                continue;
            }

            result = true;
            break;
        } else { //else if(op(b, a)) {
            if (!op(b, a)) {
                continue;
            }

            result = false;
            break;
        }
    }

    return result;
};


var cmpLessThan = function(a, b) {
    return a < b;
};

var indexOf = function(a, v) {
    var result = -1;
    for(var i = 0; i < a.length; ++i) {
        var item = a[i];
        if(item.equals(v)) {
            result = i;
            break;
        }
    }

    return result;
};

var AccBestLabel = Class.create(Acc, {
    initialize: function(bestLiteralConfig) {
        this.bestLiteralConfig = bestLiteralConfig;

        this.bestMatchNode = null;
        this.bestMatchScore = [1000, 1000];
    },

    getSubAccs: function() {
        return [];
    },

    accumulate: function(binding) {

        // Evaluate label, property and subject based on the binding
        var blc = this.bestLiteralConfig;

        var subject = binding.get(blc.getSubjectVar());
        var property = binding.get(blc.getPredicateVar());
        var label = binding.get(blc.getObjectVar());

        if(this.bestMatchNode == null) {
            this.bestMatchNode = subject;
        }

        var candidateLang = NodeUtils.getLang(label);

        // Determine the score vector for the property and the language
        var propertyScore = indexOf(blc.getPredicates(), property);
        var langScore = blc.getLangs().indexOf(candidateLang);

        var score = [propertyScore, langScore];

        var allNonNegative = score.every(function(item) {
            return item >= 0;
        });

        if(allNonNegative) {
            // Check if the new score is better (less than) than the current best match
            var cmp = compareArray(score, this.bestMatchScore, cmpLessThan);
            //console.log('status', cmp, score, this.bestMatchScore, cmpLessThan);
            if(cmp === true) {
                this.bestMatchScore = score;
                this.bestMatchNode = label;
            }
        }
    },

    getValue: function() {
        return this.bestMatchNode;
    },

});

module.exports = AccBestLabel;

},{"../../ext/Class":2,"../../rdf/NodeUtils":92,"./Acc":297}],301:[function(require,module,exports){
var Class = require('../../ext/Class');
var ObjectUtils = require('../../util/ObjectUtils');
var Acc = require('./Acc');

var AccLiteral = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccLiteral',

    initialize: function(bindingMapper) {
        this.bindingMapper = bindingMapper;

        this.value = null;
    },

    accumulate: function(binding) {
        var newValue = this.bindingMapper.map(binding, 0);

        if (false) {
            if(this.value != null && !ObjectUtils.isEqual(this.value, newValue)) {
                console.log('[WARN] Reassigned value: Original', this.value, ' New: ', newValue);
            }
        }

        this.value = newValue;
    },

    getValue: function() {
        return this.value;
    },

    getSubAccs: function() {
        return [];
    },

});

module.exports = AccLiteral;

},{"../../ext/Class":2,"../../util/ObjectUtils":332,"./Acc":297}],302:[function(require,module,exports){
var Class = require('../../ext/Class');

var HashMap = require('../../util/collection/HashMap');

var Acc = require('./Acc');

var AccMap = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccMap',

    initialize: function(keyBindingMapper, subAgg) {
        this.keyBindingMapper = keyBindingMapper;
        this.subAgg = subAgg;

        this.state = new HashMap();
    },

    getState: function() {
        return this.state;
    },

    accumulate: function(binding) {
        var k = this.keyBindingMapper.map(binding, 0);

        if(k != null) {
            var subAcc = this.state.get(k);
            if(!subAcc) {
                subAcc = this.subAgg.createAcc();
                this.state.put(k, subAcc);
            }
            subAcc.accumulate(binding);
        }
    },

    getValue: function() {
        var result = new HashMap();

        var entries = this.state.entries();
        entries.forEach(function(item) {
            var k = item.key;
            var acc = item.val;

            var v = acc.getValue();
            result.put(k, v);
        });

        return result;
    },

    getSubAccs: function() {

        var entries = this.state.entries();
        var result = entries.map(function(entry) {
            return entry.val;
        });

        return result;
    },

});

module.exports = AccMap;

},{"../../ext/Class":2,"../../util/collection/HashMap":343,"./Acc":297}],303:[function(require,module,exports){
var forEach = require('lodash.foreach');
var Class = require('../../ext/Class');

var Acc = require('./Acc');

var AccObject = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccObject',

    /**
     * An aggregator factory must have already taken
     * care of initializing the attrToAggr map.
     *
     */
    initialize: function(attrToAcc) {
        this.attrToAcc = attrToAcc;
    },

    accumulate: function(binding) {
        forEach(this.attrToAcc, function(acc) {
            acc.accumulate(binding);
        });
    },

    getValue: function() {
        var result = {};

        forEach(this.attrToAcc, function(acc, attr) {
            var v = acc.getValue();
            result[attr] = v;
        });

        return result;
    },
    
    getSubAccs: function() {
        var result = [];

        forEach(this.attrToAcc, function(acc) {
            result.push(acc);
        });
        
        return result;
    },

});

module.exports = AccObject;

},{"../../ext/Class":2,"./Acc":297,"lodash.foreach":433}],304:[function(require,module,exports){
var Class = require('../../ext/Class');

var Acc = require('./Acc');

var AccRef = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccRef',

    initialize: function(bindingMapper, refSpec) {
        this.bindingMapper = bindingMapper;
        this.refSpec = refSpec;

        this.refValue = null;

        this.baseValue = null;
    },

    getSubAccs: function() {
        return [];
    },

    getRefSpec: function() {
        return this.refSpec;
    },

    getRefValue: function() {
        return this.refValue;
        //return this.subAcc;
    },

    accumulate: function(binding) {
        var refValue = this.bindingMapper.map(binding, 0);
        this.refValue = refValue;
    },

    getBaseValue: function() {
        return this.baseValue;
    },

    setBaseValue: function(baseValue) {
        this.baseValue = baseValue;
        //console.log('Base VALUE: ', this.refSpec.getAttr(), this.getValue());
    },

    getValue: function() {
        return this.baseValue;

//        var baseValue = this.baseValue;
//
//        var attr = this.refSpec.getAttr();
//        var result = baseValue != null
//            ? (attr != null ? baseValue[attr] : baseValue)
//            : baseValue
//            ;
//
//        console.log('GET VALUE: ', result);
//
//        return result;
    },

});

module.exports = AccRef;

},{"../../ext/Class":2,"./Acc":297}],305:[function(require,module,exports){
var Class = require('../../ext/Class');

var Acc = require('./Acc');

var AccTransform = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccTransform',

    initialize: function(subAcc, fn) {
        this.subAcc = subAcc;
        this.fn = fn;
    },

    getSubAcc: function() {
        return this.subAcc;
    },

    accumulate: function(binding) {
        this.subAcc.accumulate(binding);
    },

    getValue: function() {
        var v = this.subAcc.getValue();
        var result = this.fn(v);
        return result;
    },

    getSubAccs: function() {
        return [this.subAcc];
    }
});

module.exports = AccTransform;

},{"../../ext/Class":2,"./Acc":297}],306:[function(require,module,exports){
var Class = require('../../ext/Class');

var Acc = require('./Acc');

var AccTransformLazy = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccTransformLazy',

    initialize: function(subAcc, fn) {
        this.subAcc = subAcc;
        this.fn = fn;
    },

    getSubAcc: function() {
        return this.subAcc;
    },

    accumulate: function(binding) {
        this.subAcc.accumulate(binding);
    },

    getValue: function() {
        var result = {
            _lazy: {
                value: this.subAcc.getValue(),
                fn: this.fn
            }
        };

        return result;
    },

    getSubAccs: function() {
        return [this.subAcc];
    }
});

module.exports = AccTransformLazy;

},{"../../ext/Class":2,"./Acc":297}],307:[function(require,module,exports){
var Class = require('../../ext/Class');

var Agg = Class.create({
    classLabel: 'jassa.sponate.Agg',

    createAcc: function() {
        throw new Error('override me');
    },

    getSubAggs: function() {
        throw new Error('override me');
    },

    clone: function() {
        throw new Error('override me');
    },

});

module.exports = Agg;

},{"../../ext/Class":2}],308:[function(require,module,exports){
var Class = require('../../ext/Class');

var Agg = require('./Agg');
var AccArray = require('../acc/AccArray');


var AggArray = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggArray',

    initialize: function(subAgg, indexBindingMapper) {
        this.subAgg = subAgg;
        this.indexBindingMapper = indexBindingMapper;
    },

    clone: function() {
        var result = new AggArray(this.subAgg.clone(), this.indexBindingMapper);
        return result;
    },

    createAcc: function() {
        var result = new AccArray(this.subAgg, this.indexBindingMapper);
        return result;
    },

    getSubAgg: function() {
        return this.subAgg;
    },

    getIndexBindingMapper: function() {
        return this.indexBindingMapper;
    },

    getSubAggs: function() {
        return [
            this.subAgg,
        ];
    },

    toString: function() {
        return this.expr.toString();
    },

});

module.exports = AggArray;

},{"../../ext/Class":2,"../acc/AccArray":298,"./Agg":307}],309:[function(require,module,exports){
var Class = require('../../ext/Class');

var Agg = require('./Agg');
var AccArrayStatic = require('../acc/AccArrayStatic');


var AggArrayStatic = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggArrayStatic',

    initialize: function(subAggs) {
        this.subAggs = subAggs;
    },

    clone: function() {
        var tmp = this.subAggs.map(function(subAgg) {
            return subAgg.clone();
        });

        var result = new AggArrayStatic(tmp);
        return result;
    },

    createAcc: function() {
        var subAccs = this.subAggs.map(function(subAgg) {
            return subAgg.createAcc();
        });


        var result = new AccArrayStatic(subAccs);
        return result;
    },

    getSubAggs: function() {
        return this.subAggs;
    },

    toString: function() {
        return 'implement me';
    },

});

module.exports = AggArrayStatic;

},{"../../ext/Class":2,"../acc/AccArrayStatic":299,"./Agg":307}],310:[function(require,module,exports){
var union = require('lodash.union');

var Class = require('../../ext/Class');
var Agg = require('./Agg');
var AccBestLiteral = require('../acc/AccBestLabel');


var AggBestLabel = Class.create(Agg, {
    initialize: function(bestLiteralConfig) {
        this.bestLiteralConfig = bestLiteralConfig;
    },

    clone: function() {
        var result = new AggBestLabel(this.bestLiteralConfig);
        return result;
    },

    createAcc: function() {
        var result = new AccBestLiteral(this.bestLiteralConfig);

        return result;
    },

    getSubAggs: function() {
        return [];
    },

    toString: function() {
        var result = 'bestLabel[' + this.bestLiteralConfig + ']';
        return result;
    },

//    getVarsMentioned: function() {
//        var vm = function(expr) {
//            var result = expr ? expr.getVarsMentioned() : [];
//            return result;
//        };
//
//        var blc = this.bestLiteralConfig;
//
//        var result = union(vm(blc.getLabelExpr()), vm(blc.getSubjectExpr()), vm(blc.getPropertyExpr()));
//        return result;
//    }
});

module.exports = AggBestLabel;


},{"../../ext/Class":2,"../acc/AccBestLabel":300,"./Agg":307,"lodash.union":560}],311:[function(require,module,exports){
var Class = require('../../ext/Class');

var Agg = require('./Agg');

/**
 * Aggregator for custom functions.
 * 
 */
var AggCustomAgg = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggCustomAgg',

    /**
     * 
     * @param 
     */
    initialize: function(fnAcc) {
        this.fnAcc = fnAcc;
    },

    getSubAggs: function() {
        return [];
    },

//    getVarsMentioned: function() {
//        var result = this.customAggFactory.getVarsMentioned();
//        return result;
//    },

});

module.exports = AggCustomAgg;

},{"../../ext/Class":2,"./Agg":307}],312:[function(require,module,exports){
var Class = require('../../ext/Class');

var Agg = require('./Agg');
var AccLiteral = require('../acc/AccLiteral');

/**
 * An aggregator for a single valued field.
 *
 * Can carry a name to a client side aggregator to use.
 *
 *
 */
var AggLiteral = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggLiteral',

    /**
     * @param {jassa.sparql.Expr} An expression to be evaluated
     * @param {function} An optional function applied on the eval'ed exprs
     */
    initialize: function(bindingMapper) {
        this.bindingMapper = bindingMapper;
    },

    clone: function() {
        var result = new AggLiteral(this.bindingMapper);
        return result;
    },

    getBindingMapper: function() {
        return this.bindingMapper;
    },

    getSubAggs: function() {
        return [];
    },

    createAcc: function() {
        var result = new AccLiteral(this.bindingMapper);
        return result;
    },

});

module.exports = AggLiteral;

},{"../../ext/Class":2,"../acc/AccLiteral":301,"./Agg":307}],313:[function(require,module,exports){
var Class = require('../../ext/Class');

var AggBase = require('./Agg');
var AccMap = require('../acc/AccMap');

/**
 * An aggregator for a map from *variable* keys to patters
 *
 * map[keyExpr(binding)] = aggregator(binding);
 *
 * The subAgg corresponds to the element contained
 *
 * TODO An array can be seen as a map from index to item
 * So formally, PatternMap is thus the best candidate for a map, yet
 * we should add a flag to treat this aggregator as an array, i.e. the groupKey as an index
 *
 */
var AggMap = Class.create(AggBase, {
    classLabel: 'jassa.sponate.AggMap',

    initialize: function(keyBindingMapper, subAgg) {
        this.keyBindingMapper = keyBindingMapper;
        this.subAgg = subAgg;
    },

    clone: function() {
        var result = new AggMap(this.keyBindingMapper, this.subAgg.clone());
        return result;
    },

    getKeyBindingMapper: function() {
        return this.keyBindingMapper;
    },

    getSubAgg: function() {
        return this.subAgg;
    },

    getSubAggs: function() {
        return [
            this.subAgg,
        ];
    },

    createAcc: function() {
        var result = new AccMap(this.keyBindingMapper, this.subAgg);
        return result;
    },

    toString: function() {
        var result = '[' + this.keyExpr + ' -> ' + this.subAgg + ']';
        return result;
    },

});

module.exports = AggMap;

},{"../../ext/Class":2,"../acc/AccMap":302,"./Agg":307}],314:[function(require,module,exports){
var forEach = require('lodash.foreach');

var Class = require('../../ext/Class');

var Agg = require('./Agg');
var AccObject = require('../acc/AccObject');

/**
 * An aggregator for a map from *predefined* keys to aggregators.
 */
var AggObject = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggObject',

    initialize: function(attrToAgg) {
        this.attrToAgg = attrToAgg;
    },

    clone: function() {
        var tmp = {};
        forEach(this.attrToAgg, function(agg, attr) {
            tmp[attr] = agg.clone();
        });

        var result = new AggObject(tmp);
        return result;
    },

    getAttrToAgg: function() {
        return this.attrToAgg;
    },

    createAcc: function() {
        var attrToAcc = {};

        forEach(this.attrToAgg, function(agg, attr) {
            var acc = agg.createAcc();
            attrToAcc[attr] = acc;
        });

        var result = new AccObject(attrToAcc);
        return result;

    },

    getSubAggs: function() {
        var result = [];

        forEach(this.attrToAgg, function(subAgg) {
            result.push(subAgg);
        });

        return result;
    },

    toString: function() {
        var parts = [];
        forEach(this.attrToAgg, function(v, k) {
            parts.push('"' + k + '": ' + v);
        });

        var result = '{' + parts.join(',') + '}';
        return result;
    },

});

module.exports = AggObject;

},{"../../ext/Class":2,"../acc/AccObject":303,"./Agg":307,"lodash.foreach":433}],315:[function(require,module,exports){
var Class = require('../../ext/Class');
var AggObject = require('./AggObject');

var AggObjectCustom = Class.create(AggObject, {
    initialize: function($super, attrToAgg, templateParser) {
        $super(attrToAgg);
        this.templateParser = templateParser;
    },

    add: function(attrName, obj) {
        var agg = this.templateParser.parseAgg(obj);

        this.attrToAgg[attrName] = agg;

        return agg;
    },

    del: function(attrName) {
        delete this.attrToAgg[attrName];
    }
});

module.exports = AggObjectCustom;

},{"../../ext/Class":2,"./AggObject":314}],316:[function(require,module,exports){
var Class = require('../../ext/Class');

var NodeFactory = require('../../rdf/NodeFactory');

var AccRef = require('../acc/AccRef');
var Agg = require('./Agg');

var AggRef = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggRef',

    /**
     * The subAgg aggregates the IDs of the objects to be referenced
     */
    initialize: function(bindingMapper, refSpec) {
        this.bindingMapper = bindingMapper;
        this.refSpec = refSpec;
    },

    clone: function() {
        var result = new AggRef(this.bindingMapper, this.refSpec);
        return result;
    },

    getBindingMapper: function() {
        return this.bindingMapper;
    },

    setBindingMapper: function(bindingMapper) {
        this.bindingMapper = bindingMapper;
    },

    getRefSpec: function() {
        return this.refSpec;
    },

    setRefSpec: function(refSpec) {
        this.refSpec = refSpec;
    },

    getSubAggs: function() {
        return [];
    },

    createAcc: function() {
        var result = new AccRef(this.bindingMapper, this.refSpec);
        return result;
    },

    toString: function() {
        return JSON.stringify(this);
    },

});

module.exports = AggRef;

},{"../../ext/Class":2,"../../rdf/NodeFactory":91,"../acc/AccRef":304,"./Agg":307}],317:[function(require,module,exports){
var Class = require('../../ext/Class');

var NodeFactory = require('../../rdf/NodeFactory');

var AccTransform = require('../acc/AccTransform');
var Agg = require('./Agg');

var AggTransform = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggTransform',

    initialize: function(subAgg, fn) {
        this.subAgg = subAgg;
        this.fn = fn;
    },

    clone: function() {
        var result = new AggTransform(this.subAgg.clone(), this.fn);
        return result;
    },

    getSubAgg: function() {
        return this.subAgg;
    },

    getSubAggs: function() {
        return [
            this.subAgg,
        ];
    },

    createAcc: function() {
        var subAcc = this.subAgg.createAcc();
        var result = new AccTransform(subAcc, this.fn);
        return result;
    },

    toString: function() {
        return JSON.stringify(this);
    },

});

module.exports = AggTransform;

},{"../../ext/Class":2,"../../rdf/NodeFactory":91,"../acc/AccTransform":305,"./Agg":307}],318:[function(require,module,exports){
var Class = require('../../ext/Class');

var NodeFactory = require('../../rdf/NodeFactory');

var AccTransformLazy = require('../acc/AccTransformLazy');
var Agg = require('./Agg');

var AggTransformLazy = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggTransformLazy',

    initialize: function(subAgg, fn) {
        this.subAgg = subAgg;
        this.fn = fn;
    },

    clone: function() {
        var result = new AggTransformLazy(this.subAgg.clone(), this.fn);
        return result;
    },

    getSubAgg: function() {
        return this.subAgg;
    },

    getSubAggs: function() {
        return [
            this.subAgg,
        ];
    },

    createAcc: function() {
        var subAcc = this.subAgg.createAcc();
        var result = new AccTransformLazy(subAcc, this.fn);
        return result;
    },

    toString: function() {
        return JSON.stringify(this);
    },

});

module.exports = AggTransformLazy;

},{"../../ext/Class":2,"../../rdf/NodeFactory":91,"../acc/AccTransformLazy":306,"./Agg":307}],319:[function(require,module,exports){
var Class = require('../../ext/Class');

var BindingMapper = Class.create({
    map: function(binding, rowId) {
        throw new Error('Not overridden');
    }
});

module.exports = BindingMapper;

},{"../../ext/Class":2}],320:[function(require,module,exports){
var Class = require('../../ext/Class');
var BindingMapper = require('./BindingMapper');

/**
 * Evaluates an expression to a {jassa.rdf.Node}
 *
 * TODO Not sure if evaluating to NodeValue instead would have any benefits
 */
var BindingMapperExpr = Class.create(BindingMapper, {
    initialize: function(expr) {
        this.expr = expr;
    },

    getExpr: function() {
        return this.expr;
    },

    map: function(binding, rowId) {
        var nv = this.expr.eval(binding);
        var result = nv.asNode();
        return result;
    },

});

module.exports = BindingMapperExpr;

},{"../../ext/Class":2,"./BindingMapper":319}],321:[function(require,module,exports){
var Class = require('../../ext/Class');
var BindingMapper = require('./BindingMapper');

var BindingMapperIndex = Class.create(BindingMapper, {
//    initialize: function() {
//    },

    map: function(binding, rowId) {
        return rowId;
    },

});

module.exports = BindingMapperIndex;

},{"../../ext/Class":2,"./BindingMapper":319}],322:[function(require,module,exports){
var Class = require('../../ext/Class');
var BindingMapper = require('./BindingMapper');

/**
 * Evaluates an expression to a {jassa.rdf.Node}
 * 
 * TODO Not sure if evaluating to NodeValue instead would have any benefits
 */
var BindingMapperTransform = Class.create(BindingMapper, {
    initialize: function(subBindingMapper, fn) {
        this.subBindingMapper = subBindingMapper;
        this.fn = fn;
    },

    map: function(binding, rowId) {
        var val = this.subBindingMapper.map(binding, rowId);
        var result = this.fn(val);
        return result;
    },

});

module.exports = BindingMapperTransform;

},{"../../ext/Class":2,"./BindingMapper":319}],323:[function(require,module,exports){
var Class = require('../../ext/Class');

var QueryFlow = require('./QueryFlow');

var CollectionFacade = Class.create({
    initialize: function(storeFacade, mappingName) {
        this.storeFacade = storeFacade;
        this.mappingName = mappingName;
    },

    /**
     * Convenience method to access the object(!) aggregator
     *
     * This is not the source's root aggregator, but the root's child
     */
    getAggObject: function() {
        var result = this.getSource().getMappedConcept().getAgg().getSubAgg();
        return result;
    },

    getSource: function() {
        var result = this.storeFacade.getContext().getSource(this.mappingName);
        return result;
    },

    getListService: function() {
        var result = this.storeFacade.getListService(this.mappingName);
        return result;
    },

    find: function(criteria) {
        if(criteria) {
            throw new Error('Criteria queries are currently not supported anymore - Sorry :/');
        }

        var result = new QueryFlow(this.storeFacade, this.mappingName, criteria);
        return result;
    }
});

module.exports = CollectionFacade;

},{"../../ext/Class":2,"./QueryFlow":324}],324:[function(require,module,exports){
var Class = require('../../ext/Class');

var Query = require('../Query');
var Engine = require('../Engine');


var QueryFlow = Class.create({
    initialize: function(storeFacade, sourceName, criteria) {
        this.storeFacade = storeFacade;
        this.query = new Query();

        this.query.setSourceName(sourceName);
        this.query.setCriteria(criteria);
    },

    /**
     * Join the lookup with the given concept
     */
    concept: function(_concept, isLeftJoin) {
        this.query.setFilterConcept(_concept);
        this.query.setLeftJoin(isLeftJoin);

        return this;
    },

    /**
     * Specify a set of nodes for which to perform the lookup
     * If concept is specified, nodes will be applied to the concept
     *
     * //Use of .concept(...) and .nodes(..) is mutually exclusive
     *
     */
    nodes: function(_nodes) {
        this.query.setNodes(_nodes);

        return this;
    },

    skip: function(offset) {
        this.query.setOffset(offset);

        return this;
    },

    limit: function(limit) {
        this.query.setLimit(limit);

        return this;
    },

    offset: function(offset) {
        this.query.setOffset(offset);

        return this;
    },

    list: function() {
        //var engine = this.storeFacade.getEngine();
        //var context = this.storeFacade.getContext();
        //var context = this.storeFacade.createContext();
        var context = this.storeFacade.getContext().createResolvedContext();

        var result = Engine.exec(context, this.query);
        return result;

        /*
        var result = this.storeFacade.executeList(this.query);
        return result;
        */
    },

    count: function() {
        /*
        var result = this.storeFacade.executeCount(this.query);
        return result;
        */
    }
});

module.exports = QueryFlow;

},{"../../ext/Class":2,"../Engine":285,"../Query":292}],325:[function(require,module,exports){
var Class = require('../../ext/Class');

var PrefixMappingImpl = require('../../rdf/PrefixMappingImpl');
var ObjectUtils = require('../../util/ObjectUtils');
var Context = require('../Context');
var Engine = require('../Engine');

var SponateUtils = require('../SponateUtils');
var MappedConceptSource = require('../MappedConceptSource');
var MappedConcept = require('../MappedConcept');

var ListServiceFn = require('../../service/list_service/ListServiceFn');

var CollectionFacade = require('./CollectionFacade');

var ObjectUtils = require('../../util/ObjectUtils');

var forEach = require('lodash.foreach');


var StoreFacade = Class.create({
    initialize: function(defaultSparqlService, prefixMapping, context) {
        this.defaultSparqlService = defaultSparqlService;

        this.prefixMapping = prefixMapping
            ? prefixMapping instanceof PrefixMappingImpl
                ? prefixMapping
                : new PrefixMappingImpl(prefixMapping)
            : new PrefixMappingImpl();

        this.context = context || new Context(prefixMapping);
//        this.nameToMap = {};

        // This map is for templates (just convenience in the facade)
        this.nameToMappedConcept = {};
    },

//    getEngine: function() {
//        return this.engine;
//    },

    getContext: function() {
        return this.context;
    },


//    getPrefixMapping: function() {
//        return this.prefixMapping;
//    },

//    getdefaultSparqlService: function() {
//        return this.defaultSparqlService;
//    },

    addTemplate: function(spec) {
        var name = spec.name;
        if(!name) {
            throw new Error('Sponate spec must have a name');
        }

        var mappedConcept = SponateUtils.parseSpec(spec, this.prefixMapping);

        this.nameToMappedConcept[name] = mappedConcept;

        //this.context.addTemplate(spec);
//        var name = spec.name;
//        if(!name) {
//            throw new Error('Sponate spec must have a name');
//        }
//
//        this.nameToTemplate[name] = spec;
    },

    addMap: function(spec) {
        var name = spec.name;
        if(!name) {
            throw new Error('Sponate spec must have a name');
        }

        var sparqlService = spec.service || this.defaultSparqlService;
        if(!sparqlService) {
            throw new Error('No service provided for ', spec);
        }

        var mappedConcept;
        if(ObjectUtils.isString(spec.template)) {
            var templateName = spec.template;
            var tmp = this.nameToMappedConcept[templateName];
            if(!tmp) {
                throw new Error('No template with name ' + templateName + ' registered.');
            }

            mappedConcept = new MappedConcept(tmp.getConcept(), tmp.getAgg().clone());
        } else {
            mappedConcept = SponateUtils.parseSpec(spec, this.prefixMapping);
        }

        var source = new MappedConceptSource(mappedConcept, sparqlService);

        this.context.addSource(name, source);

        this[name] = new CollectionFacade(this, name);

        return source;

//        if(!spec.service) {
//            ObjectUtils.extend({}, spec);
//            spec.service = this.defaultSparqlService;
//        }
//
//        this.context.add(spec);
//        var name = spec.name; // context.add will fail if the name is missing
//
//        if(!name) {
//            throw new Error('Sponate spec must have a name');
//        }
//        this.context.add(spec);

//        this[name] = new CollectionFacade(this, name);
//        this.nameToMap[name] = spec;
    },

    getListService: function(sourceName, isLeftJoin) {
        var self = this;

        var fn = function() {
            var context = self.context.createResolvedContext();
            var r = Engine.createListService(context, sourceName, isLeftJoin);
            return r;
        };

        var result = new ListServiceFn(fn);

        //var result = Engine.createListService(this.context, sourceName, isLeftJoin);
        return result;
    },

});

module.exports = StoreFacade;

},{"../../ext/Class":2,"../../rdf/PrefixMappingImpl":93,"../../service/list_service/ListServiceFn":143,"../../util/ObjectUtils":332,"../Context":284,"../Engine":285,"../MappedConcept":288,"../MappedConceptSource":289,"../SponateUtils":295,"./CollectionFacade":323,"lodash.foreach":433}],326:[function(require,module,exports){
'use strict';

var ns = {
    AccUtils: require('./AccUtils'),
    AggUtils: require('./AggUtils'),
    AttrPath: require('./AttrPath'),
    Context: require('./Context'),
    Engine: require('./Engine'),
    ListServiceUtils: require('./ListServiceUtils'),
    LookupServiceUtils: require('./LookupServiceUtils'),
    MappedConcept: require('./MappedConcept'),
    MappedConceptSource: require('./MappedConceptSource'),
    MappedConceptUtils: require('./MappedConceptUtils'),
    MappingRef: require('./MappingRef'),
    Query: require('./Query'),
    RefSpec: require('./RefSpec'),
    ServiceUtils: require('./ServiceUtils'),
    SponateUtils: require('./SponateUtils'),
    TemplateParser: require('./TemplateParser'),
    Acc: require('./acc/Acc'),
    AccArray: require('./acc/AccArray'),
    AccArrayStatic: require('./acc/AccArrayStatic'),
    AccBestLabel: require('./acc/AccBestLabel'),
    AccLiteral: require('./acc/AccLiteral'),
    AccMap: require('./acc/AccMap'),
    AccObject: require('./acc/AccObject'),
    AccRef: require('./acc/AccRef'),
    AccTransform: require('./acc/AccTransform'),
    AccTransformLazy: require('./acc/AccTransformLazy'),
    Agg: require('./agg/Agg'),
    AggArray: require('./agg/AggArray'),
    AggArrayStatic: require('./agg/AggArrayStatic'),
    AggBestLabel: require('./agg/AggBestLabel'),
    AggCustomAcc: require('./agg/AggCustomAcc'),
    AggLiteral: require('./agg/AggLiteral'),
    AggMap: require('./agg/AggMap'),
    AggObject: require('./agg/AggObject'),
    AggObjectCustom: require('./agg/AggObjectCustom'),
    AggRef: require('./agg/AggRef'),
    AggTransform: require('./agg/AggTransform'),
    AggTransformLazy: require('./agg/AggTransformLazy'),
    BindingMapper: require('./binding_mapper/BindingMapper'),
    BindingMapperExpr: require('./binding_mapper/BindingMapperExpr'),
    BindingMapperIndex: require('./binding_mapper/BindingMapperIndex'),
    BindingMapperTransform: require('./binding_mapper/BindingMapperTransform'),
    CollectionFacade: require('./facade/CollectionFacade'),
    QueryFlow: require('./facade/QueryFlow'),
    StoreFacade: require('./facade/StoreFacade'),
};

Object.freeze(ns);

module.exports = ns;

},{"./AccUtils":281,"./AggUtils":282,"./AttrPath":283,"./Context":284,"./Engine":285,"./ListServiceUtils":286,"./LookupServiceUtils":287,"./MappedConcept":288,"./MappedConceptSource":289,"./MappedConceptUtils":290,"./MappingRef":291,"./Query":292,"./RefSpec":293,"./ServiceUtils":294,"./SponateUtils":295,"./TemplateParser":296,"./acc/Acc":297,"./acc/AccArray":298,"./acc/AccArrayStatic":299,"./acc/AccBestLabel":300,"./acc/AccLiteral":301,"./acc/AccMap":302,"./acc/AccObject":303,"./acc/AccRef":304,"./acc/AccTransform":305,"./acc/AccTransformLazy":306,"./agg/Agg":307,"./agg/AggArray":308,"./agg/AggArrayStatic":309,"./agg/AggBestLabel":310,"./agg/AggCustomAcc":311,"./agg/AggLiteral":312,"./agg/AggMap":313,"./agg/AggObject":314,"./agg/AggObjectCustom":315,"./agg/AggRef":316,"./agg/AggTransform":317,"./agg/AggTransformLazy":318,"./binding_mapper/BindingMapper":319,"./binding_mapper/BindingMapperExpr":320,"./binding_mapper/BindingMapperIndex":321,"./binding_mapper/BindingMapperTransform":322,"./facade/CollectionFacade":323,"./facade/QueryFlow":324,"./facade/StoreFacade":325}],327:[function(require,module,exports){
var ObjectUtils = require('./ObjectUtils');

var ArrayUtils = {
    addAll: function(arr, items) {
        return arr.push.apply(arr, items);
    },

    chunk: function(arr, chunkSize) {
        var result = [];
        for (var i = 0; i < arr.length; i += chunkSize) {
            var chunk = arr.slice(i, i + chunkSize);

            result.push(chunk);
        }

        return result;
    },

    clear: function(arr) {
        while (arr.length > 0) {
            arr.pop();
        }
    },

    replace: function(target, source) {
        this.clear(target);

        if (source) {
            target.push.apply(target, source);
        }
    },

    filter: function(arr, fn) {
        var newArr = arr.filter(fn);
        this.replace(arr, newArr);
        return arr;
    },

    indexOf: function(arr, item, fnEquals) {
        fnEquals = fnEquals || ObjectUtils.isEqual;
        var result = -1;

        for(var i = 0; i < arr.length; ++i) {
            var it = arr[i];

            if(fnEquals(item, it)) {
                result = i;
                break;
            }
        }

        return result;
    },

    indexesOf: function(arr, val, fnEquals) {
        fnEquals = fnEquals || ObjectUtils.isEqual;

        var result = [];

        arr.forEach(function(item, index) {
            var isEqual = fnEquals(val, item);
            if (isEqual) {
                result.push(index);
            }
        });

        return result;
    },

    // Like jQueries's grep
    grep: function(arr, fnPredicate) {
        var result = [];

        arr.forEach(function(item, index) {
            var isTrue = fnPredicate(item, index);
            if (isTrue) {
                result.push(index);
            }
        });

        return result;
    },

    copyWithoutIndexes: function(arr, indexes) {
        var map = {};
        indexes.forEach(function(index) {
            map[index] = true;
        });

        var result = [];

        for (var i = 0; i < arr.length; ++i) {
            var omit = map[i];
            if (!omit) {
                result.push(arr[i]);
            }
        }

        return result;
    },

    // Remove an item by strict equality
    removeItemStrict: function(arr, item) {
        var index = arr.indexOf(item);

        if (index > -1) {
            this.removeIndexes(arr, [index]);
        }

        return arr;
    },

    removeIndexes: function(arr, indexes) {
        var tmp = this.copyWithoutIndexes(arr, indexes);
        this.replace(arr, tmp);
        return arr;
    },

    removeByGrep: function(arr, fnPredicate) {
        var indexes = this.grep(arr, fnPredicate);
        this.removeIndexes(arr, indexes);
    }
};

module.exports = ArrayUtils;

},{"./ObjectUtils":332}],328:[function(require,module,exports){

var ClusterUtils = {

    indexPredicates: function(predicate, keyToGroup, predicateToGroupKey, source) {
        predicateToGroupKey = predicateToGroupKey || {};

        var p = predicate.id.toString(); //;getUri();

        var groupKey = predicateToGroupKey[p];
        if(!groupKey) {
            groupKey = p;
        }

        var group = keyToGroup[groupKey];
        if(!group) {
            group = {
                id: groupKey,
                valueToMember: {},
                sources: []
            };
            keyToGroup[groupKey] = group;
        }

        var sources = group.sources;
        if(sources.indexOf(source) < 0) {
            sources.push(source);
        }


        var valueToMember = group.valueToMember;

        predicate.values.forEach(function(o) {
            var str = o.id.toString();
            var member = valueToMember[str];
            if(!member) {
                member = {
                    predicate: predicate.id,
                    value: o,
                    sources: []
                };

                valueToMember[str] = member;
            }

            var sources = member.sources;
            if(sources.indexOf(source) < 0) {
                sources.push(source);
            }
        });
    },


    /**
     * Utility method to cluster values of predicates for links (pair of resources)
     *
     * link: {
     *   source: {
     *     predicates: [{
     *       id: 'http://predi.ca/te'
     *       values: [{
     *           id: 'http://foobar'
     *       }]
     *     ]
     *   },
     *   target: (analogous to source)
     * }
     *
     * @param link
     * @param predicateToGroupKey
     * @param keyToGroup
     *
     */
    clusterLink: function(link, predicateToGroupKey, keyToGroup) {
        keyToGroup = keyToGroup || {};

        // Collect the union of properties in source and target position
        link.source.predicates.forEach(function(p) { ClusterUtils.indexPredicates(p, keyToGroup, predicateToGroupKey, 'source'); });
        link.target.predicates.forEach(function(p) { ClusterUtils.indexPredicates(p, keyToGroup, predicateToGroupKey, 'target'); });

        //console.log(keyToGroup);
        return keyToGroup;
    }

};

module.exports = ClusterUtils;

},{}],329:[function(require,module,exports){
var CollectionUtils = {
    /**
     * Toggle the membership of an item in a collection and
     * returns the item's new membership state (true = member, false = not a member)
     *
     *
     * @param {Array} collection
     * @param {Object} item
     *
     */
    toggleItem: function(collection, item) {
        var result;

        if (collection.contains(item)) {
            collection.remove(item);
            result = false;
        } else {
            collection.add(item);
            result = true;
        }

        return result;
    }
};

module.exports = CollectionUtils;

},{}],330:[function(require,module,exports){
var JSONCanonical = require('../ext/JSONCanonical');

var isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && Boolean(obj);
};

var JsonUtils = {
    stringifyCyclic: function(obj, fn) {
        var seen = [];
        var result = JSONCanonical.stringify(obj, function(key, val) {
            if (isObject(val)) {
                if (seen.indexOf(val) >= 0) {
                    return;
                }

                seen.push(val);

                if (fn) {
                    val = fn(key, val);
                }
            }
            return val;
        });

        return result;
    }
};

module.exports = JsonUtils;

},{"../ext/JSONCanonical":3}],331:[function(require,module,exports){
var HashMap = require('./collection/HashMap');
var ObjectUtils = require('./ObjectUtils');

var MapUtils = {
    indexBy: function(arr, keyOrFn, result) {
        result = result || new HashMap();

        var fnKey;

        if (ObjectUtils.isString(keyOrFn)) {
            fnKey = function(obj) {
                return obj[keyOrFn];
            };
        } else {
            fnKey = keyOrFn;
        }

        arr.forEach(function(item) {
            var key = fnKey(item);
            result.put(key, item);
        });

        return result;
    }
};

module.exports = MapUtils;

},{"./ObjectUtils":332,"./collection/HashMap":343}],332:[function(require,module,exports){
var isEqual = require('lodash.isequal');

var JsonUtils = require('./JsonUtils');

var ObjectUtils = {
    isObject: function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && Boolean(obj);
    },

    isFunction: function(obj) {
        return typeof obj === 'function';
    },

    isString: function(obj) {
        return Object.prototype.toString.call(obj) === '[object String]';
    },

    extend: function(obj, source) {
        for (var prop in source) {
            if (hasOwnProperty.call(source, prop)) {
                obj[prop] = source[prop];
            }
        }
        return obj;
    },

    isEqual: function(a, b) {
        var result;
        if (a && a.equals) {
            result = a.equals(b);
        } else if (b && b.equals) {
            result = b.equals(a);
        } else {
            result = isEqual(a, b);
        }

        return result;
    },

    defaultHashCode: function(a) {
        var result;
        if (a && a.hashCode) {
            result = a.hashCode();
        } else {
            result = a.toString();
        }

        return result;
    },

    /**
     * Used to turn copySubstitute into a clone method
     */
    identity: function(x) {
        return x;
    },

    /**
     * Recursively iterate the object tree and use a .hashCode function if available
     * TODO Add support to exclude attributes
     */
    hashCode: function(obj, skipOnce) {

        var result = JsonUtils.stringifyCyclic(obj, function(key, val) {

            var r = null;

            if (!skipOnce && ObjectUtils.isObject(val)) {

                var hashFnName = null;
                ObjectUtils.defaultHashFnNames.some(function(name) {
                    if (ObjectUtils.isFunction(val[name])) {
                        hashFnName = name;
                        return true;
                    }
                });

                var fnHashCode = val[hashFnName];

                if (hashFnName && fnHashCode && ObjectUtils.isFunction(fnHashCode)) {
                    r = fnHashCode.apply(val);
                } else {
                    r = val;
                }

            } else {
                r = val;
            }

            if (skipOnce) {
                skipOnce = false;
            }

            return r;
        });

        return result;
    }
};

ObjectUtils.defaultHashFnNames = [
    'hashCode'
];

module.exports = ObjectUtils;

},{"./JsonUtils":330,"lodash.isequal":463}],333:[function(require,module,exports){
var StringUtils = require('./StringUtils');

var PrefixUtils = {

    prefixPattern: /((\w|-)+):(\w|-)+/g, // TODO Will break if this pattern occurs within a string

    extractPrefixes: function(str) {
        var result = StringUtils.extractAllRegexMatches(this.prefixPattern, str, 1);
        return result;
    },

    /**
     * Returns a new string with prefixes expanded
     */
    expandPrefixes: function(prefixes, str) {
        var usedPrefixes = this.extractPrefixes(str);


        var result = str;
        usedPrefixes.forEach(function(prefix) {
            var url = prefixes[prefix];
            if(url) {
                // TODO Add a cache
                var re = new RegExp(prefix + ':(\\w+)', 'g');

                result = result.replace(re, '<' + url + '$1>');
            }
        });

        return result;
    }

};

module.exports = PrefixUtils;

},{"./StringUtils":337}],334:[function(require,module,exports){
var PromiseUtils = {

    /**
     * Wraps a promise supplier function (i.e. a function returning a promise)
     * that delays between requests
     */
//    postpone: function(promiseSupplierFn, ms, abortFn) {
//        return function() {
//            var args = arguments;
//            var deferred = jQuery.Deferred();
//            var running = null;
//
//            var timeout = setTimeout(function() {
//                running = promiseSupplierFn.apply(this, args);
//                running.then(function() {
//                    deferred.resolve.apply(this, arguments);
//                }).fail(function() {
//                    deferred.reject.apply(this, arguments);
//                });
//            }, ms);
//
//            var result = deferred.promise();
//            result.abort = function() {
//                if(running == null) {
//                    clearTimeout(timeout);
//                } else if(abortFn != null) {
//                    abortFn(running);
//                }
//            };
//
//            return result;
//        };
//    },

    /**
     * Returns a function returning a promise that wraps a function returning promises.
     * Only the resolution of the most recently created promise will be resolved.
     */
//    lastRequest: function(promiseSupplierFn, abortFn) {
//        var deferred = null;
//        var prior = null;
//        var counter = 0;
//
//        return function() {
//            if(deferred == null) {
//                deferred = jQuery.Deferred();
//            }
//
//            //var args = arguments;
//
//            var now = ++counter;
//            //console.log('now ' + now + ' for ', args);
//            var next = promiseSupplierFn.apply(this, arguments);
//
//            if(abortFn != null && prior != null) {
//                abortFn(prior);
//            }
//            prior = next;
//
//            next.then(function() {
//                if(now === counter) {
//                    //console.log('resolved' + now + ' for ', args);
//                    deferred.resolve.apply(this, arguments);
//                    deferred = null;
//                }
//            }, function() {
//                if(now === counter) {
//                    //console.log('rejected' + now + ' for ', args);
//                    deferred.reject.apply(this, arguments);
//                    deferred = null;
//                }
//            });
//
//
//            return deferred.promise();
//        };
//
//    },
};

module.exports = PromiseUtils;

},{}],335:[function(require,module,exports){
var Class = require('../ext/Class');
var HashMap = require('./collection/HashMap');
var ObjectUtils = require('./ObjectUtils');

/**
 *
 * Essentially this is a map from state hash of the object
 *
 */
var SerializationContext = Class.create({
    initialize: function() {
        this._nextId = 1;

        // A hash map that compares keys by reference equality
        this.objToId = new HashMap(
            function(a, b) {
                return a === b;
            }, function(obj) {
                return ObjectUtils.hashCode(obj);
            }
        );

        this.idToState = {};
    },

    nextId: function() {
        var result = (this._nextId++).toString();
        return result;
    },

    getIdToState: function() {
        return this.idToState;
    },

    getObjToId: function() {
        return this.objToId;
    }
});

module.exports = SerializationContext;

},{"../ext/Class":2,"./ObjectUtils":332,"./collection/HashMap":343}],336:[function(require,module,exports){
/* jshint maxdepth: 5 */
/* jshint newcap: false */

// libs
var Class = require('../ext/Class');

// project deps
var ObjectUtils = require('./ObjectUtils');
var SerializationContext = require('./SerializationContext');

var Serializer = Class.create({
    initialize: function() {
        /**
         * A map from class label to the class object
         *
         */
        this.classNameToClass = {};

        /**
         * A map from class label to serialization function
         */
        this.classNameToFnSerialize = {};

        /**
         * A map from class label to deserialization function
         */
        this.classNameToFnDeserialize = {};

        /**
         * A map from class name to a prototype instance
         * (i.e. an instance of the class without any ctor arguments passed in)
         * This is a 'cache' attribute; prototypes are created on demand
         */
        this.classNameToPrototype = {};
    },

    registerOverride: function(classLabel, fnSerialize, fnDeserialize) {
        this.classNameToFnSerialize[classLabel] = fnSerialize;
        this.classNameToFnDeserialize[classLabel] = fnDeserialize;
    },

    /**
     * Find and index all classes that appear as members of the namespace (a JavaScript Object)
     *
     */
    indexClasses: function(ns) {
        var tmp = this.findClasses(ns);

        ObjectUtils.extend(this.classNameToClass, tmp);

        return tmp;
    },

    findClasses: function(ns) {
        var result = {};

        ns.forEach(function(k) {
            // TODO Use custom function to obtain class names
            var classLabel = k.classLabel || (k.prototype ? k.prototype.classLabel : null);
            if (classLabel) {
                result[classLabel] = k;
            }
        });

        return result;
    },

    /**
     * Returns the class label for an instance
     *
     */
    getLabelForClass: function(obj) {
        var objProto = Object.getPrototypeOf(obj);

        var result;
        this.classNameToClass.find(function(ctor, classLabel) {
            if (objProto === ctor.prototype) {
                result = classLabel;
                return true;
            }
        });

        return result;
    },

    getClassForLabel: function(classLabel) {
        var result;
        this.classNameToClass.find(function(ctor, cl) {
            if (cl === classLabel) {
                result = ctor;
                return true;
            }
        });

        return result;
    },

    serialize: function(obj, context) {
        context = context || new SerializationContext();

        var data = this.serializeRec(obj, context);

        var result = {
            root: data,
            idToState: context.getIdToState(),
        };

        return result;
    },

    serializeRec: function(obj, context) {
        var result;

        // var id = context.getOrCreateId(obj);

        // Get or create an ID for the object
        var objToId = context.getObjToId();
        var id = objToId.get(obj);

        if (!id) {
            id = context.nextId();
            objToId.put(obj, id);
        }

        var idToState = context.getIdToState();
        var state = idToState[id];

        if (state) {
            result = {
                ref: id,
            };
        } else if (ObjectUtils.isFunction(obj)) {
            result = undefined;
        } else if (ObjectUtils.isObject(obj)) {

            result = {};

            // Try to figure out the class of the object
            // var objClassLabel = obj.classLabel;

            var classLabel = this.getLabelForClass(obj);

            // TODO Source of Confusion: We use proto to refer toa prototypal instance of some class for the sake of
            // getting the default values as well as an JavaScript's object prototype... Fix the naming.

            // TODO Not sure how stable this proto stuff is across browsers
            var isPrimitiveObject = function(obj) {
                var result = Boolean(obj) || Object.toString.call(obj) === '[object Number]' ||
                    Object.toString.call(obj) === '[object Date]' ||
                    Object.toString.call(obj) === '[object String]' ||
                    Object.toString.call(obj) === '[object RegExp]';
                return result;
            };

            var isSimpleMap = function(obj) {
                var objProto = obj.prototype;

                var isObject = ObjectUtils.isObject(obj) && !isPrimitiveObject(obj);

                var result = isObject && objProto == null;

                return result;
            };

            var isSimpleObject = isPrimitiveObject(obj) || isSimpleMap(obj) || Array.isArray(obj);

            if (classLabel == null && !isSimpleObject) {
                //console.log('Failed to serialize instance without class label', obj);
                throw new Error('Failed to serialize instance without class label');
            }

            var proto;
            if (classLabel) {

                proto = this.classNameToPrototype[classLabel];

                if (!proto) {
                    var Clazz = this.getClassForLabel(classLabel);

                    if (Clazz) {
                        try {
                            proto = new Clazz();
                            this.classNameToPrototype[classLabel] = proto;
                        } catch (e) {
                            console.log('[WARN] Failed to create a prototype instance of class ' + classLabel, e);
                        }
                    }
                }
            }

            if (!proto) {
                proto = {};
            }

            /*
            var data = {};

            var self = this;
            _(obj).each(function(v, k) {

                var val = self.serializeRec(v, context);

                var compVal = proto[k];
                var isEqual = _(val).isEqual(compVal) || (val == null && compVal == null);
                //console.log('is equal: ', isEqual, 'val: ', val, 'compVal: ', compVal);
                if(isEqual) {
                    return;
                }

                if(!_(val).isUndefined()) {
                    data[k] = val;
                }
                //serialize(clazz, k, v);
            });
            */
            var data = this.serializeAttrs(obj, context, proto);

            //              }

            var x = {};

            if (classLabel) {
                x.classLabel = classLabel;
            }

            if (Object.keys(data).length > 0) {
                x.attrs = data.attrs;
                if (data.parent != null) {
                    x.parent = data.parent;
                }
            }

            // If the object is also an array, serialize its members
            // Array members are treated just like objects
            /*
            var self = this;
            if(_(obj).isArray()) {
                var items = _(obj).map(function(item) {
                    var r = self.serializeRec(item, context);
                    return r;
                });

                x['items'] = items;
            }
            */
            if (Array.isArray(obj)) {
                x.length = obj.length;
            }

            idToState[id] = x;

            result = {
                ref: id,
            };
        } else {
            // result = {type: 'literal', 'value': obj};//null; //obj;
            result = {
                value: obj,
            };
            // throw "unhandled case for " + obj;
        }

        // return result;
        return result;
    },

    /**
     * Serialize an object's state, thereby taking the prototype chain into account
     *
     * TODO: We assume that noone messed with the prototype chain after an instance of
     * an 'conceptual' class has been created.
     *
     */
    serializeAttrs: function(obj, context, proto) {
        var result = {};
        var parent = result;

        //            while(current != null) {
        var data = parent.attrs = {};

        var self = this;

        var keys = Object.keys(obj);
        keys.forEach(function(k) {
            var v = obj[k];

            // _(obj).each(function(v, k) {

            // Only traverse own properties
            //                    if(!_(obj).has(k)) {
            //                        return;
            //                    }

            var val = self.serializeRec(v, context);

            var compVal = proto[k];
            var isEqual = ObjectUtils.isEqual(val, compVal) || (val == null && compVal == null);
            // console.log('is equal: ', isEqual, 'val: ', val, 'compVal: ', compVal);
            if (isEqual) {
                return;
            }

            if (val) {
                data[k] = val;
            }
            // serialize(clazz, k, v);
        });

        //                current = current.__proto__;
        //                if(current) {
        //                    parent = parent['parent'] = {};
        //                }
        //            };

        return result;
    },

    /**
     * @param {Object} graph: Object created by serialize(foo)
     *
     */
    deserialize: function(graph) {
        // context = context || new ns.SerializationContext();

        var ref = graph.root;
        var idToState = graph.idToState;
        var idToObj = {};

        var result = this.deserializeRef(ref, idToState, idToObj);

        return result;
    },

    deserializeRef: function(attr, idToState, idToObj) {
        var ref = attr.ref;
        var value = attr.value;

        var result;

        if (ref != null) {
            var objectExists = ref in idToObj;

            if (objectExists) {
                result = idToObj[ref];
            } else {
                result = this.deserializeState(ref, idToState, idToObj);

                //                    if(result == null) {
                //                        console.log('Could not deserialize: ' + JSON.stringify(state) + ' with context ' + idToState);
                //                        throw 'Deserialization error';
                //                    }
            }
        } else {
            result = value;
        }
        /*
        else if(!_(value).isUndefined()) {
            result = value;
        }
        else if(_(value).isUndefined()) {
            // Leave the value
        }
        else {
            console.log('Should not come here');
            throw 'Should not come here';
        }
        */
        return result;
    },

    deserializeState: function(id, idToState, idToObj) {

        var result;

        var state = idToState[id];

        if (state == null || !ObjectUtils.isObject(state)) {
            console.log('State must be an object, was: ', state);
            throw new Error('Deserialization error');
        }

        var attrs = state.attrs;
        // var items = state.items;
        var classLabel = state.classLabel;
        var length = state.length;

        if (classLabel) {
            var ClassFn = this.getClassForLabel(classLabel);

            if (!ClassFn) {
                throw new Error('Unknown class label encountered in deserialization: ' + classLabel);
            }

            result = new ClassFn();
        } else if (length != null) { // items != null) {
            result = [];
        } else {
            result = {};
        }

        // TODO get the id
        idToObj[id] = result;

        var self = this;
        if (attrs != null) {
            var keys = Object.keys(attrs);
            keys.forEach(function(k) {
                var ref = attrs[k];

                var val = self.deserializeRef(ref, idToState, idToObj);

                result[k] = val;
            });
        }

        if (length != null) {
            result.length = length;
        }
        /*
        if(items != null) {
            _(items).each(function(item) {
                var r = self.deserializeRef(item, idToState, idToObj);

                result.push(r);
            });
        }
        */

        return result;
    },
});

module.exports = new Serializer();

},{"../ext/Class":2,"./ObjectUtils":332,"./SerializationContext":335}],337:[function(require,module,exports){
var uniq = require('lodash.uniq');

var StringUtils = {

    extractAllRegexMatches: function(pattern, str, index) {
        var match;
        var result = [];

        while ((match = pattern.exec(str)) != null) {
            result.push(match[index]);
        }

        result = uniq(result);

        return result;
    }

};

module.exports = StringUtils;

},{"lodash.uniq":583}],338:[function(require,module,exports){
var TreeUtils = {

    /**
     * Generic method for visiting a tree structure
     *
     */
    visitDepthFirst: function(parent, fnChildren, fnPredicate) {
        var proceed = fnPredicate(parent);

        if (proceed) {
            var children = fnChildren(parent);

            children.forEach(function(child) {
                TreeUtils.visitDepthFirst(child, fnChildren, fnPredicate);
            });
        }
    },

    /**
     * Traverses a tree structure based on a child-attribute name and returns all nodes
     *
     */
    flattenTree: function(node, childPropertyName, result) {
        if (result == null) {
            result = [];
        }

        if (node) {
            result.push(node);
        }

        var children = node[childPropertyName];
        var self = this;
        if (children) {
            children.forEach(function(childNode) {
                self.flattenTree(childNode, childPropertyName, result);
            });
        }

        return result;
    }
};

module.exports = TreeUtils;

},{}],339:[function(require,module,exports){
var UriUtils = {

    extractLabel: function(str) {
        var a = str.lastIndexOf('#');
        var b = str.lastIndexOf('/');
        
        var i = Math.max(a, b);
    
        var result = (i === str.length) ? str : str.substring(i + 1); 
    
        if(result === '') {
            result = str; // Rather show the URI than an empty string
        }
        
        return result;
    }
};

module.exports = UriUtils;

},{}],340:[function(require,module,exports){
var Class = require('../../ext/Class');
var ObjectUtils = require('../ObjectUtils');

var ArrayList = Class.create({
    initialize: function(fnEquals) {
        this.items = [];
        this.fnEquals = fnEquals || ObjectUtils.isEqual;
    },

    setItems: function(items) {
        this.items = items;
    },

    getArray: function() {
        return this.items;
    },

    get: function(index) {
        var result = this.items[index];
        return result;
    },

    add: function(item) {
        this.items.push(item);
    },

    indexesOf: function(item) {
        var items = this.items;
        var fnEquals = this.fnEquals;

        var result = [];

        items.forEach(function(it, index) {
            var isEqual = fnEquals(item, it);
            if (isEqual) {
                result.push(index);
            }
        });

        return result;
    },

    contains: function(item) {
        var indexes = this.indexesOf(item);
        var result = indexes.length > 0;
        return result;
    },

    firstIndexOf: function(item) {
        var indexes = this.indexesOf(item);
        var result = (indexes.length > 0) ? indexes[0] : -1;
        return result;
    },

    lastIndexOf: function(item) {
        var indexes = this.indexesOf(item);
        var result = (indexes.length > 0) ? indexes[indexes.length - 1] : -1;
        return result;
    },

    /**
     * Removes the first occurrence of the item from the list
     */
    remove: function(item) {
        var index = this.firstIndexOf(item);
        if (index >= 0) {
            this.removeByIndex(index);
        }
    },

    removeByIndex: function(index) {
        this.items.splice(index, 1);
    },

    size: function() {
        return this.items.length;
    }
});

module.exports = ArrayList;

},{"../../ext/Class":2,"../ObjectUtils":332}],341:[function(require,module,exports){
var Class = require('../../ext/Class');

var Entry = Class.create({
    initialize: function(key, value) {
        this.key = key;
        this.value = value;
    },

    getKey: function() {
        return this.key;
    },

    getValue: function() {
        return this.value;
    },

    toString: function() {
        return this.key + '->' + this.value;
    }
});

module.exports = Entry;

},{"../../ext/Class":2}],342:[function(require,module,exports){
var Class = require('../../ext/Class');
var HashMap = require('./HashMap');

var HashBidiMap = Class.create({
    initialize: function(fnEquals, fnHash, inverseMap) {
        this.forward = new HashMap(fnEquals, fnHash);
        this.inverse = inverseMap ? inverseMap : new HashBidiMap(fnEquals, fnHash, this);
    },

    getInverse: function() {
        return this.inverse;
    },

    put: function(key, val) {
        this.remove(key);

        this.forward.put(key, val);
        this.inverse.forward.put(val, key);
    },

    remove: function(key) {
        var priorVal = this.get(key);

        if (priorVal !== null) {
            this.inverse.forward.remove(priorVal);
        }
        this.forward.remove(key);
    },

    getMap: function() {
        return this.forward;
    },

    get: function(key) {
        var result = this.forward.get(key);
        return result;
    },

    keyList: function() {
        var result = this.forward.keys();
        return result;
    }
});

module.exports = HashBidiMap;

},{"../../ext/Class":2,"./HashMap":343}],343:[function(require,module,exports){
var forEach = require('lodash.foreach');
var Class = require('../../ext/Class');
var ObjectUtils = require('./../ObjectUtils');

var HashMap = Class.create({
    initialize: function(fnEquals, fnHash) {

        this.fnEquals = fnEquals ? fnEquals : ObjectUtils.isEqual;
        this.fnHash = fnHash ? fnHash : ObjectUtils.hashCode;

        this.hashToBucket = {};

        var self = this;
        this.fnGet = function(key) {
            var r = self.get(key);
            return r;
        };
    },

    clear: function() {
        this.hashToBucket = {};
    },

    putAll: function(map) {
        var self = this;
        map.entries().forEach(function(entry) {
            self.put(entry.key, entry.val);
        });

        return this;
    },

    put: function(key, val) {
        var hash = this.fnHash(key);

        var bucket = this.hashToBucket[hash];
        if (bucket == null) {
            bucket = [];
            this.hashToBucket[hash] = bucket;
        }

        var keyIndex = this._indexOfKey(bucket, key);
        if (keyIndex >= 0) {
            bucket[keyIndex].val = val;
            return;
        }

        var entry = {
            key: key,
            val: val,
        };

        bucket.push(entry);
    },

    _indexOfKey: function(bucket, key) {
        if (bucket != null) {

            for (var i = 0; i < bucket.length; ++i) {
                var entry = bucket[i];

                var k = entry.key;
                if (this.fnEquals(k, key)) {
                    // entry.val = val;
                    return i;
                }
            }

        }

        return -1;
    },

    get: function(key) {
        var hash = this.fnHash(key);
        var bucket = this.hashToBucket[hash];
        var i = this._indexOfKey(bucket, key);
        var result = i >= 0 ? bucket[i].val : null;
        return result;
    },

    remove: function(key) {
        var hash = this.fnHash(key);
        var bucket = this.hashToBucket[hash];
        var i = this._indexOfKey(bucket, key);

        var doRemove = i >= 0;
        if (doRemove) {
            bucket.splice(i, 1);
        }

        return doRemove;
    },

    containsKey: function(key) {
        var hash = this.fnHash(key);
        var bucket = this.hashToBucket[hash];
        var result = this._indexOfKey(bucket, key) >= 0;
        return result;
    },

    keys: function() {
        var result = [];

        forEach(this.hashToBucket, function(bucket) {
            var keys = [];
            bucket.forEach(function(item) {
                if (item.key) {
                    keys.push(item.key);
                }
            });
            result.push.apply(result, keys);
        });

        return result;
    },

    values: function() {
        var entries = this.entries();

        var result = entries.map(function(entry) {
           return entry.val;
        });

        return result;
    },

    entries: function() {
        var result = [];

        forEach(this.hashToBucket, function(bucket) {
            result.push.apply(result, bucket);
        });

        return result;
    },

    toString: function() {
        var entries = this.entries();
        var entryStrs = entries.map(function(entry) {
            return entry.key + ': ' + entry.val;
        });
        var result = '{' + entryStrs.join(', ') + '}';
        return result;
    },

    /**
     * Returns a function for getting elements
     */
    asFn: function() {
        return this.fnGet;
    },

});

module.exports = HashMap;

},{"../../ext/Class":2,"./../ObjectUtils":332,"lodash.foreach":433}],344:[function(require,module,exports){
var Class = require('../../ext/Class');
var HashMap = require('./HashMap');

var HashSet = Class.create({
    initialize: function(fnEquals, fnHash) {
        this.map = new HashMap(fnEquals, fnHash);
    },

    add: function(item) {
        this.map.put(item, true);
    },

    contains: function(item) {
        var result = this.map.containsKey(item);
        return result;
    },

    remove: function(item) {
        this.map.remove(item);
    },

    entries: function() {
        var result = this.map.entries().map(function(entry) {
            // return entry.getKey();
            return entry.key;
        });

        return result;
    },

    clear: function() {
        this.map.clear();
    },

    toString: function() {
        var entries = this.entries();
        var result = '{' + entries.join(', ') + '}';
        return result;
    }
});

module.exports = HashSet;

},{"../../ext/Class":2,"./HashMap":343}],345:[function(require,module,exports){
var Class = require('../../ext/Class');

var Iterator = Class.create({
    next: function() {
        throw new Error('Not overridden');
    },
    hasNext: function() {
        throw new Error('Not overridden');
    }
});

module.exports = Iterator;

},{"../../ext/Class":2}],346:[function(require,module,exports){
var Class = require('../../ext/Class');
var Iterator = require('./Iterator');

var IteratorAbstract = Class.create(Iterator, {
    initialize: function() {
        this.current = null;
        this.advance = true;
        this.finished = false;
    },

    finish: function() {
        this.finished = true;

        this.close();
        return null;
    },

    $prefetch: function() {
        this.current = this.prefetch();
    },

    hasNext: function() {
        if (this.advance) {
            this.$prefetch();
            this.advance = false;
        }

        return this.finished === false;
    },

    next: function() {
        if (this.finished) {
            throw new Error('No more elments');
        }

        if (this.advance) {
            this.$prefetch();
        }

        this.advance = true;
        return this.current;
    },

    prefetch: function() {
        throw new Error('Not overridden');
    }
});

module.exports = IteratorAbstract;

},{"../../ext/Class":2,"./Iterator":345}],347:[function(require,module,exports){
var Class = require('../../ext/Class');
var Iterator = require('./Iterator');

/**
 * Utility class to create an iterator over an array.
 *
 */
var IteratorArray = Class.create(Iterator, {
    initialize: function(array, offset) {
        this.array = array;
        this.offset = offset ? offset : 0;
    },

    getArray: function() {
        return this.array;
    },

    hasNext: function() {
        var result = this.offset < this.array.length;
        return result;
    },

    next: function() {
        var hasNext = this.hasNext();

        var result;
        if (hasNext) {
            result = this.array[this.offset];

            ++this.offset;
        } else {
            result = null;
        }

        return result;
    }
});

module.exports = IteratorArray;

},{"../../ext/Class":2,"./Iterator":345}],348:[function(require,module,exports){
var Class = require('../../ext/Class');
var HashMap = require('./HashMap');

/**
 * A map that retains insert order
 *
 */
var ListMap = Class.create({
    initialize: function(fnEquals, fnHash) {
        this.map = new HashMap(fnEquals, fnHash);
        this.keys = [];
    },

    put: function(key, value) {
        var v = this.map.get(key);
        if (v) {
            throw new Error('Key ' + key + ' already inserted');
        }

        this.keys.push(key);
        this.map.put(key, value);
    },

    get: function(key) {
        var result = this.map.get(key);
        return result;
    },

    getByIndex: function(index) {
        var key = this.keys[index];
        var result = this.map.get(key);
        return result;
    },

    entries: function() {
        var self = this;
        var result = this.keys.map(function(key) {
            var value = self.map.get(key);

            var r = {
                key: key,
                val: value
            };
            return r;
        });

        return result;
    },

    remove: function(key) {
        for (var i = 0; i < this.keys.length; i++) {
          var iterKey = this.keys[i];
          if (iterKey === key) {
            this.keys.splice(i, 1);
            break;
          }
        }
        this.map.remove(key);
    },

    removeByIndex: function(index) {
        var key = this.keys[index];

        this.remove(key);
    },

    keyList: function() {
        return this.keys;
    },

    size: function() {
        return this.keys.length;
    }
});

module.exports = ListMap;

},{"../../ext/Class":2,"./HashMap":343}],349:[function(require,module,exports){
var Class = require('../../ext/Class');

var MultiMapObjectArray = Class.create({
    initialize: function() {
        this.entries = {};
    },

    clone: function() {
        var result = new MultiMapObjectArray();
        result.addMultiMap(this);

        return result;
    },

    clear: function() {
        // this.entries = {},
        var keys = Object.keys(this.entries);
        var self = this;
        keys.forEach(function(key) {
            delete self.entries[key];
        });
    },

    addMultiMap: function(other) {
        for (var key in other.entries) {
            var values = other.entries[key];

            for (var i = 0; i < values.length; ++i) {
                var value = values[i];

                this.put(key, value);
            }
        }
    },

    get: function(key) {
        return (key in this.entries) ? this.entries[key] : [];
    },

    put: function(key, value) {
        var values;

        if (key in this.entries) {
            values = this.entries[key];
        } else {
            values = [];
            this.entries[key] = values;
        }

        values.push(value);
    },

    removeKey: function(key) {
        delete this.entries[key];
    }
});

module.exports = MultiMapObjectArray;

},{"../../ext/Class":2}],350:[function(require,module,exports){
'use strict';

var ns = {
    ArrayUtils: require('./ArrayUtils'),
    ClusterUtils: require('./ClusterUtils'),
    CollectionUtils: require('./CollectionUtils'),
    JsonUtils: require('./JsonUtils'),
    MapUtils: require('./MapUtils'),
    ObjectUtils: require('./ObjectUtils'),
    PrefixUtils: require('./PrefixUtils'),
    PromiseUtils: require('./PromiseUtils'),
    SerializationContext: require('./SerializationContext'),
    Serializer: require('./Serializer'),
    StringUtils: require('./StringUtils'),
    TreeUtils: require('./TreeUtils'),
    UriUtils: require('./UriUtils'),
    shared: require('./shared'),
    ArrayList: require('./collection/ArrayList'),
    Entry: require('./collection/Entry'),
    HashBidiMap: require('./collection/HashBidiMap'),
    HashMap: require('./collection/HashMap'),
    HashSet: require('./collection/HashSet'),
    Iterator: require('./collection/Iterator'),
    IteratorAbstract: require('./collection/IteratorAbstract'),
    IteratorArray: require('./collection/IteratorArray'),
    ListMap: require('./collection/ListMap'),
    MultiMapObjectArray: require('./collection/MultiMapObjectArray'),
};

Object.freeze(ns);

module.exports = ns;

},{"./ArrayUtils":327,"./ClusterUtils":328,"./CollectionUtils":329,"./JsonUtils":330,"./MapUtils":331,"./ObjectUtils":332,"./PrefixUtils":333,"./PromiseUtils":334,"./SerializationContext":335,"./Serializer":336,"./StringUtils":337,"./TreeUtils":338,"./UriUtils":339,"./collection/ArrayList":340,"./collection/Entry":341,"./collection/HashBidiMap":342,"./collection/HashMap":343,"./collection/HashSet":344,"./collection/Iterator":345,"./collection/IteratorAbstract":346,"./collection/IteratorArray":347,"./collection/ListMap":348,"./collection/MultiMapObjectArray":349,"./shared":351}],351:[function(require,module,exports){
var shared = {
    Promise: null,
    ajax: function() {
        throw new Error('not set!');
    }
};

module.exports = shared;

},{}],352:[function(require,module,exports){
'use strict';

var ns = {
    owl: require('./owl'),
    rdf: require('./rdf'),
    rdfs: require('./rdfs'),
    wgs84: require('./wgs84'),
    xsd: require('./xsd'),
};

Object.freeze(ns);

module.exports = ns;

},{"./owl":353,"./rdf":354,"./rdfs":355,"./wgs84":356,"./xsd":357}],353:[function(require,module,exports){
var NodeFactory = require('../rdf/NodeFactory');
var p = 'http://www.w3.org/2002/07/owl#';

var ns = {
    Class: NodeFactory.createUri(p + 'Class'),
    DatatypeProperty: NodeFactory.createUri(p + 'DatatypeProperty'),
    ObjectProperty: NodeFactory.createUri(p + 'ObjectProperty'),
    AnnotationProperty: NodeFactory.createUri(p + 'AnnotationProperty'),
};

module.exports = ns;

},{"../rdf/NodeFactory":91}],354:[function(require,module,exports){
var NodeFactory = require('../rdf/NodeFactory');
var p = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

var ns = {
    type: NodeFactory.createUri(p + 'type'),
    Property: NodeFactory.createUri(p + 'Property'),
};

module.exports = ns;

},{"../rdf/NodeFactory":91}],355:[function(require,module,exports){
var NodeFactory = require('../rdf/NodeFactory');
var p = 'http://www.w3.org/2000/01/rdf-schema#';

var ns = {
    label: NodeFactory.createUri(p + 'label'),
    comment: NodeFactory.createUri(p + 'comment'),
    subClassOf: NodeFactory.createUri(p + 'subClassOf'),
};

module.exports = ns;

},{"../rdf/NodeFactory":91}],356:[function(require,module,exports){
var NodeFactory = require('../rdf/NodeFactory');
var p = 'http://www.w3.org/2003/01/geo/wgs84_pos#';

// String versions
var ns = {
    lon: NodeFactory.createUri(p + 'long'),
    lat: NodeFactory.createUri(p + 'lat'),
};

module.exports = ns;

},{"../rdf/NodeFactory":91}],357:[function(require,module,exports){
var p = 'http://www.w3.org/2001/XMLSchema#';
var Node_Uri = require('../rdf/node/Node_Uri');
// Note we can't use the NodeFactory here because of cyclic dep
// var NodeFactory = require('../rdf/NodeFactory');

var ns = {
    xboolean: new Node_Uri(p + 'boolean'),
    xint: new Node_Uri(p + 'int'),
    xinteger: new Node_Uri(p + 'integer'),
    xlong: new Node_Uri(p + 'long'),
    decimal: new Node_Uri(p + 'decimal'),
    xfloat: new Node_Uri(p + 'float'),
    xdouble: new Node_Uri(p + 'double'),
    xstring: new Node_Uri(p + 'string'),
    date: new Node_Uri(p + 'date'),
    dateTime: new Node_Uri(p + 'dateTime'),
};

module.exports = ns;

},{"../rdf/node/Node_Uri":108}],358:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var keys = require('lodash.keys'),
    objectTypes = require('lodash._objecttypes');

/**
 * Assigns own enumerable properties of source object(s) to the destination
 * object for all destination properties that resolve to `undefined`. Once a
 * property is set, additional defaults of the same property will be ignored.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Objects
 * @param {Object} object The destination object.
 * @param {...Object} [source] The source objects.
 * @param- {Object} [guard] Allows working with `_.reduce` without using its
 *  `key` and `object` arguments as sources.
 * @returns {Object} Returns the destination object.
 * @example
 *
 * var object = { 'name': 'barney' };
 * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
 * // => { 'name': 'barney', 'employer': 'slate' }
 */
var defaults = function(object, source, guard) {
  var index, iterable = object, result = iterable;
  if (!iterable) return result;
  var args = arguments,
      argsIndex = 0,
      argsLength = typeof guard == 'number' ? 2 : args.length;
  while (++argsIndex < argsLength) {
    iterable = args[argsIndex];
    if (iterable && objectTypes[typeof iterable]) {
    var ownIndex = -1,
        ownProps = objectTypes[typeof iterable] && keys(iterable),
        length = ownProps ? ownProps.length : 0;

    while (++ownIndex < length) {
      index = ownProps[ownIndex];
      if (typeof result[index] == 'undefined') result[index] = iterable[index];
    }
    }
  }
  return result
};

module.exports = defaults;

},{"lodash._objecttypes":359,"lodash.keys":360}],359:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to determine if values are of the language type Object */
var objectTypes = {
  'boolean': false,
  'function': true,
  'object': true,
  'number': false,
  'string': false,
  'undefined': false
};

module.exports = objectTypes;

},{}],360:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative'),
    isObject = require('lodash.isobject'),
    shimKeys = require('lodash._shimkeys');

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;

/**
 * Creates an array composed of the own enumerable property names of an object.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property names.
 * @example
 *
 * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
 * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  if (!isObject(object)) {
    return [];
  }
  return nativeKeys(object);
};

module.exports = keys;

},{"lodash._isnative":361,"lodash._shimkeys":362,"lodash.isobject":363}],361:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/** Used to detect if a method is native */
var reNative = RegExp('^' +
  String(toString)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/toString| for [^\]]+/g, '.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
 */
function isNative(value) {
  return typeof value == 'function' && reNative.test(value);
}

module.exports = isNative;

},{}],362:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = require('lodash._objecttypes');

/** Used for native method references */
var objectProto = Object.prototype;

/** Native method shortcuts */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A fallback implementation of `Object.keys` which produces an array of the
 * given object's own enumerable property names.
 *
 * @private
 * @type Function
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property names.
 */
var shimKeys = function(object) {
  var index, iterable = object, result = [];
  if (!iterable) return result;
  if (!(objectTypes[typeof object])) return result;
    for (index in iterable) {
      if (hasOwnProperty.call(iterable, index)) {
        result.push(index);
      }
    }
  return result
};

module.exports = shimKeys;

},{"lodash._objecttypes":359}],363:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = require('lodash._objecttypes');

/**
 * Checks if `value` is the language type of Object.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // check if the value is the ECMAScript language type of Object
  // http://es5.github.io/#x8
  // and avoid a V8 bug
  // http://code.google.com/p/v8/issues/detail?id=2291
  return !!(value && objectTypes[typeof value]);
}

module.exports = isObject;

},{"lodash._objecttypes":359}],364:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseFlatten = require('lodash._baseflatten'),
    map = require('lodash.map');

/**
 * Flattens a nested array (the nesting can be to any depth). If `isShallow`
 * is truey, the array will only be flattened a single level. If a callback
 * is provided each element of the array is passed through the callback before
 * flattening. The callback is bound to `thisArg` and invoked with three
 * arguments; (value, index, array).
 *
 * If a property name is provided for `callback` the created "_.pluck" style
 * callback will return the property value of the given element.
 *
 * If an object is provided for `callback` the created "_.where" style callback
 * will return `true` for elements that have the properties of the given object,
 * else `false`.
 *
 * @static
 * @memberOf _
 * @category Arrays
 * @param {Array} array The array to flatten.
 * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
 * @param {Function|Object|string} [callback=identity] The function called
 *  per iteration. If a property name or object is provided it will be used
 *  to create a "_.pluck" or "_.where" style callback, respectively.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Array} Returns a new flattened array.
 * @example
 *
 * _.flatten([1, [2], [3, [[4]]]]);
 * // => [1, 2, 3, 4];
 *
 * _.flatten([1, [2], [3, [[4]]]], true);
 * // => [1, 2, 3, [[4]]];
 *
 * var characters = [
 *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
 *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
 * ];
 *
 * // using "_.pluck" callback shorthand
 * _.flatten(characters, 'pets');
 * // => ['hoppy', 'baby puss', 'dino']
 */
function flatten(array, isShallow, callback, thisArg) {
  // juggle arguments
  if (typeof isShallow != 'boolean' && isShallow != null) {
    thisArg = callback;
    callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
    isShallow = false;
  }
  if (callback != null) {
    array = map(array, callback, thisArg);
  }
  return baseFlatten(array, isShallow);
}

module.exports = flatten;

},{"lodash._baseflatten":365,"lodash.map":369}],365:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray');

/**
 * The base implementation of `_.flatten` without support for callback
 * shorthands or `thisArg` binding.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
 * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
 * @param {number} [fromIndex=0] The index to start from.
 * @returns {Array} Returns a new flattened array.
 */
function baseFlatten(array, isShallow, isStrict, fromIndex) {
  var index = (fromIndex || 0) - 1,
      length = array ? array.length : 0,
      result = [];

  while (++index < length) {
    var value = array[index];

    if (value && typeof value == 'object' && typeof value.length == 'number'
        && (isArray(value) || isArguments(value))) {
      // recursively flatten arrays (susceptible to call stack limits)
      if (!isShallow) {
        value = baseFlatten(value, isShallow, isStrict);
      }
      var valIndex = -1,
          valLength = value.length,
          resIndex = result.length;

      result.length += valLength;
      while (++valIndex < valLength) {
        result[resIndex++] = value[valIndex];
      }
    } else if (!isStrict) {
      result.push(value);
    }
  }
  return result;
}

module.exports = baseFlatten;

},{"lodash.isarguments":366,"lodash.isarray":367}],366:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** `Object#toString` result shortcuts */
var argsClass = '[object Arguments]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/**
 * Checks if `value` is an `arguments` object.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
 * @example
 *
 * (function() { return _.isArguments(arguments); })(1, 2, 3);
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  return value && typeof value == 'object' && typeof value.length == 'number' &&
    toString.call(value) == argsClass || false;
}

module.exports = isArguments;

},{}],367:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative');

/** `Object#toString` result shortcuts */
var arrayClass = '[object Array]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray;

/**
 * Checks if `value` is an array.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
 * @example
 *
 * (function() { return _.isArray(arguments); })();
 * // => false
 *
 * _.isArray([1, 2, 3]);
 * // => true
 */
var isArray = nativeIsArray || function(value) {
  return value && typeof value == 'object' && typeof value.length == 'number' &&
    toString.call(value) == arrayClass || false;
};

module.exports = isArray;

},{"lodash._isnative":368}],368:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],369:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var createCallback = require('lodash.createcallback'),
    forOwn = require('lodash.forown');

/**
 * Creates an array of values by running each element in the collection
 * through the callback. The callback is bound to `thisArg` and invoked with
 * three arguments; (value, index|key, collection).
 *
 * If a property name is provided for `callback` the created "_.pluck" style
 * callback will return the property value of the given element.
 *
 * If an object is provided for `callback` the created "_.where" style callback
 * will return `true` for elements that have the properties of the given object,
 * else `false`.
 *
 * @static
 * @memberOf _
 * @alias collect
 * @category Collections
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function|Object|string} [callback=identity] The function called
 *  per iteration. If a property name or object is provided it will be used
 *  to create a "_.pluck" or "_.where" style callback, respectively.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Array} Returns a new array of the results of each `callback` execution.
 * @example
 *
 * _.map([1, 2, 3], function(num) { return num * 3; });
 * // => [3, 6, 9]
 *
 * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
 * // => [3, 6, 9] (property order is not guaranteed across environments)
 *
 * var characters = [
 *   { 'name': 'barney', 'age': 36 },
 *   { 'name': 'fred',   'age': 40 }
 * ];
 *
 * // using "_.pluck" callback shorthand
 * _.map(characters, 'name');
 * // => ['barney', 'fred']
 */
function map(collection, callback, thisArg) {
  var index = -1,
      length = collection ? collection.length : 0;

  callback = createCallback(callback, thisArg, 3);
  if (typeof length == 'number') {
    var result = Array(length);
    while (++index < length) {
      result[index] = callback(collection[index], index, collection);
    }
  } else {
    result = [];
    forOwn(collection, function(value, key, collection) {
      result[++index] = callback(value, key, collection);
    });
  }
  return result;
}

module.exports = map;

},{"lodash.createcallback":370,"lodash.forown":406}],370:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    baseIsEqual = require('lodash._baseisequal'),
    isObject = require('lodash.isobject'),
    keys = require('lodash.keys'),
    property = require('lodash.property');

/**
 * Produces a callback bound to an optional `thisArg`. If `func` is a property
 * name the created callback will return the property value for a given element.
 * If `func` is an object the created callback will return `true` for elements
 * that contain the equivalent object properties, otherwise it will return `false`.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {*} [func=identity] The value to convert to a callback.
 * @param {*} [thisArg] The `this` binding of the created callback.
 * @param {number} [argCount] The number of arguments the callback accepts.
 * @returns {Function} Returns a callback function.
 * @example
 *
 * var characters = [
 *   { 'name': 'barney', 'age': 36 },
 *   { 'name': 'fred',   'age': 40 }
 * ];
 *
 * // wrap to create custom callback shorthands
 * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
 *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
 *   return !match ? func(callback, thisArg) : function(object) {
 *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
 *   };
 * });
 *
 * _.filter(characters, 'age__gt38');
 * // => [{ 'name': 'fred', 'age': 40 }]
 */
function createCallback(func, thisArg, argCount) {
  var type = typeof func;
  if (func == null || type == 'function') {
    return baseCreateCallback(func, thisArg, argCount);
  }
  // handle "_.pluck" style callback shorthands
  if (type != 'object') {
    return property(func);
  }
  var props = keys(func),
      key = props[0],
      a = func[key];

  // handle "_.where" style callback shorthands
  if (props.length == 1 && a === a && !isObject(a)) {
    // fast path the common case of providing an object with a single
    // property containing a primitive value
    return function(object) {
      var b = object[key];
      return a === b && (a !== 0 || (1 / a == 1 / b));
    };
  }
  return function(object) {
    var length = props.length,
        result = false;

    while (length--) {
      if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
        break;
      }
    }
    return result;
  };
}

module.exports = createCallback;

},{"lodash._basecreatecallback":371,"lodash._baseisequal":390,"lodash.isobject":399,"lodash.keys":401,"lodash.property":405}],371:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var bind = require('lodash.bind'),
    identity = require('lodash.identity'),
    setBindData = require('lodash._setbinddata'),
    support = require('lodash.support');

/** Used to detected named functions */
var reFuncName = /^\s*function[ \n\r\t]+\w/;

/** Used to detect functions containing a `this` reference */
var reThis = /\bthis\b/;

/** Native method shortcuts */
var fnToString = Function.prototype.toString;

/**
 * The base implementation of `_.createCallback` without support for creating
 * "_.pluck" or "_.where" style callbacks.
 *
 * @private
 * @param {*} [func=identity] The value to convert to a callback.
 * @param {*} [thisArg] The `this` binding of the created callback.
 * @param {number} [argCount] The number of arguments the callback accepts.
 * @returns {Function} Returns a callback function.
 */
function baseCreateCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  // exit early for no `thisArg` or already bound by `Function#bind`
  if (typeof thisArg == 'undefined' || !('prototype' in func)) {
    return func;
  }
  var bindData = func.__bindData__;
  if (typeof bindData == 'undefined') {
    if (support.funcNames) {
      bindData = !func.name;
    }
    bindData = bindData || !support.funcDecomp;
    if (!bindData) {
      var source = fnToString.call(func);
      if (!support.funcNames) {
        bindData = !reFuncName.test(source);
      }
      if (!bindData) {
        // checks if `func` references the `this` keyword and stores the result
        bindData = reThis.test(source);
        setBindData(func, bindData);
      }
    }
  }
  // exit early if there are no `this` references or `func` is bound
  if (bindData === false || (bindData !== true && bindData[1] & 1)) {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 2: return function(a, b) {
      return func.call(thisArg, a, b);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
  }
  return bind(func, thisArg);
}

module.exports = baseCreateCallback;

},{"lodash._setbinddata":372,"lodash.bind":375,"lodash.identity":387,"lodash.support":388}],372:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative'),
    noop = require('lodash.noop');

/** Used as the property descriptor for `__bindData__` */
var descriptor = {
  'configurable': false,
  'enumerable': false,
  'value': null,
  'writable': false
};

/** Used to set meta data on functions */
var defineProperty = (function() {
  // IE 8 only accepts DOM elements
  try {
    var o = {},
        func = isNative(func = Object.defineProperty) && func,
        result = func(o, o, o) && func;
  } catch(e) { }
  return result;
}());

/**
 * Sets `this` binding data on a given function.
 *
 * @private
 * @param {Function} func The function to set data on.
 * @param {Array} value The data array to set.
 */
var setBindData = !defineProperty ? noop : function(func, value) {
  descriptor.value = value;
  defineProperty(func, '__bindData__', descriptor);
};

module.exports = setBindData;

},{"lodash._isnative":373,"lodash.noop":374}],373:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],374:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * A no-operation function.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @example
 *
 * var object = { 'name': 'fred' };
 * _.noop(object) === undefined;
 * // => true
 */
function noop() {
  // no operation performed
}

module.exports = noop;

},{}],375:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var createWrapper = require('lodash._createwrapper'),
    slice = require('lodash._slice');

/**
 * Creates a function that, when called, invokes `func` with the `this`
 * binding of `thisArg` and prepends any additional `bind` arguments to those
 * provided to the bound function.
 *
 * @static
 * @memberOf _
 * @category Functions
 * @param {Function} func The function to bind.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {...*} [arg] Arguments to be partially applied.
 * @returns {Function} Returns the new bound function.
 * @example
 *
 * var func = function(greeting) {
 *   return greeting + ' ' + this.name;
 * };
 *
 * func = _.bind(func, { 'name': 'fred' }, 'hi');
 * func();
 * // => 'hi fred'
 */
function bind(func, thisArg) {
  return arguments.length > 2
    ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
    : createWrapper(func, 1, null, null, thisArg);
}

module.exports = bind;

},{"lodash._createwrapper":376,"lodash._slice":386}],376:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseBind = require('lodash._basebind'),
    baseCreateWrapper = require('lodash._basecreatewrapper'),
    isFunction = require('lodash.isfunction'),
    slice = require('lodash._slice');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push,
    unshift = arrayRef.unshift;

/**
 * Creates a function that, when called, either curries or invokes `func`
 * with an optional `this` binding and partially applied arguments.
 *
 * @private
 * @param {Function|string} func The function or method name to reference.
 * @param {number} bitmask The bitmask of method flags to compose.
 *  The bitmask may be composed of the following flags:
 *  1 - `_.bind`
 *  2 - `_.bindKey`
 *  4 - `_.curry`
 *  8 - `_.curry` (bound)
 *  16 - `_.partial`
 *  32 - `_.partialRight`
 * @param {Array} [partialArgs] An array of arguments to prepend to those
 *  provided to the new function.
 * @param {Array} [partialRightArgs] An array of arguments to append to those
 *  provided to the new function.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new function.
 */
function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
  var isBind = bitmask & 1,
      isBindKey = bitmask & 2,
      isCurry = bitmask & 4,
      isCurryBound = bitmask & 8,
      isPartial = bitmask & 16,
      isPartialRight = bitmask & 32;

  if (!isBindKey && !isFunction(func)) {
    throw new TypeError;
  }
  if (isPartial && !partialArgs.length) {
    bitmask &= ~16;
    isPartial = partialArgs = false;
  }
  if (isPartialRight && !partialRightArgs.length) {
    bitmask &= ~32;
    isPartialRight = partialRightArgs = false;
  }
  var bindData = func && func.__bindData__;
  if (bindData && bindData !== true) {
    // clone `bindData`
    bindData = slice(bindData);
    if (bindData[2]) {
      bindData[2] = slice(bindData[2]);
    }
    if (bindData[3]) {
      bindData[3] = slice(bindData[3]);
    }
    // set `thisBinding` is not previously bound
    if (isBind && !(bindData[1] & 1)) {
      bindData[4] = thisArg;
    }
    // set if previously bound but not currently (subsequent curried functions)
    if (!isBind && bindData[1] & 1) {
      bitmask |= 8;
    }
    // set curried arity if not yet set
    if (isCurry && !(bindData[1] & 4)) {
      bindData[5] = arity;
    }
    // append partial left arguments
    if (isPartial) {
      push.apply(bindData[2] || (bindData[2] = []), partialArgs);
    }
    // append partial right arguments
    if (isPartialRight) {
      unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
    }
    // merge flags
    bindData[1] |= bitmask;
    return createWrapper.apply(null, bindData);
  }
  // fast path for `_.bind`
  var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
  return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
}

module.exports = createWrapper;

},{"lodash._basebind":377,"lodash._basecreatewrapper":381,"lodash._slice":386,"lodash.isfunction":385}],377:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreate = require('lodash._basecreate'),
    isObject = require('lodash.isobject'),
    setBindData = require('lodash._setbinddata'),
    slice = require('lodash._slice');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push;

/**
 * The base implementation of `_.bind` that creates the bound function and
 * sets its meta data.
 *
 * @private
 * @param {Array} bindData The bind data array.
 * @returns {Function} Returns the new bound function.
 */
function baseBind(bindData) {
  var func = bindData[0],
      partialArgs = bindData[2],
      thisArg = bindData[4];

  function bound() {
    // `Function#bind` spec
    // http://es5.github.io/#x15.3.4.5
    if (partialArgs) {
      // avoid `arguments` object deoptimizations by using `slice` instead
      // of `Array.prototype.slice.call` and not assigning `arguments` to a
      // variable as a ternary expression
      var args = slice(partialArgs);
      push.apply(args, arguments);
    }
    // mimic the constructor's `return` behavior
    // http://es5.github.io/#x13.2.2
    if (this instanceof bound) {
      // ensure `new bound` is an instance of `func`
      var thisBinding = baseCreate(func.prototype),
          result = func.apply(thisBinding, args || arguments);
      return isObject(result) ? result : thisBinding;
    }
    return func.apply(thisArg, args || arguments);
  }
  setBindData(bound, bindData);
  return bound;
}

module.exports = baseBind;

},{"lodash._basecreate":378,"lodash._setbinddata":372,"lodash._slice":386,"lodash.isobject":399}],378:[function(require,module,exports){
(function (global){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative'),
    isObject = require('lodash.isobject'),
    noop = require('lodash.noop');

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(prototype, properties) {
  return isObject(prototype) ? nativeCreate(prototype) : {};
}
// fallback for browsers without `Object.create`
if (!nativeCreate) {
  baseCreate = (function() {
    function Object() {}
    return function(prototype) {
      if (isObject(prototype)) {
        Object.prototype = prototype;
        var result = new Object;
        Object.prototype = null;
      }
      return result || global.Object();
    };
  }());
}

module.exports = baseCreate;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash._isnative":379,"lodash.isobject":399,"lodash.noop":380}],379:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],380:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],381:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreate = require('lodash._basecreate'),
    isObject = require('lodash.isobject'),
    setBindData = require('lodash._setbinddata'),
    slice = require('lodash._slice');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push;

/**
 * The base implementation of `createWrapper` that creates the wrapper and
 * sets its meta data.
 *
 * @private
 * @param {Array} bindData The bind data array.
 * @returns {Function} Returns the new function.
 */
function baseCreateWrapper(bindData) {
  var func = bindData[0],
      bitmask = bindData[1],
      partialArgs = bindData[2],
      partialRightArgs = bindData[3],
      thisArg = bindData[4],
      arity = bindData[5];

  var isBind = bitmask & 1,
      isBindKey = bitmask & 2,
      isCurry = bitmask & 4,
      isCurryBound = bitmask & 8,
      key = func;

  function bound() {
    var thisBinding = isBind ? thisArg : this;
    if (partialArgs) {
      var args = slice(partialArgs);
      push.apply(args, arguments);
    }
    if (partialRightArgs || isCurry) {
      args || (args = slice(arguments));
      if (partialRightArgs) {
        push.apply(args, partialRightArgs);
      }
      if (isCurry && args.length < arity) {
        bitmask |= 16 & ~32;
        return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
      }
    }
    args || (args = arguments);
    if (isBindKey) {
      func = thisBinding[key];
    }
    if (this instanceof bound) {
      thisBinding = baseCreate(func.prototype);
      var result = func.apply(thisBinding, args);
      return isObject(result) ? result : thisBinding;
    }
    return func.apply(thisBinding, args);
  }
  setBindData(bound, bindData);
  return bound;
}

module.exports = baseCreateWrapper;

},{"lodash._basecreate":382,"lodash._setbinddata":372,"lodash._slice":386,"lodash.isobject":399}],382:[function(require,module,exports){
module.exports=require(378)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":378,"lodash._isnative":383,"lodash.isobject":399,"lodash.noop":384}],383:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],384:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],385:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Checks if `value` is a function.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 */
function isFunction(value) {
  return typeof value == 'function';
}

module.exports = isFunction;

},{}],386:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Slices the `collection` from the `start` index up to, but not including,
 * the `end` index.
 *
 * Note: This function is used instead of `Array#slice` to support node lists
 * in IE < 9 and to ensure dense arrays are returned.
 *
 * @private
 * @param {Array|Object|string} collection The collection to slice.
 * @param {number} start The start index.
 * @param {number} end The end index.
 * @returns {Array} Returns the new array.
 */
function slice(array, start, end) {
  start || (start = 0);
  if (typeof end == 'undefined') {
    end = array ? array.length : 0;
  }
  var index = -1,
      length = end - start || 0,
      result = Array(length < 0 ? 0 : length);

  while (++index < length) {
    result[index] = array[start + index];
  }
  return result;
}

module.exports = slice;

},{}],387:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'name': 'fred' };
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

},{}],388:[function(require,module,exports){
(function (global){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = require('lodash._isnative');

/** Used to detect functions containing a `this` reference */
var reThis = /\bthis\b/;

/**
 * An object used to flag environments features.
 *
 * @static
 * @memberOf _
 * @type Object
 */
var support = {};

/**
 * Detect if functions can be decompiled by `Function#toString`
 * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
 *
 * @memberOf _.support
 * @type boolean
 */
support.funcDecomp = !isNative(global.WinRTError) && reThis.test(function() { return this; });

/**
 * Detect if `Function#name` is supported (all but IE).
 *
 * @memberOf _.support
 * @type boolean
 */
support.funcNames = typeof Function.name == 'string';

module.exports = support;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash._isnative":389}],389:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],390:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var forIn = require('lodash.forin'),
    getArray = require('lodash._getarray'),
    isFunction = require('lodash.isfunction'),
    objectTypes = require('lodash._objecttypes'),
    releaseArray = require('lodash._releasearray');

/** `Object#toString` result shortcuts */
var argsClass = '[object Arguments]',
    arrayClass = '[object Array]',
    boolClass = '[object Boolean]',
    dateClass = '[object Date]',
    numberClass = '[object Number]',
    objectClass = '[object Object]',
    regexpClass = '[object RegExp]',
    stringClass = '[object String]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/** Native method shortcuts */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.isEqual`, without support for `thisArg` binding,
 * that allows partial "_.where" style comparisons.
 *
 * @private
 * @param {*} a The value to compare.
 * @param {*} b The other value to compare.
 * @param {Function} [callback] The function to customize comparing values.
 * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
 * @param {Array} [stackA=[]] Tracks traversed `a` objects.
 * @param {Array} [stackB=[]] Tracks traversed `b` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
  // used to indicate that when comparing objects, `a` has at least the properties of `b`
  if (callback) {
    var result = callback(a, b);
    if (typeof result != 'undefined') {
      return !!result;
    }
  }
  // exit early for identical values
  if (a === b) {
    // treat `+0` vs. `-0` as not equal
    return a !== 0 || (1 / a == 1 / b);
  }
  var type = typeof a,
      otherType = typeof b;

  // exit early for unlike primitive values
  if (a === a &&
      !(a && objectTypes[type]) &&
      !(b && objectTypes[otherType])) {
    return false;
  }
  // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
  // http://es5.github.io/#x15.3.4.4
  if (a == null || b == null) {
    return a === b;
  }
  // compare [[Class]] names
  var className = toString.call(a),
      otherClass = toString.call(b);

  if (className == argsClass) {
    className = objectClass;
  }
  if (otherClass == argsClass) {
    otherClass = objectClass;
  }
  if (className != otherClass) {
    return false;
  }
  switch (className) {
    case boolClass:
    case dateClass:
      // coerce dates and booleans to numbers, dates to milliseconds and booleans
      // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
      return +a == +b;

    case numberClass:
      // treat `NaN` vs. `NaN` as equal
      return (a != +a)
        ? b != +b
        // but treat `+0` vs. `-0` as not equal
        : (a == 0 ? (1 / a == 1 / b) : a == +b);

    case regexpClass:
    case stringClass:
      // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
      // treat string primitives and their corresponding object instances as equal
      return a == String(b);
  }
  var isArr = className == arrayClass;
  if (!isArr) {
    // unwrap any `lodash` wrapped values
    var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
        bWrapped = hasOwnProperty.call(b, '__wrapped__');

    if (aWrapped || bWrapped) {
      return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
    }
    // exit for functions and DOM nodes
    if (className != objectClass) {
      return false;
    }
    // in older versions of Opera, `arguments` objects have `Array` constructors
    var ctorA = a.constructor,
        ctorB = b.constructor;

    // non `Object` object instances with different constructors are not equal
    if (ctorA != ctorB &&
          !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
          ('constructor' in a && 'constructor' in b)
        ) {
      return false;
    }
  }
  // assume cyclic structures are equal
  // the algorithm for detecting cyclic structures is adapted from ES 5.1
  // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
  var initedStack = !stackA;
  stackA || (stackA = getArray());
  stackB || (stackB = getArray());

  var length = stackA.length;
  while (length--) {
    if (stackA[length] == a) {
      return stackB[length] == b;
    }
  }
  var size = 0;
  result = true;

  // add `a` and `b` to the stack of traversed objects
  stackA.push(a);
  stackB.push(b);

  // recursively compare objects and arrays (susceptible to call stack limits)
  if (isArr) {
    // compare lengths to determine if a deep comparison is necessary
    length = a.length;
    size = b.length;
    result = size == length;

    if (result || isWhere) {
      // deep compare the contents, ignoring non-numeric properties
      while (size--) {
        var index = length,
            value = b[size];

        if (isWhere) {
          while (index--) {
            if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
              break;
            }
          }
        } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
          break;
        }
      }
    }
  }
  else {
    // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
    // which, in this case, is more costly
    forIn(b, function(value, key, b) {
      if (hasOwnProperty.call(b, key)) {
        // count the number of properties.
        size++;
        // deep compare each property value.
        return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
      }
    });

    if (result && !isWhere) {
      // ensure both objects have the same number of properties
      forIn(a, function(value, key, a) {
        if (hasOwnProperty.call(a, key)) {
          // `size` will be `-1` if `a` has more properties than `b`
          return (result = --size > -1);
        }
      });
    }
  }
  stackA.pop();
  stackB.pop();

  if (initedStack) {
    releaseArray(stackA);
    releaseArray(stackB);
  }
  return result;
}

module.exports = baseIsEqual;

},{"lodash._getarray":391,"lodash._objecttypes":393,"lodash._releasearray":394,"lodash.forin":397,"lodash.isfunction":398}],391:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var arrayPool = require('lodash._arraypool');

/**
 * Gets an array from the array pool or creates a new one if the pool is empty.
 *
 * @private
 * @returns {Array} The array from the pool.
 */
function getArray() {
  return arrayPool.pop() || [];
}

module.exports = getArray;

},{"lodash._arraypool":392}],392:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to pool arrays and objects used internally */
var arrayPool = [];

module.exports = arrayPool;

},{}],393:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],394:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var arrayPool = require('lodash._arraypool'),
    maxPoolSize = require('lodash._maxpoolsize');

/**
 * Releases the given array back to the array pool.
 *
 * @private
 * @param {Array} [array] The array to release.
 */
function releaseArray(array) {
  array.length = 0;
  if (arrayPool.length < maxPoolSize) {
    arrayPool.push(array);
  }
}

module.exports = releaseArray;

},{"lodash._arraypool":395,"lodash._maxpoolsize":396}],395:[function(require,module,exports){
module.exports=require(392)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._getarray/node_modules/lodash._arraypool/index.js":392}],396:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used as the max size of the `arrayPool` and `objectPool` */
var maxPoolSize = 40;

module.exports = maxPoolSize;

},{}],397:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    objectTypes = require('lodash._objecttypes');

/**
 * Iterates over own and inherited enumerable properties of an object,
 * executing the callback for each property. The callback is bound to `thisArg`
 * and invoked with three arguments; (value, key, object). Callbacks may exit
 * iteration early by explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Objects
 * @param {Object} object The object to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * function Shape() {
 *   this.x = 0;
 *   this.y = 0;
 * }
 *
 * Shape.prototype.move = function(x, y) {
 *   this.x += x;
 *   this.y += y;
 * };
 *
 * _.forIn(new Shape, function(value, key) {
 *   console.log(key);
 * });
 * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
 */
var forIn = function(collection, callback, thisArg) {
  var index, iterable = collection, result = iterable;
  if (!iterable) return result;
  if (!objectTypes[typeof iterable]) return result;
  callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
    for (index in iterable) {
      if (callback(iterable[index], index, collection) === false) return result;
    }
  return result
};

module.exports = forIn;

},{"lodash._basecreatecallback":371,"lodash._objecttypes":393}],398:[function(require,module,exports){
module.exports=require(385)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash.isfunction/index.js":385}],399:[function(require,module,exports){
module.exports=require(363)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":363,"lodash._objecttypes":400}],400:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],401:[function(require,module,exports){
module.exports=require(360)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/index.js":360,"lodash._isnative":402,"lodash._shimkeys":403,"lodash.isobject":399}],402:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],403:[function(require,module,exports){
module.exports=require(362)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._shimkeys/index.js":362,"lodash._objecttypes":404}],404:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],405:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Creates a "_.pluck" style function, which returns the `key` value of a
 * given object.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {string} key The name of the property to retrieve.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var characters = [
 *   { 'name': 'fred',   'age': 40 },
 *   { 'name': 'barney', 'age': 36 }
 * ];
 *
 * var getName = _.property('name');
 *
 * _.map(characters, getName);
 * // => ['barney', 'fred']
 *
 * _.sortBy(characters, getName);
 * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
 */
function property(key) {
  return function(object) {
    return object[key];
  };
}

module.exports = property;

},{}],406:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    keys = require('lodash.keys'),
    objectTypes = require('lodash._objecttypes');

/**
 * Iterates over own enumerable properties of an object, executing the callback
 * for each property. The callback is bound to `thisArg` and invoked with three
 * arguments; (value, key, object). Callbacks may exit iteration early by
 * explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Objects
 * @param {Object} object The object to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
 *   console.log(key);
 * });
 * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
 */
var forOwn = function(collection, callback, thisArg) {
  var index, iterable = collection, result = iterable;
  if (!iterable) return result;
  if (!objectTypes[typeof iterable]) return result;
  callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
    var ownIndex = -1,
        ownProps = objectTypes[typeof iterable] && keys(iterable),
        length = ownProps ? ownProps.length : 0;

    while (++ownIndex < length) {
      index = ownProps[ownIndex];
      if (callback(iterable[index], index, collection) === false) return result;
    }
  return result
};

module.exports = forOwn;

},{"lodash._basecreatecallback":407,"lodash._objecttypes":428,"lodash.keys":429}],407:[function(require,module,exports){
module.exports=require(371)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/index.js":371,"lodash._setbinddata":408,"lodash.bind":411,"lodash.identity":425,"lodash.support":426}],408:[function(require,module,exports){
module.exports=require(372)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/index.js":372,"lodash._isnative":409,"lodash.noop":410}],409:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],410:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],411:[function(require,module,exports){
module.exports=require(375)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/index.js":375,"lodash._createwrapper":412,"lodash._slice":424}],412:[function(require,module,exports){
module.exports=require(376)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/index.js":376,"lodash._basebind":413,"lodash._basecreatewrapper":418,"lodash._slice":424,"lodash.isfunction":423}],413:[function(require,module,exports){
module.exports=require(377)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/index.js":377,"lodash._basecreate":414,"lodash._setbinddata":408,"lodash._slice":424,"lodash.isobject":417}],414:[function(require,module,exports){
module.exports=require(378)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":378,"lodash._isnative":415,"lodash.isobject":417,"lodash.noop":416}],415:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],416:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],417:[function(require,module,exports){
module.exports=require(363)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":363,"lodash._objecttypes":428}],418:[function(require,module,exports){
module.exports=require(381)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/index.js":381,"lodash._basecreate":419,"lodash._setbinddata":408,"lodash._slice":424,"lodash.isobject":422}],419:[function(require,module,exports){
module.exports=require(378)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":378,"lodash._isnative":420,"lodash.isobject":422,"lodash.noop":421}],420:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],421:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],422:[function(require,module,exports){
module.exports=require(363)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":363,"lodash._objecttypes":428}],423:[function(require,module,exports){
module.exports=require(385)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash.isfunction/index.js":385}],424:[function(require,module,exports){
module.exports=require(386)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._slice/index.js":386}],425:[function(require,module,exports){
module.exports=require(387)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.identity/index.js":387}],426:[function(require,module,exports){
module.exports=require(388)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.support/index.js":388,"lodash._isnative":427}],427:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],428:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],429:[function(require,module,exports){
module.exports=require(360)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/index.js":360,"lodash._isnative":430,"lodash._shimkeys":431,"lodash.isobject":432}],430:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],431:[function(require,module,exports){
module.exports=require(362)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._shimkeys/index.js":362,"lodash._objecttypes":428}],432:[function(require,module,exports){
module.exports=require(363)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":363,"lodash._objecttypes":428}],433:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    forOwn = require('lodash.forown');

/**
 * Iterates over elements of a collection, executing the callback for each
 * element. The callback is bound to `thisArg` and invoked with three arguments;
 * (value, index|key, collection). Callbacks may exit iteration early by
 * explicitly returning `false`.
 *
 * Note: As with other "Collections" methods, objects with a `length` property
 * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
 * may be used for object iteration.
 *
 * @static
 * @memberOf _
 * @alias each
 * @category Collections
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Array|Object|string} Returns `collection`.
 * @example
 *
 * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
 * // => logs each number and returns '1,2,3'
 *
 * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
 * // => logs each number and returns the object (property order is not guaranteed across environments)
 */
function forEach(collection, callback, thisArg) {
  var index = -1,
      length = collection ? collection.length : 0;

  callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
  if (typeof length == 'number') {
    while (++index < length) {
      if (callback(collection[index], index, collection) === false) {
        break;
      }
    }
  } else {
    forOwn(collection, callback);
  }
  return collection;
}

module.exports = forEach;

},{"lodash._basecreatecallback":434,"lodash.forown":457}],434:[function(require,module,exports){
module.exports=require(371)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/index.js":371,"lodash._setbinddata":435,"lodash.bind":438,"lodash.identity":454,"lodash.support":455}],435:[function(require,module,exports){
module.exports=require(372)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/index.js":372,"lodash._isnative":436,"lodash.noop":437}],436:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],437:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],438:[function(require,module,exports){
module.exports=require(375)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/index.js":375,"lodash._createwrapper":439,"lodash._slice":453}],439:[function(require,module,exports){
module.exports=require(376)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/index.js":376,"lodash._basebind":440,"lodash._basecreatewrapper":446,"lodash._slice":453,"lodash.isfunction":452}],440:[function(require,module,exports){
module.exports=require(377)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/index.js":377,"lodash._basecreate":441,"lodash._setbinddata":435,"lodash._slice":453,"lodash.isobject":444}],441:[function(require,module,exports){
module.exports=require(378)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":378,"lodash._isnative":442,"lodash.isobject":444,"lodash.noop":443}],442:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],443:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],444:[function(require,module,exports){
module.exports=require(363)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":363,"lodash._objecttypes":445}],445:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],446:[function(require,module,exports){
module.exports=require(381)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/index.js":381,"lodash._basecreate":447,"lodash._setbinddata":435,"lodash._slice":453,"lodash.isobject":450}],447:[function(require,module,exports){
module.exports=require(378)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":378,"lodash._isnative":448,"lodash.isobject":450,"lodash.noop":449}],448:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],449:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],450:[function(require,module,exports){
module.exports=require(363)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":363,"lodash._objecttypes":451}],451:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],452:[function(require,module,exports){
module.exports=require(385)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash.isfunction/index.js":385}],453:[function(require,module,exports){
module.exports=require(386)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._slice/index.js":386}],454:[function(require,module,exports){
module.exports=require(387)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.identity/index.js":387}],455:[function(require,module,exports){
module.exports=require(388)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.support/index.js":388,"lodash._isnative":456}],456:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],457:[function(require,module,exports){
module.exports=require(406)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.forown/index.js":406,"lodash._basecreatecallback":434,"lodash._objecttypes":458,"lodash.keys":459}],458:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],459:[function(require,module,exports){
module.exports=require(360)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/index.js":360,"lodash._isnative":460,"lodash._shimkeys":461,"lodash.isobject":462}],460:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],461:[function(require,module,exports){
module.exports=require(362)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._shimkeys/index.js":362,"lodash._objecttypes":458}],462:[function(require,module,exports){
module.exports=require(363)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":363,"lodash._objecttypes":458}],463:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    baseIsEqual = require('lodash._baseisequal');

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent to each other. If a callback is provided it will be executed
 * to compare values. If the callback returns `undefined` comparisons will
 * be handled by the method instead. The callback is bound to `thisArg` and
 * invoked with two arguments; (a, b).
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} a The value to compare.
 * @param {*} b The other value to compare.
 * @param {Function} [callback] The function to customize comparing values.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'name': 'fred' };
 * var copy = { 'name': 'fred' };
 *
 * object == copy;
 * // => false
 *
 * _.isEqual(object, copy);
 * // => true
 *
 * var words = ['hello', 'goodbye'];
 * var otherWords = ['hi', 'goodbye'];
 *
 * _.isEqual(words, otherWords, function(a, b) {
 *   var reGreet = /^(?:hello|hi)$/i,
 *       aGreet = _.isString(a) && reGreet.test(a),
 *       bGreet = _.isString(b) && reGreet.test(b);
 *
 *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
 * });
 * // => true
 */
function isEqual(a, b, callback, thisArg) {
  return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
}

module.exports = isEqual;

},{"lodash._basecreatecallback":464,"lodash._baseisequal":487}],464:[function(require,module,exports){
module.exports=require(371)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/index.js":371,"lodash._setbinddata":465,"lodash.bind":468,"lodash.identity":484,"lodash.support":485}],465:[function(require,module,exports){
module.exports=require(372)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/index.js":372,"lodash._isnative":466,"lodash.noop":467}],466:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],467:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],468:[function(require,module,exports){
module.exports=require(375)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/index.js":375,"lodash._createwrapper":469,"lodash._slice":483}],469:[function(require,module,exports){
module.exports=require(376)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/index.js":376,"lodash._basebind":470,"lodash._basecreatewrapper":476,"lodash._slice":483,"lodash.isfunction":482}],470:[function(require,module,exports){
module.exports=require(377)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/index.js":377,"lodash._basecreate":471,"lodash._setbinddata":465,"lodash._slice":483,"lodash.isobject":474}],471:[function(require,module,exports){
module.exports=require(378)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":378,"lodash._isnative":472,"lodash.isobject":474,"lodash.noop":473}],472:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],473:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],474:[function(require,module,exports){
module.exports=require(363)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":363,"lodash._objecttypes":475}],475:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],476:[function(require,module,exports){
module.exports=require(381)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/index.js":381,"lodash._basecreate":477,"lodash._setbinddata":465,"lodash._slice":483,"lodash.isobject":480}],477:[function(require,module,exports){
module.exports=require(378)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":378,"lodash._isnative":478,"lodash.isobject":480,"lodash.noop":479}],478:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],479:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],480:[function(require,module,exports){
module.exports=require(363)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":363,"lodash._objecttypes":481}],481:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],482:[function(require,module,exports){
module.exports=require(385)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash.isfunction/index.js":385}],483:[function(require,module,exports){
module.exports=require(386)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._slice/index.js":386}],484:[function(require,module,exports){
module.exports=require(387)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.identity/index.js":387}],485:[function(require,module,exports){
module.exports=require(388)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.support/index.js":388,"lodash._isnative":486}],486:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],487:[function(require,module,exports){
module.exports=require(390)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/index.js":390,"lodash._getarray":488,"lodash._objecttypes":490,"lodash._releasearray":491,"lodash.forin":494,"lodash.isfunction":495}],488:[function(require,module,exports){
module.exports=require(391)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._getarray/index.js":391,"lodash._arraypool":489}],489:[function(require,module,exports){
module.exports=require(392)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._getarray/node_modules/lodash._arraypool/index.js":392}],490:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],491:[function(require,module,exports){
module.exports=require(394)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._releasearray/index.js":394,"lodash._arraypool":492,"lodash._maxpoolsize":493}],492:[function(require,module,exports){
module.exports=require(392)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._getarray/node_modules/lodash._arraypool/index.js":392}],493:[function(require,module,exports){
module.exports=require(396)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._releasearray/node_modules/lodash._maxpoolsize/index.js":396}],494:[function(require,module,exports){
module.exports=require(397)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash.forin/index.js":397,"lodash._basecreatecallback":464,"lodash._objecttypes":490}],495:[function(require,module,exports){
module.exports=require(385)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash.isfunction/index.js":385}],496:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var createCallback = require('lodash.createcallback'),
    forOwn = require('lodash.forown');

/**
 * Reduces a collection to a value which is the accumulated result of running
 * each element in the collection through the callback, where each successive
 * callback execution consumes the return value of the previous execution. If
 * `accumulator` is not provided the first element of the collection will be
 * used as the initial `accumulator` value. The callback is bound to `thisArg`
 * and invoked with four arguments; (accumulator, value, index|key, collection).
 *
 * @static
 * @memberOf _
 * @alias foldl, inject
 * @category Collections
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [accumulator] Initial value of the accumulator.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {*} Returns the accumulated value.
 * @example
 *
 * var sum = _.reduce([1, 2, 3], function(sum, num) {
 *   return sum + num;
 * });
 * // => 6
 *
 * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
 *   result[key] = num * 3;
 *   return result;
 * }, {});
 * // => { 'a': 3, 'b': 6, 'c': 9 }
 */
function reduce(collection, callback, accumulator, thisArg) {
  if (!collection) return accumulator;
  var noaccum = arguments.length < 3;
  callback = createCallback(callback, thisArg, 4);

  var index = -1,
      length = collection.length;

  if (typeof length == 'number') {
    if (noaccum) {
      accumulator = collection[++index];
    }
    while (++index < length) {
      accumulator = callback(accumulator, collection[index], index, collection);
    }
  } else {
    forOwn(collection, function(value, index, collection) {
      accumulator = noaccum
        ? (noaccum = false, value)
        : callback(accumulator, value, index, collection)
    });
  }
  return accumulator;
}

module.exports = reduce;

},{"lodash.createcallback":497,"lodash.forown":533}],497:[function(require,module,exports){
module.exports=require(370)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/index.js":370,"lodash._basecreatecallback":498,"lodash._baseisequal":517,"lodash.isobject":526,"lodash.keys":528,"lodash.property":532}],498:[function(require,module,exports){
module.exports=require(371)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/index.js":371,"lodash._setbinddata":499,"lodash.bind":502,"lodash.identity":514,"lodash.support":515}],499:[function(require,module,exports){
module.exports=require(372)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/index.js":372,"lodash._isnative":500,"lodash.noop":501}],500:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],501:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],502:[function(require,module,exports){
module.exports=require(375)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/index.js":375,"lodash._createwrapper":503,"lodash._slice":513}],503:[function(require,module,exports){
module.exports=require(376)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/index.js":376,"lodash._basebind":504,"lodash._basecreatewrapper":508,"lodash._slice":513,"lodash.isfunction":512}],504:[function(require,module,exports){
module.exports=require(377)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/index.js":377,"lodash._basecreate":505,"lodash._setbinddata":499,"lodash._slice":513,"lodash.isobject":526}],505:[function(require,module,exports){
module.exports=require(378)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":378,"lodash._isnative":506,"lodash.isobject":526,"lodash.noop":507}],506:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],507:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],508:[function(require,module,exports){
module.exports=require(381)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/index.js":381,"lodash._basecreate":509,"lodash._setbinddata":499,"lodash._slice":513,"lodash.isobject":526}],509:[function(require,module,exports){
module.exports=require(378)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":378,"lodash._isnative":510,"lodash.isobject":526,"lodash.noop":511}],510:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],511:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],512:[function(require,module,exports){
module.exports=require(385)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash.isfunction/index.js":385}],513:[function(require,module,exports){
module.exports=require(386)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._slice/index.js":386}],514:[function(require,module,exports){
module.exports=require(387)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.identity/index.js":387}],515:[function(require,module,exports){
module.exports=require(388)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.support/index.js":388,"lodash._isnative":516}],516:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],517:[function(require,module,exports){
module.exports=require(390)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/index.js":390,"lodash._getarray":518,"lodash._objecttypes":520,"lodash._releasearray":521,"lodash.forin":524,"lodash.isfunction":525}],518:[function(require,module,exports){
module.exports=require(391)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._getarray/index.js":391,"lodash._arraypool":519}],519:[function(require,module,exports){
module.exports=require(392)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._getarray/node_modules/lodash._arraypool/index.js":392}],520:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],521:[function(require,module,exports){
module.exports=require(394)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._releasearray/index.js":394,"lodash._arraypool":522,"lodash._maxpoolsize":523}],522:[function(require,module,exports){
module.exports=require(392)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._getarray/node_modules/lodash._arraypool/index.js":392}],523:[function(require,module,exports){
module.exports=require(396)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._releasearray/node_modules/lodash._maxpoolsize/index.js":396}],524:[function(require,module,exports){
module.exports=require(397)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash.forin/index.js":397,"lodash._basecreatecallback":498,"lodash._objecttypes":520}],525:[function(require,module,exports){
module.exports=require(385)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash.isfunction/index.js":385}],526:[function(require,module,exports){
module.exports=require(363)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":363,"lodash._objecttypes":527}],527:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],528:[function(require,module,exports){
module.exports=require(360)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/index.js":360,"lodash._isnative":529,"lodash._shimkeys":530,"lodash.isobject":526}],529:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],530:[function(require,module,exports){
module.exports=require(362)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._shimkeys/index.js":362,"lodash._objecttypes":531}],531:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],532:[function(require,module,exports){
module.exports=require(405)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash.property/index.js":405}],533:[function(require,module,exports){
module.exports=require(406)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.forown/index.js":406,"lodash._basecreatecallback":534,"lodash._objecttypes":555,"lodash.keys":556}],534:[function(require,module,exports){
module.exports=require(371)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/index.js":371,"lodash._setbinddata":535,"lodash.bind":538,"lodash.identity":552,"lodash.support":553}],535:[function(require,module,exports){
module.exports=require(372)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/index.js":372,"lodash._isnative":536,"lodash.noop":537}],536:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],537:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],538:[function(require,module,exports){
module.exports=require(375)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/index.js":375,"lodash._createwrapper":539,"lodash._slice":551}],539:[function(require,module,exports){
module.exports=require(376)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/index.js":376,"lodash._basebind":540,"lodash._basecreatewrapper":545,"lodash._slice":551,"lodash.isfunction":550}],540:[function(require,module,exports){
module.exports=require(377)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/index.js":377,"lodash._basecreate":541,"lodash._setbinddata":535,"lodash._slice":551,"lodash.isobject":544}],541:[function(require,module,exports){
module.exports=require(378)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":378,"lodash._isnative":542,"lodash.isobject":544,"lodash.noop":543}],542:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],543:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],544:[function(require,module,exports){
module.exports=require(363)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":363,"lodash._objecttypes":555}],545:[function(require,module,exports){
module.exports=require(381)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/index.js":381,"lodash._basecreate":546,"lodash._setbinddata":535,"lodash._slice":551,"lodash.isobject":549}],546:[function(require,module,exports){
module.exports=require(378)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":378,"lodash._isnative":547,"lodash.isobject":549,"lodash.noop":548}],547:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],548:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],549:[function(require,module,exports){
module.exports=require(363)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":363,"lodash._objecttypes":555}],550:[function(require,module,exports){
module.exports=require(385)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash.isfunction/index.js":385}],551:[function(require,module,exports){
module.exports=require(386)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._slice/index.js":386}],552:[function(require,module,exports){
module.exports=require(387)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.identity/index.js":387}],553:[function(require,module,exports){
module.exports=require(388)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.support/index.js":388,"lodash._isnative":554}],554:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],555:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],556:[function(require,module,exports){
module.exports=require(360)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/index.js":360,"lodash._isnative":557,"lodash._shimkeys":558,"lodash.isobject":559}],557:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],558:[function(require,module,exports){
module.exports=require(362)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._shimkeys/index.js":362,"lodash._objecttypes":555}],559:[function(require,module,exports){
module.exports=require(363)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":363,"lodash._objecttypes":555}],560:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseFlatten = require('lodash._baseflatten'),
    baseUniq = require('lodash._baseuniq');

/**
 * Creates an array of unique values, in order, of the provided arrays using
 * strict equality for comparisons, i.e. `===`.
 *
 * @static
 * @memberOf _
 * @category Arrays
 * @param {...Array} [array] The arrays to inspect.
 * @returns {Array} Returns an array of combined values.
 * @example
 *
 * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
 * // => [1, 2, 3, 5, 4]
 */
function union() {
  return baseUniq(baseFlatten(arguments, true, true));
}

module.exports = union;

},{"lodash._baseflatten":561,"lodash._baseuniq":565}],561:[function(require,module,exports){
module.exports=require(365)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash._baseflatten/index.js":365,"lodash.isarguments":562,"lodash.isarray":563}],562:[function(require,module,exports){
module.exports=require(366)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash._baseflatten/node_modules/lodash.isarguments/index.js":366}],563:[function(require,module,exports){
module.exports=require(367)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash._baseflatten/node_modules/lodash.isarray/index.js":367,"lodash._isnative":564}],564:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],565:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseIndexOf = require('lodash._baseindexof'),
    cacheIndexOf = require('lodash._cacheindexof'),
    createCache = require('lodash._createcache'),
    getArray = require('lodash._getarray'),
    largeArraySize = require('lodash._largearraysize'),
    releaseArray = require('lodash._releasearray'),
    releaseObject = require('lodash._releaseobject');

/**
 * The base implementation of `_.uniq` without support for callback shorthands
 * or `thisArg` binding.
 *
 * @private
 * @param {Array} array The array to process.
 * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
 * @param {Function} [callback] The function called per iteration.
 * @returns {Array} Returns a duplicate-value-free array.
 */
function baseUniq(array, isSorted, callback) {
  var index = -1,
      indexOf = baseIndexOf,
      length = array ? array.length : 0,
      result = [];

  var isLarge = !isSorted && length >= largeArraySize,
      seen = (callback || isLarge) ? getArray() : result;

  if (isLarge) {
    var cache = createCache(seen);
    indexOf = cacheIndexOf;
    seen = cache;
  }
  while (++index < length) {
    var value = array[index],
        computed = callback ? callback(value, index, array) : value;

    if (isSorted
          ? !index || seen[seen.length - 1] !== computed
          : indexOf(seen, computed) < 0
        ) {
      if (callback || isLarge) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  if (isLarge) {
    releaseArray(seen.array);
    releaseObject(seen);
  } else if (callback) {
    releaseArray(seen);
  }
  return result;
}

module.exports = baseUniq;

},{"lodash._baseindexof":566,"lodash._cacheindexof":567,"lodash._createcache":569,"lodash._getarray":574,"lodash._largearraysize":576,"lodash._releasearray":577,"lodash._releaseobject":580}],566:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * The base implementation of `_.indexOf` without support for binary searches
 * or `fromIndex` constraints.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {*} value The value to search for.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {number} Returns the index of the matched value or `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  var index = (fromIndex || 0) - 1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

module.exports = baseIndexOf;

},{}],567:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseIndexOf = require('lodash._baseindexof'),
    keyPrefix = require('lodash._keyprefix');

/**
 * An implementation of `_.contains` for cache objects that mimics the return
 * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
 *
 * @private
 * @param {Object} cache The cache object to inspect.
 * @param {*} value The value to search for.
 * @returns {number} Returns `0` if `value` is found, else `-1`.
 */
function cacheIndexOf(cache, value) {
  var type = typeof value;
  cache = cache.cache;

  if (type == 'boolean' || value == null) {
    return cache[value] ? 0 : -1;
  }
  if (type != 'number' && type != 'string') {
    type = 'object';
  }
  var key = type == 'number' ? value : keyPrefix + value;
  cache = (cache = cache[type]) && cache[key];

  return type == 'object'
    ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
    : (cache ? 0 : -1);
}

module.exports = cacheIndexOf;

},{"lodash._baseindexof":566,"lodash._keyprefix":568}],568:[function(require,module,exports){
/**
 * Lo-Dash 2.4.2 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2014 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
var keyPrefix = '__1335248838000__';

module.exports = keyPrefix;

},{}],569:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var cachePush = require('lodash._cachepush'),
    getObject = require('lodash._getobject'),
    releaseObject = require('lodash._releaseobject');

/**
 * Creates a cache object to optimize linear searches of large arrays.
 *
 * @private
 * @param {Array} [array=[]] The array to search.
 * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
 */
function createCache(array) {
  var index = -1,
      length = array.length,
      first = array[0],
      mid = array[(length / 2) | 0],
      last = array[length - 1];

  if (first && typeof first == 'object' &&
      mid && typeof mid == 'object' && last && typeof last == 'object') {
    return false;
  }
  var cache = getObject();
  cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

  var result = getObject();
  result.array = array;
  result.cache = cache;
  result.push = cachePush;

  while (++index < length) {
    result.push(array[index]);
  }
  return result;
}

module.exports = createCache;

},{"lodash._cachepush":570,"lodash._getobject":572,"lodash._releaseobject":580}],570:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var keyPrefix = require('lodash._keyprefix');

/**
 * Adds a given value to the corresponding cache object.
 *
 * @private
 * @param {*} value The value to add to the cache.
 */
function cachePush(value) {
  var cache = this.cache,
      type = typeof value;

  if (type == 'boolean' || value == null) {
    cache[value] = true;
  } else {
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value,
        typeCache = cache[type] || (cache[type] = {});

    if (type == 'object') {
      (typeCache[key] || (typeCache[key] = [])).push(value);
    } else {
      typeCache[key] = true;
    }
  }
}

module.exports = cachePush;

},{"lodash._keyprefix":571}],571:[function(require,module,exports){
module.exports=require(568)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._cacheindexof/node_modules/lodash._keyprefix/index.js":568}],572:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectPool = require('lodash._objectpool');

/**
 * Gets an object from the object pool or creates a new one if the pool is empty.
 *
 * @private
 * @returns {Object} The object from the pool.
 */
function getObject() {
  return objectPool.pop() || {
    'array': null,
    'cache': null,
    'criteria': null,
    'false': false,
    'index': 0,
    'null': false,
    'number': null,
    'object': null,
    'push': null,
    'string': null,
    'true': false,
    'undefined': false,
    'value': null
  };
}

module.exports = getObject;

},{"lodash._objectpool":573}],573:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to pool arrays and objects used internally */
var objectPool = [];

module.exports = objectPool;

},{}],574:[function(require,module,exports){
module.exports=require(391)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._getarray/index.js":391,"lodash._arraypool":575}],575:[function(require,module,exports){
module.exports=require(392)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._getarray/node_modules/lodash._arraypool/index.js":392}],576:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used as the size when optimizations are enabled for large arrays */
var largeArraySize = 75;

module.exports = largeArraySize;

},{}],577:[function(require,module,exports){
module.exports=require(394)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._releasearray/index.js":394,"lodash._arraypool":578,"lodash._maxpoolsize":579}],578:[function(require,module,exports){
module.exports=require(392)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._getarray/node_modules/lodash._arraypool/index.js":392}],579:[function(require,module,exports){
module.exports=require(396)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._releasearray/node_modules/lodash._maxpoolsize/index.js":396}],580:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var maxPoolSize = require('lodash._maxpoolsize'),
    objectPool = require('lodash._objectpool');

/**
 * Releases the given object back to the object pool.
 *
 * @private
 * @param {Object} [object] The object to release.
 */
function releaseObject(object) {
  var cache = object.cache;
  if (cache) {
    releaseObject(cache);
  }
  object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
  if (objectPool.length < maxPoolSize) {
    objectPool.push(object);
  }
}

module.exports = releaseObject;

},{"lodash._maxpoolsize":581,"lodash._objectpool":582}],581:[function(require,module,exports){
module.exports=require(396)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._releasearray/node_modules/lodash._maxpoolsize/index.js":396}],582:[function(require,module,exports){
module.exports=require(573)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._createcache/node_modules/lodash._getobject/node_modules/lodash._objectpool/index.js":573}],583:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseUniq = require('lodash._baseuniq'),
    createCallback = require('lodash.createcallback');

/**
 * Creates a duplicate-value-free version of an array using strict equality
 * for comparisons, i.e. `===`. If the array is sorted, providing
 * `true` for `isSorted` will use a faster algorithm. If a callback is provided
 * each element of `array` is passed through the callback before uniqueness
 * is computed. The callback is bound to `thisArg` and invoked with three
 * arguments; (value, index, array).
 *
 * If a property name is provided for `callback` the created "_.pluck" style
 * callback will return the property value of the given element.
 *
 * If an object is provided for `callback` the created "_.where" style callback
 * will return `true` for elements that have the properties of the given object,
 * else `false`.
 *
 * @static
 * @memberOf _
 * @alias unique
 * @category Arrays
 * @param {Array} array The array to process.
 * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
 * @param {Function|Object|string} [callback=identity] The function called
 *  per iteration. If a property name or object is provided it will be used
 *  to create a "_.pluck" or "_.where" style callback, respectively.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Array} Returns a duplicate-value-free array.
 * @example
 *
 * _.uniq([1, 2, 1, 3, 1]);
 * // => [1, 2, 3]
 *
 * _.uniq([1, 1, 2, 2, 3], true);
 * // => [1, 2, 3]
 *
 * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
 * // => ['A', 'b', 'C']
 *
 * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
 * // => [1, 2.5, 3]
 *
 * // using "_.pluck" callback shorthand
 * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
 * // => [{ 'x': 1 }, { 'x': 2 }]
 */
function uniq(array, isSorted, callback, thisArg) {
  // juggle arguments
  if (typeof isSorted != 'boolean' && isSorted != null) {
    thisArg = callback;
    callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
    isSorted = false;
  }
  if (callback != null) {
    callback = createCallback(callback, thisArg, 3);
  }
  return baseUniq(array, isSorted, callback);
}

module.exports = uniq;

},{"lodash._baseuniq":584,"lodash.createcallback":602}],584:[function(require,module,exports){
module.exports=require(565)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.union/node_modules/lodash._baseuniq/index.js":565,"lodash._baseindexof":585,"lodash._cacheindexof":586,"lodash._createcache":588,"lodash._getarray":593,"lodash._largearraysize":595,"lodash._releasearray":596,"lodash._releaseobject":599}],585:[function(require,module,exports){
module.exports=require(566)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._baseindexof/index.js":566}],586:[function(require,module,exports){
module.exports=require(567)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._cacheindexof/index.js":567,"lodash._baseindexof":585,"lodash._keyprefix":587}],587:[function(require,module,exports){
module.exports=require(568)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._cacheindexof/node_modules/lodash._keyprefix/index.js":568}],588:[function(require,module,exports){
module.exports=require(569)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._createcache/index.js":569,"lodash._cachepush":589,"lodash._getobject":591,"lodash._releaseobject":599}],589:[function(require,module,exports){
module.exports=require(570)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._createcache/node_modules/lodash._cachepush/index.js":570,"lodash._keyprefix":590}],590:[function(require,module,exports){
module.exports=require(568)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._cacheindexof/node_modules/lodash._keyprefix/index.js":568}],591:[function(require,module,exports){
module.exports=require(572)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._createcache/node_modules/lodash._getobject/index.js":572,"lodash._objectpool":592}],592:[function(require,module,exports){
module.exports=require(573)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._createcache/node_modules/lodash._getobject/node_modules/lodash._objectpool/index.js":573}],593:[function(require,module,exports){
module.exports=require(391)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._getarray/index.js":391,"lodash._arraypool":594}],594:[function(require,module,exports){
module.exports=require(392)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._getarray/node_modules/lodash._arraypool/index.js":392}],595:[function(require,module,exports){
module.exports=require(576)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._largearraysize/index.js":576}],596:[function(require,module,exports){
module.exports=require(394)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._releasearray/index.js":394,"lodash._arraypool":597,"lodash._maxpoolsize":598}],597:[function(require,module,exports){
module.exports=require(392)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._getarray/node_modules/lodash._arraypool/index.js":392}],598:[function(require,module,exports){
module.exports=require(396)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._releasearray/node_modules/lodash._maxpoolsize/index.js":396}],599:[function(require,module,exports){
module.exports=require(580)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._releaseobject/index.js":580,"lodash._maxpoolsize":600,"lodash._objectpool":601}],600:[function(require,module,exports){
module.exports=require(396)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._releasearray/node_modules/lodash._maxpoolsize/index.js":396}],601:[function(require,module,exports){
module.exports=require(573)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.union/node_modules/lodash._baseuniq/node_modules/lodash._createcache/node_modules/lodash._getobject/node_modules/lodash._objectpool/index.js":573}],602:[function(require,module,exports){
module.exports=require(370)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/index.js":370,"lodash._basecreatecallback":603,"lodash._baseisequal":622,"lodash.isobject":631,"lodash.keys":633,"lodash.property":637}],603:[function(require,module,exports){
module.exports=require(371)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/index.js":371,"lodash._setbinddata":604,"lodash.bind":607,"lodash.identity":619,"lodash.support":620}],604:[function(require,module,exports){
module.exports=require(372)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/index.js":372,"lodash._isnative":605,"lodash.noop":606}],605:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],606:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],607:[function(require,module,exports){
module.exports=require(375)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/index.js":375,"lodash._createwrapper":608,"lodash._slice":618}],608:[function(require,module,exports){
module.exports=require(376)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/index.js":376,"lodash._basebind":609,"lodash._basecreatewrapper":613,"lodash._slice":618,"lodash.isfunction":617}],609:[function(require,module,exports){
module.exports=require(377)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/index.js":377,"lodash._basecreate":610,"lodash._setbinddata":604,"lodash._slice":618,"lodash.isobject":631}],610:[function(require,module,exports){
module.exports=require(378)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":378,"lodash._isnative":611,"lodash.isobject":631,"lodash.noop":612}],611:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],612:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],613:[function(require,module,exports){
module.exports=require(381)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basecreatewrapper/index.js":381,"lodash._basecreate":614,"lodash._setbinddata":604,"lodash._slice":618,"lodash.isobject":631}],614:[function(require,module,exports){
module.exports=require(378)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash._basebind/node_modules/lodash._basecreate/index.js":378,"lodash._isnative":615,"lodash.isobject":631,"lodash.noop":616}],615:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],616:[function(require,module,exports){
module.exports=require(374)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash._setbinddata/node_modules/lodash.noop/index.js":374}],617:[function(require,module,exports){
module.exports=require(385)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash.isfunction/index.js":385}],618:[function(require,module,exports){
module.exports=require(386)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._slice/index.js":386}],619:[function(require,module,exports){
module.exports=require(387)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.identity/index.js":387}],620:[function(require,module,exports){
module.exports=require(388)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.support/index.js":388,"lodash._isnative":621}],621:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],622:[function(require,module,exports){
module.exports=require(390)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/index.js":390,"lodash._getarray":623,"lodash._objecttypes":625,"lodash._releasearray":626,"lodash.forin":629,"lodash.isfunction":630}],623:[function(require,module,exports){
module.exports=require(391)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._getarray/index.js":391,"lodash._arraypool":624}],624:[function(require,module,exports){
module.exports=require(392)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._getarray/node_modules/lodash._arraypool/index.js":392}],625:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],626:[function(require,module,exports){
module.exports=require(394)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._releasearray/index.js":394,"lodash._arraypool":627,"lodash._maxpoolsize":628}],627:[function(require,module,exports){
module.exports=require(392)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._getarray/node_modules/lodash._arraypool/index.js":392}],628:[function(require,module,exports){
module.exports=require(396)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash._releasearray/node_modules/lodash._maxpoolsize/index.js":396}],629:[function(require,module,exports){
module.exports=require(397)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._baseisequal/node_modules/lodash.forin/index.js":397,"lodash._basecreatecallback":603,"lodash._objecttypes":625}],630:[function(require,module,exports){
module.exports=require(385)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash._basecreatecallback/node_modules/lodash.bind/node_modules/lodash._createwrapper/node_modules/lodash.isfunction/index.js":385}],631:[function(require,module,exports){
module.exports=require(363)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":363,"lodash._objecttypes":632}],632:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],633:[function(require,module,exports){
module.exports=require(360)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/index.js":360,"lodash._isnative":634,"lodash._shimkeys":635,"lodash.isobject":631}],634:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],635:[function(require,module,exports){
module.exports=require(362)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._shimkeys/index.js":362,"lodash._objecttypes":636}],636:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],637:[function(require,module,exports){
module.exports=require(405)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.flatten/node_modules/lodash.map/node_modules/lodash.createcallback/node_modules/lodash.property/index.js":405}],638:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var keys = require('lodash.keys');

/**
 * Creates an array composed of the own enumerable property values of `object`.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property values.
 * @example
 *
 * _.values({ 'one': 1, 'two': 2, 'three': 3 });
 * // => [1, 2, 3] (property order is not guaranteed across environments)
 */
function values(object) {
  var index = -1,
      props = keys(object),
      length = props.length,
      result = Array(length);

  while (++index < length) {
    result[index] = object[props[index]];
  }
  return result;
}

module.exports = values;

},{"lodash.keys":639}],639:[function(require,module,exports){
module.exports=require(360)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/index.js":360,"lodash._isnative":640,"lodash._shimkeys":641,"lodash.isobject":643}],640:[function(require,module,exports){
module.exports=require(361)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._isnative/index.js":361}],641:[function(require,module,exports){
module.exports=require(362)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash._shimkeys/index.js":362,"lodash._objecttypes":642}],642:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}],643:[function(require,module,exports){
module.exports=require(363)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash.keys/node_modules/lodash.isobject/index.js":363,"lodash._objecttypes":644}],644:[function(require,module,exports){
module.exports=require(359)
},{"/home/raven/Projects/Eclipse/jassa-core-parent/node_modules/lodash.defaults/node_modules/lodash._objecttypes/index.js":359}]},{},[1]);
