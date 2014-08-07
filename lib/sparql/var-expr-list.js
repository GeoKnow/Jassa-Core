var VarExprList = function() {
    this.vars = [];
    this.varToExpr = {};
};

VarExprList.prototype = {
    getVarList: function() {
        return this.vars;
    },

    getExprMap: function() {
        return this.varToExpr;
    },

    add: function(v, expr) {
        this.vars.push(v);

        if (expr) {
            this.varToExpr[v.getName()] = expr;
        }
    },


    addAll: function(vars) {
        this.vars.push.apply(this.vars, vars);
    },

    entries: function() {
        var self = this;
        var result = this.vars.map(function(v) {
            var expr = self.varToExpr[v.getName()];

            //return expr;
            return {
                v: v,
                expr: expr
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
                arr.push('' + v);
            }
        }

        var result = arr.join(' ');
        return result;
    }
};

module.exports = VarExprList;