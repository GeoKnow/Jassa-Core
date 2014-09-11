var NodeUtils = require('../rdf/NodeUtils');

var LabelUtils = require('../sparql/LabelUtils');
var VarUtils = require('../sparql/VarUtils');
var ExprVar = require('../sparql/expr/ExprVar');

var AggArray = require('./agg/AggArray');
var AggLiteral = require('./agg/AggLiteral');
var AggMap = require('./agg/AggMap');
var AggObject = require('./agg/AggObject');
var AggBestLabel = require('./agg/AggBestLabel');
var AggTransform = require('./agg/AggTransform');

var BindingMapperExpr = require('./binding_mapper/BindingMapperExpr');
var BindingMapperTransform = require('./binding_mapper/BindingMapperTransform');

var Concept = require('../sparql/Concept');
var MappedConcept = require('./MappedConcept');

var NodeUtils = require('../rdf/NodeUtils');

var MappedConceptUtils = {

    createMappedConceptBestLabel: function(bestLabelConfig) {
        var relation = LabelUtils.createRelationPrefLabels(bestLabelConfig);

        var s = relation.getSourceVar();
        var o = relation.getTargetVar();

        var agg =
            new AggObject({
                id: new AggTransform(new AggLiteral(new BindingMapperExpr(new ExprVar(s))), NodeUtils.getValue),
                displayLabel: new AggTransform(new AggBestLabel(bestLabelConfig), NodeUtils.getValue),
                hiddenLabels: new AggArray(
                    new AggTransform(new AggLiteral(new BindingMapperExpr(new ExprVar(o))), NodeUtils.getValue))
            });

        agg = new AggMap(new BindingMapperExpr(new ExprVar(s)), agg);


        var labelConcept = new Concept(relation.getElement(), relation.getSourceVar());
        var result = new MappedConcept(labelConcept, agg);

        return result;
    },

};

module.exports = MappedConceptUtils;
