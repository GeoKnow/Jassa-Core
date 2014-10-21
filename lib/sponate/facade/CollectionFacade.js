var Class = require('../../ext/Class');

var QueryFlow = require('./QueryFlow');

var CollectionFacade = Class.create({
    initialize: function(storeFacade, mappingName) {
        this.storeFacade = storeFacade;
        this.mappingName = mappingName;
    },

    getSource: function() {
        var result = this.storeFacade.getContext().getSource(this.mappingName);
        return result;
    },

    getListService: function() {
        var result = this.storeFacade.getListService(this.mappingName);
        return result;
    },

    find: function(criteria) {
        if(criteria) {
            throw new Error('Criteria queries are currently not supported anymore - Sorry :/');
        }

        var result = new QueryFlow(this.storeFacade, this.mappingName, criteria);
        return result;
    }
});

module.exports = CollectionFacade;
