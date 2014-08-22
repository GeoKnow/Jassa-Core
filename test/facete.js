/* global describe */
/* global it */
var should = require('should');

// lib includes
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var ajax = function(param) {
    return request.postAsync(param.url, {
        json: true,
        form: param.data,
    }).then(function(res) {
        return new Promise(function(resolve) {
            resolve(res[0].body);
        });
    });
};

// lib
var jassa = require('../lib')(Promise, ajax);
// namespaces
var rdf = jassa.rdf;
var vocab = jassa.vocab;
var sparql = jassa.sparql;
var service = jassa.service;
var sponate = jassa.sponate;
var facete = jassa.facete;
var util = jassa.util;


function prettifyFacetTreeChildren(children) {
    var root = {
        labelInfo: { displayLabel: 'root' },
        countInfo: {hasMoreItems: true},
        outgoing: children
    };

    var result = prettifyFacetTree(root);
    return result;
};

function prettifyFacetTree(node) {
    var ci = node.countInfo;
    var li = node.labelInfo || {};

    var children = node.outgoing || node.incoming || [];

    var dir = node.outgoing ? '->' : '<-';
    var label = li.displayLabel || node.id.getUri();
    var count = ci.hasMoreItems ? '*' : ci.count;

    var str = dir + ' ' + label + ' (' + count + ')';

    var cs = children.map(prettifyFacetTree);

    var result = {
        label: str,
        children: cs
    };
    return result;
};

// tests
describe('Facete Basics', function() {

    it('#Service test', function() {

        if(false) {
            var sparqlService = new service.SparqlServiceHttp('http://fp7-pp.publicdata.eu/sparql', ['http://fp7-pp.publicdata.eu/']);
            sparqlService = new service.SparqlServiceConsoleLog(sparqlService);

            var facetSystem = new facete.FacetSystemSparql(sparqlService);
            var constraintManager = new facete.ConstraintManager();
            var facetService = facetSystem.createFacetService(constraintManager);

            var ftc = new facete.FacetTreeConfig();
            ftc.setState(new facete.Path(), new facete.FacetNodeState(1, 10, null, 'funding'));

            ftc.setState(facete.Path.parse('http://fp7-pp.publicdata.eu/ontology/funding'), new facete.FacetNodeState(1, 10, null, null));


            facete.FacetTreeService.fetchFacetTree(facetService, ftc).then(function(items) {

                var json = prettifyFacetTreeChildren(items);
                console.log('TREE: ' + JSON.stringify(json, null, 4));
            });
        }
    });

    it('#Resource list', function() {

        var sparqlService = new service.SparqlServiceHttp('http://fp7-pp.publicdata.eu/sparql', ['http://fp7-pp.publicdata.eu/']);
        sparqlService = new service.SparqlServiceConsoleLog(sparqlService);

        var facetConfig = new facete.FacetConfig();
        var cpath = facete.Path.parse('http://fp7-pp.publicdata.eu/ontology/funding http://fp7-pp.publicdata.eu/ontology/partner http://fp7-pp.publicdata.eu/ontology/address http://fp7-pp.publicdata.eu/ontology/country');
        //facetConfig.getConstraintManager().addConstraint(new facete.ConstraintEquals(cpath, rdf.NodeFactory.createUri('http://foo.org/foo')));
        var path = facete.Path.parse('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
        var excludeSelfConstraints = false;
        var concept = facete.FacetUtils.createConceptResources(facetConfig, cpath, excludeSelfConstraints);
        var baseVar = facetConfig.getRootFacetNode().getVar();

        var relation = new sparql.Relation(concept.getElement(), concept.getVar(), baseVar);


        // Make a check on how many rows there are
        service.ServiceUtils.fetchCountRows(sparqlService, relation.getElement(), 100000).then(function(countInfo) {
            var canUseCounts = countInfo.hasMoreItems === false;

            // If we could count the items, we can also support ordering them by their aggregated value
            var canUseOrder = canUseCounts;


            console.log('Count info: ', countInfo);
        });



        var countVar = rdf.NodeFactory.createVar('c');
        var query = sparql.RelationUtils.createQueryDistinctValueCount(relation, countVar);

        query.getOrderBy().push(new sparql.SortCondition(query.getProject().getExpr(countVar), 'desc'));

        /*
        valueSystem.prepareTable(somePath) // Will check whether sorting is feasible on the that path
        .then(function(tableService) { // Returns a table service
            The issue is, that we don't have access to the concept here

            So maybe have a util method instead?
            FacetValueUtil.prepareTableService(sparqlService, concept);
        });



        facetSystem.createValueTable(somePath).setTableMod(tableMod).createTableService().then(function(tableService) {

        });


        var tw = new TableWrapperQuery(query, [{'item': {v: concept.getVar(), sortable: true, removeable: false}, ]);
        tw.setOrder('item', 'asc'); //

        tw.getOrder('columnId');


        */
        console.log('Resource concept is: ' + query);

        var listService = new service.ListServiceSparqlQuery(sparqlService, query, concept.getVar());

        //var qe = sparqlService.createQueryExecution(query);
        //qe.execSelect().then(function(rs) {
        //console.log('Argh ' + baseVar + '; ' + query);
        listService.fetchItems(null, 10, 100).then(function(items) {
            console.log('Results:\n' + JSON.stringify(items.length, null, 4));
        });


        // TODO Wrap the query with a table mod


/*

        var facetSystem = new facete.FacetSystemSparql(sparqlService);
        var constraintManager = new facete.ConstraintManager();
        constraintManager.addConstraint(new facete.ConstraintRegex(facete.Path.parse('http://dcat.cc/ontology/groupId'), 'dbpedia'));
        constraintManager.addConstraint(new facete.ConstraintRegex(facete.Path.parse('http://dcat.cc/ontology/artifacetId'), 'o'));
*/
    });

    it('#Datacat test', function() {

        if(false) {
            var sparqlService = new service.SparqlServiceHttp('http://datacat.aksw.org/sparql', []);
            sparqlService = new service.SparqlServiceConsoleLog(sparqlService);

            var facetSystem = new facete.FacetSystemSparql(sparqlService);
            var constraintManager = new facete.ConstraintManager();
            constraintManager.addConstraint(new facete.ConstraintRegex(facete.Path.parse('http://dcat.cc/ontology/groupId'), 'dbpedia'));
            constraintManager.addConstraint(new facete.ConstraintRegex(facete.Path.parse('http://dcat.cc/ontology/artifacetId'), 'o'));


            var facetService = facetSystem.createFacetService(constraintManager);
        }
    });
/*
        var ftc = new facete.FacetTreeConfig();
        ftc.setState(new facete.Path(), new facete.FacetNodeState(1, 10, null, 'funding'));

        ftc.setState(facete.Path.parse('http://dcat.cc/ontology/groupId'), new facete.FacetNodeState(1, 10, null, null));


        facete.FacetTreeService.fetchFacetTree(facetService, ftc).then(function(items) {

            var json = prettifyFacetTreeChildren(items);
            console.log('TREE: ' + JSON.stringify(json, null, 4));
        });
    });
*/

});
