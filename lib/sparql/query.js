var Class = require('../ext/Class');
var union = require('lodash.union');
var VarExprList = require('./var-expr-list');
var ArrayUtils = require('../util/array-utils');
var ElementUtils = require('./element/element-utils');
var joinElements = require('./join/join-elements');
var QueryType = require('./query-type');

var fnIdentity = function(x) {
    return x;
};

var Query = Class.create({
    classLabel: 'jassa.sparql.Query',

    initialize: function() {
        this.type = 0; // select, construct, ask, describe

        this.distinct = false;
        this.reduced = false;

        this.resultStar = false;

        // TODO Rename to project(ion)
        this.projectVars = new VarExprList();
        // this.projectVars = []; // The list of variables to appear in the projection
        // this.projectExprs = {}; // A map from variable to an expression

        // this.projection = {}; // Map from var to expr; map to null for using the var directly

        // this.order = []; // A list of expressions

        this.groupBy = [];
        this.orderBy = [];

        this.elements = [];

        this.constructTemplate = null;

        this.limit = null;
        this.offset = null;
    },

    isResultStar: function() {
        return this.resultStar;
    },

    setResultStar: function(enable) {
        this.resultStar = (enable === true);
    },

    getQueryPattern: function() {
        return this.elements[0];
    },

    setQueryPattern: function(element) {
        ArrayUtils.clear(this.elements);
        this.elements.push(element);
    },

    // TODO Deprecate
    getElements: function() {
        return this.elements;
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
        return this.copySubstitute(fnIdentity);
    },

    flatten: function() {
        var result = this.clone();

        var tmp = result.elements.map(function(element) {
            return element.flatten();
        });

        var newElements = ElementUtils.flattenElements(tmp);

        result.elements = newElements;

        return result;
    },

    getVarsMentioned: function() {

        console.log('sparql.Query.getVarsMentioned(): Not implemented properly yet. Things may break!');
        // TODO Also include projection, group by, etc in the output - not just the elements

        var result = this.elements.reduce(function(memo, element) {
            var evs = element.getVarsMentioned();
            var r = union(memo, evs);
            return r;
        }, []);

        return result;
    },

    copySubstitute: function(fnNodeMap) {
        var result = new Query();
        result.type = this.type;
        result.distinct = this.distinct;
        result.reduced = this.reduced;
        result.resultStar = this.resultStar;
        result.limit = this.limit;
        result.offset = this.offset;

        result.projectVars = this.projectVars.copySubstitute(fnNodeMap);

        if (this.constructTemplate) {
            result.constructTemplate = this.constructTemplate.copySubstitute(fnNodeMap);
        }

        result.orderBy = this.orderBy === null ? null : this.orderBy.map(function(item) {
            return item.copySubstitute(fnNodeMap);
        });

        result.groupBy = this.groupBy === null ? null : this.groupBy.map(function(item) {
            return item.copySubstitute(fnNodeMap);
        });

        result.elements = this.elements.map(function(element) {
            //              console.log('Element: ', element);
            //              debugger;
            var r = element.copySubstitute(fnNodeMap);
            return r;
        });

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
        if (this.resultStar) {
            return '*';
        }

        return this.projectVars.toString();
    },

    toStringLimitOffset: function() {
        var result = '';

        if (this.limit !== null) {
            result += ' Limit ' + this.limit;
        }

        if (this.offset !== null) {
            result += ' Offset ' + this.offset;
        }

        return result;
    },

    toStringSelect: function() {
        var distinctStr = this.distinct ? 'Distinct ' : '';

        // console.log('Elements: ', this.elements);
        var result = 'Select ' + distinctStr + this.toStringProjection() + ' {' +
            joinElements(' . ', this.elements) +
            '} ' + this.toStringGroupBy() + this.toStringOrderBy() + this.toStringLimitOffset();

        return result;
    },

    toStringConstruct: function() {
        var result = 'Construct ' + this.constructTemplate + ' {' +
            joinElements(' . ', this.elements) +
            '}' + this.toStringOrderBy() + this.toStringLimitOffset();

        return result;
    },
});

module.exports = Query;
