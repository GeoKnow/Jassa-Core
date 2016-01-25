var HashMap = require('../util/collection/HashMap');

var Triple = require('../rdf/Triple');

var ElementGroup = require('./element/ElementGroup');
var ElementTriplesBlock = require('./element/ElementTriplesBlock');
var ElementNamedGraph= require('./element/ElementNamedGraph');

var ElementUtils = require('./ElementUtils');

var Quad = require('./Quad');

var QuadUtils = {

    triplesToQuads: function(triples, graphNode) {

        var result = triples.map(function(triple) {
            var r = new Quad.createFromTriple(graphNode, triple);
            return r;
        });

        return result;
    },


    quadsToElement: function(quads) {
        var map = this.groupByGraph(quads);
        var result = this.groupToElement(map);
        return result;
    },

    /**
     * Returns a map from quad to an array of quads
     */
    groupByGraph: function(quads) {
        var result = new HashMap();

        quads.forEach(function(quad) {
            //console.log('got item ' + quad);
            var g = quad.getGraph();
            var items = result.getOrCreate(g, []);

            items.push(quad);
        });

        return result;
    },

    groupToElement: function(graphToQuads) {
        var entries = graphToQuads.entries();

        var elements = entries.map(function(entry) {
            var graph = entry.key;
            var quads = entry.val;

            var triples = quads.map(function(quad) {
                return quad.asTriple();
            });

            var etb = new ElementTriplesBlock(triples);

            var r = graph == null || graph.equals(Quad.defaultGraphNodeGenerated)
                ? etb
                : new ElementNamedGraph(graph, etb)
                ;

            return r;
        });

        //var result = ElementUtils.groupIfNeeded(elements);
        var result = new ElementGroup(elements);
        return result;
    }

};

module.exports = QuadUtils;
