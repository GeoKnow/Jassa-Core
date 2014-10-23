var Class = require('../ext/Class');

var RefSpec = Class.create({
   initialize: function(target, attr) { //, parser) {
       //this.parser = parser;

       // Target can be (temporarily) an arbitrary object - but eventually
       // it usually becomes a string denoting the id of the target
       this.target = target;
       this.attr = attr;
   },

//   getParser: function() {
//       return this.parser;
//   },

   getTarget: function() {
       return this.target;
   },

   getAttr: function() {
       return this.attr;
   },

});

/**
 * Specification of a reference.
 *
 *
 */
/*
var RefSpec = Class.create({

    initialize: function(sourceMapRef, targetMapRef, isArray, joinTableRef) {
        this.sourceMapRef = sourceMapRef;
        this.targetMapRef = targetMapRef;
        this.isArray = isArray;
        this.joinTableRef = joinTableRef;
    },

    getSourceMapRef: function() {
        return this.sourceMapRef;
    },

    getTargetMapRef: function() {
        return this.targetMapRef;
    },

    isArray: function() {
        return this.isArray;
    },

    getJoinTableRef: function() {
        return this.joinTableRef;
    },

    toString: function() {
        var result = this.sourceMapRef + ' references ' + this.targetMapRef + ' via ' + this.joinTableRef + ' as array? ' + this.isArray;
        return result;
    },

});
*/

module.exports = RefSpec;
