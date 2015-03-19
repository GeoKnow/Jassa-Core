var Class = require('../ext/Class');

var ListServiceTransformConcept = require('../service/list_service/ListServiceTransformConcept');
var ListServiceConceptKeyLookup = require('../service/list_service/ListServiceConceptKeyLookup');

var LookupServiceUtils = require('../sponate/LookupServiceUtils');

var FacetValueService = require('./facet_value_service/FacetValueService');
var FacetValueServiceWrapListService = require('./facet_value_service/FacetValueServiceWrapListService');

var LiteralPreference = require('../sparql/LiteralPreference');
var KeywordSearchUtils = require('../sparql/search/KeywordSearchUtils');
var LabelUtils = require('../sparql/LabelUtils');


var FacetValueServiceBuilder = Class.create({
    initialize: function(facetValueService, sparqlService) {
        this.facetValueService = facetValueService;
        this.sparqlService = sparqlService;
    },

    labelConfig: function(literalPreference) {
        literalPreference = literalPreference || new LiteralPreference();

        this._labelConfigLookup(literalPreference);
        this._labelConfigFilter(literalPreference);

        return this;
    },

    wrapListService: function(listServiceWrapperFn) {
        this.facetValueService = new FacetValueServiceWrapListService(this.facetValueService, listServiceWrapperFn);

        return this;
    },

    _labelConfigFilter: function(literalPreference) {
        // TODO: Make the search function configurable

        var fnTransformSearch = function(searchString) {
            var r;
            if(searchString) {

                var relation = LabelUtils.createRelationLiteralPreference(literalPreference);
                // TODO Make it configurable to whether scan URIs too (the true argument)
                r = KeywordSearchUtils.createConceptRegex(relation, searchString, true);
                //var result = sparql.KeywordSearchUtils.createConceptBifContains(relation, searchString);
            } else {
                r = null;
            }

            return r;
        };


        var listServiceWrapperFn = function(ls) {
          var r = new ListServiceTransformConcept(ls, fnTransformSearch);
          return r;
        };

        this.facetValueService = new FacetValueServiceWrapListService(this.facetValueService, listServiceWrapperFn);

        //this.facetService = new FacetServiceTransformConcept(this.facetService, listServiceWrapperFn);
        return this;
    },

    _labelConfigLookup: function(literalPreference) {
        //this._labelConfigLabels(bestLiteralConfig);
        //this._labelConfigFilter(bestLiteralConfig);

        var self = this;

        var listServiceWrapperFn = function(ls) {
            var lookupServiceNodeLabels = LookupServiceUtils.createLookupServiceNodeLabels(self.sparqlService, literalPreference);

            var r = new ListServiceConceptKeyLookup(ls, lookupServiceNodeLabels);
            return r;
        };

        this.facetValueService = new FacetValueServiceWrapListService(this.facetValueService, listServiceWrapperFn);

        return this;
    },

    create: function() {
        return this.facetValueService;
    }
});


FacetValueServiceBuilder.core = function(sparqlService, facetConfig, rowLimit) {
    var facetValueService = new FacetValueService(sparqlService, facetConfig, rowLimit);

    var result = new FacetValueServiceBuilder(facetValueService, sparqlService);
    return result;
};

module.exports = FacetValueServiceBuilder;
