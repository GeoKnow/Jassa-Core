var union = require('lodash.union');

var Class = require('../../ext/Class');
var Agg = require('./Agg');
var AccBestLiteral = require('../acc/AccBestLiteral');


var AggBestLiteral = Class.create(Agg, {
    initialize: function(bestLiteralConfig) {
        this.bestLiteralConfig = bestLiteralConfig;
    },
    
    createAcc: function() {
        var result = new AccBestLiteral(this.bestLiteralConfig);

        return result;
    },
    
    getVarsMentioned: function() {
        var vm = function(expr) {
            var result = expr ? expr.getVarsMentioned() : [];
            return result;
        };
        
        var blc = this.bestLiteralConfig;
        
        var result = union(vm(blc.getLabelExpr()), vm(blc.getSubjectExpr()), vm(blc.getPropertyExpr()));
        return result;
    }
});

module.exports = AggBestLiteral;

