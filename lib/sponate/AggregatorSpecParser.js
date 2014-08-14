var Class = require('../ext/class');

var AggregatorSpecParser = Class.create({

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

        if (val.length != 1) {
            console.log('[ERROR] Arrays must have exactly one element that is either a string or an object', val);
            throw 'Bailing out';
        }

        var config = val[0];

        var result;
        if (_(config).isString()) {

            result = this.parseArrayLiteral(config);

        } else if (_(config).isObject()) {

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

            // Expects a PatternLiteral
            var idPattern = subPattern.getPattern(idAttr);
            var idExpr = idPattern.getExpr();
            result = new ns.PatternMap(idExpr, subPattern, true);

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

        var result = new ns.PatternRef(config);
        return result;
    },

    parseArrayLiteral: function() {

    },

    parseLiteral: function(val) {
        var expr = this.parseExprString(val);

        var result = new ns.PatternLiteral(expr);
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
        _(val).each(function(v, attr) {
            var v = val[attr];
            var subPattern = self.parsePattern(v);

            attrToPattern[attr] = subPattern;
        });

        var result = new ns.PatternObject(attrToPattern);
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

        if (_(val).isString()) {
            result = this.parseLiteral(val);
        } else if (_(val).isArray()) {
            result = this.parseArray(val);
        } else if (_(val).isFunction()) {
            result = new ns.PatternCustomAgg(new ns.AccumulatorFactoryFn(val));
        } else if (val instanceof rdf.Node && val.isVariable()) {
            var expr = new sparql.ExprVar(val);
            result = new ns.PatternLiteral(expr);
        } else if (val instanceof sparql.Expr) {
            result = new ns.PatternLiteral(expr);
        } else if (_(val).isObject()) {
            var fnCustomAggFactory = val.createAggregator;
            if (fnCustomAggFactory) {
                result = new ns.PatternCustomAgg(val);
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

        if (_.isString(obj)) {
            result = this.parseExprString(obj);
        }

        return result;
    },

    parseExprString: function(str) {
        var result;

        if (_(str).startsWith('?')) {
            var varName = str.substr(1);
            var v = sparql.Node.v(varName);
            result = new sparql.ExprVar(v);

        } else {
            result = sparql.NodeValue.makeString(str);
            // TODO: This must be a node value
            // result = sparql.Node.plainLit(str);
        }

        // TODO Handle special strings, such as ?\tag

        // console.log('Parsed', str, 'to', result);

        return result;
    },

});

modules.export = AggregatorSpecParser;
