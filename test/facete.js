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


/*
function prettifyFacetTreeChildren(children) {
    var root = {
        labelInfo: { displayLabel: 'root' },
        countInfo: {hasMoreItems: true},
        outgoing: children
    };

    var result = prettifyFacetTree(root);
    return result;
};
*/

function prettifyFacetTree(node) {
    var ci = node.countInfo;
    var li = node.labelInfo || {};

    var children = node.outgoing || node.incoming || [];

    var dir = node.outgoing ? '->' : '<-';
    var label = '' + (li.displayLabel || node.id) + ' (' + node.id + ')'; //.getUri();
    var count = ci.hasMoreItems ? '*' : ci.count;

    var str = dir + ' ' + label + ' (' + count + ') with tags: ' + JSON.stringify(node.tags);

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

        if(true) {
            var sparqlService =
                service.SparqlServiceBuilder.http('http://fp7-pp.publicdata.eu/sparql', ['http://fp7-pp.publicdata.eu/'])
                .cache().create();

            var facetTreeConfig = new facete.FacetTreeConfig();

            var facetTreeState = facetTreeConfig.getFacetTreeState();

            facetTreeState.getPathExpansions().add(new facete.Path());
            //facetTreeState.getPathToDirection().put(new facete>path())
            facetTreeState.getPathHeadToFilter().put(new facete.PathHead(new facete.Path(), false), new facete.ListFilter('funding', 10));


            //var pathToState = facetTreeConfig.getPathToState();
            //pathToState.put(null, new facete.FacetNodeState(true, false, new facete.ListFilter()));
            //pathToState.put(new facete.Path(), new facete.FacetNodeState(true, false, new facete.ListFilter('funding', 10)));
            //pathToState.put(new facete.Path(), new facete.FacetNodeState(true, false, new facete.ListFilter(null, 10)));


            var facetTreeService = facete.FacetTreeServiceUtils.createFacetTreeService(sparqlService, facetTreeConfig);

            /*
            var tagMap = new util.HashMap();
            tagMap.put(null, {foo: 'bar'});

            //var ftc = new facete.FacetTreeConfig();
            var pathToState = new util.HashMap();

            var facetConfig = new facete.FacetConfig();
            //var facetService = new facete.FacetServiceUtils.createFacetService(sparqlService, facetConfig, tagMap.asFn());
            var facetService = facete.FacetServiceBuilder
                .core(sparqlService, facetConfig)
                .labelConfig()
                .index()
                .tagMap(tagMap)
                .tagFn(function(entry) {
                    var key = entry.key;

                    var state = pathToState.get(key);
                    if(!state) {
                        state = new facete.FacetNodeState();
                        pathToState.put(key, state)
                    }

                    entry.val.tags.state = state;
                    return entry;
                })
                .create();
*/
            //var constraintManager = new facete.ConstraintManager();


            //var facetService = facetSystem.createFacetService(constraintManager);



            //ftc.setState(new facete.Path(), new facete.FacetNodeState(1, new facete.ListFilter('funding', 10)));
            //ftc.setState(new facete.Path(), new facete.FacetNodeState(1, new facete.ListFilter('funding', 10)));
            //ftc.setState(facete.Path.parse('http://fp7-pp.publicdata.eu/ontology/funding'), new facete.FacetNodeState(1, new facete.ListFilter(null, 10)));
            //ftc.setState(facete.Path.parse('http://fp7-pp.publicdata.eu/ontology/funding http://fp7-pp.publicdata.eu/ontology/partner'), new facete.FacetNodeState(1, new facete.ListFilter(null, 10)));

            //var facetTreeService = new facete.FacetTreeService(facetService, pathToState.asFn());

            // new facete.Path()
            facetTreeService.fetchFacetTree().then(function(json) {

                //var json = prettifyFacetTree(json);
                //json = items;
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
