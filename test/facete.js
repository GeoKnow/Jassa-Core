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
        var cpath = facete.Path.parse('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
        facetConfig.getConstraintManager().addConstraint(new facete.ConstraintEquals(cpath, rdf.NodeFactory.createUri('http://fp7-pp.publicdata.eu/ontology/Project')));


        var facetValueService = new facete.FacetValueService(sparqlService, facetConfig, 5000000);
        var path = facete.Path.parse('http://fp7-pp.publicdata.eu/ontology/funding http://fp7-pp.publicdata.eu/ontology/partner http://fp7-pp.publicdata.eu/ontology/address http://fp7-pp.publicdata.eu/ontology/country');
        facetValueService.prepareTableService(path, false).then(function(ls) {

            var bestLabelConfig = new sparql.BestLabelConfig();
            var labelRelation = sparql.LabelUtils.createRelationPrefLabels(bestLabelConfig);
            var filterConcept = sparql.KeywordSearchUtils.createConceptRegex(labelRelation, 'Germany', true);

            return ls.fetchItems(filterConcept, 10);
        }).then(function(items) {
            items[0].val.bindings[0].get(rdf.NodeFactory.createVar('c_1')).getLiteralValue().should.equal(1094);
            //console.log('FACET VALUES\n ' + JSON.stringify(items, null, 4));
        });

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
