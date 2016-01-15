var Coordinate = require('./Coordinate');
var NodeUtils = require('../NodeUtils');
var ArrayUtils = require('../../util/ArrayUtils');

var TalisRdfJsonUtils = {


    addTripleJson: function(talisRdfJson, tripleJson) {
        //var coord = new Coordinate(tripleJson.s, tripleJson.p, tripleJson.)
    },

    removeTripleJson: function(tripleJson) {

    },


    add: function(graph, coordinate, v) {

    },

    remove: function(graph, coordinate, v) {

    },

    merge: function(destTalisRdfJson, srcTalisRdfJson) {

    },

    tripleToJson: function(triple) {
        var _s = triple.getSubject();
        var s = _s.isUri() ? _s.getUri() : '' + _s;

        var p = triple.getPredicate().getUri();

        var _o = triple.getObject();
        var o = NodeUtils.toTalisRdfJson(_o);

        var result = {
            s: s,
            p: p,
            o: o
        };
        return result;
    },


    // Returns the object array at a given predicate
    getObjectsAt: function(talisRdfJson, coordinate) {
        var s = coordinate ? talisRdfJson[coordinate.s] : null;
        var result = s ? s[coordinate.p] : null;
        return result;
    },

    // Returns the object at a given index
    getObjectAt: function(talisRdfJson, coordinate) {
        var p = this.getObjectsAt(talisRdfJson, coordinate);
        var result = p ? p[coordinate.i] : null;

        return result;
    },

    getOrCreateObjectAt: function(talisRdfJson, coordinate, obj) {
        var s = talisRdfJson[coordinate.s] = talisRdfJson[coordinate.s] || {};
        var p = s[coordinate.p] = s[coordinate.p] || [];
        var result = p[coordinate.i] = p[coordinate.i] || obj || {};
        return result;
    },

    removeValueAt: function(talisRdfJson, coordinate) {

        var ps = talisRdfJson[coordinate.s];
        var is = ps ? ps[coordinate.p] : null;
        var cs = is ? is[coordinate.i] : null;

        if(cs) {
            delete cs[coordinate.c];

            if(Object.keys(cs).length === 0) {

                delete is[coordinate.i];
                ArrayUtils.compactTrailingNulls(is);

                if(is.length === 0) {
                    delete ps[coordinate.p];

                    if(Object.keys(ps).length === 0) {
                        delete talisRdfJson[coordinate.s];
                    }
                }
            }
        }
    },

    setValueAt: function(talisRdfJson, coordinate, value) {
        //if(value != null) {
        if(coordinate != null) {
            var o = this.getOrCreateObjectAt(talisRdfJson, coordinate);
            o[coordinate.c] = value;
        //}
        }
    },

    // TODO Rename to getComponentAt
    getValueAt: function(talisRdfJson, coordinate) {
        var i = this.getObjectAt(talisRdfJson, coordinate);
        var result = i ? i[coordinate.c] : null;

        return result;
    },

    renameSubject: function(talisRdfJson, oldName, newName) {
        this.renameKey(talisRdfJson, oldName, newName);
    },


    renamePredicate: function(talisRdfJson, s, oldName, newName) {
        var pToOs = talisRdfJson[s];
        if(pToOs) {
            this.renameKey(pToOs, oldName, newName);
        }
    },

    deleteSubject: function(talisRdfJson, s) {
        delete talisRdfJson[s];
    },

    deletePredicate: function(talisRdfJson, s, p) {
        var pToOs = talisRdfJson[s];
        if(pToOs) {
            delete pToOs[p];
        }
    },

    renameKey: function(obj, oldName, newName) {
        if(oldName in obj) {
            var data = obj[oldName];
            delete obj[oldName];
            obj[newName] = data;
        }
    }


};

module.exports = TalisRdfJsonUtils;

