var Class = require('../../ext/Class');
var QueryExecution = require('./QueryExecution');

var QueryExecutionDelegate = Class.create(QueryExecution, {
    initialize: function(sparqlService, query) {
        this.sparqlService = sparqlService;
        this.query = query;
        
        this.timeout = null;
    },

    setTimeout: function(timeout) {
        this.timeout = timeout;
    },

    createQueryExecution: function() {
        var result = this.sparqlService.createQueryExecution(this.query);
        result.setTimeout(this.timeout);
        return result;
    },

    /*
    execConstruct: function() {
        var result = this.sparqlService.execConstruct(this.query);
        return result;
    },
    */

    execSelect: function() {
        var result = this.createQueryExecution().execSelect(this.query);
        return result;
    },

    /*
    execDescribe: function() {
        var result = this.sparqlService.execDescribe(this.query);
        return result;
    },
    */

    execAsk: function() {
        var result = this.createQueryExecution().execAsk(this.query);
        return result;
    },

});

module.exports = QueryExecutionDelegate;
