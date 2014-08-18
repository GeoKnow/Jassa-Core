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
