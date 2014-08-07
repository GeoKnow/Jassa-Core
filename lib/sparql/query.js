var union = require('lodash.union');
var VarExprList = require('./var-expr-list');
var ArrayUtils = require('../util/array-utils');
var ElementUtils = require('./element-utils');
var joinElements = require('./join-elements');
var QueryType = require('./query-type');

var fnIdentity = function(x) { return x; };

var Query = function() {
    this.classLabel = 'jassa.sparql.Query';

    this.initialize();
};


Query.prototype.initialize = function() {
    this.type = 0; // select, construct, ask, describe

    this.distinct = false;
    this.reduced = false;

    this.resultStar = false;

    // TODO Rename to project(ion)
    this.projectVars = new VarExprList();
    //this.projectVars = []; // The list of variables to appear in the projection
    //this.projectExprs = {}; // A map from variable to an expression

    //this.projection = {}; // Map from var to expr; map to null for using the var directly

    //this.order = []; // A list of expressions

    this.groupBy = [];
    this.orderBy = [];


    this.elements = [];

    this.constructTemplate = null;

    this.limit = null;
    this.offset = null;
};

Query.prototype.isResultStar = function() {
    return this.resultStar;
};

Query.prototype.setResultStar = function(enable) {
    this.resultStar = (enable === true);
};

Query.prototype.getQueryPattern = function() {
    return this.elements[0];
};

Query.prototype.setQueryPattern = function(element) {
    ArrayUtils.clear(this.elements);
    this.elements.push(element);
};

// TODO Deprecate
Query.prototype.getElements = function() {
    return this.elements;
};

// TODO This should only return the variables!!
Query.prototype.getProjectVars = function() {
    var result = this.projectVars ? this.projectVars.getVars() : null;
    return result;
};

// TODO Remove this method
Query.prototype.setProjectVars = function(projectVars) {
    this.projectVars = projectVars;
};

Query.prototype.getProject = function() {
    return this.projectVars;
};

Query.prototype.getGroupBy = function() {
    return this.groupBy;
};

Query.prototype.getOrderBy = function() {
    return this.orderBy;
};

Query.prototype.getLimit = function() {
    return this.limit;
};

Query.prototype.getOffset = function() {
    return this.offset;
};

Query.prototype.toStringOrderBy = function() {
    var result = (this.orderBy && this.orderBy.length > 0) ? 'Order By ' + this.orderBy.join(' ') + ' ' : '';
    //console.log('Order: ', this.orderBy);
    return result;
};

Query.prototype.toStringGroupBy = function() {
    var result = (this.groupBy && this.groupBy.length > 0) ? 'Group By ' + this.groupBy.join(' ') + ' ' : '';
    //console.log('Order: ', this.orderBy);
    return result;
};

Query.prototype.clone = function() {
    return this.copySubstitute(fnIdentity);
};

Query.prototype.flatten = function() {
    var result = this.clone();

    var tmp = result.elements.map(function(element) {
        return element.flatten();
    });

    var newElements = ElementUtils.flattenElements(tmp);

    result.elements = newElements;

    return result;
};


Query.prototype.getVarsMentioned = function() {

    console.log('sparql.Query.getVarsMentioned(): Not implemented properly yet. Things may break!');
    // TODO Also include projection, group by, etc in the output - not just the elements

    var result = this.elements.reduce(function(memo, element) {
        var evs = element.getVarsMentioned();
        var r = union(memo, evs);
        return r;
    }, []);

    return result;
};

Query.prototype.copySubstitute = function(fnNodeMap) {
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
};


/**
 * Convenience function for setting limit, offset and distinct from JSON
 *
 * @param options
 */
Query.prototype.setOptions = function(options) {
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
};

Query.prototype.setOffset = function(offset) {
    this.offset = offset ? offset : null;
};

Query.prototype.setLimit = function(limit) {
    if (limit === 0) {
        this.limit = 0;
    } else {
        this.limit = limit ? limit : null;
    }
};

Query.prototype.isDistinct = function() {
    return this.distinct;
};


Query.prototype.setDistinct = function(enable) {
    this.distinct = (enable === true);
};

Query.prototype.isReduced = function() {
    return this.reduced;
};

Query.prototype.setReduced = function(enable) {
    this.reduced = (enable === true);
};

Query.prototype.toString = function() {
    switch (this.type) {
        case QueryType.Select:
            return this.toStringSelect();
        case QueryType.Construct:
            return this.toStringConstruct();

    }
};


Query.prototype.toStringProjection = function() {
    if (this.resultStar) {
        return '*';
    }

    return '' + this.projectVars;
};


Query.prototype.toStringLimitOffset = function() {
    var result = '';

    if (this.limit !== null) {
        result += ' Limit ' + this.limit;
    }

    if (this.offset !== null) {
        result += ' Offset ' + this.offset;
    }

    return result;
};


Query.prototype.toStringSelect = function() {
    var distinctStr = this.distinct ? 'Distinct ' : '';

    //console.log('Elements: ', this.elements);
    var result = 'Select ' + distinctStr + this.toStringProjection() + ' {' +
        joinElements(' . ', this.elements) +
        '} ' + this.toStringGroupBy() + this.toStringOrderBy() + this.toStringLimitOffset();

    return result;
};

Query.prototype.toStringConstruct = function() {
    var result = 'Construct ' + this.constructTemplate + ' {' +
        joinElements(' . ', this.elements) +
        '}' + this.toStringOrderBy() + this.toStringLimitOffset();

    return result;
};

module.exports = Query;