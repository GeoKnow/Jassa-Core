   ns.ResultSetPart = Class.create({
        initialize: function(varNames, bindings) {
            this.varNames = varNames || [];
            this.bindings = bindings || [];
        },

        getVarNames: function() {
            return this.varNames;
        },
        
        getBindings: function() {
            return this.bindings;
        },
                
        toString: function() {
            return 'ResultSetPart: vars=' + this.varNames + ', bindings=' + this.bindings;
        }
    });
