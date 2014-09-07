var Class = require('../../ext/Class');

var Query = require('../Query');
var Engine = require('../Engine');


var QueryFlow = Class.create({
    initialize: function(storeFacade, sourceName, criteria) {
        this.storeFacade = storeFacade;
        this.query = new Query();

        this.query.setSourceName(sourceName);
        this.query.setCriteria(criteria);
    },

    /**
     * Join the lookup with the given concept
     */
    concept: function(_concept, isLeftJoin) {
        this.query.setFilterConcept(_concept);
        this.query.setLeftJoin(isLeftJoin);

        return this;
    },

    /**
     * Specify a set of nodes for which to perform the lookup
     * If concept is specified, nodes will be applied to the concept
     *
     * //Use of .concept(...) and .nodes(..) is mutually exclusive
     *
     */
    nodes: function(_nodes) {
        this.query.setNodes(_nodes);

        return this;
    },

    skip: function(offset) {
        this.query.setOffset(offset);

        return this;
    },

    limit: function(limit) {
        this.query.setLimit(limit);

        return this;
    },

    offset: function(offset) {
        this.query.setOffset(offset);

        return this;
    },

    list: function() {
        //var engine = this.storeFacade.getEngine();
        var context = this.storeFacade.getContext();
        var result = Engine.exec(context, this.query);
        return result;

        /*
        var result = this.storeFacade.executeList(this.query);
        return result;
        */
    },

    count: function() {
        /*
        var result = this.storeFacade.executeCount(this.query);
        return result;
        */
    }
});

module.exports = QueryFlow;
