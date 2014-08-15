var Element = require('./Element'); 

ElementBind = Class.create(ns.Element,{
    classLabel: 'jassa.sparql.ElementBind',

    initialize: function(variable, expression){
        this.expr = expression;
        this.variable = variable;
    },

    getArgs: function(){
        return [];
    },

    getExpr: function(){
        return this.expr;
    },

    getVar: function(){
        return this.variable;
    },

    getVarsMentioned: function(){
        return _(this.expr.getVarsMentioned()).union(this.variable);
    },

    copy: function(){
        return new ElementBind(this.variable,this.expr);
    },

    copySubstitute: function(fnNodeMap) {
        return new ElementBind(rdf.getSubstitute(this.variable,  fnNodeMap),this.expr.copySubstitute(fnNodeMap));
    },

    flatten: function(){
        return this;
    },

    toString: function(){
        return 'bind(' + this.expr + ' as ' + this.variable  +  ')';
    }

});

module.exports = ElementBind;
