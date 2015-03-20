var Class = require('../ext/Class');
var FacetServiceUtils = require('./FacetServiceUtils');

var FacetServiceFn = require('./facet_service/FacetServiceFn');
var FacetServiceClientIndex = require('./facet_service/FacetServiceClientIndex');

var LiteralPreference = require('../sparql/LiteralPreference');
var LookupServiceUtils = require('../sponate/LookupServiceUtils');
var FacetServiceTransformConcept = require('./facet_service/FacetServiceTransformConcept');

var ListServiceTransformItem = require('../service/list_service/ListServiceTransformItem');
var ListServiceTransformItems = require('../service/list_service/ListServiceTransformItems');
var MappedConceptUtils = require('../sponate/MappedConceptUtils');

var LabelUtils = require('../sparql/LabelUtils');
var KeywordSearchUtils = require('../sparql/search/KeywordSearchUtils');

var HashMap = require('../util/collection/HashMap');

var FacetServiceBuilder = Class.create({
   initialize: function(facetService, defaultSparqlService) {
       this.facetService = facetService;
       this.defaultSparqlService = defaultSparqlService;
   },

   create: function() {
       return this.facetService;
   },

   labelConfig: function(literalPreference) {
       literalPreference = literalPreference || new LiteralPreference();

       this.labelConfigLabels(literalPreference);
       this.labelConfigFilter(literalPreference);

       return this;
   },

   tagFn: function(tagFn) {
     this.facetService = new FacetServiceFn(this.facetService, function(listService) {
         var r = new ListServiceTransformItem(listService, tagFn);
         return r;
     });

     return this;
   },


   pathToTags: function(pathToTags, mapAttr) {
       pathToTags = pathToTags || new HashMap();
       mapAttr = mapAttr || 'tags';

       this.facetService = new FacetServiceFn(this.facetService, function(listService) {
           var r = new ListServiceTransformItems(listService, function(entries) {
               entries.forEach(function(entry) {
                   var val = entry.val;
                   var path = val.path;

                   var tags = pathToTags.get(path);
                   if(!tags) {
                       tags = {};
                       pathToTags.put(path, tags);
                   }
                   val[mapAttr] = tags;
               });

               return entries;
           });
           return r;
       });

       return this;
   },

//   labelLookupService: function(lookupServiceNodeLabel) {
//
//   },

   labelConfigFilter: function(literalPreference) {
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

       this.facetService = new FacetServiceTransformConcept(this.facetService, fnTransformSearch);
       return this;
   },

   labelConfigLabels: function(literalPreference, labelAttrName) {
       labelAttrName = labelAttrName || 'labelInfo';
       var self = this;

       this.facetService = new FacetServiceFn(this.facetService, function(listService) {

           var r = new ListServiceTransformItems(listService, function(entries) {

               var mappedConcept = MappedConceptUtils.createMappedConceptLiteralPreference(literalPreference);
               var lookupServiceNodeLabels = LookupServiceUtils.createLookupServiceMappedConcept(self.defaultSparqlService, mappedConcept);

               var properties = entries.map(function(entry) {
                   return entry.val.property;
               });

               //console.log('Properties: ' + JSON.stringify(properties));

               var s = lookupServiceNodeLabels.lookup(properties).then(function(map) {
                   entries.forEach(function(entry) {
                       entry.val[labelAttrName] = map.get(entry.val.property);
                   });

                   return entries;
               });

               return s;
           });

           return r;
       });

       return this;
   },

   // NOTE: A label config must already have been provided before calling this function
   index: function() {
       var filterSupplierFn = function(searchString) {
           var result;

           if(searchString != null) {
               var re = new RegExp(searchString, 'mi');

               result = function(entry) {
                   //var key = entry.key;
                   //var labelInfo = fnLabelInfo(key);
                   var labelInfo = entry.val.labelInfo || { id: entry.key.getUri(), displayLabel: entry.key.getUri(), hiddenLabels: []};
//console.log('labelInfo' + JSON.stringify(entry));
                   var m1 = re.test(labelInfo.id);
                   var m2 = m1 || re.test(labelInfo.displayLabel);
                   var m3 = m2 || (labelInfo.hiddenLabels && labelInfo.hiddenLabels.some(function(x) { return re.test(x); }));

                   return m3;
               };
           } else {
               result = function(entry) { return true; };
           }

           return result;
       };

       this.facetService = new FacetServiceClientIndex(this.facetService, filterSupplierFn, 100);

       return this;
   }


});

FacetServiceBuilder.core = function(sparqlService, facetConfig) {
    var facetService = FacetServiceUtils.createFacetService(sparqlService, facetConfig);
    var result = new FacetServiceBuilder(facetService, sparqlService);
    return result;
};

module.exports = FacetServiceBuilder;
