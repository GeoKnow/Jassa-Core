var Class = require('../../ext/Class');
var values = require('lodash.values');
var shared = require('../../util/shared');
var Promise = shared.Promise;

var Concept = require('../../sparql/Concept');
var ConceptUtils = require('../../sparql/ConceptUtils');
var ServiceUtils = require('../ServiceUtils');
var ResultSetUtils = require('../ResultSetUtils');
var ListService = require('./ListService');

/**
 * A list service that is configured with a query + var, 
 * and which can filter the result set according to the provided concept in fetchItems.
 *
 * Each item is of type sevice.ResultSetPart and contains the result set rows where
 * var is of a certain value
 *
 * NOTE: AttrConcept could have an element of type ElementSubQuery, which we can treat in specially for optimization
 * 
 * Note: The service is not responsible for ordering by var (in order to have the result set rows pre-grouped)
 *
 * isInnerJoin controls whether the attributes are optional or mandatory:
 * If isInnerJoin is false, attributes are considered optional, and e.g. fetchCount will solely rely on the provided concept
 * If it is true, an inner join between the attributes and the concept will be made, and e.g. fetchCount will return the number of items in their intersection
 *
 * ConceptTypes: FilterConcept: No triple-patterns - just filters on the concept.getVar()
 *               QueryConcept: Concept with a ElementSubQuery as its element
 *               SubjectConcept: Concept which is isomorph to the concept ({?s ?p ?o}, ?s)
 * @param isLeftJoin true indidcates that the attributes are optional
 */
var ListServiceSparqlQuery = Class.create(ListService, {
    initialize: function(sparqlService, attrQuery, attrVar, isLeftJoin) {
        if(attrQuery.getLimit() || attrQuery.getOffset()) {
            console.log('Limit and offset in attribute queries not yet supported');
            throw 'Limit and offset in attribute queries not yet supported';
        }

        this.sparqlService = sparqlService;
        this.attrQuery = attrQuery;
        this.attrVar = attrVar;
        this.isLeftJoin = isLeftJoin == null ? true : isLeftJoin;
    },

    fetchItems: function(filterConcept, limit, offset) {
        var attrVar = this.attrVar;
        var query = ConceptUtils.createAttrQuery(this.attrQuery, attrVar, this.isLeftJoin, filterConcept, limit, offset);

        var qe = this.sparqlService.createQueryExecution(query);

        var result = qe.execSelect().then(function(rs) {
            var map = ResultSetUtils.partition(rs, attrVar);
            var entries = map.entries();

            var r = values(entries);
            return r;
            // partition the result set according to the attrConcept.getVar();
        });

        return result;
    },

    fetchCount: function(filterConcept, itemLimit, rowLimit) {

        var countConcept;
        if(this.isLeftJoin) {
            var query = ConceptUtils.createAttrQuery(this.attrQuery, this.attrVar, this.isLeftJoin, filterConcept, itemLimit, null);

            countConcept = new Concept(query.getQueryPattern(), this.attrVar);
        } else {
            countConcept = filterConcept;
        }

        var result = ServiceUtils.fetchCountConcept(this.sparqlService, countConcept, itemLimit, rowLimit);
        return result;
    },

});

module.exports = ListServiceSparqlQuery;