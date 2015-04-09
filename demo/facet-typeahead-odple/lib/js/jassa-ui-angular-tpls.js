/*
 * jassa-ui-angular
 * https://github.com/GeoKnow/Jassa-UI-Angular

 * Version: 0.0.4-SNAPSHOT - 2014-09-23
 * License: MIT
 */
angular.module("ui.jassa", ["ui.jassa.tpls", "ui.jassa.auto-focus","ui.jassa.blurify","ui.jassa.constraint-list","ui.jassa.facet-tree","ui.jassa.facet-typeahead","ui.jassa.facet-value-list","ui.jassa.jassa-list-browser","ui.jassa.jassa-media-list","ui.jassa.lang-select","ui.jassa.list-search","ui.jassa.pointer-events-scroll-fix","ui.jassa.resizable","ui.jassa.sparql-grid","ui.jassa.template-list"]);
angular.module("ui.jassa.tpls", ["template/constraint-list/constraint-list.html","template/facet-tree/facet-dir-content.html","template/facet-tree/facet-dir-ctrl.html","template/facet-tree/facet-tree-item.html","template/facet-value-list/facet-value-list.html","template/jassa-list-browser/jassa-list-browser.html","template/jassa-media-list/jassa-media-list.html","template/lang-select/lang-select.html","template/list-search/list-search.html","template/sparql-grid/sparql-grid.html","template/template-list/template-list.html"]);
angular.module('ui.jassa.auto-focus', [])

// Source: http://stackoverflow.com/questions/14833326/how-to-set-focus-on-input-field
.directive('autoFocus', function($timeout, $parse) {
    return {
        link: function(scope, element, attrs) {
            var model = $parse(attrs.autoFocus);
            scope.$watch(model, function(value) {
                if(value === true) {
                    $timeout(function() {
                         element[0].focus();
                    });
                }
            });
            // to address @blesh's comment, set attribute value to 'false'
            // on blur event:
            element.bind('blur', function() {
                if(model.assign) {
                    scope.$apply(model.assign(scope, false));
                }
            });
        }
    };
})

;


angular.module('ui.jassa.blurify', [])

/**
 * Replaces text content with an alternative on blur
 * blurify="(function(model) { return 'displayValue'; })"
 *
 */
.directive('blurify', [ '$parse', function($parse) {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function($scope, element, attrs, model) {
            element.on('focus', function () {
                // Re-render the model on focus
                model.$render();
            });
            element.on('blur', function () {
                var modelVal = $parse(attrs['ngModel'])($scope);
                var labelFn = $parse(attrs['blurify'])($scope);

                if(labelFn) {
                    var val = labelFn(modelVal);
                    if(val && val.then) {
                        val.then(function(label) {
                            element.val(label);
                        });
                    } else {
                        element.val(val);
                    }
                }
//              $scope.$apply(function() {
//                  model.$setViewValue(val);
//              });
            });
        }
    };
}])

;


angular.module('ui.jassa.constraint-list', [])

.controller('ConstraintListCtrl', ['$scope', '$q', '$rootScope', function($scope, $q, $rootScope) {

    var self = this;

    //var constraintManager;

    var updateConfig = function() {
        var isConfigured = $scope.facetTreeConfig;
        //debugger;
        $scope.constraintManager = isConfigured ? $scope.facetTreeConfig.getFacetConfig().getConstraintManager() : null;
    };
    
    var update = function() {
        updateConfig();
        self.refresh();
    };


    $scope.ObjectUtils = Jassa.util.ObjectUtils;

    var watchList = '[ObjectUtils.hashCode(facetTreeConfig)]';
    $scope.$watch(watchList, function() {
		update();
	}, true);
    
    $scope.$watch('sparqlService', function() {
        update();
    });
    
    $scope.$watch('labelService', function() {
        update();
    });
    
    
    var renderConstraint = function(constraint) {
        var type = constraint.getName();

        var result;
        switch(type) {
        case 'equals':
            var pathStr = ''  + constraint.getDeclaredPath();
            if(pathStr === '') {
                pathStr = '()';
            }
            result = pathStr + ' = ' + constraint.getValue();
        break;
        default:
            result = constraint;
        }
        
        return result;
    };
    
    self.refresh = function() {

        var constraintManager = $scope.constraintManager;
        var constraints = constraintManager ? constraintManager.getConstraints() : [];

        var promise = jassa.service.LookupServiceUtils.lookup($scope.labelService, constraints);

        jassa.sponate.angular.bridgePromise(promise, $q.defer(), $scope, function(map) {

            var items =_(constraints).map(function(constraint) {
                var label = map.get(constraint);

                var r = {
                    constraint: constraint,
                    label: label
                };
                
                return r;
            });

            $scope.constraints = items;
        });
    };
    
    $scope.removeConstraint = function(item) {
        $scope.constraintManager.removeConstraint(item.constraint);
        //$scope.$emit('facete:constraintsChanged');
    };
    
}])


/**
 * The actual dependencies are:
 * - sparqlServiceFactory
 * - facetTreeConfig
 * - labelMap (maybe this should be part of the facetTreeConfig) 
 */
.directive('constraintList', function() {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/constraint-list/constraint-list.html',
        transclude: false,
        require: 'constraintList',
        scope: {
            sparqlService: '=',
            labelService: '=',
            facetTreeConfig: '=',
            onSelect: '&select'
        },
        controller: 'ConstraintListCtrl'
    };
})

;

angular.module('ui.jassa.facet-tree', [])

/**
 * Controller for the SPARQL based FacetTree
 * Supports nested incoming and outgoing properties
 *
 */
.controller('FacetTreeDirContentCtrl', ['$rootScope', '$scope', '$q', function($rootScope, $scope, $q) {

}])

/**
 * The actual dependencies are:
 * - sparqlServiceFactory
 * - facetTreeConfig
 * - labelMap (maybe this should be part of the facetTreeConfig) 
 */
.directive('facetTreeDirContent', function($parse) {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/facet-tree/facet-tree-content.html',
        transclude: false,
        require: 'facetTree',
        scope: {
            sparqlService: '=',
            facetTreeConfig: '=',
            plugins: '=',
            onSelect: '&select'
        },
        controller: 'FacetTreeDirContentCtrl',
        compile: function(elm, attrs) {
            return function link(scope, elm, attrs, controller) {
            };
        }
    };
})

;

angular.module('ui.jassa.facet-tree', ['ui.jassa.template-list'])

/**
 * Controller for the SPARQL based FacetTree
 * Supports nested incoming and outgoing properties
 *
 */
.controller('FacetTreeCtrl', ['$rootScope', '$scope', '$q', function($rootScope, $scope, $q) {
        
    var self = this;
      
      
    var updateFacetTreeService = function() {
        var isConfigured = $scope.sparqlService && $scope.facetTreeConfig;
        //debugger;
        $scope.facetTreeService = isConfigured ? Jassa.facete.FaceteUtils.createFacetTreeService($scope.sparqlService, $scope.facetTreeConfig, null) : null;
    };
    
    var update = function() {
        updateFacetTreeService();
        //controller.refresh();
        self.refresh();
    };
    
    
    $scope.setFacetHover = function(facet, isHovered) {
        facet.isHovered = isHovered;
        if(facet.incoming) {
            facet.incoming.isHovered = isHovered;
        }
        
        if(facet.outgoing) {
            facet.outgoing.isHovered = isHovered;
        }
    };

    $scope.ObjectUtils = Jassa.util.ObjectUtils;

    var watchList = '[ObjectUtils.hashCode(facetTreeConfig)]';
    $scope.$watch(watchList, function() {
        update();
    }, true);
    
    $scope.$watch('sparqlService', function() {
        update();
    });
    
      
    $scope.doFilter = function(path, filterString) {
        $scope.facetTreeConfig.getPathToFilterString().put(path, filterString);
        self.refresh();
    };
    
    self.refresh = function() {
                  
        var facet = $scope.facet;
        var startPath = facet ? facet.item.getPath() : new Jassa.facete.Path();
    
        if($scope.facetTreeService) {
          
            var facetTreeTagger = Jassa.facete.FaceteUtils.createFacetTreeTagger($scope.facetTreeConfig.getPathToFilterString());
    
            //console.log('scopefacets', $scope.facet);             
            var promise = $scope.facetTreeService.fetchFacetTree(startPath);
              
            Jassa.sponate.angular.bridgePromise(promise, $q.defer(), $rootScope, function(data) {
                facetTreeTagger.applyTags(data);
                $scope.facet = data;
            });
    
        } else {
            $scope.facet = null;
        }
    };
              
    $scope.toggleCollapsed = function(path) {
        Jassa.util.CollectionUtils.toggleItem($scope.facetTreeConfig.getExpansionSet(), path);
          
        var val = $scope.facetTreeConfig.getExpansionMap().get(path);
        if(val == null) {
            $scope.facetTreeConfig.getExpansionMap().put(path, 1);
        }
          
        self.refresh();
    };
      
    $scope.selectIncoming = function(path) {
        //console.log('Incoming selected at path ' + path);
        if($scope.facetTreeConfig) {
            var val = $scope.facetTreeConfig.getExpansionMap().get(path);
            if(val != 2) {
                $scope.facetTreeConfig.getExpansionMap().put(path, 2);
                self.refresh();
            }
        }
    };
      
    $scope.selectOutgoing = function(path) {
        //console.log('Outgoing selected at path ' + path);
        if($scope.facetTreeConfig) {
            var val = $scope.facetTreeConfig.getExpansionMap().get(path);
            if(val != 1) {
                $scope.facetTreeConfig.getExpansionMap().put(path, 1);
                self.refresh();
            }
        }
    };
      
      
    $scope.selectFacetPage = function(page, facet) {
        var path = facet.item.getPath();
        var state = $scope.facetTreeConfig.getFacetStateProvider().getFacetState(path);
        var resultRange = state.getResultRange();
          
        console.log('Facet state for path ' + path + ': ' + state);
            var limit = resultRange.getLimit() || 0;
              
            var newOffset = limit ? (page - 1) * limit : null;
              
            resultRange.setOffset(newOffset);
            
            self.refresh();
        };
          
        $scope.toggleSelected = function(path) {
            $scope.onSelect({path: path});
        };
  
        $scope.toggleTableLink = function(path) {
            //$scope.emit('facete:toggleTableLink');
        tableMod.togglePath(path);
      
        //$scope.$emit('')
        // alert('yay' + JSON.stringify(tableMod.getPaths()));
      
        $scope.$emit('facete:refresh');
      
//        var columnDefs = tableMod.getColumnDefs();
//        _(columnDefs).each(function(columnDef) {
          
//        });
      
//        tableMod.addColumnDef(null, new ns.ColumnDefPath(path));
      //alert('yay ' + path);
        };
      
  //  $scope.$on('facete:refresh', function() {
//        $scope.refresh();
  //  });
}])

/**
 * The actual dependencies are:
 * - sparqlServiceFactory
 * - facetTreeConfig
 * - labelMap (maybe this should be part of the facetTreeConfig) 
 */
.directive('facetTree', function() {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/facet-tree/facet-tree-item.html',
        transclude: false,
        require: 'facetTree',
        scope: {
            sparqlService: '=',
            facetTreeConfig: '=',
            plugins: '=',
            pluginContext: '=', //plugin context
            onSelect: '&select'
        },
        controller: 'FacetTreeCtrl',
        compile: function(elm, attrs) {
            return function link(scope, elm, attrs, controller) {
            };
        }
    };
})

;

angular.module('ui.jassa.facet-typeahead', [])

.directive('facetTypeahead', ['$compile', '$q', '$parse', function($compile, $q, $parse) {

    var FacetTypeAheadServiceAngular = Class.create({
        initialize: function($scope, $q, configExpr, id) {
            this.$scope = $scope;
            this.$q = $q;

            this.configExpr = configExpr;
            this.id = id;
        },
        
        getSuggestions: function(filterString) {
            var config = this.configExpr(this.$scope);

            var sparqlService = config.sparqlService;
            var fct = config.facetTreeConfig;

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
            var path = jassa.facete.PathUtils.parsePathSpec(pathSpec);
            
            // Hack - the facetService should only depend on FacetConfig
            var tmp = fct.getFacetConfig();
            
            var cm = tmp.getConstraintManager();
            var cmClone = cm.shallowClone();
            
            var facetConfig = new jassa.facete.FacetConfig();
            facetConfig.setConstraintManager(cmClone);
            facetConfig.setBaseConcept(tmp.getBaseConcept());
            facetConfig.setRootFacetNode(tmp.getRootFacetNode());
            facetConfig.setLabelMap(tmp.getLabelMap());
            
            var facetTreeConfig = new jassa.facete.FacetTreeConfig();
            //facetTreeConfig.setFacetConfig(facetConfig);
            // TODO HACK Use a setter instead
            facetTreeConfig.facetConfig = facetConfig;

            
            // Compile constraints
            var self = this;
            
            var constraints = _(idToModelPathMapping).map(function(item) {
                var valStr = item.modelExpr(self.$scope);
                if(!valStr || valStr.trim() === '') {
                    return null;
                }

                var val = jassa.rdf.NodeFactory.createPlainLiteral(valStr);
                var pathSpec = item.pathExpr(self.$scope);
                var path = jassa.facete.PathUtils.parsePathSpec(pathSpec);


                var r = new jassa.facete.ConstraintRegex(path, val);
                return r;
            });
            
            constraints = _(constraints).compact();
            
            _(constraints).each(function(constraint) {
                cmClone.addConstraint(constraint);
            });

            
            var facetValueService = new jassa.facete.FacetValueService(sparqlService, facetTreeConfig);
            var fetcher = facetValueService.createFacetValueFetcher(path, filterString);
            
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
            return result;
        }
    });



    return {
        restrict: 'A',
        scope: true,
        //require: ['ngModel', 'facetTypeaheadPath'], // TODO I want to require attributes on elem - not directives - seems require is only for the latter?
        /*
        scope: {
            'facetTypeahead': '=',
            ''
        },
        */

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
            
            // Remove the attribute to prevent endless loop in compilation
            elem.removeAttr('facet-typeahead');
            elem.removeAttr('facet-typeahead-path');

            var newAttrVal = 'item for item in facetTypeAheadService.getSuggestions($viewValue)';
            //var newAttrVal = 'item for item in getSuggestions($viewValue);'
            //newAttrVal = $sanitize(newAttrVal);
            elem.attr('typeahead', newAttrVal);


            return {
                pre: function(scope, elem, attrs) {
//                         var requiredAttrNames = ['ng-model', 'facet-typeahead', 'facet-typeahead-path']
                    
//                         var attrExprs = {};
//                         _(requiredAttrNames).each(function(attrName) {
//                             var exprStr = elem.attr(attrName);

//                             attrExprs[attrName] = $parse(exprStr);
//                         });

                    // TODO Check if any of the required attributes were left undefined

                                     
//                     },
                
//                     post: function(scope, elem, attrs) {

                    /*
                    var modelExprStr = this.modelExprStr;
                    var configExprStr = this.configExprStr;
                    var pathExprStr = this.pathExprStr;
                    */
                    

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



angular.module('ui.jassa.facet-value-list', [])

/**
 * Controller for the SPARQL based FacetTree
 * Supports nested incoming and outgoing properties
 *
 */
.controller('FacetValueListCtrl', ['$rootScope', '$scope', '$q', function($rootScope, $scope, $q) {

    $scope.filterText = '';

    $scope.pagination = {
        totalItems: 0,
        currentPage: 1,
        maxSize: 5
    };
    
    //$scope.path = null;
    

    var facetValueService = null;
    
    var self = this;


    var updateFacetTreeService = function() {
        var isConfigured = $scope.sparqlService && $scope.facetTreeConfig && $scope.path;

        facetValueService = isConfigured ? new jassa.facete.FacetValueService($scope.sparqlService, $scope.facetTreeConfig) : null;
    };
    
    var update = function() {
        updateFacetTreeService();
        self.refresh();
    };

    $scope.ObjectUtils = jassa.util.ObjectUtils;

    var watchList = '[ObjectUtils.hashCode(facetTreeConfig), "" + path, pagination.currentPage]';
    $scope.$watch(watchList, function() {
        update();
    }, true);
    
    $scope.$watch('sparqlService', function() {
        update();
    });
    


    $scope.toggleConstraint = function(item) {
        var constraintManager = facetValueService.getFacetTreeConfig().getFacetConfig().getConstraintManager();
        
        var constraint = new jassa.facete.ConstraintEquals(item.path, item.node);

        // TODO Integrate a toggle constraint method into the filterManager
        constraintManager.toggleConstraint(constraint);
    };
    
    
    
    self.refresh = function() {
        var path = $scope.path;
        
        if(!facetValueService || !path) {
            $scope.totalItems = 0;
            $scope.facetValues = [];
            return;
        }
        
        var fetcher = facetValueService.createFacetValueFetcher($scope.path, $scope.filterText);

        var countPromise = fetcher.fetchCount();
        
        var pageSize = 10;
        var offset = ($scope.pagination.currentPage - 1) * pageSize;
        
        var dataPromise = fetcher.fetchData(offset, pageSize);

        jassa.sponate.angular.bridgePromise(countPromise, $q.defer(), $scope.$root, function(countInfo) {
            $scope.pagination.totalItems = countInfo.count;
        });
        
        jassa.sponate.angular.bridgePromise(dataPromise, $q.defer(), $scope.$root, function(items) {
            $scope.facetValues = items;
        });

    };

    $scope.filterTable = function(filterText) {
        $scope.filterText = filterText;
        update();
    };

    
    /*
    $scope.$on('facete:facetSelected', function(ev, path) {

        $scope.currentPage = 1;
        $scope.path = path;
        
        updateItems();
    });
    
    $scope.$on('facete:constraintsChanged', function() {
        updateItems(); 
    });
    */
//  $scope.firstText = '<<';
//  $scope.previousText = '<';
//  $scope.nextText = '>';
//  $scope.lastText = '>>';

}])

/**
 * The actual dependencies are:
 * - sparqlServiceFactory
 * - facetTreeConfig
 * - labelMap (maybe this should be part of the facetTreeConfig) 
 */
.directive('facetValueList', function() {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/facet-value-list/facet-value-list.html',
        transclude: false,
        require: 'facetValueList',
        scope: {
            sparqlService: '=',
            facetTreeConfig: '=',
            path: '=',
            onSelect: '&select'
        },
        controller: 'FacetValueListCtrl'
//        compile: function(elm, attrs) {
//            return function link(scope, elm, attrs, controller) {
//            };
//        }
    };
})

;

angular.module('ui.jassa.jassa-list-browser', [])

//.controller('JassaListBrowserCtrl', ['$scope', function($scope) {
//
//}])

.directive('jassaListBrowser', function() {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            listService: '=',
            filter: '=',
            limit: '=',
            offset: '=',
            totalItems: '=',
            items: '=',
            maxSize: '=',
            langs: '=', // Extra attribute that is deep watched on changes for triggering refreshs
            availableLangs: '=',
            doFilter: '=',
            searchModes: '=',
            activeSearchMode: '=',
            context: '=' // Extra data that can be passed in // TODO I would prefer access to the parent scope
        },
        templateUrl: 'template/jassa-list-browser/jassa-list-browser.html',
        //controller: 'JassaListBrowserCtrl'
    };
})

;

angular.module('ui.jassa.jassa-media-list', [])

.controller('JassaMediaListCtrl', ['$scope', '$q', '$timeout', function($scope, $q, $timeout) {
    $scope.currentPage = 1;

    // TODO Get rid of the $timeouts - not sure why $q.when alone breaks when we return results from cache

    $scope.doRefresh = function() {
        $q.when($scope.listService.fetchCount($scope.filter)).then(function(countInfo) {
            $timeout(function() {
                $scope.totalItems = countInfo.count;
            });
        });

        $q.when($scope.listService.fetchItems($scope.filter, $scope.limit, $scope.offset)).then(function(items) {
            $timeout(function() {
                $scope.items = items.map(function(item) {
                    return item.val;
                });
            });
        });
    };


    $scope.$watch('offset', function() {
        $scope.currentPage = Math.floor($scope.offset / $scope.limit) + 1;
    });

    $scope.$watch('currentPage', function() {
        $scope.offset = ($scope.currentPage - 1) * $scope.limit;
    });


    $scope.$watch('[filter, limit, offset, refresh]', $scope.doRefresh, true);
    $scope.$watch('listService', $scope.doRefresh);
}])

.directive('jassaMediaList', [function() {
    return {
        restrict: 'EA',
        templateUrl: 'template/jassa-media-list/jassa-media-list.html',
        transclude: true,
        replace: true,
        scope: {
            listService: '=',
            filter: '=',
            limit: '=',
            offset: '=',
            totalItems: '=',
            //currentPage: '=',
            items: '=',
            maxSize: '=',
            refresh: '=', // Extra attribute that is deep watched on changes for triggering refreshs
            context: '=' // Extra data that can be passed in // TODO I would prefer access to the parent scope
        },
        controller: 'JassaMediaListCtrl',
        link: function(scope, element, attrs, ctrl, transcludeFn) {
            transcludeFn(scope, function(clone, scope) {
                var e = element.find('ng-transclude');
                var p = e.parent();
                e.remove();
                p.append(clone);
            });
        }
    };
}])

;

angular.module('ui.jassa.lang-select', ['ui.sortable', 'ui.keypress', 'ngSanitize'])

.controller('LangSelectCtrl', ['$scope', function($scope) {
    $scope.newLang = '';
    $scope.showLangInput = false;

    var removeIntent = false;

    $scope.sortConfig = {
        placeholder: 'lang-sortable-placeholder',
        receive: function(e, ui) { removeIntent = false; },
        over: function(e, ui) { removeIntent = false; },
        out: function(e, ui) { removeIntent = true; },
        beforeStop: function(e, ui) {
            if (removeIntent === true) {
                var lang = ui.item.context.textContent;
                if(lang) {
                    lang = lang.trim();
                    var i = $scope.langs.indexOf(lang);
                    $scope.langs.splice(i, 1);
                    ui.item.remove();
                }
            }
        },
        stop: function() {
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        }
    };

    $scope.getLangSuggestions = function() {
        var obj = $scope.availableLangs;

        var result;
        if(!obj) {
            result = [];
        }
        else if(Array.isArray(obj)) {
            result = obj;
        }
        else if(obj instanceof Function) {
            result = obj();
        }
        else {
            result = [];
        }

        return result;
    };

    $scope.confirmAddLang = function(lang) {

        var i = $scope.langs.indexOf(lang);
        if(i < 0) {
            $scope.langs.push(lang);
        }
        $scope.showLangInput = false;
        $scope.newLang = '';
    };
}])

.directive('langSelect', function() {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/lang-select/lang-select.html',
        scope: {
            langs: '=',
            availableLangs: '='
        },
        controller: 'LangSelectCtrl',
    };
})

;


angular.module('ui.jassa.list-search', [])

.controller('ListSearchCtrl', ['$scope', function($scope) {
    // Don't ask me why this assignment does not trigger a digest
    // if performed inline in the directive...
    $scope.setActiveSearchMode = function(searchMode) {
        $scope.activeSearchMode = searchMode;
    };
}])

.directive('listSearch', function() {
    return {
        restrict: 'EA',
        scope: {
            searchModes: '=',
            activeSearchMode: '=',
            ngModel: '=',
            onSubmit: '&submit'
        },
        controller: 'ListSearchCtrl',
        templateUrl: 'template/list-search/list-search.html'
    };
})

;


angular.module('ui.jassa.pointer-events-scroll-fix', [])

/**
 * Scrollbars on overflow divs with pointer-events: none are not clickable on chrome/chromium.
 * This directive sets pointer-events to auto when scrollbars are needed and thus assumed to be visible.
 *
 */
.directive('pointerEventsScrollFix', function() {
    return {
        restrict: 'A',
        //scope: 
        compile: function() {
            return {
                post: function(scope, elem, attrs) {

                    // TODO Registering (jQuery) plugins in a directive is actually an anti-pattern - either get rid of this or move the plugin to a common location
                    if(!jQuery.fn.hasScrollBar) {
                        jQuery.fn.hasScrollBar = function() {
                            var el = this.get(0);
                            if(!el) {
                                console.log('Should not happen');
                                return false;
                            }

                            var result = el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
                            //console.log('Checked scrollbar state: ', result);
                            return result;
                        };
                    }
                    
                    var backup = null;
                    
                    scope.$watch(
                        function () { return jQuery(elem).hasScrollBar(); },
                        function (hasScrollBar) {
                            console.log('Scrollbar state: ', hasScrollBar, backup);
                            if(hasScrollBar) {
                                if(!backup) {
                                    backup = elem.css('pointer-events');
                                    elem.css('pointer-events', 'auto');
                                }
                            } else if(backup) {
                                elem.css('pointer-events', backup);
                                backup = null;
                            }
                        }
                    );
                }
            };
        }
    };
})

;


angular.module('ui.jassa.resizable', [])

/**
 *
 * <div resizable="resizableConfig" bounds="myBoundObject" on-resize-init="onResizeInit(bounds)" on-resize="onResize(evt, ui, bounds)" style="width: 50px; height: 50px;">
 *
 * On init, the the directive will invoke on-resize-init with the original css properties (not the computed values).
 * This allows resetting the size
 * Also, on init, the given bounds will be overridden, however, afterwards the directive will listen for changes
 */
.directive('resizable', function () {
    //var resizableConfig = {...};
    return {
        restrict: 'A',
        scope: {
            resizable: '=',
            onResize: '&onResize',
            onResizeInit: '&onResizeInit',
            bounds: '='
        },
        compile: function() {
            return {
                post: function(scope, elem, attrs) {
                    if(!scope.bounds) {
                        scope.bounds = {};
                    }

                    var isInitialized = false;

                    var onConfigChange = function(newConfig) {
                        //console.log('Setting config', newConfig);
                        if(isInitialized) {
                            jQuery(elem).resizable('destroy');
                        }

                        jQuery(elem).resizable(newConfig);
                        
                        isInitialized = true;
                    };
                    

                    var propNames = ['top', 'bottom', 'width', 'height'];
                    
                    var getCssPropMap = function(propNames) {
                        var data = elem.prop('style');
                        var result = _(data).pick(propNames);
                        
                        return result;
                    };
                    
                    var setCssPropMap = function(propMap) {
                        _(propMap).each(function(v, k) {
                            //console.log('css prop', k, v);
                            elem.css(k, v);
                        });
                    };

                    var bounds = getCssPropMap(propNames);
                    angular.copy(bounds, scope.bounds);
                    
                    if(scope.onResizeInit) {
                        scope.onResizeInit({
                            bounds: bounds
                        });
                    }
                    
                    var onBoundsChange = function(newBounds, oldBounds) {
                        //console.log('setting bounds', newBounds, oldBounds);
                        setCssPropMap(newBounds);
                    };
                    
                    scope.$watch('bounds', onBoundsChange, true);

                    jQuery(elem).on('resizestop', function (evt, ui) {
                        
                        var bounds = getCssPropMap(propNames);
                        angular.copy(bounds, scope.bounds);
                        //console.log('sigh', bounds);
                        
                        if (scope.onResize) {
                            scope.onResize(evt, ui, bounds);
                        }
                        
                        if(!scope.$$phase) {
                            scope.$apply();
                        }
                    });

                    scope.$watch('resizable', onConfigChange);
                    //onConfigChange(scope.resizable);
                }
            };
        }
    };
})

;



angular.module('ui.jassa.sparql-grid', [])

.controller('SparqlGridCtrl', ['$scope', '$rootScope', '$q', function($scope, $rootScope, $q) {

    var rdf = jassa.rdf;
    var sparql = jassa.sparql;
    var service = jassa.service;
    var util = jassa.util;
    var sponate = jassa.sponate;
    var facete = jassas.facete;
    
    var syncTableMod = function(sortInfo, tableMod) {
        
        var newSortConditions = [];
        for(var i = 0; i < sortInfo.fields.length; ++i) {
            var columnId = sortInfo.fields[i];
            var dir = sortInfo.directions[i];
            
            var d = 0;
            if(dir === 'asc') {
                d = 1;
            }
            else if(dir === 'desc') {
                d = -1;
            }
            
            if(d !== 0) {
                var sortCondition = new facete.SortCondition(columnId, d);
                newSortConditions.push(sortCondition);
            }
        }

        var oldSortConditions = tableMod.getSortConditions();
        
        var isTheSame = _(newSortConditions).isEqual(oldSortConditions);
        if(!isTheSame) {
            util.ArrayUtils.replace(oldSortConditions, newSortConditions);
        }

    };

    
    var createTableService = function() {
        var config = $scope.config;
        
        var sparqlService = $scope.sparqlService;
        var queryFactory = config ? config.queryFactory : null;
        
        var query = queryFactory ? queryFactory.createQuery() : null;
        
        var result = new service.SparqlTableService(sparqlService, query);
        
        return result;
    };


    
    $scope.$watch('gridOptions.sortInfo', function(sortInfo) {
        var config = $scope.config;

        var tableMod = config ? config.tableMod : null;

        if(tableMod != null) {
            syncTableMod(sortInfo, tableMod);
        }
        
        $scope.refreshData();
    }, true);


    $scope.$watch('[pagingOptions, filterOptions]', function (newVal, oldVal) {
        $scope.refreshData();
    }, true);
    
    var update = function() {
        $scope.refresh();
    };
    
    
    $scope.ObjectUtils = util.ObjectUtils;
    
    $scope.$watch('[ObjectUtils.hashCode(config), disableRequests]', function (newVal, oldVal) {
        update();
    }, true);
    
    $scope.$watch('sparqlService', function() {
        update();
    });
    
    
    $scope.totalServerItems = 0;
        
    $scope.pagingOptions = {
        pageSizes: [10, 50, 100],
        pageSize: 10,
        currentPage: 1
    };

    $scope.refresh = function() {
        var tableService = createTableService();

        if($scope.disableRequests) {
            util.ArrayUtils.clear($scope.myData);
            return;
        }
        

        $scope.refreshSchema(tableService);
        $scope.refreshPageCount(tableService);
        $scope.refreshData(tableService);
    };

    $scope.refreshSchema = function(tableService) {
        tableService = tableService || createTableService();

        var oldSchema = $scope.colDefs;
        var newSchema = tableService.getSchema();
        
        var isTheSame = _(newSchema).isEqual(oldSchema);
        if(!isTheSame) {
            $scope.colDefs = newSchema;
        }
    };

    $scope.refreshPageCount = function(tableService) {
        tableService = tableService || createTableService();
        
        var promise = tableService.fetchCount();

        jassa.sponate.angular.bridgePromise(promise, $q.defer(), $scope, function(countInfo) {
            // Note: There is also countInfo.hasMoreItems and countInfo.limit (limit where the count was cut off)
            $scope.totalServerItems = countInfo.count;
        });
    };
    
    $scope.refreshData = function(tableService) {
        tableService = tableService || createTableService();

        var page = $scope.pagingOptions.currentPage;
        var pageSize = $scope.pagingOptions.pageSize;
        
        var offset = (page - 1) * pageSize;

        
        var promise = tableService.fetchData(pageSize, offset);

        jassa.sponate.angular.bridgePromise(promise, $q.defer(), $scope, function(data) {
            var isTheSame = _(data).isEqual($scope.myData);
            if(!isTheSame) {
                $scope.myData = data;
            }
            //util.ArrayUtils.replace($scope.myData, data);
            
            // Using equals gives digest iterations exceeded errors; could be https://github.com/angular-ui/ng-grid/issues/873
            //$scope.myData = data;
        });
    };

        
    var plugins = [];
    
    if(ngGridFlexibleHeightPlugin) {
        // js-hint will complain on lower case ctor call
        var PluginCtor = ngGridFlexibleHeightPlugin;
        
        plugins.push(new PluginCtor(30));
    }
    
    $scope.myData = [];
    
    $scope.gridOptions = {
        data: 'myData',
        enablePaging: true,
        useExternalSorting: true,
        showFooter: true,
        totalServerItems: 'totalServerItems',
        enableHighlighting: true,
        sortInfo: {
            fields: [],
            directions: [],
            columns: []
        },
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions,
        plugins: plugins,
        columnDefs: 'colDefs'
    };

    

    //$scope.refresh();
}])


/**
 * 
 * 
 * config: {
 *     queryFactory: qf,
 *     tableMod: tm
 * }
 * 
 */
.directive('sparqlGrid', ['$parse', function($parse) {
    return {
        restrict: 'EA', // says that this directive is only for html elements
        replace: true,
        //template: '<div></div>',
        templateUrl: 'template/sparql-grid/sparql-grid.html',
        controller: 'SparqlGridCtrl',
        scope: {
            sparqlService: '=',
            config: '=',
            disableRequests: '=',
            onSelect: '&select',
            onUnselect: '&unselect'
        },
        link: function (scope, element, attrs) {
            
        }
    };
}])

;
    
/*    
var createQueryCountQuery = function(query, outputVar) {
    //TODO Deterimine whether a sub query is needed
    var result = new sparql.Query();
    var e = new sparql.ElementSubQuery(query);
    result.getElements().push(e);
    result.getProjectVars().add(outputVar, new sparql.E_Count());
    
    return result;
};
*/

angular.module('ui.jassa.template-list', [])

/**
 *
 */
.controller('TemplateListCtrl', ['$scope', function($scope) {
}])

/**
 *
 */
.directive('templateList', ['$compile', function($compile) {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/template-list/template-list.html',
        transclude: true,
        //require: 'templateList',
        scope: {
            templates: '=',
            data: '=',
            context: '='
        },
        controller: 'TemplateListCtrl',
        compile: function() {
            return {
                pre: function(scope, elm, attrs) {
                    angular.forEach(scope.templates, function(template) {
                        var li = $compile('<li style="display: inline;"></li>')(scope);
                        
                        var element = $compile(template)(scope);
                        li.append(element);
                        
                        elm.append(li);
                    });
                }
            };
        }
    };
}])

;

angular.module("template/constraint-list/constraint-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/constraint-list/constraint-list.html",
    "<ul>\n" +
    "  	<li ng-show=\"constraints.length == 0\" style=\"color: #aaaaaa;\">(no constraints)</li>\n" +
    "   	<li ng-repeat=\"constraint in constraints\"><a href=\"\" ng-click=\"removeConstraint(constraint)\" ng-bind-html=\"constraint.label\"></a></li>\n" +
    "</ul>\n" +
    "");
}]);

angular.module("template/facet-tree/facet-dir-content.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/facet-tree/facet-dir-content.html",
    "<!-- ng-show=\"dirset.pageCount > 1 || dirset.children.length > 5\" -->\n" +
    "\n" +
    "\n" +
    "<!--                 		<div ng-show=\"dirset.pageCount != 1\" style=\"width:100%; background-color: #eeeeff\"> -->\n" +
    "<!--     		         		<pagination style=\"padding-left: {{16 * (dirset.path.getLength() + 1)}}px\" class=\"pagination-tiny\" max-size=\"7\" total-items=\"dirset.childFacetCount\" page=\"dirset.pageIndex\" boundary-links=\"true\" rotate=\"false\" on-select-page=\"selectFacetPage(page, facet)\" first-text=\"<<\" previous-text=\"<\" next-text=\">\" last-text=\">>\"></pagination> -->\n" +
    "<!--                 		</div> -->\n" +
    "\n" +
    "<span ng-show=\"dirset.children.length == 0\"\n" +
    "	style=\"color: #aaaaaa; padding-left: {{16*(dirset.path.getLength()+1)}}px\">(no\n" +
    "	entries)</span>\n" +
    "\n" +
    "<div style=\"padding-left: {{16*(dirset.path.getLength()+1)}}px\"\n" +
    "	ng-repeat=\"facet in dirset.children\"\n" +
    "	ng-include=\"'template/facet-tree/facet-tree-item.html'\" ></div>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("template/facet-tree/facet-dir-ctrl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/facet-tree/facet-dir-ctrl.html",
    "<div style=\"width: 100%; background-color: #eeeeff;\">\n" +
    "	<div style=\"padding-right: 16px; padding-left: {{16*(dirset.path.getLength()+1)}}px\">\n" +
    "\n" +
    "		<form class=\"form-inline\" role=\"form\" ng-submit=\"doFilter(dirset.path, dirset.filter.filterString)\">\n" +
    "\n" +
    "			<div class=\"form-group\">\n" +
    "				<input type=\"text\" class=\"form-control input-sm\" placeholder=\"Filter\" ng-model=\"dirset.filter.filterString\" value=\"{{dirset.filter.filterString}}\" />\n" +
    "			</div>\n" +
    "			<div class=\"form-group\">\n" +
    "				<button type=\"submit\" class=\"btn btn-default input-sm\">Filter</button>\n" +
    "			</div>\n" +
    "			<div class=\"form-group\" ng-if=\"dirset.pageCount > 1\" style=\"background-color: #eeeeff\">\n" +
    "				<pagination\n" +
    "					style=\"padding-left: {{16*(dirset.path.getLength()+1)}}px\"\n" +
    "					class=\"pagination-tiny\" max-size=\"7\"\n" +
    "					total-items=\"dirset.childFacetCount\" page=\"dirset.pageIndex\"\n" +
    "					boundary-links=\"true\" rotate=\"false\"\n" +
    "					on-select-page=\"selectFacetPage(page, facet)\" first-text=\"<<\"\n" +
    "					previous-text=\"<\" next-text=\">\" last-text=\">>\">\n" +
    "				</pagination>\n" +
    "			</div>\n" +
    "\n" +
    "		</form>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("template/facet-tree/facet-tree-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/facet-tree/facet-tree-item.html",
    "<div ng-class=\"{'frame': facet.isExpanded}\">\n" +
    "\n" +
    "<!--	<div class=\"facet-row\" ng-class=\"{'highlite': facet.isExpanded}\" ng-mouseover=\"setFacetHover(facet, true)\" ng-mouseleave=\"setFacetHover(facet, false)\"> -->\n" +
    "	<div class=\"facet-row\" ng-class=\"{'highlite': facet.isExpanded}\">\n" +
    "		<a ng-show=\"facet.isExpanded\" href=\"\" ng-click=\"toggleCollapsed(facet.item.getPath())\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a>\n" +
    "		<a ng-show=\"!facet.isExpanded\" href=\"\" ng-click=\"toggleCollapsed(facet.item.getPath())\"><span class=\"glyphicon glyphicon-chevron-right\"></span></a>\n" +
    "\n" +
    "		<a href=\"\" title=\"Showing incoming facets. Click to show outgoing facets.\" ng-if=\"facet.isExpanded && facet.isIncomingActive === true\" ng-click=\"selectOutgoing(facet.item.getPath())\"><span class=\"glyphicon glyphicon-arrow-left\"></span></a>\n" +
    "		<a href=\"\" title=\"Showing outgoing facets. Click to show incoming facets.\" ng-if=\"facet.isExpanded && facet.isOutgoingActive === true\" ng-click=\"selectIncoming(facet.item.getPath())\"><span class=\"glyphicon glyphicon-arrow-right\"></span></a>\n" +
    "\n" +
    "\n" +
    "		<a data-rdf-term=\"{{facet.item.getNode().toString()}}\" title=\"{{facet.item.getNode().getUri()}}\" href=\"\" ng-click=\"toggleSelected(facet.item.getPath())\">{{facet.item.getDoc().displayLabel}}</a>\n" +
    "\n" +
    "		<template-list style=\"list-style:none; display: inline; padding-left: 0px;\" templates=\"plugins\" data=\"facet\" context=\"pluginContext\"></template-list>\n" +
    "\n" +
    "		<span style=\"float: right\" class=\"badge\" ng-bind-html=\"(facet.item.getDistinctValueCount() == null || facet.item.getDistinctValueCount() < 0) ? '&#8230;' : ('' + facet.item.getDistinctValueCount())\"></span>\n" +
    "		\n" +
    "		<div ng-if=\"facet.isExpanded && facet.item.getTags().controls.isContained && facet.isIncomingActive === true\" style=\"width:100%\" ng-repeat=\"dirset in [facet.incoming]\" ng-include=\"'template/facet-tree/facet-dir-ctrl.html'\"></div>\n" +
    "		<div ng-if=\"facet.isExpanded && facet.item.getTags().controls.isContained && facet.isOutgoingActive === true\" style=\"width:100%\" ng-repeat=\"dirset in [facet.outgoing]\" ng-include=\"'template/facet-tree/facet-dir-ctrl.html'\"></div>\n" +
    "	</div>\n" +
    "	<div ng-if=\"facet.isExpanded\" style=\"width:100%\"> \n" +
    "\n" +
    "\n" +
    "			<div ng-if=\"facet.isExpanded && facet.isIncomingActive === true\" ng-repeat=\"dirset in [facet.incoming]\" ng-include=\"'template/facet-tree/facet-dir-content.html'\"></div>\n" +
    "			<div ng-if=\"facet.isExpanded && facet.isOutgoingActive === true\" ng-repeat=\"dirset in [facet.outgoing]\" ng-include=\"'template/facet-tree/facet-dir-content.html'\"></div>\n" +
    "\n" +
    "\n" +
    "<!-- 		<tabset class=\"tabset-small\"> -->\n" +
    "<!-- 			<tab heading=\"Incoming Facets\" active=\"{{facet.isIncomingActive === true}}\" select=\"selectIncoming(facet.item.getPath())\"> -->\n" +
    "<!-- 				<div ng-repeat=\"dirset in [facet.incoming]\" ng-include=\"'template/facet-tree/facet-dir-content.html'\"></div> -->\n" +
    "<!-- 			</tab> -->\n" +
    "<!-- 			<tab heading=\"Outgoing Facets\" active=\"{{facet.isOutgoingActive === true}}\" select=\"selectOutgoing(facet.item.getPath())\">					 -->\n" +
    "<!-- 				<div ng-repeat=\"dirset in [facet.outgoing]\" ng-include=\"'template/facet-tree/facet-dir-content.html'\"></div> -->\n" +
    "<!-- 			</tab> -->\n" +
    "		</tabset>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/facet-value-list/facet-value-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/facet-value-list/facet-value-list.html",
    "<div class=\"frame\">\n" +
    "	<form ng-submit=\"filterTable(filterText)\">\n" +
    "	    <input type=\"text\" ng-model=\"filterText\" />\n" +
    "		<input class=\"btn-primary\" type=\"submit\" value=\"Filter\" />\n" +
    "	</form>\n" +
    "	<table>\n" +
    "              <tr><th>Value</th><th>Constrained</th></tr>\n" +
    "<!-- <th>Count</th> -->\n" +
    "	    <tr ng-repeat=\"item in facetValues\">\n" +
    "                  <td><span title=\"{{item.node.toString()}}\">{{item.displayLabel}}</span></td>\n" +
    "<!--                    <td>todo</td> -->\n" +
    "                  <td><input type=\"checkbox\" ng-model=\"item.tags.isConstrainedEqual\" ng-change=\"toggleConstraint(item)\" /></td>\n" +
    "              </tr>\n" +
    "      	</table>\n" +
    "  		<pagination class=\"pagination-small\" total-items=\"pagination.totalItems\" page=\"pagination.currentPage\" max-size=\"pagination.maxSize\" boundary-links=\"true\" rotate=\"false\" num-pages=\"pagination.numPages\" previous-text=\"&lsaquo;\" next-text=\"&rsaquo;\" first-text=\"&laquo;\" last-text=\"&raquo;\"></pagination>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/jassa-list-browser/jassa-list-browser.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/jassa-list-browser/jassa-list-browser.html",
    "<div class=\"container\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-md-12\">\n" +
    "\n" +
    "            <div class=\"alert alert-success\" role=\"alert\">\n" +
    "\n" +
    "                <list-search ng-model=\"searchString\" submit=\"doFilter(searchString)\" search-modes=\"searchModes\" active-search-mode=\"activeSearchMode\"></list-search>\n" +
    "                <div>\n" +
    "                    <ul class=\"list-inline\">\n" +
    "                        <li><span>Language Settings: </span></li>\n" +
    "                        <li><lang-select langs=\"langs\" available-langs=\"availableLangs\"></lang-select></li>\n" +
    "                    </ul>\n" +
    "                </div>\n" +
    "\n" +
    "                <div>\n" +
    "                    <strong>Found <span class=\"badge\">{{totalItems}}</span> items</strong>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"row\">\n" +
    "\n" +
    "        <div class=\"col-md-12\">\n" +
    "\n" +
    "            <jassa-media-list list-service=\"listService\" offset=\"offset\" limit=\"limit\" max-size=\"maxSize\" filter=\"filter\" total-items=\"totalItems\" items=\"items\" refresh=\"langs\" context=\"context\">\n" +
    "                <ng-include src=\"context.itemTemplate\"></ng-include>\n" +
    "            </jassa-media-list>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/jassa-media-list/jassa-media-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/jassa-media-list/jassa-media-list.html",
    "<div style=\"width: 100%\">\n" +
    "\n" +
    "    <div style=\"width: 100%; text-align: center\">\n" +
    "        <pagination\n" +
    "            ng-show=\"items.length\"\n" +
    "            class=\"pagination\"\n" +
    "            ng-model=\"currentPage\"\n" +
    "            page=\"currentPage\"\n" +
    "            items-per-page=\"limit\"\n" +
    "            total-items=\"totalItems\"\n" +
    "            max-size=\"maxSize\"\n" +
    "            boundary-links=\"true\"\n" +
    "            rotate=\"false\"\n" +
    "            first-text=\"&lt;&lt;\"\n" +
    "            previous-text=\"&lt;\"\n" +
    "            next-text=\"&gt;\"\n" +
    "            last-text=\"&gt;&gt;\"\n" +
    "        ></pagination>\n" +
    "    </div>\n" +
    "\n" +
    "    <ul class=\"media-list\" style=\"width: 100%;\">\n" +
    "        <ng-transclude></ng-transclude>\n" +
    "    </ul>\n" +
    "\n" +
    "    <div style=\"width: 100%; text-align: center\">\n" +
    "        <pagination\n" +
    "            ng-show=\"items.length\"\n" +
    "            class=\"pagination\"\n" +
    "            ng-model=\"currentPage\"\n" +
    "            page=\"currentPage\"\n" +
    "            items-per-page=\"limit\"\n" +
    "            total-items=\"totalItems\"\n" +
    "            max-size=\"maxSize\"\n" +
    "            boundary-links=\"true\"\n" +
    "            rotate=\"false\"\n" +
    "            first-text=\"&lt;&lt;\"\n" +
    "            previous-text=\"&lt;\"\n" +
    "            next-text=\"&gt;\"\n" +
    "            last-text=\"&gt;&gt;\"\n" +
    "        ></pagination>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/lang-select/lang-select.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/lang-select/lang-select.html",
    "<ul class=\"list-inline\">\n" +
    "    <li>\n" +
    "        <ul ui-sortable=\"sortConfig\" ng-model=\"langs\" class=\"list-inline\">\n" +
    "            <li class=\"lang-item\" ng-repeat=\"lang in langs\"><span class=\"label label-success preserve-whitespace\">{{lang.length ? lang : '  '}}</span></li>\n" +
    "        </ul>\n" +
    "    </li>\n" +
    "    <li ng-show=\"showLangInput\">\n" +
    "        <form ng-submit=\"confirmAddLang(newLang)\" ui-keydown=\"{esc: 'showLangInput=false'}\">\n" +
    "            <input auto-focus=\"focusLangInput\" size=\"4\" ng-model=\"newLang\" type=\"text\" class=\"lang-borderless\" typeahead=\"lang for lang in getLangSuggestions() | filter:$viewValue | limitTo:8\">\n" +
    "            <button type=\"submit\" style=\"cursor: pointer;\" class=\"btn label label-info\"\"><span class=\"glyphicon glyphicon-ok\"></span></button>\n" +
    "            <button type=\"reset\" style=\"cursor: pointer;\" class=\"btn label label-warning\" ng-click=\"showLangInput=false\"><span class=\"glyphicon glyphicon-remove\"></span></button>\n" +
    "        </form>\n" +
    "    </li>\n" +
    "    <li>\n" +
    "        <button type=\"button\" ng-show=\"!showLangInput\" style=\"cursor: pointer;\" class=\"btn label label-primary\" ng-click=\"showLangInput=true; focusLangInput=true\"><span class=\"glyphicon glyphicon-plus\"></span></button>\n" +
    "    </li>\n" +
    "<ul>\n" +
    "\n" +
    "");
}]);

angular.module("template/list-search/list-search.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/list-search/list-search.html",
    "<form role=\"form\" ng-submit=\"onSubmit()\" novalidate>\n" +
    "    <div class=\"form-group\">\n" +
    "        <div class=\"input-group\">\n" +
    "            <input\n" +
    "                ng-model=\"ngModel\"\n" +
    "                type=\"text\"\n" +
    "                class=\"form-control\"\n" +
    "                placeholder=\"Find ...\">\n" +
    "\n" +
    "            <div class=\"input-group-btn\">\n" +
    "                <button type=\"button\" class=\"btn btn-default dropdown-toggle no-border-radius\" style=\"margin-left: -1px; margin-right: -1px;\" data-toggle=\"dropdown\">{{activeSearchMode.label}} <span class=\"caret\"></span></button>\n" +
    "                <ul class=\"dropdown-menu dropdown-menu-right\" role=\"menu\">\n" +
    "                    <li ng-repeat=\"searchMode in searchModes\"><a ng-click=\"setActiveSearchMode(searchMode)\" href=\"#\"><span bind-html-unsafe=\"searchMode.label\"></span></a></li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "\n" +
    "            <span class=\"input-group-btn\">\n" +
    "                <button type=\"submit\" class=\"btn btn-default\" type=\"button\"><span class=\"glyphicon glyphicon-search\"></span></button>\n" +
    "            </span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</form>\n" +
    "\n" +
    "");
}]);

angular.module("template/sparql-grid/sparql-grid.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/sparql-grid/sparql-grid.html",
    "<div>\n" +
    "<div ng-grid=\"gridOptions\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/template-list/template-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/template-list/template-list.html",
    "<ul ng-show=\"templates.length > 0\">\n" +
    "</ul>");
}]);
