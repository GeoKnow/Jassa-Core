var Class = require('../../ext/Class');
var values = require('lodash.values');
var shared = require('../../util/shared');
var Promise = shared.Promise;

var Concept = require('../../sparql/Concept');
var ConceptUtils = require('../../sparql/ConceptUtils');
var ServiceUtils = require('../ServiceUtils');
var ResultSetUtils = require('../ResultSetUtils');
var ListService = require('./ListService');

var ElementSubQuery = require('../../sparql/element/ElementSubQuery');

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
    initialize: function(sparqlService, attrQuery, attrVar, isLeftJoin, forceSubQuery) {
        if(attrQuery.getLimit() || attrQuery.getOffset()) {
            throw new Error('Limit and offset in attribute queries not yet supported');
        }

        this.sparqlService = sparqlService;
        this.attrQuery = attrQuery;
        this.attrVar = attrVar;
        this.isLeftJoin = isLeftJoin; //isLeftJoin == null ? true : isLeftJoin;
        this.forceSubQuery = forceSubQuery; // force a sub query, even if attrVar is unique for each result set row
    },


    /*
    createQueryAttrAsSubQuery: function() {
        var subQuery = new Query();
        subQuery.setQueryPattern(new ElementSubQuery(this.attrQuery));
        subQuery.setQueryResultStar(this.attrQuery.isQueryResultStar());

        var entries = subQuery.getProject().entries();
        entries.forEach(function(expr, v) {
            subQuery.getProject().add(v, expr);
        });

        return subQuery;
    },
    */

    fetchItems: function(filterConcept, limit, offset) {
        var attrVar = this.attrVar;

        if(!filterConcept) {
            filterConcept = ConceptUtils.createSubjectConcept();
        }

        var query = ConceptUtils.createAttrQuery(this.attrQuery, attrVar, this.isLeftJoin, filterConcept, limit, offset, this.forceSubQuery);

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

        if(!filterConcept) {
            filterConcept = ConceptUtils.createSubjectConcept();
        }


        /*
        var makeDistinct = function(query) {

        };
        */

        var countConcept;
        if(this.isLeftJoin) {
            var query = ConceptUtils.createAttrQuery(this.attrQuery, this.attrVar, this.isLeftJoin, filterConcept, itemLimit, null, this.forceSubQuery);

            countConcept = new Concept(query.getQueryPattern(), this.attrVar);
        } else {
            var attrConcept = ( this.forceSubQuery
                ? new Concept(new ElementSubQuery(this.attrQuery), this.attrVar)
                : new Concept(this.attrQuery.getQueryPattern(), this.attrVar) )
                ;

            countConcept = ConceptUtils.createCombinedConcept(attrConcept, filterConcept, true, false, false);
//            console.log('FILTER ' + filterConcept);
//            console.log('ATTR ' + attrConcept);
//            console.log('COUNT ' + countConcept);
//            console.log('ROW ' + rowLimit);
        }

        var result = ServiceUtils.fetchCountConcept(this.sparqlService, countConcept, itemLimit, rowLimit);
        return result;
    },

});

module.exports = ListServiceSparqlQuery;
