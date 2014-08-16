var GenSym = require('./GenSym');
var GeneratorBlacklist = require('./GeneratorBlacklist');
var VarGenerator = require('./VarGenerator');
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

        var result = new VarGenerator(genVarName);

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

};

module.exports = VarUtils;
