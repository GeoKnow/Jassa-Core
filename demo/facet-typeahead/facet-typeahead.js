angular.module('ui.jassa.facet-typeahead', [])

.directive('facetTypeahead', ['$compile', '$q', '$parse', function($compile, $q, $parse) {

    var rdf = jassa.rdf;
    var facete = jassa.facete;

    var parsePathSpec = function(pathSpec) {
        var result = pathSpec instanceof facete.Path ? pathSpec : facete.Path.parse(pathSpec);
        return result;
    };

    var FacetTypeAheadServiceAngular = function($scope, $q, configExpr, id) {
            this.$scope = $scope;
            this.$q = $q;

            this.configExpr = configExpr;
            this.id = id;
        };

        FacetTypeAheadServiceAngular.prototype.getSuggestions = function(filterString) {
            var config = this.configExpr(this.$scope);

            var sparqlService = config.sparqlService;
            //var fct = config.facetTreeConfig;
            //var facetConfig = config.facetConfig;

            // Get the attributes from the config
            var idToModelPathMapping = config.idToModelPathMapping;

            var modelPathMapping = idToModelPathMapping[this.id];

            if(!modelPathMapping) {
                console.log('Cannot retrieve model-path mapping for facet-typeahead directive with id ' + id);
                throw 'Bailing out';
            }

            var limit = modelPathMapping.limit || config.defaultLimit || 10;
            var offset = modelPathMapping.offset || config.defaultOffset || 0;


            var pathSpec = modelPathMapping.pathExpr(this.scope);
            var path = parsePathSpec(pathSpec);

            // Hack - the facetService should only depend on FacetConfig
            var fc = config.facetConfig;
            var cm = fc.getConstraintManager();
            var cmClone = cm.shallowClone();


            var facetConfig = new facete.FacetConfig();
            facetConfig.setConstraintManager(cmClone);
            facetConfig.setBaseConcept(fc.getBaseConcept());
            facetConfig.setRootFacetNode(fc.getRootFacetNode());
            //facetConfig.setLabelMap(facetConfig.getLabelMap());

            //var facetTreeConfig = new facete.FacetTreeConfig();
            //facetTreeConfig.setFacetConfig(facetConfig);
            // TODO HACK Use a setter instead
            //facetTreeConfig.facetConfig = facetConfig;


            // Compile constraints
            var self = this;

            var constraints = _(idToModelPathMapping).map(function(item) {
                var valStr = item.modelExpr(self.$scope);
                if(!valStr || valStr.trim() === '') {
                    return null;
                }

                var val = rdf.NodeFactory.createPlainLiteral(valStr);
                var pathSpec = item.pathExpr(self.$scope);
                var path = parsePathSpec(pathSpec); //facete.PathUtils.


                var r = new jassa.facete.ConstraintRegex(path, val);
                return r;
            });

            constraints = _(constraints).compact();

            _(constraints).each(function(constraint) {
                cmClone.addConstraint(constraint);
            });


//            var facetValueService = new jassa.facete.FacetValueService(sparqlService, facetConfig, 5000000);
//            var result = facetValueService.prepareTableService(path, false).then(function(listService) {
//                return listService.fetchItems(null, 100);
//            });

            var bestLabelConfig = new sparql.BestLabelConfig();
            var mappedConcept = sponate.MappedConceptUtils.createMappedConceptBestLabel(bestLabelConfig);

            var itemService = sponate.ListServiceUtils.createListServiceMappedConcept(sparqlService, mappedConcept);


            var facetValueConceptService = new jassa.facete.FacetValueConceptServiceExact(facetConfig);

            var result = facetValueConceptService.prepareConcept(path, false).then(function(concept) {
                var r = itemService.fetchItems(concept, 10).then(function(items) {
                    console.log('Items: ' + JSON.stringify(items, null, 4));
                    //return ['foo', 'bar'];
                    return items;
                });
                return r;
                //jassa.sparql.ConceptUtils.createCombinedConcept();
            });

            // TODO Currently we really return a list service rather than a table service

            /*
            var p1 = fetcher.fetchData(offset, limit); //offset);
            var p2 = fetcher.fetchCount();

            var p3 = jQuery.when.apply(null, [p1, p2]).pipe(function(data, count) {
                var r = {
                    offset: this.offset,
                    count: count,
                    data: data
                };

                return r;
            });


            var p4 = p3.pipe(function(data) {
                var r = _(data.data).map(function(item) {
                   return item.displayLabel;
                });

                return r;
            });

            var result = jassa.sponate.angular.bridgePromise(p4, this.$q.defer(), this.$scope.$root);
            */
            return result;
    };



    return {
        restrict: 'A',
        scope: true,

        // We need to run this directive before the the ui-bootstrap's type-ahead directive!
        priority: 1001,

        // Prevent angular calling other directives - we do it manually
        terminal: true,

        compile: function(elem, attrs) {

            if(!this.instanceId) {
                this.instanceId = 0;
            }

            var instanceId = 'facetTypeAhead-' + (this.instanceId++);
            //console.log('INSTANCEID', instanceId);

            var modelExprStr = attrs['ngModel'];
            var configExprStr = attrs['facetTypeahead'];
            var pathExprStr = attrs['facetTypeaheadPath'];
            var listServiceExprStr = attrs['facetTypeaheadList'];

            // Remove the attribute to prevent endless loop in compilation
            elem.removeAttr('facet-typeahead');
            elem.removeAttr('facet-typeahead-path');
            elem.removeAttr('facet-typeahead-list');

            var newAttrVal = 'item.id.getUri() as item.displayLabel for item in facetTypeAheadService.getSuggestions($viewValue)';
            elem.attr('typeahead', newAttrVal);


            return {
                pre: function(scope, elem, attrs) {

                    var modelExpr = $parse(modelExprStr);
                    var pathExpr = $parse(pathExprStr);
                    var configExpr = $parse(configExprStr);

                    // Note: We do not need to watch the config, because we retrieve the most
                    // recent values when the suggestions are requested
                    // However, we need to register/unregister the directive from the config object when this changes
                    scope.$watch(configExprStr, function(newConfig, oldConfig) {

                        if(!newConfig) {
                            return;
                        }

                        if(!newConfig.idToModelPathMapping) {
                            newConfig.idToModelPathMapping = {};
                        }


                        newConfig.idToModelPathMapping[instanceId] = {
                            modelExpr: modelExpr,
                            modelExprStr: modelExprStr,
                            pathExprStr: pathExprStr,
                            pathExpr: pathExpr
                        };

                        // TODO Unregister from old config
                        if(oldConfig && oldConfig != newConfig && oldConfig.modelToPathMapping) {
                            delete oldConfig.idToModelPathMapping[instanceId];
                        }
                    });


                    scope.facetTypeAheadService = new FacetTypeAheadServiceAngular(scope, $q, configExpr, instanceId);
                },

                post: function(scope, elem, attr) {
                    // Continue processing any further directives
                    $compile(elem)(scope);
                }
            };
        }
    };
}])

;

