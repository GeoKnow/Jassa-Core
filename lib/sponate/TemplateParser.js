var uniq = require('lodash.uniq');

var Class = require('../ext/Class');

var ObjectUtils = require('../util/ObjectUtils');

var NodeUtils = require('../rdf/NodeUtils');
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
var AggArray = require('./agg/AggArray');
var AggTransform = require('./agg/AggTransform');

var AggUtils = require('./AggUtils');

var RefSpec = require('./RefSpec');

var BindingMapperExpr = require('./binding_mapper/BindingMapperExpr');

//var AccFactoryFn = require('./AccFactoryFn');

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
     *     and a subAgg corresponding to the object
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

                // If the subConfig only contains the elements id and $value, we turn it into a 'plain' map

                var keys = Object.keys(subConfig);
                var isPlainMap = keys.length === 2 && keys.indexOf('id') >=0 && keys.indexOf('$value') >= 0;
                //console.log('IS PLAIN MAP', isPlainMap);
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

            // TODO This is more like a hack - we should ensure in advance that ID attributes do not make use of transformations
            idAgg = AggUtils.unwrapAggTransform(idAgg);

            var idBm = idAgg.getBindingMapper();
            //var idExpr = bm.getExpr();
            result = new AggMap(idBm, subAgg);


            result = new AggTransform(result, function(map) {
                //var map = acc.getValue();
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
     * Here we only keep track that we encountered a reference.
     * We cannot validate it here, as we lack information
     *
     *
     */
    parseArrayRef: function(config) {

        var result = new AggRef(config);
        return result;
    },

    parseArrayLiteral: function(exprStr) {
        //var expr = this.parseExprString(exprStr);
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
     * An object is an entity having a set of fields,
     * whereas fields can be of different types
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
        //console.log('PARSED REF SPEC: ' + JSON.stringify(refSpec), val.attr);

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

        var result = new AggObject(attrToAgg);

        return result;
    },

//      parseAgg: function(fieldName, val) {
//          // if the value is an array, create an array field
//          // TODO An array field can be either an array of literals or of objects
//          // How to represent them?
//          // Maybe we could have Object and Literal Fields plus a flag whether these are arrays?
//          // So then we wouldn't have a dedicated arrayfield.
//          // if the value is an object, create an object reference field
//
//          // friends: ArrayField(
//      },
    parseAgg: function(val) {

        //console.log('PARSING: ' + JSON.stringify(val));

        var result;

        if (ObjectUtils.isString(val)) {
            result = this.parseLiteral(val);
        } else if (Array.isArray(val)) {
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
        } else {
            throw new Error('Could not parse expression: ', obj);
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
