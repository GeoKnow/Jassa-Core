angular.module('ui.jassa.facet-typeahead', [])

/**
 * facet-typeahead
 *
 */
.directive('facetTypeahead', ['$compile', '$q', '$parse', function($compile, $q, $parse) {

    //var rdf = jassa.rdf;
    var sponate = jassa.sponate;
    var facete = jassa.facete;

    var parsePathSpec = function(pathSpec) {
        var result = pathSpec instanceof facete.Path ? pathSpec : facete.Path.parse(pathSpec);
        return result;
    };

    var makeListService = function(lsSpec, ftac) {
        var result;

        if(!lsSpec) {
            throw new Error('No specification for building a list service provided');
        }
        else if(Object.prototype.toString.call(lsSpec) === '[object String]') {
            var store = ftac.store;

            result = store.getListService(lsSpec);
            if(!result) {
                throw new Error('No collection with name ' + lsSpec + ' found');
            }
        }
        else if(lsSpec instanceof sponate.MappedConcept) {
            var sparqlService = ftac.sparqlService;
            result = jassa.sponate.ListServiceUtils.createListServiceMappedConcept(sparqlService, lsSpec);
        }
        else if(lsSpec instanceof sponate.MappedConceptSource) {
            var mappedConcept = lsSpec.getMappedConcept();
            var sparqlService = lsSpec.getSparqlService();

            result = jassa.sponate.ListServiceUtils.createListServiceMappedConcept(sparqlService, mappedConcept);
        }
        else if(lsSpec instanceof service.ListService) {
            result = lsSpec;
        }
        else {
            throw new Error('Unsupported list service type', lsSpec);
        }

        return result;
    };

    var createConstraints = function(idToModelPathMapping, searchFn, selectionOnly) {

        var result = [];
        var keys = Object.keys(idToModelPathMapping);
        keys.forEach(function(key) {
            var item = idToModelPathMapping[key];
            var scope = item.scope;
            var r;

            var val = item.modelExpr(scope);

            var pathSpec = item.pathExpr(scope);
            var path = parsePathSpec(pathSpec); //facete.PathUtils.

            var valStr;
            if(!selectionOnly && Object.prototype.toString.call(val) === '[object String]' && (valStr = val.trim()) !== '') {

                if(searchFn) {
                    var concept = searchFn(valStr);
                    r = new jassa.facete.ConstraintConcept(path, concept);
                } else {
                    //throw new Error('No keyword search strategy specified');
                    r = new jassa.facete.ConstraintRegex(path, valStr);
                }
            }
            else if(val && val.id) {
                var id = val.id;
                var node = id; //jassa.rdf.NodeFactory.createUri(id);
                r = new jassa.facete.ConstraintEquals(path, node);
            }
            else {
                r = null;
            }

            //console.log('Result constraint: ', r.createElementsAndExprs(config.facetConfig.getRootFacetNode()));

            if(r) {
                result.push(r);
            }
        });

        return result;
    };

    var FacetTypeAheadServiceAngular = function($scope, $q, configExpr, id, listServiceExpr) {
        this.$scope = $scope;
        this.$q = $q;

        this.configExpr = configExpr;
        this.id = id;
        this.listServiceExpr = listServiceExpr;
    };

    FacetTypeAheadServiceAngular.prototype.getSuggestions = function(filterString) {
        var config = this.configExpr(this.$scope);

        //var sparqlService = config.sparqlService;

        // Get the attributes from the config
        var idToModelPathMapping = config.idToModelPathMapping;

        var modelPathMapping = idToModelPathMapping[this.id];

        if(!modelPathMapping) {
            throw new Error('Cannot retrieve model-path mapping for facet-typeahead directive with id ' + id);
        }

        //var limit = modelPathMapping.limit || config.defaultLimit || 10;
        //var offset = modelPathMapping.offset || config.defaultOffset || 0;


        var pathSpec = modelPathMapping.pathExpr(this.$scope);
        var path = parsePathSpec(pathSpec);


        var lsSpec = this.listServiceExpr(this.$scope);
        var listService = makeListService(lsSpec, config);

        // Clone the constraints just for this set of suggestions
        var fc = config.facetConfig;
        var cm = fc.getConstraintManager();
        var cmClone = cm.shallowClone();


        var facetConfig = new facete.FacetConfig();
        facetConfig.setConstraintManager(cmClone);
        facetConfig.setBaseConcept(fc.getBaseConcept());
        facetConfig.setRootFacetNode(fc.getRootFacetNode());

        // Compile constraints
        var constraints = createConstraints(idToModelPathMapping, config.search);

        _(constraints).each(function(constraint) {
            cmClone.addConstraint(constraint);
        });

        //console.log('Constraints ', idToModelPathMapping, constraints);

        var facetValueConceptService = new jassa.facete.FacetValueConceptServiceExact(facetConfig);

        var result = facetValueConceptService.prepareConcept(path, false).then(function(concept) {
            //console.log('Path ' + path);
            //console.log('Concept: ' + concept);


            var r = listService.fetchItems(concept, 10).then(function(items) {
                var s = items.map(function(item) {
                    return item.val;
                });

                return s;
            });
            return r;
        });

        return result;

    };


    return {
        restrict: 'A',
        scope: true,
        //require: 'ngModel',
        // We need to run this directive before the the ui-bootstrap's type-ahead directive!
        priority: 1001,

        // Prevent angular calling other directives - we do it manually
        terminal: true,

        compile: function(elem, attrs) {

            if(!this.instanceId) {
                this.instanceId = 0;
            }

            var instanceId = 'facetTypeAhead-' + (this.instanceId++);

            var modelExprStr = attrs['ngModel'];
            var configExprStr = attrs['facetTypeahead'];
            var pathExprStr = attrs['facetTypeaheadPath'];
            var listServiceExprStr = attrs['facetTypeaheadSuggestions'];
            var labelAttr = attrs['facetTypeaheadLabel'];
            var modelAttr = attrs['facetTypeaheadModel'];

            labelAttr = labelAttr || 'id';
            modelAttr = modelAttr || 'id';
            // Add the URI-label directive

            console.log('labelAttr', labelAttr);
            console.log('modelAttr', modelAttr);

            // Remove the attribute to prevent endless loop in compilation
            elem.removeAttr('facet-typeahead');
            elem.removeAttr('facet-typeahead-path');
            elem.removeAttr('facet-typeahead-suggestions');
            elem.removeAttr('facet-typeahead-label');
            elem.removeAttr('facet-typeahead-model');


            //var newAttrVal = 'item.id as item.displayLabel for item in facetTypeAheadService.getSuggestions($viewValue)';
            var tmp = modelAttr ? '.' + modelAttr : '';
            var newAttrVal = 'item as item' + tmp + ' for item in facetTypeAheadService.getSuggestions($viewValue)';
            elem.attr('typeahead', newAttrVal);


            elem.attr('blurify', 'labelFn');

            return {
                pre: function(scope, elem, attrs) {

                    var modelExpr = $parse(modelExprStr);
                    var pathExpr = $parse(pathExprStr);
                    var configExpr = $parse(configExprStr);
                    var listServiceExpr = $parse(listServiceExprStr);

                    scope.labelFn = function(str) {
                        var model = modelExpr(scope);
                        var val = model ? model[labelAttr] : null;
                        var r = val ? val : str;
                        return r;
                    };


                    // Note: We do not need to watch the config, because we retrieve the most
                    // recent values when the suggestions are requested
                    // However, we need to register/unregister the directive from the config object when this changes
                    scope.$watch(configExprStr, function(newConfig, oldConfig) {

                        // Unregister from old config
                        if(oldConfig && oldConfig != newConfig && oldConfig.modelToPathMapping) {
                            delete oldConfig.idToModelPathMapping[instanceId];
                        }

                        if(newConfig) {
                            if(!newConfig.idToModelPathMapping) {
                                newConfig.idToModelPathMapping = {};
                            }

                            newConfig.idToModelPathMapping[instanceId] = {
                                modelExpr: modelExpr,
                                modelExprStr: modelExprStr,
                                pathExprStr: pathExprStr,
                                pathExpr: pathExpr,
                                scope: scope
                            };


                            newConfig.getConstraints = function(selectionOnly) {
                                var result = createConstraints(newConfig.idToModelPathMapping, newConfig.search, selectionOnly);
                                return result;
                            };
                        }
                    });


                    scope.facetTypeAheadService = new FacetTypeAheadServiceAngular(scope, $q, configExpr, instanceId, listServiceExpr);
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

