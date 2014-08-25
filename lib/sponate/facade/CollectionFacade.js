var Class = require('../../ext/Class');

var QueryFlow = require('./QueryFlow');

var CollectionFacade = Class.create({
    initialize: function(storeFacade, mappingName) {
        this.storeFacade = storeFacade;
        this.mappingName = mappingName;
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
