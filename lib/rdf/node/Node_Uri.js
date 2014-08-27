var Class = require('../../ext/Class');
var Node_Concrete = require('./Node_Concrete');

var Node_Uri = Class.create(Node_Concrete, {
    classLabel: 'jassa.rdf.Node_Uri',
    initialize: function(uri) {
        this.uri = uri;
    },
    isUri: function() {
        return true;
    },
    getUri: function() {
        return this.uri;
    },
    toString: function() {
        return '<' + this.uri + '>';
    }
});

module.exports = Node_Uri;
