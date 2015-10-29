var Class = require('../ext/Class');
var HashMap = require('../util/collection/HashMap');
var HashSet = require('../util/collection/HashSet');

var VarExprList = Class.create({
    initialize: function() {
        this.vars = [];
        //this.varToExpr = {};
        this.varToExpr = new HashMap();
    },

    contains: function(v) {
        var result = this.vars.some(function(item) {
            var r = item.equals(v);
            return r;
        });

        return result;
    },

    getVars: function() {
        return this.vars;
    },

    getExpr: function(v) {
        var result = this.varToExpr.get(v);
        return result;
    },

    getExprMap: function() {
        return this.varToExpr;
    },

    add: function(v, expr) {
        this.vars.push(v);

        if (expr) {
            //this.varToExpr[v.getName()] = expr;
            this.varToExpr.put(v, expr);
        }
    },

    addAll: function(vars) {
        this.vars.push.apply(this.vars, vars);
    },

    entries: function() {
        var self = this;
        var result = this.vars.map(function(v) {
            var expr = self.varToExpr.get(v);

            return {
                v: v,
                expr: expr,
            };
        });

        return result;
    },

    copySubstitute: function(fnNodeMap) {
        var result = new VarExprList();

        var entries = this.entries();
        for (var i = 0; i < entries.length; ++i) {
            var entry = entries[i];
            var newVar = fnNodeMap(entry.v);
            var newExpr = entry.expr ? entry.expr.copySubstitute(fnNodeMap) : null;

            result.add(newVar, newExpr);
        }

        return result;
    },

    toString: function() {
        var arr = [];
        var projEntries = this.entries();
        for (var i = 0; i < projEntries.length; ++i) {
            var entry = projEntries[i];
            var v = entry.v;
            var expr = entry.expr;

            if (expr) {
                arr.push('(' + expr + ' As ' + v + ')');
            } else {
                arr.push(v.toString());
            }
        }

        var result = arr.join(' ');
        return result;
    },

    // Get the referenced variables
    getRefVars: function() {
        var set = new HashSet();

        var entries = this.entries();
        entries.forEach(function(entry) {
            if(entry.expr == null) {
                set.add(entry.v);
            } else {
                var vs = entry.expr.getVarsMentioned();
                vs.forEach(function(v) {
                    set.add(v);
                });
            }
        });

        var result = set.map(function(v) {
            return v;
        });

        return result;
    }
});

module.exports = VarExprList;
