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
