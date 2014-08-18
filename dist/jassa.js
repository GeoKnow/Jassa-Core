(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var Jassa = require('./index.js');

if (typeof global.window.define == 'function' && global.window.define.amd) {
    global.window.define('Jassa', function () { return Jassa; });
} else {
    global.window.Jassa = Jassa;
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./index.js":28}],2:[function(require,module,exports){
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

},{"../ext/Class":2,"../sparql/ExprUtils":124,"./ElementsAndExprs":6,"lodash.foreach":324,"lodash.uniq":410}],5:[function(require,module,exports){
var ElementUtils = require('../sparql/ElementUtils');

var ExprVar = require('../sparql/expr/ExprVar');
var E_Lang = require('../sparql/expr/E_Lang');
var E_LangMatches = require('../sparql/expr/E_LangMatches');
var E_Regex = require('../sparql/expr/E_Regex');
var E_Equals = require('../sparql/expr/E_Equals');
var NodeValueUtils = require('../sparql/NodeValueUtils');

var ElementTriplesBlock = require('../sparql/element/ElementTriplesBlock');

var ElementsAndExprs = require('./ElementsAndExprs');

    
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
    }
};

module.exports = ConstraintUtils;

},{"../sparql/ElementUtils":120,"../sparql/NodeValueUtils":129,"../sparql/element/ElementTriplesBlock":145,"../sparql/expr/E_Equals":154,"../sparql/expr/E_Lang":157,"../sparql/expr/E_LangMatches":158,"../sparql/expr/E_Regex":166,"../sparql/expr/ExprVar":176,"./ElementsAndExprs":6}],6:[function(require,module,exports){
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


},{"../ext/Class":2,"../sparql/ElementUtils":120}],7:[function(require,module,exports){
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

},{"../ext/Class":2,"../sparql/ConceptUtils":118,"./ConstraintManager":4,"./FacetNode":8}],8:[function(require,module,exports){
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

},{"../ext/Class":2,"../rdf/NodeFactory":32,"../sparql/GenSym":125,"../sparql/VarUtils":138,"../sparql/element/ElementTriplesBlock":145,"./Path":10,"./Step":11,"./VarNode":14}],9:[function(require,module,exports){
var Concept = require('../sparql/Concept');
var Relation = require('../sparql/Relation');

var NodeFactory = require('../rdf/NodeFactory');
var Triple = require('../rdf/Triple');
var NodeUtils = require('../rdf/NodeUtils');

var ExprVar = require('../sparql/expr/ExprVar');
var E_Equals = require('../sparql/expr/E_Equals');
var NodeValue = require('../sparql/expr/NodeValue');
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


var FacetConceptUtils = {

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

        // TODO Fix the API - it should only need one call
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
    createConceptFacets: function(facetConfig, path, isInverse) {
        var relation = this.createRelationFacets(facetConfig, path, isInverse);

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
    createRelationFacets: function(facetConfig, path, isInverse, singleProperty) {

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

        var triple = isInverse
            ? new Triple(facetVar, propertyVar, objectVar)
            : triple = new Triple(objectVar, propertyVar, facetVar);

        facetElements.push(new ElementTriplesBlock([triple]));

        if(singleStep) {
            var exprVar = new ExprVar(propertyVar);
            var expr = new E_Equals(exprVar, NodeValue.makeNode(singleProperty));
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
    createRelationsFacetValues: function(facetConfig, path, isInverse, properties, isNegated) {
        var result = [];

        isInverse = !!isInverse; // ensure boolean

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

        // The first part of the result is formed by conceptItems for the constrained steps
        var constrainedStepRelations = this.createStepRelations(facetNode, constrainedSteps);
        result.push.apply(result, constrainedStepRelations);

        // Set up the concept for fetching facets of all concepts that were NOT constrained
        //var genericConcept = facetFacadeNode.createConcept(true);
        var genericRelation = this.createRelationFacets(path, isInverse, false);
        
        // Combine this with the user specified array of properties
        var filterElement = this.createElementFilterBindVar(genericRelation.getSourceVar(), includeProperties, false);
        if(filterElement != null) {
            genericRelation = new Relation(
                new ElementGroup([genericRelation.getElement(), filterElement]), // TODO flatten?
                genericRelation.getSourcVar(),
                genericRelation.getTargetVar());
        }

        // Important: If there are no properties to include, we can drop the genericConcept
        if(includeProperties.length > 0) {
            var genericStepRelation = new StepRelation(null, genericRelation);

            result.push(genericStepRelation);
        }

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

        var targetConcept = this.createRelationFacets(path, step.isInverse(), false, property);

        var result = new StepRelation(step, targetConcept);
        return result;
    },

};

module.exports = FacetConceptUtils;

},{"../rdf/NodeFactory":32,"../rdf/NodeUtils":33,"../rdf/Triple":35,"../sparql/Concept":117,"../sparql/ElementUtils":120,"../sparql/PatternUtils":130,"../sparql/Relation":134,"../sparql/VarUtils":138,"../sparql/element/ElementFilter":141,"../sparql/element/ElementGroup":142,"../sparql/element/ElementTriplesBlock":145,"../sparql/expr/E_Equals":154,"../sparql/expr/E_LogicalNot":162,"../sparql/expr/E_OneOf":165,"../sparql/expr/ExprVar":176,"../sparql/expr/NodeValue":177,"./Step":11,"./StepRelation":12,"./StepUtils":13}],10:[function(require,module,exports){
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

},{"../ext/Class":2,"./Step":11}],11:[function(require,module,exports){
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

},{"../ext/Class":2,"../rdf/NodeFactory":32,"../rdf/Triple":35,"../sparql/element/ElementTriplesBlock":145,"../util/ObjectUtils":225}],12:[function(require,module,exports){
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

},{"../ext/Class":2}],13:[function(require,module,exports){

var StepUtils = {
    getPropertyName: function(step) {
        var result = step.getPropertyName();
        return result;
    },
};

module.exports = StepUtils;

},{}],14:[function(require,module,exports){
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

},{"../ext/Class":2,"./Step":11,"./VarNode":14,"lodash.foreach":324}],15:[function(require,module,exports){
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

},{"../../ext/Class":2}],16:[function(require,module,exports){
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

},{"../../ext/Class":2,"./Constraint":15}],17:[function(require,module,exports){
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
    
},{"../../ext/Class":2,"../../util/ObjectUtils":225,"./ConstraintBasePath":16}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
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
},{"../../ext/Class":2,"../ConstraintUtils":5,"./ConstraintBasePathValue":17}],20:[function(require,module,exports){
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
    }
});

module.exports = ConstraintExists;
},{"../../ext/Class":2,"../ConstraintUtils":5,"./ConstraintBasePath":16}],21:[function(require,module,exports){
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
},{"../../ext/Class":2,"../ConstraintUtils":5,"./ConstraintBasePathValue":17}],22:[function(require,module,exports){
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

},{"../../ext/Class":2,"../ConstraintUtils":5,"./ConstraintBasePathValue":17}],23:[function(require,module,exports){
var Class = require('../../ext/Class');

/**
 * A FacetService is a factory for list services based on {jassa.facete.Path} objects.
 */
var FacetService = Class.create({
    createListService: function(path, isInverse) { // TODO Maybe replace arguments with the PathHead object?
        throw new Error('Not overridden');
    }
});

module.exports = FacetService;
},{"../../ext/Class":2}],24:[function(require,module,exports){
var Class = require('../../ext/Class');

var Concept = require('../../sparql/Concept');

var ListServiceConcept = require('../../service/list_service/ListServiceConcept');

var FacetService = require('./FacetService');
var FacetUtils = require('./../FacetUtils');


var FacetServiceSparql = Class.create(FacetService, {
    initialize: function(sparqlService, facetConfig) {
        this.sparqlService = sparqlService;
        this.facetConfig = facetConfig;
        //this.facetConceptGenerator = facetConceptGenerator;
        
        // TODO We probably need factory functions to get-or-create list services for concepts/queries with certain caps (page expansion, caching)
    },
    
    /**
     * Returns a list service, that yields JSON documents of the following form:
     * { 
     *   id: property {jassa.rdf.Node},
     *   countInfo: { count: , hasMoreItems: true/false/null }
     * }
     */
    createListService: function(path, isInverse) {
        //FacetConceptUtils.createConceptFacets(path, isInverse)
        // TODO We probably want a FacetRelationSupplier here:
        // This object could then return different concepts for the paths
        var relation = FacetUtils.createRelationFacets(this.facetConfig, path, isInverse);

        var concept = new Concept(relation.getElement(), relation.getSourceVar());
        
        // TODO We could provide an extension point here to order the concept by some criteria 


        //var promise = self.fetchFacetValueCounts(path, isInverse, properties, false);

        var result = new ListServiceConcept(this.sparqlService);
        return result;
    },

});

module.exports = FacetServiceSparql;

},{"../../ext/Class":2,"../../service/list_service/ListServiceConcept":73,"../../sparql/Concept":117,"./../FacetUtils":9,"./FacetService":23}],25:[function(require,module,exports){
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


},{}],26:[function(require,module,exports){
var Class = require('../../ext/Class');

var ListServiceTransformConcept = require('../../service/list_service/ListServiceTransformConcept');
var FacetService = require('./FacetService');

/**
 * A FacetService is a factory for list services based on {jassa.facete.Path} objects.
 */
var FacetService = Class.create({
    initialize: function(facetService, fnTransform) {
        this.facetService = facetService;
        this.fnTransform = fnTransform;
    },
    
    createListService: function(path, isInverse) { // TODO Maybe replace arguments with the PathHead object?
        var ls = this.facetService.createListService(path, isInverse);
        var result = new ListServiceTransformConcept(ls, this.fnTransform);
        return result;
    },

});

module.exports = FacetService;
},{"../../ext/Class":2,"../../service/list_service/ListServiceTransformConcept":77,"./FacetService":23}],27:[function(require,module,exports){
'use strict';

var ns = {
    ConstraintManager: require('./ConstraintManager'),
    ConstraintUtils: require('./ConstraintUtils'),
    ElementsAndExprs: require('./ElementsAndExprs'),
    FacetConfig: require('./FacetConfig'),
    FacetNode: require('./FacetNode'),
    FacetUtils: require('./FacetUtils'),
    Path: require('./Path'),
    Step: require('./Step'),
    StepRelation: require('./StepRelation'),
    StepUtils: require('./StepUtils'),
    VarNode: require('./VarNode'),
    Constraint: require('./constraint/Constraint'),
    ConstraintBasePath: require('./constraint/ConstraintBasePath'),
    ConstraintBasePathValue: require('./constraint/ConstraintBasePathValue'),
    ConstraintElementFactoryBBoxRange: require('./constraint/ConstraintElementFactoryBBoxRange'),
    ConstraintEquals: require('./constraint/ConstraintEquals'),
    ConstraintExists: require('./constraint/ConstraintExists'),
    ConstraintLang: require('./constraint/ConstraintLang'),
    ConstraintRegex: require('./constraint/ConstraintRegex'),
    FacetService: require('./facet_service/FacetService'),
    FacetServiceSparql: require('./facet_service/FacetServiceSparql'),
    FacetServiceTagger: require('./facet_service/FacetServiceTagger'),
    FacetServiceTransformConcept: require('./facet_service/FacetServiceTransformConcept'),
};

Object.freeze(ns);

module.exports = ns;

},{"./ConstraintManager":4,"./ConstraintUtils":5,"./ElementsAndExprs":6,"./FacetConfig":7,"./FacetNode":8,"./FacetUtils":9,"./Path":10,"./Step":11,"./StepRelation":12,"./StepUtils":13,"./VarNode":14,"./constraint/Constraint":15,"./constraint/ConstraintBasePath":16,"./constraint/ConstraintBasePathValue":17,"./constraint/ConstraintElementFactoryBBoxRange":18,"./constraint/ConstraintEquals":19,"./constraint/ConstraintExists":20,"./constraint/ConstraintLang":21,"./constraint/ConstraintRegex":22,"./facet_service/FacetService":23,"./facet_service/FacetServiceSparql":24,"./facet_service/FacetServiceTagger":25,"./facet_service/FacetServiceTransformConcept":26}],28:[function(require,module,exports){
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

module.exports = function(Promise, ajaxRequest) {
    // store promise and ajax function
    shared.Promise = Promise;
    shared.ajax = ajaxRequest;

    // return jassa object
    return {
        util: require('./util'),
        rdf: require('./rdf'),
        vocab: require('./vocab'),
        sparql: require('./sparql'),
        service: require('./service'),
        sponate: require('./sponate'),
        facete: require('./facete')
    };
};

},{"./facete":27,"./rdf":43,"./service":71,"./sparql":179,"./sponate":218,"./util":241,"./util/shared":242,"./vocab":243}],29:[function(require,module,exports){
var Class = require('../ext/Class');

// constructor
var AnonId = Class.create({
    classLabel: 'AnonId',
    getLabelString: function() {
        throw new Error('not implemented');
    },
});

module.exports = AnonId;

},{"../ext/Class":2}],30:[function(require,module,exports){
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

},{"../ext/Class":2,"./AnonId":29}],31:[function(require,module,exports){
var Class = require('../ext/Class');
var Node_Concrete = require('./node/Node_Concrete');

// helper function
// FIXME: WAT?
var escapeLiteralString = function(str) {
    return str;
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
        return this.lex;
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

},{"../ext/Class":2,"./node/Node_Concrete":46}],32:[function(require,module,exports){
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
        console.log('[ERROR] Cannot deal with ' + str);
        throw 'Not implemented';
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
            throw 'Invalid node: ' + JSON.stringify(talisJson);
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
                throw 'Bailing out';
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
            console.log('[ERROR] Null Pointer Exception');
            throw 'Bailing out';
        }

        str = str.trim();

        if (str.length === 0) {
            console.log('[ERROR] Empty string');
            throw 'Bailing out';
        }

        var c = str.charAt(0);
        var result;

        switch (c) {
            case '<':
                var uriStr = str.slice(1, -1);
                result = NodeFactory.createUri(uriStr);
                break;

            case '_':
                var anonId = new AnonIdStr(c);
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
                        console.log('[ERROR] Excepted @ or ^^');
                        throw 'Bailing out';
                }
                break;

            default:
                console.log('Could not parse ' + str);
                // Assume an uri in prefix notation
                throw 'Not implemented';
        }

        return result;
    },
};

module.exports = NodeFactory;

},{"./AnonIdStr":30,"./LiteralLabel":31,"./TypeMapper":37,"./node/Node":44,"./node/Node_Blank":45,"./node/Node_Literal":48,"./node/Node_Uri":49,"./node/Var":51,"./rdf_datatype/DefaultRdfDatatypes":53}],33:[function(require,module,exports){
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
        
        return result;
    },

};

module.exports = NodeUtils;
},{}],34:[function(require,module,exports){
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
        throw 'Not implemented yet - sorry';
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

        this.prefixes.forEach(function(u, prefix) {
            if (startsWith(uri, u)) {
                if (!bestNs || (u.length > bestNs.length)) {
                    result = prefix;
                    bestNs = u;
                }
            }
        });

        return result;
    },

    qnameFor: function() {

    },

    removeNsPrefix: function(prefix) {
        delete this.prefixes[prefix];
    },

    samePrefixMappingAs: function() {
        throw 'Not implemented yet - Sorry';
    },

    setNsPrefix: function(prefix, uri) {
        this.prefixes[prefix] = uri;

        return this;
    },

    setNsPrefixes: function(obj) {
        var json = isFunction(obj.getNsPrefixMap) ? obj.getNsPrefixMap() : obj;

        var self = this;
        json.forEach(function(uri, prefix) {
            self.setNsPrefix(prefix, uri);
        });

        return this;
    },

    shortForm: function(uri) {
        var prefix = this.getNsPrefixURI(uri);

        var result;
        if (prefix) {

            var u = this.prefixes[uri];
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
    },
});

module.exports = PrefixMappingImpl;

},{"../ext/Class":2}],35:[function(require,module,exports){
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

},{"../ext/Class":2,"./NodeUtils":33}],36:[function(require,module,exports){
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

},{"lodash.uniq":410}],37:[function(require,module,exports){
var Class = require('../ext/Class');
var DefaultRdfDatatypes = require('./rdf_datatype/DefaultRdfDatatypes');
var BaseDatatype = require('./rdf_datatype/BaseDatatype');

// TODO: expose?
var JenaParameters = {
    enableSilentAcceptanceOfUnknownDatatypes: true,
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
                    throw 'Bailing out';
                }
            }
        }
        return dtype;
    },

    registerDatatype: function(datatype) {
        var typeUri = datatype.getUri();
        this.uriToDt[typeUri] = datatype;
    },
});

TypeMapper.staticInstance = null;

TypeMapper.getInstance = function() {

    if (TypeMapper.staticInstance == null) {
        TypeMapper.staticInstance = new TypeMapper(DefaultRdfDatatypes);
    }

    return TypeMapper.staticInstance;
};

module.exports = TypeMapper;

},{"../ext/Class":2,"./rdf_datatype/BaseDatatype":52,"./rdf_datatype/DefaultRdfDatatypes":53}],38:[function(require,module,exports){
var Class = require('../../ext/Class');

// constructor
var DatatypeLabel = Class.create({
    classLabel: 'DatatypeLabel',
    parse: function() {
        throw 'Not implemented';
    },
    unparse: function() {
        throw 'Not implemented';
    },
});

module.exports = DatatypeLabel;

},{"../../ext/Class":2}],39:[function(require,module,exports){
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
    },
});

module.exports = DatatypeLabelFloat;

},{"../../ext/Class":2,"./DatatypeLabel":38}],40:[function(require,module,exports){
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
    },
});

module.exports = DatatypeLabelInteger;

},{"../../ext/Class":2,"./DatatypeLabel":38}],41:[function(require,module,exports){
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
    },
});

module.exports = DatatypeLabelString;

},{"../../ext/Class":2,"./DatatypeLabel":38}],42:[function(require,module,exports){
var DatatypeLabelInteger = require('./DatatypeLabelInteger');
var DatatypeLabelFloat = require('./DatatypeLabelFloat');
var DatatypeLabelString = require('./DatatypeLabelString');

var DefaultDatatypeLabels = {
    xinteger: new DatatypeLabelInteger(),
    xfloat: new DatatypeLabelFloat(),
    xdouble: new DatatypeLabelFloat(),
    xstring: new DatatypeLabelString(),
    decimal: new DatatypeLabelFloat(), // TODO Handle Decimal properly
};

// freeze
//Object.freeze(DatatypeLabels);

module.exports = DefaultDatatypeLabels;

},{"./DatatypeLabelFloat":39,"./DatatypeLabelInteger":40,"./DatatypeLabelString":41}],43:[function(require,module,exports){
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

},{"./AnonId":29,"./AnonIdStr":30,"./LiteralLabel":31,"./NodeFactory":32,"./NodeUtils":33,"./PrefixMappingImpl":34,"./Triple":35,"./TripleUtils":36,"./TypeMapper":37,"./datatype/DatatypeLabel":38,"./datatype/DatatypeLabelFloat":39,"./datatype/DatatypeLabelInteger":40,"./datatype/DatatypeLabelString":41,"./datatype/DefaultDatatypeLabels":42,"./node/Node":44,"./node/Node_Blank":45,"./node/Node_Concrete":46,"./node/Node_Fluid":47,"./node/Node_Literal":48,"./node/Node_Uri":49,"./node/Node_Variable":50,"./node/Var":51,"./rdf_datatype/BaseDatatype":52,"./rdf_datatype/DefaultRdfDatatypes":53,"./rdf_datatype/RdfDatatype":54,"./rdf_datatype/RdfDatatypeBase":55,"./rdf_datatype/RdfDatatypeLabel":56,"./rdf_datatype/TypedValue":57}],44:[function(require,module,exports){
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
        throw 'not a URI node';
    },

    getName: function() {
        throw ' is not a variable node';
    },

    getBlankNodeId: function() {
        throw ' is not a blank node';
    },

    getBlankNodeLabel: function() {
        // Convenience override
        return this.getBlankNodeId().getLabelString();
    },

    getLiteral: function() {
        throw ' is not a literal node';
    },

    getLiteralValue: function() {
        throw ' is not a literal node';
    },

    getLiteralLexicalForm: function() {
        throw ' is not a literal node';
    },

    getLiteralDatatype: function() {
        throw ' is not a literal node';
    },

    getLiteralDatatypeUri: function() {
        throw ' is not a literal node';
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
            throw 'not implemented yet';
        }

        return result;
    },
});

module.exports = Node;

},{"../../ext/Class":2}],45:[function(require,module,exports){
var Class = require('../../ext/Class');
var Node_Concrete = require('./Node_Concrete');

var Node_Blank = Class.create(Node_Concrete, {
    classLabel: 'jassa.rdf.Node_Blank',
    // Note: id is expected to be an instance of AnonId
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
    },
});

module.exports = Node_Blank;

},{"../../ext/Class":2,"./Node_Concrete":46}],46:[function(require,module,exports){
var Class = require('../../ext/Class');
var Node = require('./Node');

var Node_Concrete = Class.create(Node, {
    classLabel: 'jassa.rdf.Node_Concrete',
    isConcrete: function() {
        return true;
    },
});

module.exports = Node_Concrete;

},{"../../ext/Class":2,"./Node":44}],47:[function(require,module,exports){
var Class = require('../../ext/Class');
var Node = require('./Node');

var Node_Fluid = Class.create(Node, {
    classLabel: 'jassa.rdf.Node_Fluid',
    isConcrete: function() {
        return false;
    },
});

module.exports = Node_Fluid;

},{"../../ext/Class":2,"./Node":44}],48:[function(require,module,exports){
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
    },
});

module.exports = Node_Literal;

},{"../../ext/Class":2,"./Node_Concrete":46}],49:[function(require,module,exports){
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
    },
});

module.exports = Node_Uri;

},{"../../ext/Class":2,"./Node_Concrete":46}],50:[function(require,module,exports){
var Class = require('../../ext/Class');
var Node_Fluid = require('./Node_Fluid');

var Node_Variable = Class.create(Node_Fluid, {
    classLabel: 'jassa.rdf.Node_Variable',
    isVariable: function() {
        return true;
    },
});

module.exports = Node_Variable;

},{"../../ext/Class":2,"./Node_Fluid":47}],51:[function(require,module,exports){
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
    },
});

module.exports = Var;

},{"../../ext/Class":2,"./Node_Variable":50}],52:[function(require,module,exports){
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
    },
});

module.exports = BaseDatatype;

},{"../../ext/Class":2,"./RdfDatatype":54,"./TypedValue":57}],53:[function(require,module,exports){
var xsd = require('../../vocab/xsd');
var DatatypeLabels = require('../datatype/DefaultDatatypeLabels');
var RdfDatatypeLabel = require('./RdfDatatypeLabel');

// init object
var DefaultRdfDatatypes = {};

// helper function
var registerRdfDatype = function(uri, label) {
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

},{"../../vocab/xsd":248,"../datatype/DefaultDatatypeLabels":42,"./RdfDatatypeLabel":56}],54:[function(require,module,exports){
var Class = require('../../ext/Class');

// constructor
var RdfDatatype = Class.create({
    classLabel: 'RdfDatatype',
    getUri: function() {
        throw 'Not implemented';
    },
    unparse: function() {
        throw 'Not implemented';
    },
    /** Convert a value of this datatype to lexical form. */
    parse: function() {
        throw 'Not implemented';
    },
});

module.exports = RdfDatatype;

},{"../../ext/Class":2}],55:[function(require,module,exports){
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
    },
});

module.exports = RdfDatatypeBase;

},{"../../ext/Class":2,"./RdfDatatype":54}],56:[function(require,module,exports){
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
    },
});

module.exports = RdfDatatypeLabel;

},{"../../ext/Class":2,"./RdfDatatypeBase":55}],57:[function(require,module,exports){
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
    },
});

module.exports = TypedValue;

},{"../../ext/Class":2}],58:[function(require,module,exports){
var defaults = require('lodash.defaults');

var AjaxUtils = {

    /**
     *
     */
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
            data: data,
        };

        defaults(data, dataDefaults);
        defaults(result, ajaxDefaults);

        //console.log('Created ajax spec: ' + JSON.stringify(result));
        return result;
    }
};

module.exports = AjaxUtils;

},{"lodash.defaults":249}],59:[function(require,module,exports){
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
                exprsKey: exprsKey,
            });
        }

        // FIXME: expr not defined
        // var elementFilter = new ElementFilter(expr);

        // var subQuery = this.query.clone();
        // subQuery.getElements().push(elementFilter);

        // TODO: Add columns for variables in B
        // var rsB = this.sparqlService.execSelect(subQuery);
    },
});

module.exports = BindingLookup;

},{"../ext/Class":2,"../sparql/ExprUtils":124}],60:[function(require,module,exports){
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

},{"../util/collection/HashMap":233,"../util/shared":242}],61:[function(require,module,exports){
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

},{}],62:[function(require,module,exports){
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

},{"../ext/Class":2}],63:[function(require,module,exports){
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

},{"../ext/Class":2,"./cache/CacheSimple":69}],64:[function(require,module,exports){
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

},{"../ext/Class":2}],65:[function(require,module,exports){
var HashMap = require('../util/collection/HashMap');
var IteratorArray = require('../util/collection/IteratorArray');
var VarUtils = require('../sparql/VarUtils');
var ResultSetArrayIteratorBinding = require('./result_set/ResultSetArrayIteratorBinding');
var ResultSetPart = require('./ResultSetPart');
var Binding = require('../sparql/Binding');

var ResultSetUtils = {
    jsonToResultSet: function(json) {
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
},{"../sparql/Binding":116,"../sparql/VarUtils":138,"../util/collection/HashMap":233,"../util/collection/IteratorArray":237,"./ResultSetPart":64,"./result_set/ResultSetArrayIteratorBinding":98}],66:[function(require,module,exports){
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

    /**
     * Fetches the first column of the first row of a result set and parses it as int.
     *
     */
    fetchInt: function(queryExecution, variable) {
        var self = this;
        var result = queryExecution.execSelect().then(function(rs) {
            var r = self.resultSetToInt(rs, variable);
            return r;
        });

        return result;
    },

    fetchCountConcept: Promise.method(function(sparqlService, concept, threshold) {

        var outputVar = ConceptUtils.freshVar(concept);

        var scanLimit = threshold == null ? null : threshold + 1;

        var countQuery = ConceptUtils.createQueryCount(concept, outputVar, scanLimit);

        var qe = sparqlService.createQueryExecution(countQuery);

        return ServiceUtils
            .fetchInt(qe, outputVar)
            .then(function(count) {
                var hasMoreItems = count > threshold;

                var r = {
                    count: hasMoreItems ? threshold : count,
                    limit: threshold,
                    hasMoreItems: hasMoreItems,
                };

                return r;
            });
    }),

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

        return ServiceUtils.fetchInt(qe, outputVar)
            .then(function(count) {
                return {
                    count: count,
                    limit: null,
                    hasMoreItems: false,
                };
            })
            .catch(function() {
                // Try counting with the fallback size
                var countQuery = QueryUtils.createQueryCount(elements, limit + 1, null, outputVar, null, null, null);
                var qe = sparqlService.createQueryExecution(countQuery);
                return ServiceUtils.fetchInt(qe, outputVar)
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

},{"../sparql/Binding":116,"../sparql/ConceptUtils":118,"../sparql/QueryUtils":133,"../sparql/VarUtils":138,"../sparql/element/ElementFilter":141,"../sparql/element/ElementSubQuery":144,"../sparql/expr/E_OneOf":165,"../sparql/expr/ExprVar":176,"../util/ArrayUtils":219,"../util/collection/IteratorArray":237,"../util/shared":242,"./result_set/ResultSetArrayIteratorBinding":98,"lodash.union":387}],67:[function(require,module,exports){
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

},{"../sparql/VarUtils":138,"../util/collection/IteratorArray":237,"../util/shared":242,"./ServiceUtils":66,"./result_set/ResultSetArrayIteratorBinding":98,"lodash.uniq":410}],68:[function(require,module,exports){
var Class = require('../../ext/Class');

var Cache = Class.create({
    getItem: function(key) {
        console.log('not implemented');
        throw 'not implemented';
    },

    setItem: function(key, val) {
        console.log('not implemented');
        throw 'not implemented';
    },

});

module.exports = Cache;

},{"../../ext/Class":2}],69:[function(require,module,exports){
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

},{"../../ext/Class":2,"./Cache":68}],70:[function(require,module,exports){
var Class = require('../../ext/Class');

/**
 * A data service only provides a single method for retrieving data based on some 'key' (thing)
 * The key can be an arbitrary object that identifies a collection (e.g. a tag), a sparql concept, etc...
 */
var DataService = Class.create({
    fetchData: function() { // thing) {
        console.log('Not implemented');
        throw 'Not implemented';
    },

});

module.exports = DataService;

},{"../../ext/Class":2}],71:[function(require,module,exports){
'use strict';

var ns = {
    BindingLookup: require('./BindingLookup'),
    LookupServiceUtils: require('./LookupServiceUtils'),
    PageExpandUtils: require('./PageExpandUtils'),
    QueryPaginator: require('./QueryPaginator'),
    RequestCache: require('./RequestCache'),
    ResultSetPart: require('./ResultSetPart'),
    ResultSetUtils: require('./ResultSetUtils'),
    ServiceUtils: require('./ServiceUtils'),
    TableServiceUtils: require('./TableServiceUtils'),
    Cache: require('./cache/Cache'),
    CacheSimple: require('./cache/CacheSimple'),
    DataService: require('./data_service/DataService'),
    ListService: require('./list_service/ListService'),
    ListServiceConcept: require('./list_service/ListServiceConcept'),
    ListServiceConceptKeyLookup: require('./list_service/ListServiceConceptKeyLookup'),
    ListServicePageExpand: require('./list_service/ListServicePageExpand'),
    ListServiceSparqlQuery: require('./list_service/ListServiceSparqlQuery'),
    LookupService: require('./lookup_service/LookupService'),
    LookupServiceBase: require('./lookup_service/LookupServiceBase'),
    LookupServiceCache: require('./lookup_service/LookupServiceCache'),
    LookupServiceChunker: require('./lookup_service/LookupServiceChunker'),
    LookupServiceConst: require('./lookup_service/LookupServiceConst'),
    LookupServiceDelegateBase: require('./lookup_service/LookupServiceDelegateBase'),
    LookupServiceIdFilter: require('./lookup_service/LookupServiceIdFilter'),
    LookupServiceSparqlQuery: require('./lookup_service/LookupServiceSparqlQuery'),
    LookupServiceTimeout: require('./lookup_service/LookupServiceTimeout'),
    LookupServiceTransform: require('./lookup_service/LookupServiceTransform'),
    QueryCacheBindingHashSingle: require('./query_cache/QueryCacheBindingHashSingle'),
    QueryCacheNodeFactory: require('./query_cache/QueryCacheNodeFactory'),
    QueryCacheNodeFactoryImpl: require('./query_cache/QueryCacheNodeFactoryImpl'),
    QueryExecution: require('./query_execution/QueryExecution'),
    QueryExecutionCache: require('./query_execution/QueryExecutionCache'),
    QueryExecutionDelegate: require('./query_execution/QueryExecutionDelegate'),
    QueryExecutionHttp: require('./query_execution/QueryExecutionHttp'),
    QueryExecutionPageExpand: require('./query_execution/QueryExecutionPageExpand'),
    QueryExecutionPaginate: require('./query_execution/QueryExecutionPaginate'),
    ResultSet: require('./result_set/ResultSet'),
    ResultSetArrayIteratorBinding: require('./result_set/ResultSetArrayIteratorBinding'),
    ResultSetHashJoin: require('./result_set/ResultSetHashJoin'),
    SparqlService: require('./sparql_service/SparqlService'),
    SparqlServiceBaseString: require('./sparql_service/SparqlServiceBaseString'),
    SparqlServiceCache: require('./sparql_service/SparqlServiceCache'),
    SparqlServiceFactory: require('./sparql_service/SparqlServiceFactory'),
    SparqlServiceFactoryConst: require('./sparql_service/SparqlServiceFactoryConst'),
    SparqlServiceFactoryDefault: require('./sparql_service/SparqlServiceFactoryDefault'),
    SparqlServiceHttp: require('./sparql_service/SparqlServiceHttp'),
    SparqlServicePageExpand: require('./sparql_service/SparqlServicePageExpand'),
    SparqlServicePaginate: require('./sparql_service/SparqlServicePaginate'),
    SparqlServiceVirtFix: require('./sparql_service/SparqlServiceVirtFix'),
    TableService: require('./table_service/TableService'),
    TableServiceDelegateBase: require('./table_service/TableServiceDelegateBase'),
    TableServiceFacet: require('./table_service/TableServiceFacet'),
    TableServiceNodeLabels: require('./table_service/TableServiceNodeLabels'),
    TableServiceQuery: require('./table_service/TableServiceQuery'),
};

Object.freeze(ns);

module.exports = ns;

},{"./BindingLookup":59,"./LookupServiceUtils":60,"./PageExpandUtils":61,"./QueryPaginator":62,"./RequestCache":63,"./ResultSetPart":64,"./ResultSetUtils":65,"./ServiceUtils":66,"./TableServiceUtils":67,"./cache/Cache":68,"./cache/CacheSimple":69,"./data_service/DataService":70,"./list_service/ListService":72,"./list_service/ListServiceConcept":73,"./list_service/ListServiceConceptKeyLookup":74,"./list_service/ListServicePageExpand":75,"./list_service/ListServiceSparqlQuery":76,"./lookup_service/LookupService":78,"./lookup_service/LookupServiceBase":79,"./lookup_service/LookupServiceCache":80,"./lookup_service/LookupServiceChunker":81,"./lookup_service/LookupServiceConst":82,"./lookup_service/LookupServiceDelegateBase":83,"./lookup_service/LookupServiceIdFilter":84,"./lookup_service/LookupServiceSparqlQuery":85,"./lookup_service/LookupServiceTimeout":86,"./lookup_service/LookupServiceTransform":87,"./query_cache/QueryCacheBindingHashSingle":88,"./query_cache/QueryCacheNodeFactory":89,"./query_cache/QueryCacheNodeFactoryImpl":90,"./query_execution/QueryExecution":91,"./query_execution/QueryExecutionCache":92,"./query_execution/QueryExecutionDelegate":93,"./query_execution/QueryExecutionHttp":94,"./query_execution/QueryExecutionPageExpand":95,"./query_execution/QueryExecutionPaginate":96,"./result_set/ResultSet":97,"./result_set/ResultSetArrayIteratorBinding":98,"./result_set/ResultSetHashJoin":99,"./sparql_service/SparqlService":100,"./sparql_service/SparqlServiceBaseString":101,"./sparql_service/SparqlServiceCache":102,"./sparql_service/SparqlServiceFactory":103,"./sparql_service/SparqlServiceFactoryConst":104,"./sparql_service/SparqlServiceFactoryDefault":105,"./sparql_service/SparqlServiceHttp":106,"./sparql_service/SparqlServicePageExpand":107,"./sparql_service/SparqlServicePaginate":108,"./sparql_service/SparqlServiceVirtFix":109,"./table_service/TableService":110,"./table_service/TableServiceDelegateBase":111,"./table_service/TableServiceFacet":112,"./table_service/TableServiceNodeLabels":113,"./table_service/TableServiceQuery":114}],72:[function(require,module,exports){
var Class = require('../../ext/Class');

/**
 * A list service supports fetching ranges of items and supports thresholded counting.
 */
var ListService = Class.create({
    fetchItems: function(thing, limit, offset) {
        console.log('Not implemented');
        throw 'Not implemented';
    },

    fetchCount: function(thing, threshold) {
        console.log('Not implemented');
        throw 'Not implemented';
    },
});

module.exports = ListService;

},{"../../ext/Class":2}],73:[function(require,module,exports){
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

},{"../../ext/Class":2,"../ServiceUtils":66,"./ListService":72}],74:[function(require,module,exports){
var values = require('lodash.values');

var Class = require('../../ext/Class');
var ListService = require('./ListService');
var ServiceUtils = require('../ServiceUtils');
var shared = require('../../util/shared');
var Promise = shared.Promise;
var ConceptUtils = require('../../sparql/ConceptUtils');

/**
 *
 *
 */
var ListServiceConceptKeyLookup = Class.create(ListService, {
    initialize: function(keyListService, keyLookupService, isLeftJoin) {
        this.keyListService = keyListService;
        this.keyLookupService = keyLookupService;
        this.isLeftJoin = isLeftJoin == null ? true : isLeftJoin;
    },

    fetchItems: Promise.method(function(concept, limit, offset) {
        var self = this; 
        
        var result = this.keyListService.fetchItems(concept, limit, offset)
            .then(function(keys) {
                return self.keyLookupService.lookup(keys);
             }).then(function(map) {
                var entries = map.entries();
                var r = values(entries);
                return r;
             });
        
        return result;
    }),

    fetchCount: Promise.method(function(concept, itemLimit, rowLimit) {
        var result;
        if (this.isLeftJoin) {
            result = this.keyListService.fetchCount(concept, itemLimit, rowLimit);
        } else {
            var self = this;

            result = this.keyListService.fetchItems(concept, itemLimit)
                .then(function(items) {
                    return self.keyLookupService.lookup(items);
                }).then(function(map) {
                    var keyList = map.keyList();
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

},{"../../ext/Class":2,"../../sparql/ConceptUtils":118,"../../util/shared":242,"../ServiceUtils":66,"./ListService":72,"lodash.values":465}],75:[function(require,module,exports){
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

},{"../../ext/Class":2,"../PageExpandUtils":61,"./ListService":72}],76:[function(require,module,exports){
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
            console.log('Limit and offset in attribute queries not yet supported');
            throw 'Limit and offset in attribute queries not yet supported';
        }

        this.sparqlService = sparqlService;
        this.attrQuery = attrQuery;
        this.attrVar = attrVar;
        this.isLeftJoin = isLeftJoin == null ? true : isLeftJoin;
    },

    fetchItems: function(filterConcept, limit, offset) {
        var attrVar = this.attrVar;
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

        var countConcept;
        if(this.isLeftJoin) {
            var query = ConceptUtils.createAttrQuery(this.attrQuery, this.attrVar, this.isLeftJoin, filterConcept, itemLimit, null);

            countConcept = new Concept(query.getQueryPattern(), this.attrVar);
        } else {
            countConcept = filterConcept;
        }

        var result = ServiceUtils.fetchCountConcept(this.sparqlService, countConcept, itemLimit, rowLimit);
        return result;
    },

});

module.exports = ListServiceSparqlQuery;
},{"../../ext/Class":2,"../../sparql/Concept":117,"../../sparql/ConceptUtils":118,"../../util/shared":242,"../ResultSetUtils":65,"../ServiceUtils":66,"./ListService":72,"lodash.values":465}],77:[function(require,module,exports){
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

},{"../../ext/Class":2,"./ListService":72}],78:[function(require,module,exports){
var Class = require('../../ext/Class');

var LookupService = Class.create({
    getIdStr: function() { // id) {
        console.log('Not overridden');
        throw 'Not overridden';
    },

    /**
     * This method must return a promise for a Map<Id, Data>
     */
    lookup: function() { // ids) {
        console.log('Not overridden');
        throw 'Not overridden';
    },
});

module.exports = LookupService;

},{"../../ext/Class":2}],79:[function(require,module,exports){
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

},{"../../ext/Class":2,"./LookupService":78}],80:[function(require,module,exports){
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

},{"../../ext/Class":2,"../../util/collection/HashMap":233,"../../util/shared":242,"../RequestCache":63,"./LookupServiceDelegateBase":83,"lodash.uniq":410}],81:[function(require,module,exports){
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

},{"../../ext/Class":2,"../../util/ArrayUtils":219,"../../util/collection/HashMap":233,"../../util/shared":242,"./LookupServiceDelegateBase":83,"lodash.uniq":410}],82:[function(require,module,exports){
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

},{"../../ext/Class":2,"../../util/collection/HashMap":233,"../../util/shared":242,"./LookupServiceBase":79}],83:[function(require,module,exports){
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

},{"../../ext/Class":2,"./LookupService":78}],84:[function(require,module,exports){
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

},{"../../ext/Class":2,"./LookupServiceDelegateBase":83}],85:[function(require,module,exports){
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
    lookup: Promise.method(function(uris) {
        var v = this.v;
        var result;
        if(uris.length === 0) {
            result = Promise.resolve(new HashMap());
        } else {
            var q = this.query.clone();

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
    })
});

module.exports = LookupServiceSparqlQuery;

},{"../../ext/Class":2,"../../sparql/element/ElementFilter":141,"../../sparql/element/ElementGroup":142,"../../sparql/expr/E_OneOf":165,"../../sparql/expr/ExprVar":176,"../../util/collection/HashMap":233,"../../util/shared":242,"../ResultSetUtils":65,"./LookupServiceBase":79}],86:[function(require,module,exports){
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

},{"../../ext/Class":2,"../../util/collection/HashMap":233,"../../util/shared":242,"./LookupServiceDelegateBase":83}],87:[function(require,module,exports){
var Class = require('../../ext/Class');
var LookupServiceDelegateBase = require('./LookupServiceDelegateBase');

// In-place transform the values for the looked up documents
var LookupServiceTransform = Class.create(LookupServiceDelegateBase, {
    initialize: function($super, delegate, fnTransform) {
        $super(delegate);
        this.fnTransform = fnTransform;
    },

    lookup: function(ids) {
        var fnTransform = this.fnTransform;

        var result = this.delegate.lookup(ids).then(function(map) {

            ids.forEach(function(id) {
                var val = map.get(id);
                var t = fnTransform(val, id);
                map.put(id, t);
            });

            return map;
        });

        return result;
    },
});

module.exports = LookupServiceTransform;

},{"../../ext/Class":2,"./LookupServiceDelegateBase":83}],88:[function(require,module,exports){
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

},{"../../ext/Class":2,"../../sparql/ExprEvaluatorImpl":122,"../../sparql/element/ElementFilter":141,"../../sparql/expr/E_OneOf":165,"../../util/collection/IteratorArray":237,"../../util/shared":242,"../result_set/ResultSetArrayIteratorBinding":98}],89:[function(require,module,exports){
var Class = require('../../ext/Class');

var QueryCacheNodeFactory = Class.create({
    createQueryCache: function() { // sparqlService, query, indexExpr) {
        throw 'Not overridden';
    },
});

module.exports = QueryCacheNodeFactory;

},{"../../ext/Class":2}],90:[function(require,module,exports){
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

},{"../../ext/Class":2,"./QueryCacheBindingHashSingle":88,"./QueryCacheNodeFactory":89}],91:[function(require,module,exports){
var Class = require('../../ext/Class');

var QueryExecution = Class.create({
    execSelect: function() {
        throw 'Not overridden';
    },

    execAsk: function() {
        throw 'Not overridden';
    },

    execDescribeTriples: function() {
        throw 'Not overridden';
    },

    execConstructTriples: function() {
        throw 'Not overridden';
    },

    setTimeout: function() {
        throw 'Not overridden';
    },
});

module.exports = QueryExecution;

},{"../../ext/Class":2}],92:[function(require,module,exports){
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
            return Promise.resolve(rs);
        });

        return result;
    },
});

module.exports = QueryExecutionCache;

},{"../../ext/Class":2,"../../util/collection/IteratorArray":237,"../../util/shared":242,"../result_set/ResultSetArrayIteratorBinding":98,"./QueryExecution":91}],93:[function(require,module,exports){
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

    createQueryExecution: function() {
        var result = this.sparqlService.createQueryExecution(this.query);
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

},{"../../ext/Class":2,"./QueryExecution":91}],94:[function(require,module,exports){
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
            var r = ResultSetUtils.jsonToResultSet(raw);
            return Promise.resolve(r);
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
        throw 'Not implemented yet';
        // return this.execAny(queryString);
    },

    execDescribeTriples: function() {
        throw 'Not implemented yet';
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

},{"../../ext/Class":2,"../../util/shared":242,"../AjaxUtils":58,"../ResultSetUtils":65,"./QueryExecution":91}],95:[function(require,module,exports){
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

},{"../../ext/Class":2,"../../util/collection/IteratorArray":237,"../PageExpandUtils":61,"../result_set/ResultSetArrayIteratorBinding":98,"./QueryExecutionDelegate":93}],96:[function(require,module,exports){
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

    executeSelectRec: function(queryPaginator, prevResult) {
        var query = queryPaginator.next();
        console.log('Query Pagination: ' + query);
        if (!query) {
            return prevResult;
        }

        var self = this;

        var qe = this.sparqlService.createQueryExecution(query);
        qe.setTimeout(this.timeoutInMillis);

        var result = qe.execSelect().then(function(rs) {
            if (!rs) {
                throw 'Null result set for query: ' + query;
            }

            // If result set size equals pageSize, request more data
            var r;
            if (!prevResult) {
                r = Promise.resolve(rs);
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
                r = Promise.resolve(new ResultSetArrayIteratorBinding(itBinding));
            }

            var rsSize = rs.getIterator().getArray().length;
            // console.debug('rsSize, PageSize: ', rsSize, self.pageSize);
            var pageSize = queryPaginator.getPageSize();

            // result size is empty or less than the pageSize or
            // limit reached
            var hasReachedEnd = rsSize === 0 || rsSize < pageSize;
            if (!hasReachedEnd) {
                r = self.executeSelectRec(queryPaginator, result);
            }

            return r;
        });

        return result;
    },

    execSelect: function() {
        var clone = this.query.clone();
        var pageSize = this.pageSize || QueryExecutionPaginate.defaultPageSize;
        var paginator = new QueryPaginator(clone, pageSize);

        //return Promise.method(this.executeSelectRec(paginator, null));
        return this.executeSelectRec(paginator, null);
    },

    setTimeout: function(timeoutInMillis) {
        this.timeoutInMillis = timeoutInMillis;

        if (!this.timeoutMsgShown) {
            console.log('[WARN] Only preliminary timeout implementation for paginated query execution');
            this.timeoutMsgShown = true;
        }
    },
});

module.exports = QueryExecutionPaginate;

},{"../../ext/Class":2,"../../util/collection/IteratorArray":237,"../../util/shared":242,"../QueryPaginator":62,"../result_set/ResultSetArrayIteratorBinding":98,"./QueryExecution":91}],97:[function(require,module,exports){
var Class = require('../../ext/Class');
var Iterator = require('../../util/collection/Iterator');

/**
 * Utility class to create an iterator over an array.
 *
 */
var ResultSet = Class.create(Iterator, {
    getVarNames: function() {
        throw 'Override me';
    },
});

module.exports = ResultSet;

},{"../../ext/Class":2,"../../util/collection/Iterator":235}],98:[function(require,module,exports){
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

},{"../../ext/Class":2,"./ResultSet":97}],99:[function(require,module,exports){
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

},{"../../ext/Class":2,"../../util/collection/IteratorAbstract":236}],100:[function(require,module,exports){
var Class = require('../../ext/Class');

var SparqlService = Class.create({
    getServiceId: function() {
        console.log('[ERROR] Method not overridden');
        throw '[ERROR] Method not overridden';
    },

    getStateHash: function() {
        console.log('[ERROR] Method not overridden');
        throw '[ERROR] Method not overridden';
    },

    createQueryExecution: function() {
        console.log('[ERROR] Method not overridden');
        throw '[ERROR] Method not overridden';
    },
});

module.exports = SparqlService;

},{"../../ext/Class":2}],101:[function(require,module,exports){
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
        throw 'Not implemented';
    },
});

module.exports = SparqlServiceBaseString;

},{"../../ext/Class":2,"./SparqlService":100}],102:[function(require,module,exports){
var Class = require('../../ext/Class');
var SparqlServiceBaseString = require('./SparqlServiceBaseString');
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
var SparqlServiceCache = Class.create(SparqlServiceBaseString, {
    initialize: function(queryExecutionFactory) { // , resultCache, executionCache) {
        this.qef = queryExecutionFactory;
        this.requestCache = new RequestCache();
    },

    getServiceId: function() {
        return this.qef.getServiceId();
    },

    getStateHash: function() {
        return this.qef.getStateHash();
    },

    hashCode: function() {
        return 'cached:' + this.qef.hashCode();
    },

    createQueryExecutionStr: function(queryStr) {
        var serviceId = this.qef.getServiceId();
        var stateHash = this.qef.getStateHash();

        var cacheKey = serviceId + '-' + stateHash + queryStr;

        var qe = this.qef.createQueryExecution(queryStr);

        var result = new QueryExecutionCache(qe, cacheKey, this.requestCache);

        return result;
    },
});

module.exports = SparqlServiceCache;

},{"../../ext/Class":2,"../RequestCache":63,"../query_execution/QueryExecutionCache":92,"./SparqlServiceBaseString":101}],103:[function(require,module,exports){
var Class = require('../../ext/Class');

var SparqlServiceFactory = Class.create({
    createSparqlService: function() {
        throw 'Not overridden';
    },
});

module.exports = SparqlServiceFactory;

},{"../../ext/Class":2}],104:[function(require,module,exports){
var Class = require('../../ext/Class');

var SparqlServiceFactoryConst = Class.create({
    initialize: function(sparqlService) {
        this.sparqlService = sparqlService;
    },

    createSparqlService: function() {
        var result = this.sparqlService;

        if (result == null) {
            console.log('[ERROR] Creation of a SPARQL service requested, but none was provided');
            throw 'Bailing out';
        }

        return result;
    },

    setSparqlService: function(sparqlService) {
        this.sparqlService = sparqlService;
    },
});

module.exports = SparqlServiceFactoryConst;

},{"../../ext/Class":2}],105:[function(require,module,exports){
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

},{"../../ext/Class":2,"./SparqlServiceCache":102,"./SparqlServiceHttp":106}],106:[function(require,module,exports){
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

},{"../../ext/Class":2,"../../ext/JSONCanonical":3,"../query_execution/QueryExecutionHttp":94,"./SparqlServiceBaseString":101,"lodash.defaults":249}],107:[function(require,module,exports){
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

},{"../../ext/Class":2,"../query_execution/QueryExecutionPageExpand":95,"./SparqlService":100}],108:[function(require,module,exports){
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

},{"../../ext/Class":2,"../query_execution/QueryExecutionPaginate":96,"./SparqlService":100}],109:[function(require,module,exports){
var Class = require('../../ext/Class');
var SparqlService = require('./SparqlService');
var E_Count = require('../../sparql/expr/E_Count');
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

    hasAggregate: function(query) {
        var entries = query.getProject().entries();
        
        var result = entries.some(function(entry) {
            var expr = entry.expr;
            if(expr instanceof E_Count) {
                return true;
            }
        });
        
        return result;
    },

    createQueryExecution: function(query) {

        var orderBy = query.getOrderBy();
        var limit = query.getLimit();
        var offset = query.getOffset();

        // 2014-08-13 This query failed on http://dbpedia.org/sparql Select * { ?s ?p ?o } Offset 1
        // with Virtuoso 22023 Error SR350: TOP parameter < 0
        // We add an extra high limit to the query
        var isLimitUpdateNeeded = offset != null && limit == null;
        var hasAggregate = this.hasAggregate(query);
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

},{"../../ext/Class":2,"../../sparql/Query":131,"../../sparql/element/ElementSubQuery":144,"../../sparql/expr/E_Count":153,"./SparqlService":100}],110:[function(require,module,exports){
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
        console.log('Implement me');
        throw 'Implement me';
    },

    /**
     * Expected to return a promise which yields an integral value for the total number of rows
     */
    fetchCount: function() {
        console.log('Implement me');
        throw 'Implement me';
    },

    /**
     * Expected to return a promise which yields an array of objects (maps) from field name to field data
     */
    fetchData: function() {// limit, offset) {
        console.log('Implement me');
        throw 'Implement me';
    },
});

module.exports = TableService;

},{"../../ext/Class":2}],111:[function(require,module,exports){
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

},{"../../ext/Class":2,"./TableService":110}],112:[function(require,module,exports){
var Class = require('../../ext/Class');
var TableServiceNodeLabels = require('./TableServiceNodeLabels');
var TableServiceUtils = require('../TableServiceUtils');

var TableServiceFacet = Class.create(TableServiceNodeLabels, {
    /**
     * So the issue is: actually we need a lookup service to get the column headings
     * The lookup service would need the sparqlService
     *
     *
     */
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

},{"../../ext/Class":2,"../TableServiceUtils":67,"./TableServiceNodeLabels":113}],113:[function(require,module,exports){
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

},{"../../ext/Class":2,"../TableServiceUtils":67,"./TableServiceDelegateBase":111}],114:[function(require,module,exports){
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

},{"../../ext/Class":2,"../../util/shared":242,"../TableServiceUtils":67,"./TableService":110}],115:[function(require,module,exports){
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


},{"../ext/Class":2,"../vocab/rdfs":246,"./VarUtils":138}],116:[function(require,module,exports){
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
            throw 'var not an instance of Var';
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

},{"../rdf/NodeFactory":32,"../rdf/node/Var":51}],117:[function(require,module,exports){
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

},{"../ext/Class":2,"./ElementUtils":120,"./element/ElementGroup":142,"./element/ElementTriplesBlock":145}],118:[function(require,module,exports){
var Node = require('../rdf/node/Node');
var NodeFactory = require('../rdf/NodeFactory');
var Triple = require('../rdf/Triple');

var HashMap = require('../util/collection/HashMap');

var rdf = require('./../vocab/rdf');

var VarUtils = require('./VarUtils'); 

var ElementUtils = require('./ElementUtils');

var E_Count = require('./expr/E_Count');

var ElementTriplesBlock = require('./element/ElementTriplesBlock');
var ElementOptional = require('./element/ElementOptional');
var ElementSubQuery = require('./element/ElementSubQuery');
var ElementGroup = require('./element/ElementGroup');

var QueryUtils = require('./QueryUtils');

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
        result.getProject().add(outputVar, new E_Count());//new ExprAggregator(concept.getVar(), new AggCount()));
        result.setQueryPattern(esq);

        return result;
    },

    createAttrQuery: function(attrQuery, attrVar, isLeftJoin, filterConcept, limit, offset) {

        // If no left join: clone the attrQuery, rename variables in filterConcept, add the renamed filter concept to the query
        // If left join: 
        var attrConcept = new Concept(new ElementSubQuery(attrQuery), attrVar);
        
        
        var renamedFilterConcept = ConceptUtils.createRenamedConcept(attrConcept, filterConcept);
        
        var newFilterElement;
        
        var requireSubQuery = limit != null || offset != null;

        if(requireSubQuery) {
            var subQuery = ConceptUtils.createQueryList(renamedFilterConcept, limit, offset);
            newFilterElement = new ElementSubQuery(subQuery);
        }
        else {
            newFilterElement = renamedFilterConcept.getElement();
        }
        
        var query = attrQuery.clone();
        
        var attrElement = query.getQueryPattern();
        
        var newAttrElement;
        if(!filterConcept || filterConcept.isSubjectConcept()) {
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

        //console.log('Query: ' + query);       
        return query;
    },

};

module.exports = ConceptUtils;


},{"../rdf/NodeFactory":32,"../rdf/Triple":35,"../rdf/node/Node":44,"../util/collection/HashMap":233,"./../vocab/rdf":245,"./Concept":117,"./ElementUtils":120,"./Query":131,"./QueryUtils":133,"./VarUtils":138,"./element/ElementGroup":142,"./element/ElementOptional":143,"./element/ElementSubQuery":144,"./element/ElementTriplesBlock":145,"./expr/E_Count":153}],119:[function(require,module,exports){
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

},{}],120:[function(require,module,exports){
// lib deps
var uniq = require('lodash.uniq');

// project deps
var ElementTriplesBlock = require('./element/ElementTriplesBlock');
var ElementFilter = require('./element/ElementFilter');
var ElementGroup = require('./element/ElementGroup');
var TripleUtils = require('./../rdf/TripleUtils');
var VarUtils = require('./VarUtils');
var GenSym = require('./GenSym');
var GeneratorBlacklist = require('./GeneratorBlacklist');
var HashBidiMap = require('../util/collection/HashBidiMap');
//var ObjectUtils = require('../util/ObjectUtils'); // node-equals
var NodeFactory = require('../rdf/NodeFactory');

var ElementUtils = {
    createFilterElements: function(exprs) {
        var result = exprs.map(function(expr) {
            var r = new ElementFilter(expr);
            return r;
        });

        return result;
    },

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

},{"../rdf/NodeFactory":32,"../util/collection/HashBidiMap":232,"./../rdf/TripleUtils":36,"./GenSym":125,"./GeneratorBlacklist":127,"./VarUtils":138,"./element/ElementFilter":141,"./element/ElementGroup":142,"./element/ElementTriplesBlock":145,"lodash.uniq":410}],121:[function(require,module,exports){
/* jshint evil: true */
var Class = require('../ext/Class');

var ExprEvaluator = Class.create({
    eval: function() { // expr, binding) {
        throw 'Not overridden';
    },
});

module.exports = ExprEvaluator;

},{"../ext/Class":2}],122:[function(require,module,exports){
/* jshint evil: true */
var Class = require('../ext/Class');
var NodeValue = require('./expr/NodeValue');
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
            throw 'Unsupported expr type';
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
            result = NodeValue.makeNode(node);
        }

        return result;
    },

    evalExprFunction: function() { // expr, binding) {
    },

    evalNodeValue: function() { // expr, binding) {
    },
});

module.exports = ExprEvaluatorImpl;

},{"../ext/Class":2,"./ExprEvaluator":121,"./expr/NodeValue":177}],123:[function(require,module,exports){
var ExprHelpers = {

    newBinaryExpr: function(Ctor, args) {
        if (args.length !== 2) {
            throw 'Invalid argument';
        }

        var newLeft = args[0];
        var newRight = args[1];

        var result = new Ctor(newLeft, newRight);
        return result;
    },

    newUnaryExpr: function(Ctor, args) {
        if (args.length !== 1) {
            throw 'Invalid argument';
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

},{}],124:[function(require,module,exports){
var ExprVar = require('./expr/ExprVar');
var NodeValue = require('./expr/NodeValue');
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
            var nodeValue = NodeValue.makeNode(node);

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

},{"./expr/E_Equals":154,"./expr/E_LogicalAnd":161,"./expr/E_LogicalOr":163,"./expr/ExprVar":176,"./expr/NodeValue":177}],125:[function(require,module,exports){
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

},{"../ext/Class":2,"./Generator":126}],126:[function(require,module,exports){
var Class = require('../ext/Class');

var Generator = Class.create({
    next: function() {
        throw 'Override me';
    },
});

module.exports = Generator;

},{"../ext/Class":2}],127:[function(require,module,exports){
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

},{"../ext/Class":2,"./Generator":126}],128:[function(require,module,exports){
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

},{"../rdf/NodeFactory":32,"../rdf/Triple":35,"./Concept":117,"./ConceptUtils":118,"./ExprUtils":124,"./NodeValueUtils":129,"./Relation":134,"./VarUtils":138,"./element/ElementFilter":141,"./element/ElementGroup":142,"./element/ElementOptional":143,"./element/ElementTriplesBlock":145,"./expr/E_Bound":151,"./expr/E_Lang":157,"./expr/E_LangMatches":158,"./expr/E_LogicalOr":163,"./expr/E_OneOf":165,"./expr/E_Regex":166,"./expr/E_Str":167,"./expr/ExprVar":176}],129:[function(require,module,exports){
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

},{"../rdf/AnonIdStr":30,"../rdf/NodeFactory":32,"../vocab/xsd":248,"./expr/NodeValue":177,"./expr/NodeValueNode":178}],130:[function(require,module,exports){
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

},{"lodash.union":387}],131:[function(require,module,exports){
var Class = require('../ext/Class');
var union = require('lodash.union');
var ObjectUtils = require('../util/ObjectUtils');
var VarExprList = require('./VarExprList');
var ArrayUtils = require('../util/ArrayUtils');
var ElementHelpers = require('./ElementHelpers');
var ElementUtils = require('./ElementUtils');
var QueryType = require('./QueryType');

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

    // TODO This should only return the variables!!
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

        console.log('sparql.Query.getVarsMentioned(): Not implemented properly yet. Things may break!');
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
        if (this.queryResultStar) {
            return '*';
        }

        return this.projectVars.toString();
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

},{"../ext/Class":2,"../util/ArrayUtils":219,"../util/ObjectUtils":225,"./ElementHelpers":119,"./ElementUtils":120,"./QueryType":132,"./VarExprList":136,"lodash.union":387}],132:[function(require,module,exports){
var QueryType = {};
QueryType.Unknown = -1;
QueryType.Select = 0;
QueryType.Construct = 1;
QueryType.Ask = 2;
QueryType.Describe = 3;

module.exports = QueryType;

},{}],133:[function(require,module,exports){
var ExprVar = require('./expr/ExprVar');
var E_Count = require('./expr/E_Count');

var ElementGroup = require('./element/ElementGroup');
var ElementSubQuery = require('./element/ElementSubQuery');

var Query = require('./Query');

var QueryUtils = {
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

        result.getProject().add(outputVar, new E_Count());

        return result;
    },
};

module.exports = QueryUtils;

},{"./Query":131,"./element/ElementGroup":142,"./element/ElementSubQuery":144,"./expr/E_Count":153,"./expr/ExprVar":176}],134:[function(require,module,exports){
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

});

module.exports = Relation;

},{"../ext/Class":2}],135:[function(require,module,exports){
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
    },

    create: function(str, varNames) {
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
    },
});

module.exports = SparqlString;

},{"../ext/Class":2,"../rdf/NodeFactory":32,"./VarUtils":138}],136:[function(require,module,exports){
var Class = require('../ext/Class');

var VarExprList = Class.create({
    initialize: function() {
        this.vars = [];
        this.varToExpr = {};
    },

    getVars: function() {
        return this.vars;
    },

    getExprMap: function() {
        return this.varToExpr;
    },

    add: function(v, expr) {
        this.vars.push(v);

        if (expr) {
            this.varToExpr[v.getName()] = expr;
        }
    },

    addAll: function(vars) {
        this.vars.push.apply(this.vars, vars);
    },

    entries: function() {
        var self = this;
        var result = this.vars.map(function(v) {
            var expr = self.varToExpr[v.getName()];

            // return expr;
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

},{"../ext/Class":2}],137:[function(require,module,exports){
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

},{"../ext/Class":2,"../rdf/NodeFactory":32}],138:[function(require,module,exports){
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
        
        var genSym = GenSym.create(blacklistNames);
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

},{"../rdf/NodeFactory":32,"../util/StringUtils":228,"./GenSym":125,"./GeneratorBlacklist":127,"./VarGen":137}],139:[function(require,module,exports){
var Class = require('../../ext/Class');

var Element = Class.create({
    classLabel: 'jassa.sparql.Element',
});

module.exports = Element;

},{"../../ext/Class":2}],140:[function(require,module,exports){
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

},{"../../ext/Class":2,"../../rdf/NodeUtils":33,"./Element":139,"lodash.union":387}],141:[function(require,module,exports){
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
            throw 'Invalid argument';
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

},{"../../ext/Class":2,"../ExprUtils":124,"./Element":139}],142:[function(require,module,exports){
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
        var result = new ElementTriplesBlock(args);
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

},{"../../ext/Class":2,"../../rdf/TripleUtils":36,"../PatternUtils":130,"./../ElementHelpers":119,"./Element":139,"./ElementFilter":141,"./ElementTriplesBlock":145,"lodash.uniq":410}],143:[function(require,module,exports){
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
            throw 'Invalid argument';
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

},{"../../ext/Class":2,"./Element":139}],144:[function(require,module,exports){
var Class = require('../../ext/Class');
var Element = require('./Element');

var ElementSubQuery = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementSubQuery',
    initialize: function(query) {
        this.query = query;
    },

    getArgs: function() {
        return [];
    },

    copy: function(args) {
        if (args.length !== 0) {
            throw 'Invalid argument';
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

},{"../../ext/Class":2,"./Element":139}],145:[function(require,module,exports){
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
            throw 'Invalid argument';
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

},{"../../ext/Class":2,"../../rdf/TripleUtils":36,"./Element":139,"lodash.union":387}],146:[function(require,module,exports){
var Class = require('../../ext/Class');

var ElementFactory = Class.create({
    createElement: function() {
        throw 'Not overridden';
    },
});

module.exports = ElementFactory;

},{"../../ext/Class":2}],147:[function(require,module,exports){
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

},{"../../ext/Class":2,"../element/ElementGroup":142,"./ElementFactory":146}],148:[function(require,module,exports){
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

},{"../../ext/Class":2,"./ElementFactory":146}],149:[function(require,module,exports){
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

},{"../../ext/Class":2,"../ElementUtils":120,"../element/ElementGroup":142,"../element/ElementOptional":143,"../join/JoinType":186,"./ElementFactory":146}],150:[function(require,module,exports){
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

},{"../../ext/Class":2,"../element/ElementGroup":142,"../join/JoinBuilder":180,"../join/JoinType":186,"./ElementFactory":146}],151:[function(require,module,exports){
var Class = require('../../ext/Class');
var ExprHelpers = require('../ExprHelpers');

var E_Bound = Class.create({
    initialize: function(expr) {
        this.expr = expr;
    },

    copySubstitute: function(fnNodeMap) {
        return new E_Bound(this.expr.copySubstitute(fnNodeMap));
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

},{"../../ext/Class":2,"../ExprHelpers":123}],152:[function(require,module,exports){
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

},{"../../ext/Class":2}],153:[function(require,module,exports){
var Class = require('../../ext/Class');
/**
 * If null, '*' will be used
 *
 * TODO Not sure if modelling aggregate functions as exprs is a good thing to do.
 *
 * @param subExpr
 * @returns {ns.ECount}
 */
var E_Count = Class.create({
    initialize: function(subExpr, isDistinct) {
        this.subExpr = subExpr;
        this.isDistinct = isDistinct ? isDistinct : false;
    },

    copySubstitute: function(fnNodeMap) {
        var subExprCopy = this.subExpr ? this.subExpr.copySubstitute(fnNodeMap) : null;

        return new E_Count(subExprCopy, this.isDistinct);
    },

    toString: function() {
        return 'Count(' + (this.isDistinct ? 'Distinct ' : '') + (this.subExpr ? this.subExpr : '*') + ')';
    },
});

module.exports = E_Count;

},{"../../ext/Class":2}],154:[function(require,module,exports){
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

},{"../../ext/Class":2,"./ExprFunction2":172}],155:[function(require,module,exports){
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

},{"../../ext/Class":2,"./ExprFunctionN":174}],156:[function(require,module,exports){
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

},{"../../ext/Class":2,"../ExprHelpers":123,"./ExprFunction2":172}],157:[function(require,module,exports){
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

},{"../../ext/Class":2,"../ExprHelpers":123}],158:[function(require,module,exports){
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

},{"../../ext/Class":2,"../ExprHelpers":123,"../PatternUtils":130}],159:[function(require,module,exports){
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

},{"../../ext/Class":2,"../ExprHelpers":123,"./ExprFunction2":172}],160:[function(require,module,exports){
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

},{"../../ext/Class":2,"../ExprHelpers":123}],161:[function(require,module,exports){
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

},{"../../ext/Class":2,"../ExprHelpers":123,"./ExprFunction2":172}],162:[function(require,module,exports){
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

},{"../../ext/Class":2,"../ExprHelpers":123,"./ExprFunction1":171}],163:[function(require,module,exports){
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

},{"../../ext/Class":2,"../ExprHelpers":123,"./ExprFunction2":172}],164:[function(require,module,exports){
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

},{"../../ext/Class":2,"./ExprFunction0":170}],165:[function(require,module,exports){
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

},{"../../ext/Class":2,"./Expr":168}],166:[function(require,module,exports){
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
            throw 'Invalid argument';
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

},{"../../ext/Class":2,"./Expr":168}],167:[function(require,module,exports){
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

},{"../../ext/Class":2,"./ExprFunction1":171}],168:[function(require,module,exports){
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
        console.log('Override me');
        throw 'Override me';
    },

    getExprVar: function() {
        console.log('Override me');
        throw 'Override me';
    },

    getConstant: function() {
        console.log('Override me');
        throw 'Override me';
    },

    copySubstitute: function() {
        console.log('Override me');
        throw 'Override me';
    },

    copy: function() {
        console.log('Override me');
        throw 'Override me';
    },
});

module.exports = Expr;

},{"../../ext/Class":2}],169:[function(require,module,exports){
var Class = require('../../ext/Class');
var Expr = require('./Expr');

var ExprFunction = Class.create(Expr, {
    getName: function() {
        console.log('Implement me');
        throw 'Implement me';
    },

    isFunction: function() {
        return true;
    },

    getFunction: function() {
        return this;
    },
});

module.exports = ExprFunction;

},{"../../ext/Class":2,"./Expr":168}],170:[function(require,module,exports){
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
            throw 'Invalid argument';
        }

        var result = this.$copy(args);
        return result;
    },
});

module.exports = ExprFunction0;

},{"../../ext/Class":2,"./ExprFunctionBase":173}],171:[function(require,module,exports){
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
            throw 'Invalid argument';
        }

        var result = this.$copy(args);
        return result;
    },

    getSubExpr: function() {
        return this.subExpr;
    },
});

module.exports = ExprFunction1;

},{"../../ext/Class":2,"./ExprFunctionBase":173}],172:[function(require,module,exports){
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
            throw 'Invalid argument';
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

},{"../../ext/Class":2,"./ExprFunctionBase":173}],173:[function(require,module,exports){
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

},{"../../ext/Class":2,"../PatternUtils":130,"./ExprFunction":169}],174:[function(require,module,exports){
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

},{"../../ext/Class":2,"./ExprFunctionBase":173}],175:[function(require,module,exports){
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
            throw 'Invalid argument';
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

},{"../../ext/Class":2,"../SparqlString":135,"./Expr":168}],176:[function(require,module,exports){
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
            throw 'Invalid argument';
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

},{"../../ext/Class":2,"./../NodeValueUtils":129,"./Expr":168}],177:[function(require,module,exports){
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
        throw 'makeNode is not overridden';
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
                result = '\'' + node.getLiteralLexicalForm() + '\'';
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

});


module.exports = NodeValue;

},{"../../ext/Class":2,"../../rdf/NodeFactory":32,"../../vocab/xsd":248,"./Expr":168}],178:[function(require,module,exports){
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

},{"../../ext/Class":2,"../../vocab/xsd":248,"./NodeValue":177}],179:[function(require,module,exports){
'use strict';

var ns = {
    BestLabelConfig: require('./BestLabelConfig'),
    Binding: require('./Binding'),
    Concept: require('./Concept'),
    ConceptUtils: require('./ConceptUtils'),
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
    SparqlString: require('./SparqlString'),
    VarExprList: require('./VarExprList'),
    VarGen: require('./VarGen'),
    VarUtils: require('./VarUtils'),
    Element: require('./element/Element'),
    ElementBind: require('./element/ElementBind'),
    ElementFilter: require('./element/ElementFilter'),
    ElementGroup: require('./element/ElementGroup'),
    ElementOptional: require('./element/ElementOptional'),
    ElementSubQuery: require('./element/ElementSubQuery'),
    ElementTriplesBlock: require('./element/ElementTriplesBlock'),
    ElementFactory: require('./element_factory/ElementFactory'),
    ElementFactoryCombine: require('./element_factory/ElementFactoryCombine'),
    ElementFactoryConst: require('./element_factory/ElementFactoryConst'),
    ElementFactoryJoin: require('./element_factory/ElementFactoryJoin'),
    ElementFactoryJoinConcept: require('./element_factory/ElementFactoryJoinConcept'),
    E_Bound: require('./expr/E_Bound'),
    E_Cast: require('./expr/E_Cast'),
    E_Count: require('./expr/E_Count'),
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

},{"./BestLabelConfig":115,"./Binding":116,"./Concept":117,"./ConceptUtils":118,"./ElementHelpers":119,"./ElementUtils":120,"./ExprEvaluator":121,"./ExprEvaluatorImpl":122,"./ExprHelpers":123,"./ExprUtils":124,"./GenSym":125,"./Generator":126,"./GeneratorBlacklist":127,"./LabelUtils":128,"./NodeValueUtils":129,"./PatternUtils":130,"./Query":131,"./QueryType":132,"./QueryUtils":133,"./Relation":134,"./SparqlString":135,"./VarExprList":136,"./VarGen":137,"./VarUtils":138,"./element/Element":139,"./element/ElementBind":140,"./element/ElementFilter":141,"./element/ElementGroup":142,"./element/ElementOptional":143,"./element/ElementSubQuery":144,"./element/ElementTriplesBlock":145,"./element_factory/ElementFactory":146,"./element_factory/ElementFactoryCombine":147,"./element_factory/ElementFactoryConst":148,"./element_factory/ElementFactoryJoin":149,"./element_factory/ElementFactoryJoinConcept":150,"./expr/E_Bound":151,"./expr/E_Cast":152,"./expr/E_Count":153,"./expr/E_Equals":154,"./expr/E_Function":155,"./expr/E_GreaterThan":156,"./expr/E_Lang":157,"./expr/E_LangMatches":158,"./expr/E_LessThan":159,"./expr/E_Like":160,"./expr/E_LogicalAnd":161,"./expr/E_LogicalNot":162,"./expr/E_LogicalOr":163,"./expr/E_NotExists":164,"./expr/E_OneOf":165,"./expr/E_Regex":166,"./expr/E_Str":167,"./expr/Expr":168,"./expr/ExprFunction":169,"./expr/ExprFunction0":170,"./expr/ExprFunction1":171,"./expr/ExprFunction2":172,"./expr/ExprFunctionBase":173,"./expr/ExprFunctionN":174,"./expr/ExprString":175,"./expr/ExprVar":176,"./expr/NodeValue":177,"./expr/NodeValueNode":178,"./join/JoinBuilder":180,"./join/JoinBuilderUtils":181,"./join/JoinInfo":182,"./join/JoinNode":183,"./join/JoinNodeInfo":184,"./join/JoinTargetState":185,"./join/JoinType":186,"./search/KeywordSearchUtils":187}],180:[function(require,module,exports){
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
            throw 'Bailing out';
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

        var newTargetVars = targetVarMap.getInverse().keyList();
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
                    console.log('[ERROR] Unsupported join type: ' + joinType);
                    throw 'Bailing out';
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

},{"../../ext/Class":2,"../../util/collection/HashBidiMap":232,"../ElementUtils":120,"../GenSym":125,"../GeneratorBlacklist":127,"../VarUtils":138,"../element/ElementGroup":142,"../element/ElementOptional":143,"./JoinInfo":182,"./JoinNode":183,"./JoinTargetState":185,"./JoinType":186}],181:[function(require,module,exports){
var JoinBuilderUtils = {
    getChildren: function(node) {
        // FIXME: getJoinNodes not defined
        return node.getJoinNodes();
    },
};

module.exports = JoinBuilderUtils;

},{}],182:[function(require,module,exports){
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

},{"../../ext/Class":2}],183:[function(require,module,exports){
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

},{"../../ext/Class":2,"./JoinNodeInfo":184,"./JoinType":186}],184:[function(require,module,exports){
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

},{"../../ext/Class":2}],185:[function(require,module,exports){
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

},{"../../ext/Class":2}],186:[function(require,module,exports){
var JoinType = {
    INNER_JOIN: 'inner_join',
    LEFT_JOIN: 'left_join',
};

module.exports = JoinType;

},{}],187:[function(require,module,exports){
var ExprVar = require('../expr/ExprVar');
var E_LangMatches = require('../expr/E_LangMatches');
var E_LogicalOr = require('../expr/E_LogicalOr');
var E_Lang = require('../expr/E_Lang');
var E_Bound = require('../expr/E_Bound');
var E_Regex = require('../expr/E_Regex');
var E_Str = require('../expr/E_Str');

var Concept = require('../Concept');

var ElementGroup = require('../element/ElementGroup');
var ElementOptional = require('../element/ElementOptional');
var ElementFilter = require('../element/ElementFilter');


var LabelUtils = require('../LabelUtils');

var KeywordSearchUtils = {
    /**
     * Optional {
     *     ?s ?p ?o 
     *     Filter(Regex(Str(?o), 'searchString'))
     * }
     * Filter(Regex(Str(?s), 'searchString') || Bound(?o))
     * 
     * @param relation
     * @returns
     */
    createConceptRegex: function(relation, searchString) {
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

        var result = new Concept(element, s);
        return result;
    },

};

module.exports = KeywordSearchUtils;

},{"../Concept":117,"../LabelUtils":128,"../element/ElementFilter":141,"../element/ElementGroup":142,"../element/ElementOptional":143,"../expr/E_Bound":151,"../expr/E_Lang":157,"../expr/E_LangMatches":158,"../expr/E_LogicalOr":163,"../expr/E_Regex":166,"../expr/E_Str":167,"../expr/ExprVar":176}],188:[function(require,module,exports){
var AccRef = require('./acc/AccRef');

var AccUtils = {
    getRefs: function(acc, result) {
        result = result || [];

        var self;
        
        if(acc instanceof AccRef) {
            result.push(acc);
        } else {
            var subAccs = acc.getSubAccs();
            subAccs.forEach(function(subAcc) {
                self.collectRefs(subAcc, result);
            });
        }
        
        return result;
    },

};

module.exports = AccUtils;
},{"./acc/AccRef":203}],189:[function(require,module,exports){
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
                console.log('[ERROR] Cannot access attribute of non-object', this.steps, doc, result);
                throw 'Bailing out';
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

},{"../ext/Class":2,"../util/ObjectUtils":225}],190:[function(require,module,exports){
var ConceptUtils = require('../sparql/ConceptUtils');
var LookupServiceSparqlQuery = require('../service/lookup_service/LookupServiceSparqlQuery');
var LookupServiceTransform = require('../service/lookup_service/LookupServiceTransform');
//var HashMap = require('../util/collection/HashMap');

var LookupServiceUtils = {

    createTransformAggResultSetPart: function(agg) {

        var result = function(resultSetPart) {
            var acc = agg.createAcc();

            var bindings = resultSetPart.getBindings();
            bindings.forEach(function(binding) {
                acc.accumulate(binding);
            });

            var r = acc.getValue();
            return r;
        };
        
        return result;
    },

    
    /**
     * public static <T> LookupService<Node, T> createLookupService(QueryExecutionFactory sparqlService, MappedConcept<T> mappedConcept)
     */
    createLookupServiceMappedConcept: function(sparqlService, mappedConcept) {
        var concept = mappedConcept.getConcept();
        var query = ConceptUtils.createQueryList(concept);

        // TODO Set up a projection using the grouping variable and the variables referenced by the aggregator
        query.setQueryResultStar(true);


        var ls = new LookupServiceSparqlQuery(sparqlService, query, concept.getVar());
        var agg = mappedConcept.getAgg();
        var fnTransform = this.createTransformAggResultSetPart(agg);

        var result = new LookupServiceTransform(ls, fnTransform);
        return result;
    },

};

module.exports = LookupServiceUtils;

},{"../service/lookup_service/LookupServiceSparqlQuery":85,"../service/lookup_service/LookupServiceTransform":87,"../sparql/ConceptUtils":118}],191:[function(require,module,exports){
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
},{"../ext/Class":2}],192:[function(require,module,exports){
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


var MappedConceptUtils = {

    createMappedConceptBestLabel: function(bestLabelConfig) {
        var relation = LabelUtils.createRelationPrefLabels(bestLabelConfig); 

        var s = relation.getSourceVar();
        var o = relation.getTargetVar();

        var agg =
            new AggObject({
                displayLabel: new AggTransform(new AggBestLabel(bestLabelConfig), NodeUtils.getValue), 
                hiddenLabels: new AggArray(
                    new AggTransform(new AggLiteral(new BindingMapperExpr(new ExprVar(o))), NodeUtils.getValue))
            });

        var labelConcept = new Concept(relation.getElement(), relation.getSourceVar());
        var result = new MappedConcept(labelConcept, agg);

        return result;
    },

};

module.exports = MappedConceptUtils;

},{"../rdf/NodeUtils":33,"../sparql/Concept":117,"../sparql/LabelUtils":128,"../sparql/VarUtils":138,"../sparql/expr/ExprVar":176,"./MappedConcept":191,"./agg/AggArray":206,"./agg/AggBestLabel":207,"./agg/AggLiteral":209,"./agg/AggMap":210,"./agg/AggObject":211,"./agg/AggTransform":213,"./binding_mapper/BindingMapperExpr":215,"./binding_mapper/BindingMapperTransform":217}],193:[function(require,module,exports){
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

},{"../ext/Class":2}],194:[function(require,module,exports){
var Class = require('../ext/Class');

var Query = Class.create({
    initialize: function(mappingName, criteria, limit, offset, concept, _isLeftJoin, nodes) {
        this.mappingName = mappingName;
        this.criteria = criteria;
        this.limit = limit;
        this.offset = offset;

        this.concept = concept;
        this._isLeftJoin = _isLeftJoin;

        // Note: For each element in the nodes array, corresponding data will be made available.
        // Thus, if nodes is an empty array, no results will be fetched; set to null to ignore the setting
        this.nodes = nodes;
    },

    shallowClone: function() {
        var r = new Query(this.mappingName, this.criteria, this.limit, this.offset, this.concept, this._isLeftJoin, this.nodes);
        return r;
    },

    getMappingName: function() {
        return this.mappingName;
    },

    setMappingName: function(mappingName) {
        this.mappingName = this.mappingName;
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

    getConcept: function() {
        return this.concept;
    },

    setConcept: function(concept) {
        this.concept = concept;
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

},{"../ext/Class":2}],195:[function(require,module,exports){
var Class = require('../ext/Class');

/**
 * Specification of a reference.
 *
 *
 */
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

module.exports = RefSpec;

},{"../ext/Class":2}],196:[function(require,module,exports){
var Class = require('../ext/Class');

var ObjectUtils = require('../util/ObjectUtils');

var Node = require('../rdf/node/Node');
var NodeFactory = require('../rdf/NodeFactory');

var Expr = require('../sparql/expr/Expr');
var ExprVar = require('../sparql/expr/ExprVar');
var NodeValue = require('../sparql/expr/NodeValue');

var AggLiteral = require('./agg/AggLiteral');
var AggObject = require('./agg/AggObject');
var AggMap = require('./agg/AggMap');
var AggCustomAgg = require('./agg/AggMap');
var AggRef = require('./agg/AggRef');

//var AccFactoryFn = require('./AccFactoryFn');

/**
 * A 'template' is a type of specification for an aggregator
 *
 */
var TemplateParser = Class.create({

    initialize: function() {
        this.attrs = {
            id: 'id',
            ref: 'ref',
        };
    },

    /**
     * An array can indicate each of the following meanings:
     *
     * - [ string ]
     *   If the argument is a string, we have an array of literals,
     *   whereas the string will be interpreted as an expression.
     *
     * - [ object ]
     *
     *   If the argument is an object, the following intepretation rules apply:
     *
     *   - If there is an 'id' attribute, we interpret it as an array of objects, with the id as the grouping key,
     *     and a subPattern corresponding to the object
     *   [{ id: '?s' }]
     *
     *   - If there is a 'ref' attribute, we intepret the object as a specification of a reference
     *
     *
     *   - If neither 'id' nor 'ref' is specified ...
     *   TODO i think then the object should be interpreted as some kind of *explicit* specification, wich 'id' and 'ref' variants being syntactic sugar for them
     *
     */
    parseArray: function(val) {

        if (val.length !== 1) {
            console.log('[ERROR] Arrays must have exactly one element that is either a string or an object', val);
            throw 'Bailing out';
        }

        var config = val[0];

        var result;
        if (ObjectUtils.isString(config)) {

            result = this.parseArrayLiteral(config);

        } else if (ObjectUtils.isObject(config)) {

            result = this.parseArrayConfig(config);

        } else {
            throw 'Bailing out';
        }

        return result;
    },

    parseArrayConfig: function(config) {

        var idAttr = this.attrs.id;
        var refAttr = this.attrs.ref;

        var hasId = config[idAttr] != null;
        var hasRef = config[refAttr] != null;

        if (hasId && hasRef) {
            console.log('[ERROR] id and ref are mutually exclusive');
            throw 'Bailing out';
        }

        var result;
        if (hasId) {

            var subPattern = this.parseObject(config);
            // console.log(config, JSON.stringify(subPattern));

            // Expects a AggLiteral
            var idPattern = subPattern.getPattern(idAttr);
            var idExpr = idPattern.getExpr();
            result = new AggMap(idExpr, subPattern, true);

        } else if (hasRef) {
            result = this.parseArrayRef(config);
        } else {
            console.log('[ERROR] Not implemented');
            throw 'Bailing out';
        }

        return result;
    },

    /**
     * Here we only keep track that we encountered a reference.
     * We cannot validate it here, as we lack information
     *
     *
     */
    parseArrayRef: function(config) {

        var result = new AggRef(config);
        return result;
    },

    parseArrayLiteral: function() {

    },

    parseLiteral: function(val) {
        var expr = this.parseExprString(val);

        var result = new AggLiteral(expr);
        return result;
    },

    /**
     * An object is an entity having a set of fields,
     * whereas fields can be of different types
     *
     */
    parseObject: function(val) {

        var attrToPattern = {};

        var self = this;
        val.forEach(function(v, attr) {
            var subPattern = self.parsePattern(v);

            attrToPattern[attr] = subPattern;
        });

        var result = new AggObject(attrToPattern);
        return result;
    },

//      parsePattern: function(fieldName, val) {
//          // if the value is an array, create an array field
//          // TODO An array field can be either an array of literals or of objects
//          // How to represent them?
//          // Maybe we could have Object and Literal Fields plus a flag whether these are arrays?
//          // So then we wouldn't have a dedicated arrayfield.
//          // if the value is an object, create an object reference field
//
//          // friends: ArrayField(
//      },
    parsePattern: function(val) {

        var result;

        if (ObjectUtils.isString(val)) {
            result = this.parseLiteral(val);
        } else if (ObjectUtils.isArray(val)) {
            result = this.parseArray(val);
        } else if (ObjectUtils.isFunction(val)) {
            throw new Error('Implement this case');
            //result = new AggCustomAgg(new AccFactoryFn(val));
        } else if (val instanceof Node && val.isVariable()) {
            var expr = new ExprVar(val);
            result = new AggLiteral(expr);
        } else if (val instanceof Expr) {
            result = new AggLiteral(val);
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
            throw 'Unkown item type';
        }

        return result;
    },

    parseExpr: function(obj) {
        var result;

        if (ObjectUtils.isString(obj)) {
            result = this.parseExprString(obj);
        }

        return result;
    },

    parseExprString: function(str) {
        var result;

        if (str.charAt(0) === '?') {
            var varName = str.substr(1);
            var v = NodeFactory.createVar(varName);
            result = new ExprVar(v);

        } else {
            result = NodeValue.makeString(str);
            // TODO: This must be a node value
            // result = sparql.Node.plainLit(str);
        }

        // TODO Handle special strings, such as ?\tag

        // console.log('Parsed', str, 'to', result);

        return result;
    },

});

module.exports = TemplateParser;

},{"../ext/Class":2,"../rdf/NodeFactory":32,"../rdf/node/Node":44,"../sparql/expr/Expr":168,"../sparql/expr/ExprVar":176,"../sparql/expr/NodeValue":177,"../util/ObjectUtils":225,"./agg/AggLiteral":209,"./agg/AggMap":210,"./agg/AggObject":211,"./agg/AggRef":212}],197:[function(require,module,exports){
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

},{"../../ext/Class":2}],198:[function(require,module,exports){
var Class = require('../../ext/Class');

var BindingMapperIndex = require('../binding_mapper/BindingMapperIndex');
var Acc = require('./Acc');

var AccFn = Class.create(Acc, {
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
           result[i] = v;
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

module.exports = AccFn;

},{"../../ext/Class":2,"../binding_mapper/BindingMapperIndex":216,"./Acc":197}],199:[function(require,module,exports){
var Class = require('../../ext/Class');

var NodeUtils = require('../../rdf/NodeUtils');
var Acc = require('./Acc');


// zip - but only for two arrays
var zip = function(a, b) {
    var result = [];

    var n = Math.max(a.length, b.length);

    for(var i = 0; i < n; ++i) {
        var item = [a[i], b[i]];
        result.push(i);
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
    
// TODO Move to utils
// TODO Make configurable
var extractLabelFromUri = function(str) {
    var a = str.lastIndexOf('#');
    var b = str.lastIndexOf('/');
    
    var i = Math.max(a, b);

    var result = (i === str.length) ? str : str.substring(i + 1); 

    if(result === '') {
        result = str; // Rather show the URI than an empty string
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

},{"../../ext/Class":2,"../../rdf/NodeUtils":33,"./Acc":197}],200:[function(require,module,exports){
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
        
        if(this.value != null && !ObjectUtils.isEqual(this.value, newValue)) {
            console.log('[WARN] Reassigned value: Original', this.value, ' New: ', newValue);
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

},{"../../ext/Class":2,"../../util/ObjectUtils":225,"./Acc":197}],201:[function(require,module,exports){
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

    accumulate: function(binding) {
        var k = this.keyBindingMapper.map(binding, 0);

        var subAcc = this.state.get(k);
        if(!subAcc) {
            subAcc = this.subAgg.createAcc();
            this.state.put(k, subAcc);
        }
        
        subAcc.accumulate(binding);
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
        var result = [];

        var entries = this.state.entries();
        entries.forEach(function(acc, k) {
            result.push(acc);
        });

        return result;
    },

});

module.exports = AccMap;

},{"../../ext/Class":2,"../../util/collection/HashMap":233,"./Acc":197}],202:[function(require,module,exports){
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

},{"../../ext/Class":2,"./Acc":197,"lodash.foreach":324}],203:[function(require,module,exports){
var Class = require('../../ext/Class');

var Acc = require('./Acc');

var AccRef = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccRef',

    initialize: function(subAcc, refSpec) {
        this.subAcc = subAcc;
        this.refSpec = refSpec;
        
        this.value = null;
    },

    accumulate: function(binding) {
        this.subAcc.accumulate(binding);
    },

    getValue: function() {
        return this.json;
    },

    // The sponate system takes care of resolving references
    setValue: function(value) {
        this.value = value;
    },
});

module.exports = AccRef;

},{"../../ext/Class":2,"./Acc":197}],204:[function(require,module,exports){
var Class = require('../../ext/Class');

var Acc = require('./Acc');

var AccTransform = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccTransform',

    initialize: function(subAcc, fn) {
        this.subAcc = subAcc;
        this.fn = fn;
    },

    accumulate: function(binding) {
        this.subAcc.accumulate(binding);
    },

    getValue: function() {
        var v = this.subAcc.getValue();
        var result = this.fn(v);
        return result;
    },

});

module.exports = AccTransform;

},{"../../ext/Class":2,"./Acc":197}],205:[function(require,module,exports){
var Class = require('../../ext/Class');

var Agg = Class.create({
    classLabel: 'jassa.sponate.Agg',

    createAcc: function() {
        throw new Error('override me');
    },

    getSubAggs: function() {
        throw new Error('override me');
    },

});

module.exports = Agg;

},{"../../ext/Class":2}],206:[function(require,module,exports){
var Class = require('../../ext/Class');

var Agg = require('./Agg');
var AccArray = require('../acc/AccArray');


var AggArray = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggArray',

    initialize: function(subAgg, indexBindingMapper) {
        this.subAgg = subAgg;
        this.indexBindingMapper = indexBindingMapper;
    },

    createAcc: function() {
        var result = new AccArray(this.subAgg, this.indexBindingMapper);
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

    toString: function() {
        return this.expr.toString();
    },

});

module.exports = AggArray;

},{"../../ext/Class":2,"../acc/AccArray":198,"./Agg":205}],207:[function(require,module,exports){
var union = require('lodash.union');

var Class = require('../../ext/Class');
var Agg = require('./Agg');
var AccBestLiteral = require('../acc/AccBestLabel');


var AggBestLabel = Class.create(Agg, {
    initialize: function(bestLiteralConfig) {
        this.bestLiteralConfig = bestLiteralConfig;
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


},{"../../ext/Class":2,"../acc/AccBestLabel":199,"./Agg":205,"lodash.union":387}],208:[function(require,module,exports){
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

},{"../../ext/Class":2,"./Agg":205}],209:[function(require,module,exports){
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

    getSubAggs: function() {
        return [];
    },

    createAcc: function() {
        var result = new AccLiteral(this.bindingMapper);
        return result;
    },

});

module.exports = AggLiteral;

},{"../../ext/Class":2,"../acc/AccLiteral":200,"./Agg":205}],210:[function(require,module,exports){
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

},{"../../ext/Class":2,"../acc/AccMap":201,"./Agg":205}],211:[function(require,module,exports){
var forEach = require('lodash.foreach');

var Class = require('../../ext/Class');

var Agg = require('./Agg');
var AccObject = require('../acc/AccObject');

/**
 * An aggregator for a map from *predefined* keys to aggregators.
 */
var AggObject = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggObject',

    initialize: function(attrToAggr) {
        this.attrToAggr = attrToAggr;
    },

    getMembers: function() {
        return this.attrToAggr;
    },

    createAcc: function() {
        var attrToAcc = {};

        forEach(this.attrToAggr, function(aggr, attr) {
            var acc = aggr.createAcc();
            attrToAcc[attr] = acc;
        });

        var result = new AccObject(attrToAcc);
        return result;

    },

    getSubAggs: function() {
        var result = [];

        forEach(this.attrToAggr, function(member) {
            result.push(member);
        });

        return result;
    },

    toString: function() {
        var parts = [];
        this.attrToPattern.forEach(function(v, k) {
            parts.push('"' + k + '": ' + v);
        });

        var result = '{' + parts.join(',') + '}';
        return result;
    },

});

module.exports = AggObject;

},{"../../ext/Class":2,"../acc/AccObject":202,"./Agg":205,"lodash.foreach":324}],212:[function(require,module,exports){
var Class = require('../../ext/Class');

var NodeFactory = require('../../rdf/NodeFactory');

var AccRef = require('../acc/AccRef');
var Agg = require('./Agg');

var AggRef = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggRef',

    /**
     * The subAgg aggregates the IDs of the objects to be referenced
     */
    initialize: function(subAgg, refSpec) {
        this.subAgg = subAgg;
        this.refSpec = refSpec;
    },

    getRefSpec: function() {
        return this.refSpec;
    },

    getSubAggs: function() {
        return [];
    },

    createAcc: function() {
        var result = new AccRef(this.subAgg, this.refSpec);
        return result;
    },

    toString: function() {
        return JSON.stringify(this);
    },

});

module.exports = AggRef;

},{"../../ext/Class":2,"../../rdf/NodeFactory":32,"../acc/AccRef":203,"./Agg":205}],213:[function(require,module,exports){
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

},{"../../ext/Class":2,"../../rdf/NodeFactory":32,"../acc/AccTransform":204,"./Agg":205}],214:[function(require,module,exports){
var Class = require('../../ext/Class');

var BindingMapper = Class.create({
    map: function(binding, rowId) {
        throw new Error('Not overridden');
    }
});

module.exports = BindingMapper;

},{"../../ext/Class":2}],215:[function(require,module,exports){
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

    map: function(binding, rowId) {
        var nv = this.expr.eval(binding);
        var result = nv.asNode();
        return result;
    },

});

module.exports = BindingMapperExpr;

},{"../../ext/Class":2,"./BindingMapper":214}],216:[function(require,module,exports){
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

},{"../../ext/Class":2,"./BindingMapper":214}],217:[function(require,module,exports){
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

},{"../../ext/Class":2,"./BindingMapper":214}],218:[function(require,module,exports){
'use strict';

var ns = {
    AccUtils: require('./AccUtils'),
    AttrPath: require('./AttrPath'),
    LookupServiceUtils: require('./LookupServiceUtils'),
    MappedConcept: require('./MappedConcept'),
    MappedConceptUtils: require('./MappedConceptUtils'),
    MappingRef: require('./MappingRef'),
    Query: require('./Query'),
    RefSpec: require('./RefSpec'),
    TemplateParser: require('./TemplateParser'),
    Acc: require('./acc/Acc'),
    AccArray: require('./acc/AccArray'),
    AccBestLabel: require('./acc/AccBestLabel'),
    AccLiteral: require('./acc/AccLiteral'),
    AccMap: require('./acc/AccMap'),
    AccObject: require('./acc/AccObject'),
    AccRef: require('./acc/AccRef'),
    AccTransform: require('./acc/AccTransform'),
    Agg: require('./agg/Agg'),
    AggArray: require('./agg/AggArray'),
    AggBestLabel: require('./agg/AggBestLabel'),
    AggCustomAcc: require('./agg/AggCustomAcc'),
    AggLiteral: require('./agg/AggLiteral'),
    AggMap: require('./agg/AggMap'),
    AggObject: require('./agg/AggObject'),
    AggRef: require('./agg/AggRef'),
    AggTransform: require('./agg/AggTransform'),
    BindingMapper: require('./binding_mapper/BindingMapper'),
    BindingMapperExpr: require('./binding_mapper/BindingMapperExpr'),
    BindingMapperIndex: require('./binding_mapper/BindingMapperIndex'),
    BindingMapperTransform: require('./binding_mapper/BindingMapperTransform'),
};

Object.freeze(ns);

module.exports = ns;

},{"./AccUtils":188,"./AttrPath":189,"./LookupServiceUtils":190,"./MappedConcept":191,"./MappedConceptUtils":192,"./MappingRef":193,"./Query":194,"./RefSpec":195,"./TemplateParser":196,"./acc/Acc":197,"./acc/AccArray":198,"./acc/AccBestLabel":199,"./acc/AccLiteral":200,"./acc/AccMap":201,"./acc/AccObject":202,"./acc/AccRef":203,"./acc/AccTransform":204,"./agg/Agg":205,"./agg/AggArray":206,"./agg/AggBestLabel":207,"./agg/AggCustomAcc":208,"./agg/AggLiteral":209,"./agg/AggMap":210,"./agg/AggObject":211,"./agg/AggRef":212,"./agg/AggTransform":213,"./binding_mapper/BindingMapper":214,"./binding_mapper/BindingMapperExpr":215,"./binding_mapper/BindingMapperIndex":216,"./binding_mapper/BindingMapperTransform":217}],219:[function(require,module,exports){
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

    removeIndexes: function(arr, indexes) {
        var tmp = this.copyWithoutIndexes(arr, indexes);
        this.replace(arr, tmp);
        return arr;
    },

    removeByGrep: function(arr, fnPredicate) {
        var indexes = this.grep(arr, fnPredicate);
        this.removeIndexes(arr, indexes);
    },
};

module.exports = ArrayUtils;

},{"./ObjectUtils":225}],220:[function(require,module,exports){
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
    },
};

module.exports = CollectionUtils;

},{}],221:[function(require,module,exports){
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
    },
};

module.exports = JsonUtils;

},{"../ext/JSONCanonical":3}],222:[function(require,module,exports){
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
    },
};

module.exports = MapUtils;

},{"./ObjectUtils":225,"./collection/HashMap":233}],223:[function(require,module,exports){
var MultiMapUtils = {
    get: function(obj, key) {
        return (key in obj) ? obj[key] : [];
    },

    put: function(obj, key, val) {
        var values;

        if (key in obj) {
            values = obj[key];
        } else {
            values = [];
            obj[key] = values;
        }

        values.push(val);
    },

    clear: function(obj) {
        var keys = Object.keys(obj);
        keys.forEach(function(key) {
            delete obj[key];
        });
    },
};

module.exports = MultiMapUtils;

},{}],224:[function(require,module,exports){
var Class = require('../ext/Class');
var flatten = require('lodash.flatten');

/**
 * Note: this is a read only collection
 *
 */
var NestedList = Class.create({
    classLabel: 'jassa.util.NestedList',
    initialize: function() {
        this.subLists = [];
    },

    /**
     * Returns an array with the concatenation of all items
     */
    getArray: function() {
        // tmp is an array of arrays
        var tmp = this.subLists.forEach(function(subList) {
            return subList.getArray();
        });

        var result = flatten(tmp, true);

        return result;
    },

    contains: function(item) {
        var found = this.subLists.find(function(subList) {
            var r = subList.contains(item);
            return r;
        });

        var result = Boolean(found);
        return result;
    },
});

module.exports = NestedList;

},{"../ext/Class":2,"lodash.flatten":255}],225:[function(require,module,exports){
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
        return Object.toString.call(obj) === '[object String]';
    },

    extend: function(obj, source) {
        var prop;
        for (prop in source) {
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

                if (fnHashCode) {
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
    },
};

ObjectUtils.defaultHashFnNames = [
    'hashCode',
];

module.exports = ObjectUtils;

},{"./JsonUtils":221,"lodash.isequal":354}],226:[function(require,module,exports){
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
    },
});

module.exports = SerializationContext;

},{"../ext/Class":2,"./ObjectUtils":225,"./collection/HashMap":233}],227:[function(require,module,exports){
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
                console.log('Failed to serialize instance without class label', obj);
                throw 'Failed to serialize instance without class label';
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
            throw 'Deserialization error';
        }

        var attrs = state.attrs;
        // var items = state.items;
        var classLabel = state.classLabel;
        var length = state.length;

        if (classLabel) {
            var ClassFn = this.getClassForLabel(classLabel);

            if (!ClassFn) {
                throw 'Unknown class label encountered in deserialization: ' + classLabel;
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

},{"../ext/Class":2,"./ObjectUtils":225,"./SerializationContext":226}],228:[function(require,module,exports){
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
    },

};

module.exports = StringUtils;

},{"lodash.uniq":410}],229:[function(require,module,exports){
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
    },
};

module.exports = TreeUtils;

},{}],230:[function(require,module,exports){
var Class = require('../../ext/Class');
var ObjectUtils = require('../ObjectUtils');

var ArrayList = Class.create({
    initialize: function(fnEquals) {
        this.items = [];
        this.fnEquals = fnEquals || ObjectUtils.equals;
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
    },
});

module.exports = ArrayList;

},{"../../ext/Class":2,"../ObjectUtils":225}],231:[function(require,module,exports){
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
    },
});

module.exports = Entry;

},{"../../ext/Class":2}],232:[function(require,module,exports){
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
        this.inverse.forward.remove(priorVal);
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
        var result = this.forward.keyList();
        return result;
    },
});

module.exports = HashBidiMap;

},{"../../ext/Class":2,"./HashMap":233}],233:[function(require,module,exports){
var forEach = require('lodash.foreach');
var Class = require('../../ext/Class');
var ObjectUtils = require('./../ObjectUtils');

var HashMap = Class.create({
    initialize: function(fnEquals, fnHash) {

        this.fnEquals = fnEquals ? fnEquals : ObjectUtils.isEqual;
        this.fnHash = fnHash ? fnHash : ObjectUtils.hashCode;

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

    keyList: function() {
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
});

module.exports = HashMap;

},{"../../ext/Class":2,"./../ObjectUtils":225,"lodash.foreach":324}],234:[function(require,module,exports){
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

    toString: function() {
        var entries = this.entries();
        var result = '{' + entries.join(', ') + '}';
        return result;
    },
});

module.exports = HashSet;

},{"../../ext/Class":2,"./HashMap":233}],235:[function(require,module,exports){
var Class = require('../../ext/Class');

var Iterator = Class.create({
    next: function() {
        throw 'Not overridden';
    },
    hasNext: function() {
        throw 'Not overridden';
    },
});

module.exports = Iterator;

},{"../../ext/Class":2}],236:[function(require,module,exports){
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
            throw 'No more elments';
        }

        if (this.advance) {
            this.$prefetch();
        }

        this.advance = true;
        return this.current;
    },

    prefetch: function() {
        throw 'Not overridden';
    },
});

module.exports = IteratorAbstract;

},{"../../ext/Class":2,"./Iterator":235}],237:[function(require,module,exports){
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
    },
});

module.exports = IteratorArray;

},{"../../ext/Class":2,"./Iterator":235}],238:[function(require,module,exports){
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
            throw 'Key ' + v + ' already inserted';
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
                val: value,
            };
            return r;
        });

        return result;
    },

    remove: function(key) {
        console.log(key);
        throw 'Implement me';
        /*
        var keys = this.keys;
        for(var i = 0; i < keys.length; ++i) {

        }

        this.map.remove(key);
        */
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
    },
});

module.exports = ListMap;

},{"../../ext/Class":2,"./HashMap":233}],239:[function(require,module,exports){
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
        keys.forEach(function(key) {
            delete this.entries[key];
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
    },
});

module.exports = MultiMapObjectArray;

},{"../../ext/Class":2}],240:[function(require,module,exports){
var Class = require('../../ext/Class');

/**
 * A map that just wraps a json object
 * Just there to provide a unified map interface
 */
var ObjectMap = Class.create({
    initialize: function(data) {
        this.data = data ? data : {};
    },

    get: function(key) {
        return this.data[key];
    },

    put: function(key, val) {
        this.data[key] = val;
    },

    remove: function(key) {
        delete this.data[key];
    },

    entries: function() {
        throw 'Not implemented';
    },

    toString: function() {
        return JSON.stringify(this.data);
    },
});

module.exports = ObjectMap;

},{"../../ext/Class":2}],241:[function(require,module,exports){
'use strict';

var ns = {
    ArrayUtils: require('./ArrayUtils'),
    CollectionUtils: require('./CollectionUtils'),
    JsonUtils: require('./JsonUtils'),
    MapUtils: require('./MapUtils'),
    MultiMapUtils: require('./MultiMapUtils'),
    NestedList: require('./NestedList'),
    ObjectUtils: require('./ObjectUtils'),
    SerializationContext: require('./SerializationContext'),
    Serializer: require('./Serializer'),
    StringUtils: require('./StringUtils'),
    TreeUtils: require('./TreeUtils'),
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
    ObjectMap: require('./collection/ObjectMap'),
};

Object.freeze(ns);

module.exports = ns;

},{"./ArrayUtils":219,"./CollectionUtils":220,"./JsonUtils":221,"./MapUtils":222,"./MultiMapUtils":223,"./NestedList":224,"./ObjectUtils":225,"./SerializationContext":226,"./Serializer":227,"./StringUtils":228,"./TreeUtils":229,"./collection/ArrayList":230,"./collection/Entry":231,"./collection/HashBidiMap":232,"./collection/HashMap":233,"./collection/HashSet":234,"./collection/Iterator":235,"./collection/IteratorAbstract":236,"./collection/IteratorArray":237,"./collection/ListMap":238,"./collection/MultiMapObjectArray":239,"./collection/ObjectMap":240,"./shared":242}],242:[function(require,module,exports){
var shared = {
    Promise: null,
    ajax: function() {
        throw new Error('not set!');
    },
};

module.exports = shared;

},{}],243:[function(require,module,exports){
var vocab = {
    xsd: require('./xsd'),
    rdf: require('./rdf'),
    rdfs: require('./rdfs'),
    owl: require('./owl'),
    wgs84: require('./wgs84'),
};

module.exports = vocab;

},{"./owl":244,"./rdf":245,"./rdfs":246,"./wgs84":247,"./xsd":248}],244:[function(require,module,exports){
var NodeFactory = require('../rdf/NodeFactory');
var p = 'http://www.w3.org/2002/07/owl#';

var ns = {
    Class: NodeFactory.createUri(p + 'Class'),
    DatatypeProperty: NodeFactory.createUri(p + 'DatatypeProperty'),
    ObjectProperty: NodeFactory.createUri(p + 'ObjectProperty'),
    AnnotationProperty: NodeFactory.createUri(p + 'AnnotationProperty'),
};

module.exports = ns;

},{"../rdf/NodeFactory":32}],245:[function(require,module,exports){
var NodeFactory = require('../rdf/NodeFactory');
var p = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

var ns = {
    type: NodeFactory.createUri(p + 'type'),
    Property: NodeFactory.createUri(p + 'Property'),
};

module.exports = ns;

},{"../rdf/NodeFactory":32}],246:[function(require,module,exports){
var NodeFactory = require('../rdf/NodeFactory');
var p = 'http://www.w3.org/2000/01/rdf-schema#';

var ns = {
    label: NodeFactory.createUri(p + 'label'),
    subClassOf: NodeFactory.createUri(p + 'subClassOf'),
};

module.exports = ns;

},{"../rdf/NodeFactory":32}],247:[function(require,module,exports){
var NodeFactory = require('../rdf/NodeFactory');
var p = 'http://www.w3.org/2003/01/geo/wgs84_pos#';

// String versions
var ns = {
    lon: NodeFactory.createUri(p + 'long'),
    lat: NodeFactory.createUri(p + 'lat'),
};

module.exports = ns;

},{"../rdf/NodeFactory":32}],248:[function(require,module,exports){
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

},{"../rdf/node/Node_Uri":49}],249:[function(require,module,exports){
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

},{"lodash._objecttypes":250,"lodash.keys":251}],250:[function(require,module,exports){
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

},{}],251:[function(require,module,exports){
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

},{"lodash._isnative":252,"lodash._shimkeys":253,"lodash.isobject":254}],252:[function(require,module,exports){
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

},{}],253:[function(require,module,exports){
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

},{"lodash._objecttypes":250}],254:[function(require,module,exports){
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

},{"lodash._objecttypes":250}],255:[function(require,module,exports){
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

},{"lodash._baseflatten":256,"lodash.map":260}],256:[function(require,module,exports){
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

},{"lodash.isarguments":257,"lodash.isarray":258}],257:[function(require,module,exports){
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

},{}],258:[function(require,module,exports){
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

},{"lodash._isnative":259}],259:[function(require,module,exports){
module.exports=require(252)
},{}],260:[function(require,module,exports){
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

},{"lodash.createcallback":261,"lodash.forown":297}],261:[function(require,module,exports){
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

},{"lodash._basecreatecallback":262,"lodash._baseisequal":281,"lodash.isobject":290,"lodash.keys":292,"lodash.property":296}],262:[function(require,module,exports){
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

},{"lodash._setbinddata":263,"lodash.bind":266,"lodash.identity":278,"lodash.support":279}],263:[function(require,module,exports){
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

},{"lodash._isnative":264,"lodash.noop":265}],264:[function(require,module,exports){
module.exports=require(252)
},{}],265:[function(require,module,exports){
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

},{}],266:[function(require,module,exports){
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

},{"lodash._createwrapper":267,"lodash._slice":277}],267:[function(require,module,exports){
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

},{"lodash._basebind":268,"lodash._basecreatewrapper":272,"lodash._slice":277,"lodash.isfunction":276}],268:[function(require,module,exports){
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

},{"lodash._basecreate":269,"lodash._setbinddata":263,"lodash._slice":277,"lodash.isobject":290}],269:[function(require,module,exports){
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
},{"lodash._isnative":270,"lodash.isobject":290,"lodash.noop":271}],270:[function(require,module,exports){
module.exports=require(252)
},{}],271:[function(require,module,exports){
module.exports=require(265)
},{}],272:[function(require,module,exports){
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

},{"lodash._basecreate":273,"lodash._setbinddata":263,"lodash._slice":277,"lodash.isobject":290}],273:[function(require,module,exports){
module.exports=require(269)
},{"lodash._isnative":274,"lodash.isobject":290,"lodash.noop":275}],274:[function(require,module,exports){
module.exports=require(252)
},{}],275:[function(require,module,exports){
module.exports=require(265)
},{}],276:[function(require,module,exports){
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

},{}],277:[function(require,module,exports){
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

},{}],278:[function(require,module,exports){
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

},{}],279:[function(require,module,exports){
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
},{"lodash._isnative":280}],280:[function(require,module,exports){
module.exports=require(252)
},{}],281:[function(require,module,exports){
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

},{"lodash._getarray":282,"lodash._objecttypes":284,"lodash._releasearray":285,"lodash.forin":288,"lodash.isfunction":289}],282:[function(require,module,exports){
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

},{"lodash._arraypool":283}],283:[function(require,module,exports){
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

},{}],284:[function(require,module,exports){
module.exports=require(250)
},{}],285:[function(require,module,exports){
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

},{"lodash._arraypool":286,"lodash._maxpoolsize":287}],286:[function(require,module,exports){
module.exports=require(283)
},{}],287:[function(require,module,exports){
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

},{}],288:[function(require,module,exports){
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

},{"lodash._basecreatecallback":262,"lodash._objecttypes":284}],289:[function(require,module,exports){
module.exports=require(276)
},{}],290:[function(require,module,exports){
module.exports=require(254)
},{"lodash._objecttypes":291}],291:[function(require,module,exports){
module.exports=require(250)
},{}],292:[function(require,module,exports){
module.exports=require(251)
},{"lodash._isnative":293,"lodash._shimkeys":294,"lodash.isobject":290}],293:[function(require,module,exports){
module.exports=require(252)
},{}],294:[function(require,module,exports){
module.exports=require(253)
},{"lodash._objecttypes":295}],295:[function(require,module,exports){
module.exports=require(250)
},{}],296:[function(require,module,exports){
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

},{}],297:[function(require,module,exports){
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

},{"lodash._basecreatecallback":298,"lodash._objecttypes":319,"lodash.keys":320}],298:[function(require,module,exports){
module.exports=require(262)
},{"lodash._setbinddata":299,"lodash.bind":302,"lodash.identity":316,"lodash.support":317}],299:[function(require,module,exports){
module.exports=require(263)
},{"lodash._isnative":300,"lodash.noop":301}],300:[function(require,module,exports){
module.exports=require(252)
},{}],301:[function(require,module,exports){
module.exports=require(265)
},{}],302:[function(require,module,exports){
module.exports=require(266)
},{"lodash._createwrapper":303,"lodash._slice":315}],303:[function(require,module,exports){
module.exports=require(267)
},{"lodash._basebind":304,"lodash._basecreatewrapper":309,"lodash._slice":315,"lodash.isfunction":314}],304:[function(require,module,exports){
module.exports=require(268)
},{"lodash._basecreate":305,"lodash._setbinddata":299,"lodash._slice":315,"lodash.isobject":308}],305:[function(require,module,exports){
module.exports=require(269)
},{"lodash._isnative":306,"lodash.isobject":308,"lodash.noop":307}],306:[function(require,module,exports){
module.exports=require(252)
},{}],307:[function(require,module,exports){
module.exports=require(265)
},{}],308:[function(require,module,exports){
module.exports=require(254)
},{"lodash._objecttypes":319}],309:[function(require,module,exports){
module.exports=require(272)
},{"lodash._basecreate":310,"lodash._setbinddata":299,"lodash._slice":315,"lodash.isobject":313}],310:[function(require,module,exports){
module.exports=require(269)
},{"lodash._isnative":311,"lodash.isobject":313,"lodash.noop":312}],311:[function(require,module,exports){
module.exports=require(252)
},{}],312:[function(require,module,exports){
module.exports=require(265)
},{}],313:[function(require,module,exports){
module.exports=require(254)
},{"lodash._objecttypes":319}],314:[function(require,module,exports){
module.exports=require(276)
},{}],315:[function(require,module,exports){
module.exports=require(277)
},{}],316:[function(require,module,exports){
module.exports=require(278)
},{}],317:[function(require,module,exports){
module.exports=require(279)
},{"lodash._isnative":318}],318:[function(require,module,exports){
module.exports=require(252)
},{}],319:[function(require,module,exports){
module.exports=require(250)
},{}],320:[function(require,module,exports){
module.exports=require(251)
},{"lodash._isnative":321,"lodash._shimkeys":322,"lodash.isobject":323}],321:[function(require,module,exports){
module.exports=require(252)
},{}],322:[function(require,module,exports){
module.exports=require(253)
},{"lodash._objecttypes":319}],323:[function(require,module,exports){
module.exports=require(254)
},{"lodash._objecttypes":319}],324:[function(require,module,exports){
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

},{"lodash._basecreatecallback":325,"lodash.forown":348}],325:[function(require,module,exports){
module.exports=require(262)
},{"lodash._setbinddata":326,"lodash.bind":329,"lodash.identity":345,"lodash.support":346}],326:[function(require,module,exports){
module.exports=require(263)
},{"lodash._isnative":327,"lodash.noop":328}],327:[function(require,module,exports){
module.exports=require(252)
},{}],328:[function(require,module,exports){
module.exports=require(265)
},{}],329:[function(require,module,exports){
module.exports=require(266)
},{"lodash._createwrapper":330,"lodash._slice":344}],330:[function(require,module,exports){
module.exports=require(267)
},{"lodash._basebind":331,"lodash._basecreatewrapper":337,"lodash._slice":344,"lodash.isfunction":343}],331:[function(require,module,exports){
module.exports=require(268)
},{"lodash._basecreate":332,"lodash._setbinddata":326,"lodash._slice":344,"lodash.isobject":335}],332:[function(require,module,exports){
module.exports=require(269)
},{"lodash._isnative":333,"lodash.isobject":335,"lodash.noop":334}],333:[function(require,module,exports){
module.exports=require(252)
},{}],334:[function(require,module,exports){
module.exports=require(265)
},{}],335:[function(require,module,exports){
module.exports=require(254)
},{"lodash._objecttypes":336}],336:[function(require,module,exports){
module.exports=require(250)
},{}],337:[function(require,module,exports){
module.exports=require(272)
},{"lodash._basecreate":338,"lodash._setbinddata":326,"lodash._slice":344,"lodash.isobject":341}],338:[function(require,module,exports){
module.exports=require(269)
},{"lodash._isnative":339,"lodash.isobject":341,"lodash.noop":340}],339:[function(require,module,exports){
module.exports=require(252)
},{}],340:[function(require,module,exports){
module.exports=require(265)
},{}],341:[function(require,module,exports){
module.exports=require(254)
},{"lodash._objecttypes":342}],342:[function(require,module,exports){
module.exports=require(250)
},{}],343:[function(require,module,exports){
module.exports=require(276)
},{}],344:[function(require,module,exports){
module.exports=require(277)
},{}],345:[function(require,module,exports){
module.exports=require(278)
},{}],346:[function(require,module,exports){
module.exports=require(279)
},{"lodash._isnative":347}],347:[function(require,module,exports){
module.exports=require(252)
},{}],348:[function(require,module,exports){
module.exports=require(297)
},{"lodash._basecreatecallback":325,"lodash._objecttypes":349,"lodash.keys":350}],349:[function(require,module,exports){
module.exports=require(250)
},{}],350:[function(require,module,exports){
module.exports=require(251)
},{"lodash._isnative":351,"lodash._shimkeys":352,"lodash.isobject":353}],351:[function(require,module,exports){
module.exports=require(252)
},{}],352:[function(require,module,exports){
module.exports=require(253)
},{"lodash._objecttypes":349}],353:[function(require,module,exports){
module.exports=require(254)
},{"lodash._objecttypes":349}],354:[function(require,module,exports){
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

},{"lodash._basecreatecallback":355,"lodash._baseisequal":378}],355:[function(require,module,exports){
module.exports=require(262)
},{"lodash._setbinddata":356,"lodash.bind":359,"lodash.identity":375,"lodash.support":376}],356:[function(require,module,exports){
module.exports=require(263)
},{"lodash._isnative":357,"lodash.noop":358}],357:[function(require,module,exports){
module.exports=require(252)
},{}],358:[function(require,module,exports){
module.exports=require(265)
},{}],359:[function(require,module,exports){
module.exports=require(266)
},{"lodash._createwrapper":360,"lodash._slice":374}],360:[function(require,module,exports){
module.exports=require(267)
},{"lodash._basebind":361,"lodash._basecreatewrapper":367,"lodash._slice":374,"lodash.isfunction":373}],361:[function(require,module,exports){
module.exports=require(268)
},{"lodash._basecreate":362,"lodash._setbinddata":356,"lodash._slice":374,"lodash.isobject":365}],362:[function(require,module,exports){
module.exports=require(269)
},{"lodash._isnative":363,"lodash.isobject":365,"lodash.noop":364}],363:[function(require,module,exports){
module.exports=require(252)
},{}],364:[function(require,module,exports){
module.exports=require(265)
},{}],365:[function(require,module,exports){
module.exports=require(254)
},{"lodash._objecttypes":366}],366:[function(require,module,exports){
module.exports=require(250)
},{}],367:[function(require,module,exports){
module.exports=require(272)
},{"lodash._basecreate":368,"lodash._setbinddata":356,"lodash._slice":374,"lodash.isobject":371}],368:[function(require,module,exports){
module.exports=require(269)
},{"lodash._isnative":369,"lodash.isobject":371,"lodash.noop":370}],369:[function(require,module,exports){
module.exports=require(252)
},{}],370:[function(require,module,exports){
module.exports=require(265)
},{}],371:[function(require,module,exports){
module.exports=require(254)
},{"lodash._objecttypes":372}],372:[function(require,module,exports){
module.exports=require(250)
},{}],373:[function(require,module,exports){
module.exports=require(276)
},{}],374:[function(require,module,exports){
module.exports=require(277)
},{}],375:[function(require,module,exports){
module.exports=require(278)
},{}],376:[function(require,module,exports){
module.exports=require(279)
},{"lodash._isnative":377}],377:[function(require,module,exports){
module.exports=require(252)
},{}],378:[function(require,module,exports){
module.exports=require(281)
},{"lodash._getarray":379,"lodash._objecttypes":381,"lodash._releasearray":382,"lodash.forin":385,"lodash.isfunction":386}],379:[function(require,module,exports){
module.exports=require(282)
},{"lodash._arraypool":380}],380:[function(require,module,exports){
module.exports=require(283)
},{}],381:[function(require,module,exports){
module.exports=require(250)
},{}],382:[function(require,module,exports){
module.exports=require(285)
},{"lodash._arraypool":383,"lodash._maxpoolsize":384}],383:[function(require,module,exports){
module.exports=require(283)
},{}],384:[function(require,module,exports){
module.exports=require(287)
},{}],385:[function(require,module,exports){
module.exports=require(288)
},{"lodash._basecreatecallback":355,"lodash._objecttypes":381}],386:[function(require,module,exports){
module.exports=require(276)
},{}],387:[function(require,module,exports){
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

},{"lodash._baseflatten":388,"lodash._baseuniq":392}],388:[function(require,module,exports){
module.exports=require(256)
},{"lodash.isarguments":389,"lodash.isarray":390}],389:[function(require,module,exports){
module.exports=require(257)
},{}],390:[function(require,module,exports){
module.exports=require(258)
},{"lodash._isnative":391}],391:[function(require,module,exports){
module.exports=require(252)
},{}],392:[function(require,module,exports){
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

},{"lodash._baseindexof":393,"lodash._cacheindexof":394,"lodash._createcache":396,"lodash._getarray":401,"lodash._largearraysize":403,"lodash._releasearray":404,"lodash._releaseobject":407}],393:[function(require,module,exports){
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

},{}],394:[function(require,module,exports){
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

},{"lodash._baseindexof":393,"lodash._keyprefix":395}],395:[function(require,module,exports){
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

},{}],396:[function(require,module,exports){
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

},{"lodash._cachepush":397,"lodash._getobject":399,"lodash._releaseobject":407}],397:[function(require,module,exports){
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

},{"lodash._keyprefix":398}],398:[function(require,module,exports){
module.exports=require(395)
},{}],399:[function(require,module,exports){
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

},{"lodash._objectpool":400}],400:[function(require,module,exports){
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

},{}],401:[function(require,module,exports){
module.exports=require(282)
},{"lodash._arraypool":402}],402:[function(require,module,exports){
module.exports=require(283)
},{}],403:[function(require,module,exports){
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

},{}],404:[function(require,module,exports){
module.exports=require(285)
},{"lodash._arraypool":405,"lodash._maxpoolsize":406}],405:[function(require,module,exports){
module.exports=require(283)
},{}],406:[function(require,module,exports){
module.exports=require(287)
},{}],407:[function(require,module,exports){
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

},{"lodash._maxpoolsize":408,"lodash._objectpool":409}],408:[function(require,module,exports){
module.exports=require(287)
},{}],409:[function(require,module,exports){
module.exports=require(400)
},{}],410:[function(require,module,exports){
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

},{"lodash._baseuniq":411,"lodash.createcallback":429}],411:[function(require,module,exports){
module.exports=require(392)
},{"lodash._baseindexof":412,"lodash._cacheindexof":413,"lodash._createcache":415,"lodash._getarray":420,"lodash._largearraysize":422,"lodash._releasearray":423,"lodash._releaseobject":426}],412:[function(require,module,exports){
module.exports=require(393)
},{}],413:[function(require,module,exports){
module.exports=require(394)
},{"lodash._baseindexof":412,"lodash._keyprefix":414}],414:[function(require,module,exports){
module.exports=require(395)
},{}],415:[function(require,module,exports){
module.exports=require(396)
},{"lodash._cachepush":416,"lodash._getobject":418,"lodash._releaseobject":426}],416:[function(require,module,exports){
module.exports=require(397)
},{"lodash._keyprefix":417}],417:[function(require,module,exports){
module.exports=require(395)
},{}],418:[function(require,module,exports){
module.exports=require(399)
},{"lodash._objectpool":419}],419:[function(require,module,exports){
module.exports=require(400)
},{}],420:[function(require,module,exports){
module.exports=require(282)
},{"lodash._arraypool":421}],421:[function(require,module,exports){
module.exports=require(283)
},{}],422:[function(require,module,exports){
module.exports=require(403)
},{}],423:[function(require,module,exports){
module.exports=require(285)
},{"lodash._arraypool":424,"lodash._maxpoolsize":425}],424:[function(require,module,exports){
module.exports=require(283)
},{}],425:[function(require,module,exports){
module.exports=require(287)
},{}],426:[function(require,module,exports){
module.exports=require(407)
},{"lodash._maxpoolsize":427,"lodash._objectpool":428}],427:[function(require,module,exports){
module.exports=require(287)
},{}],428:[function(require,module,exports){
module.exports=require(400)
},{}],429:[function(require,module,exports){
module.exports=require(261)
},{"lodash._basecreatecallback":430,"lodash._baseisequal":449,"lodash.isobject":458,"lodash.keys":460,"lodash.property":464}],430:[function(require,module,exports){
module.exports=require(262)
},{"lodash._setbinddata":431,"lodash.bind":434,"lodash.identity":446,"lodash.support":447}],431:[function(require,module,exports){
module.exports=require(263)
},{"lodash._isnative":432,"lodash.noop":433}],432:[function(require,module,exports){
module.exports=require(252)
},{}],433:[function(require,module,exports){
module.exports=require(265)
},{}],434:[function(require,module,exports){
module.exports=require(266)
},{"lodash._createwrapper":435,"lodash._slice":445}],435:[function(require,module,exports){
module.exports=require(267)
},{"lodash._basebind":436,"lodash._basecreatewrapper":440,"lodash._slice":445,"lodash.isfunction":444}],436:[function(require,module,exports){
module.exports=require(268)
},{"lodash._basecreate":437,"lodash._setbinddata":431,"lodash._slice":445,"lodash.isobject":458}],437:[function(require,module,exports){
module.exports=require(269)
},{"lodash._isnative":438,"lodash.isobject":458,"lodash.noop":439}],438:[function(require,module,exports){
module.exports=require(252)
},{}],439:[function(require,module,exports){
module.exports=require(265)
},{}],440:[function(require,module,exports){
module.exports=require(272)
},{"lodash._basecreate":441,"lodash._setbinddata":431,"lodash._slice":445,"lodash.isobject":458}],441:[function(require,module,exports){
module.exports=require(269)
},{"lodash._isnative":442,"lodash.isobject":458,"lodash.noop":443}],442:[function(require,module,exports){
module.exports=require(252)
},{}],443:[function(require,module,exports){
module.exports=require(265)
},{}],444:[function(require,module,exports){
module.exports=require(276)
},{}],445:[function(require,module,exports){
module.exports=require(277)
},{}],446:[function(require,module,exports){
module.exports=require(278)
},{}],447:[function(require,module,exports){
module.exports=require(279)
},{"lodash._isnative":448}],448:[function(require,module,exports){
module.exports=require(252)
},{}],449:[function(require,module,exports){
module.exports=require(281)
},{"lodash._getarray":450,"lodash._objecttypes":452,"lodash._releasearray":453,"lodash.forin":456,"lodash.isfunction":457}],450:[function(require,module,exports){
module.exports=require(282)
},{"lodash._arraypool":451}],451:[function(require,module,exports){
module.exports=require(283)
},{}],452:[function(require,module,exports){
module.exports=require(250)
},{}],453:[function(require,module,exports){
module.exports=require(285)
},{"lodash._arraypool":454,"lodash._maxpoolsize":455}],454:[function(require,module,exports){
module.exports=require(283)
},{}],455:[function(require,module,exports){
module.exports=require(287)
},{}],456:[function(require,module,exports){
module.exports=require(288)
},{"lodash._basecreatecallback":430,"lodash._objecttypes":452}],457:[function(require,module,exports){
module.exports=require(276)
},{}],458:[function(require,module,exports){
module.exports=require(254)
},{"lodash._objecttypes":459}],459:[function(require,module,exports){
module.exports=require(250)
},{}],460:[function(require,module,exports){
module.exports=require(251)
},{"lodash._isnative":461,"lodash._shimkeys":462,"lodash.isobject":458}],461:[function(require,module,exports){
module.exports=require(252)
},{}],462:[function(require,module,exports){
module.exports=require(253)
},{"lodash._objecttypes":463}],463:[function(require,module,exports){
module.exports=require(250)
},{}],464:[function(require,module,exports){
module.exports=require(296)
},{}],465:[function(require,module,exports){
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

},{"lodash.keys":466}],466:[function(require,module,exports){
module.exports=require(251)
},{"lodash._isnative":467,"lodash._shimkeys":468,"lodash.isobject":470}],467:[function(require,module,exports){
module.exports=require(252)
},{}],468:[function(require,module,exports){
module.exports=require(253)
},{"lodash._objecttypes":469}],469:[function(require,module,exports){
module.exports=require(250)
},{}],470:[function(require,module,exports){
module.exports=require(254)
},{"lodash._objecttypes":471}],471:[function(require,module,exports){
module.exports=require(250)
},{}]},{},[1]);
