var Class = require('../../ext/Class');
var UpdateWithUsing = require('./UpdateWithUsing');
var QuadUtils = require('../QuadUtils');

var UpdateModify = Class.create(UpdateWithUsing, {
    initialize: function($super, withNode, usingNodes, usingNamedNodes, deleteQuads, insertQuads, whereElement) {
        $super(withNode, usingNodes, usingNamedNodes);

        this.deleteQuads = deleteQuads || [];
        this.insertQuads = insertQuads || [];
        this.whereElement = whereElement || null;
    },

    getDeleteQuads: function() {
        return this.deleteQuads;
    },

    getInsertQuads: function() {
        return this.insertQuads;
    },

    getWhereElement: function() {
        return this.whereElement;
    },

    hasDeleteQuads: function() {
        var result = this.deleteQuads && this.deleteQuads.length > 0;
        return result;
    },

    hasInsertQuads: function() {
        var result = this.insertQuads && this.insertQuads.length > 0;
        return result;
    },

    /*
    toStringQuads: function(quads) {
        var arr = quads.map(this.toStringQuad);

        var result = arr.join('. ');
        return result;
    },

    toStringQuad: function(quad) {
        var g = quad.getGraph();

        // TODO null graph should be replaced by a reserved uri (just like in jena)
        var result = g == null
            ? '' + quad.asTriple()
            : '' + quad
            ;

        return result;
    },
    */

    toString: function($super) {

        var hasInsertQuads = this.hasInsertQuads();
        var hasDeleteQuads = this.hasDeleteQuads();

        var result = $super();

        if(hasDeleteQuads) {
            result += 'Delete { ' + QuadUtils.quadsToElement(this.getDeleteQuads()) + ' } ';
        }

        if(hasInsertQuads) {
            result += 'Insert { ' + QuadUtils.quadsToElement(this.getInsertQuads()) + ' } ';
        }

        result += 'Where { ' + this.getWhereElement() + ' } ';

        return result;
    }
});


module.exports = UpdateModify;
