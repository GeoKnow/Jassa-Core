var Class = require('../ext/Class');

var RefSpec = Class.create({
   initialize: function(targetSourceName) {
       this.targetSourceName = targetSourceName;
   },

   getTargetSourceName: function() {
       return this.targetSourceName;
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
