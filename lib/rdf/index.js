'use strict';

var ns = {
    AnonId: require('./AnonId'),
    AnonIdStr: require('./AnonIdStr'),
    GraphImpl: require('./GraphImpl'),
    GraphUtils: require('./GraphUtils'),
    LiteralLabel: require('./LiteralLabel'),
    NodeFactory: require('./NodeFactory'),
    NodeUtils: require('./NodeUtils'),
    PrefixMappingImpl: require('./PrefixMappingImpl'),
    Triple: require('./Triple'),
    TripleUtils: require('./TripleUtils'),
    TypeMapper: require('./TypeMapper'),
    DatatypeLabel: require('./datatype/DatatypeLabel'),
    DatatypeLabelDate: require('./datatype/DatatypeLabelDate'),
    DatatypeLabelFloat: require('./datatype/DatatypeLabelFloat'),
    DatatypeLabelInteger: require('./datatype/DatatypeLabelInteger'),
    DatatypeLabelString: require('./datatype/DatatypeLabelString'),
    DefaultDatatypeLabels: require('./datatype/DefaultDatatypeLabels'),
    Node: require('./node/Node'),
    Node_Blank: require('./node/Node_Blank'),
    Node_Concrete: require('./node/Node_Concrete'),
    Node_Fluid: require('./node/Node_Fluid'),
    Node_Literal: require('./node/Node_Literal'),
    Node_Uri: require('./node/Node_Uri'),
    Node_Variable: require('./node/Node_Variable'),
    Var: require('./node/Var'),
    BaseDatatype: require('./rdf_datatype/BaseDatatype'),
    DefaultRdfDatatypes: require('./rdf_datatype/DefaultRdfDatatypes'),
    RdfDatatype: require('./rdf_datatype/RdfDatatype'),
    RdfDatatypeBase: require('./rdf_datatype/RdfDatatypeBase'),
    RdfDatatypeLabel: require('./rdf_datatype/RdfDatatypeLabel'),
    TypedValue: require('./rdf_datatype/TypedValue'),
    Coordinate: require('./talis/Coordinate'),
    GraphTalis: require('./talis/GraphTalis'),
    TalisRdfJsonUtils: require('./talis/TalisRdfJsonUtils')
};

//Object.freeze(ns);

module.exports = ns;
