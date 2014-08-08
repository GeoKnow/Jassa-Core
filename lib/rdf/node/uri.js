var Class = require('../../ext/class');
var Node_Concrete = require('./concrete');

var Node_Uri = Class.create(Node_Concrete, {
    classLabel: 'Node_Uri',
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
    },
});

module.exports = Node_Uri;