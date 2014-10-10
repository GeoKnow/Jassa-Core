var Class = require('../../ext/Class');
/**
 * Expr classes, similar to those in Jena
 *
 * Usally, the three major cases we need to discriminate are:
 * - Varibles
 * - Constants
 * - Functions
 *
 */
var Expr = Class.create({
    isFunction: function() {
        return false;
    },

    isVar: function() {
        return false;
    },

    isConstant: function() {
        return false;
    },

    getFunction: function() {
        throw new Error('Override me');
    },

    getExprVar: function() {
        throw new Error('Override me');
    },

    getConstant: function() {
        throw new Error('Override me');
    },

    copySubstitute: function() {
        throw new Error('Override me');
    },

    copy: function() {
        throw new Error('Override me');
    },
});

module.exports = Expr;
