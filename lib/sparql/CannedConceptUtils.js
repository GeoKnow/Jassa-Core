var rdf = require('../vocab/rdf');
var owl = require('../vocab/owl');

var Triple = require('../rdf/Triple');

var ElementTriplesBlock = require('../sparql/element/ElementTriplesBlock');
var ElementFilter = require('../sparql/element/ElementFilter');
var ElementGroup = require('../sparql/element/ElementGroup');
var E_LogicalOr = require('../sparql/expr/E_LogicalOr');
var E_Equals = require('../sparql/expr/E_Equals');
var ExprVar = require('../sparql/expr/ExprVar');

var Concept = require('../sparql/Concept');

var NodeValueUtils = require('../sparql/NodeValueUtils');
var VarUtils = require('../sparql/VarUtils');

var CannedConceptUtils = {

    /**
     * Parser.parseGraphPattern(
     * {
     *   ?s a ?o .
     *   Filter(?o = rdf:Property || ?o = owl:DatatypeProperty || ?o = owl:ObjectProperty || ?o = owl:AnnotationProperty)
     *   # Alternative:
     *   Filter(?o In (rdf:Property, owl:DatatypeProperty, owl:ObjectProperty, owl:AnnotationProperty))
     * }
     *
     */
    createConceptDeclaredProperties: function(s, o) {
        s = s || VarUtils.s;
        o = o || VarUtils.o;

        var eo = new ExprVar(o);

        var rdfProperty = NodeValueUtils.makeNode(rdf.Property);
        var owlDatatypeProperty = NodeValueUtils.makeNode(owl.DatatypeProperty);
        var owlObjectProperty = NodeValueUtils.makeNode(owl.ObjectProperty);
        var owlAnnotationProperty = NodeValueUtils.makeNode(owl.AnnotationProperty);

        var result = new Concept(
            new ElementGroup([
                new ElementTriplesBlock([new Triple(s, rdf.type, o)]),
                new ElementFilter(
                    new E_LogicalOr(
                        new E_Equals(eo, rdfProperty),
                        new E_LogicalOr(
                            new E_Equals(eo, owlDatatypeProperty),
                            new E_LogicalOr(
                                new E_Equals(eo, owlObjectProperty),
                                new E_Equals(eo, owlAnnotationProperty)
                            )
                        )
                    )
                )
            ]),
            s);

        return result;
    }

    // TODO We need to integrate the rdfstore js parser, so we can do Concept.parse();
//    createConceptDeclaredProperties: function() {
//
//        var types = [rdf.Property, owl.AnnotationProperty, owl.DatatypeProperty, owl.ObjectProperty];
//
//        var o = VarUtils.o;
//        var exprVar = new ExprVar(o);
//        var typeExprs = _(types).map(function(node) {
//            var nodeValue = NodeValue.makeNode(node);
//            var expr = new E_Equals(exprVar, nodeValue);
//        return expr;
//
//
//        var filterExpr = ExprUtils.orify(typeExprs);
//
//        triple = new Triple(propertyVar, vocab.rdf.type, v);
//
//        var element = new ElementGroup([
//            new ElementTriplesBlock([triple]),
//            new ElementFilter(filterExpr)
//        ]);
//
//        //console.log('ELEMENTE' + element);
//
//        facetElements.push(element);
//
//    },


};


module.exports = CannedConceptUtils;
