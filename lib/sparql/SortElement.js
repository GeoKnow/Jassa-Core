var Class = require('../ext/Class');

/**
 * A sort specification combines a SPARQL graph pattern (i.e. an element)
 * with a list of sort conditions. The sort conditions are assumed to only
 * refer to variables that are part of the graph pattern.
 *
 */
var SortElement = Class.create({
    classLabel: 'jassa.sparql.SortElement',

    initialize: function(element, sortConditions) {
        this.element = element;
        this._sortConditions = sortConditions || [];
    },

    getElement: function() {
        return this.element;
    },

    getSortConditions: function() {
        return this._sortConditions;
    },

    toString: function() {
        var result = '' + this.element + 'ORDER BY ' + this._sortConditions.join(' ');
        return result;
    }
});

module.exports = SortElement;
