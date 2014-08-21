var Class = require('../ext/Class');

var ListServiceUtils = require('./ListServiceUtils');

var Engine = Class.create({
    initialize: function(sparqlService) {
        this.sparqlService = sparqlService;
    },

    execList: function() {

    },

    execMap: function() {

    },

    exec: function(context, query) {
        var startName = query.getMappingName();

        var mappedConcept = context.getMappedConcept(startName);
        if(!mappedConcept) {
            throw new Error('No start mapping with name ' + startName + ' found');
        }

        // TODO Build the (left-)join tree for the mappings

        // TODO Execute recursively until all references are resolved
        // AccUtils.getRefs(rootAcc)

        var listService = ListServiceUtils.createListServiceMappedConcept(this.sparqlService, mappedConcept, query.isLeftJoin());

        //console.log('Aggregator Structure:\n' + JSON.stringify(mappedConcept.getAgg(), null, 4));


        var limit = query.getLimit();
        var offset = query.getOffset();
        var filterConcept = query.getFilterConcept();

        //console.log('argh limit ' + limit + ' ' + offset + ' ' + filterConcept);


        var result = listService.fetchItems(filterConcept, limit, offset);
        return result;
    },

});

module.exports = Engine;
