var Class = require('../ext/class');
var ExprUtils = require('../sparql/expr/expr-utils');
//var ElementFilter = require('../sparql/element/element-filter');

var BindingLookup = Class.create({
    initialize: function(sparqlService, element) { //, joinExprs) {
        this.sparqlService = sparqlService;
        this.element = element;
    },

    lookupByIterator: function(itBindings) {

        // Each binding (in order) maps to the join expr,
        // Each join expr maps to its corresponding set of bindings
        // MapList<Binding, MapList<Expr

        var bindingToExprs = [];

        while (itBindings.hasNext()) {
            var binding = itBindings.nextBinding();

            var exprs = ExprUtils.bindingToExprs(binding);
            var exprsKey = exprs.join(', ');

            bindingToExprs.push({
                binding: binding,
                exprs: exprs,
                exprsKey: exprsKey
            });
        }

        // FIXME: expr not defined
        //var elementFilter = new ElementFilter(expr);

        //var subQuery = this.query.clone();
        //subQuery.getElements().push(elementFilter);

        // TODO: Add columns for variables in B
        //var rsB = this.sparqlService.execSelect(subQuery);
    },
});

module.exports = BindingLookup;
