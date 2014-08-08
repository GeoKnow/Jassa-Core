var Class = require('../ext/class');
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
        console.log('Override me');
        throw 'Override me';
    },

    getExprVar: function() {
        console.log('Override me');
        throw 'Override me';
    },

    getConstant: function() {
        console.log('Override me');
        throw 'Override me';
    },

    copySubstitute: function() {
        console.log('Override me');
        throw 'Override me';
    },

    copy: function() {
        console.log('Override me');
        throw 'Override me';
    },
});

module.exports = Expr;