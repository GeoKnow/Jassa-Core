var Class = require('../../ext/Class');
var ExprFunction0 = require('./ExprFunction0');

var E_NotExists = Class.create(ExprFunction0, {
    initialize: function($super, element) {
        $super('jassa.sparql.E_NotExists');
        this.element = element;
    },

    getVarsMentioned: function() {
        return this.element.getVarsMentioned();
    },

    $copy: function() {
        return new E_NotExists(this.element);
    },

    toString: function() {
        return 'Not Exists (' + this.element + ') ';
    },

});

module.exports = E_NotExists;
