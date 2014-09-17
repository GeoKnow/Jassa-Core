var ObjectUtils = require('../util/ObjectUtils');
var PrefixUtils = require('../util/PrefixUtils');

var Element = require('../sparql/element/Element');
var ElementString = require('../sparql/element/ElementString');

var TemplateParser = require('./TemplateParser');

var ListServiceUtils = require('./ListServiceUtils');
var AggMap = require('./agg/AggMap');
var MappedConcept = require('./MappedConcept');
var ExprVar = require('../sparql/expr/ExprVar');

var Concept = require('../sparql/Concept');

var AggUtils = require('./AggUtils');

var SponateUtils = {



    /**
     * Parses a sponate mapping spec object into a MappedConcept.
     *
     */
    parseSpec: function(spec, prefixMapping, templateParser) {
        var template = spec.template;

        var result
            = (template instanceof MappedConcept)
            ? template
            : this.parseSpecCore(spec, prefixMapping, templateParser)
            ;

        return result;
    },

    parseSpecCore: function(spec, prefixMapping, templateParser) {

        templateParser = templateParser || new TemplateParser();

        var template = spec.template;
        var from = spec.from;

        // Parse the 'from' attribute into an ElementFactory
        // TODO Move to util class
        var element;
        if(ObjectUtils.isString(from)) {

            var elementStr = from;

            if(prefixMapping != null) {
                var prefixes = prefixMapping.getNsPrefixMap();
                //var vars = sparql.extractSparqlVars(elementStr);
                elementStr = PrefixUtils.expandPrefixes(prefixes, elementStr);
            }

            element = new ElementString.create(elementStr);

            //elementFactory = new sparql.ElementFactoryConst(element);
        }
        else if(from instanceof Element) {
            element = from;
        }
//        else if(from instanceof ElementFactory) {
//            throw new Error('ElementFactories / functions in the FROM part not supported anymore');
//        }
        else if(ObjectUtils.isFunction(from)) {
            throw new Error('ElementFactories / functions in the FROM part not supported anymore');
        }
        else {
            throw new Error('Unknown argument type for FROM attribute', from);
        }

        //this.context.mapTableNameToElementFactory(name, elementFactory);

        // TODO The support joining the from element

        var tmp = templateParser.parseAgg(template);

        // Remove the outer most transformation wrapping an AggMap!
        var agg = AggUtils.unwrapAggTransform(tmp);

        // Extract the ID attribute
        var idExpr;


        //var tmp = AggUtils.unwrapAggTransform(agg);
        if(agg instanceof AggMap) {
            var keyBindingMapper = agg.getKeyBindingMapper();
            idExpr = keyBindingMapper.getExpr(); // TODO Check for whether the mapper provides getExpr()
        }
        else {
            throw new Error('Could not obtain ID attribute from aggregator');
        }

        var idVar;
        if(idExpr instanceof ExprVar) {
            idVar = idExpr.asVar();
        }
        else {
            throw new Error('Variable required for ID attribute, got an expression instead: ' + idExpr);
        }

        var concept = new Concept(element, idVar);

        var result = new MappedConcept(concept, agg);
        return result;
    },

};

module.exports = SponateUtils;
