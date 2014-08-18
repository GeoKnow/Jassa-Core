// Predefined concepts for convenience

var CannedConceptUtils = {

    // TODO We need to integrate the rdfstore js parser, so we can do Concept.parse();
    createConceptDeclaredProperties: function() {

        var types = [vocab.rdf.Property, vocab.owl.AnnotationProperty, vocab.owl.DatatypeProperty, vocab.owl.ObjectProperty];

        var v = rdf.NodeFactory.createVar('_x_');
        var exprVar = new sparql.ExprVar(v);
        var typeExprs = _(types).map(function(node) {
            var nodeValue = sparql.NodeValue.makeNode(node);
            var expr = new sparql.E_Equals(exprVar, nodeValue);
        return expr;

        
        var filterExpr = sparql.ExprUtils.orify(typeExprs); 
        
        triple = new rdf.Triple(propertyVar, vocab.rdf.type, v);

        var element = new sparql.ElementGroup([
            new sparql.ElementTriplesBlock([triple]),
            new sparql.ElementFilter(filterExpr)
        ]);
        
        //console.log('ELEMENTE' + element);
        
        facetElements.push(element);

    },

};

module.exports = CannedConceptUtils;
