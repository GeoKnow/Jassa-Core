    var ns = {};

    var facete = Jassa.facete;
    
    ns.AppContext = Class.create({
        initialize: function() {
            this.workSpaces = [];
        },

        addWorkSpace: function() {
            var id = 'workSpace' + (this.workSpaces.length + 1);
            
            var workSpace = new ns.WorkSpaceContext(id, id);
            
            workSpace.setData({
                config: {
                    sparqlServiceIri: sparqlServiceIri,
                    defaultGraphIris: defaultGraphIris 
                }
            });
            
            /*
            var workSpace = {
                id: id,
                name: id,
                config: {
                    sparqlServiceIri: sparqlServiceIri,
                    defaultGraphIris: defaultGraphIris
                }
            };
            */
            
            this.workSpaces.push(workSpace);
        },
        
        removeWorkSpace: function(index) {
            var workSpace = this.workSpaces[index];

            if(workSpace.isActive()) {
                //this.selectWorkSpace(null);
                workSpace.setActive(false);
            }

            this.workSpaces.splice(index, 1);
        },
        
        /*
        selectWorkSpace: function(index) {
            var workSpace = null;

            if(index != null) {
                workSpace = this.workSpaces[index];
                workSpace.isActive = true;
            }

            //$scope.$emit('facete:workSpaceSelected', workSpace);
        },
        */
        
        getWorkSpaces: function() {
            return this.workSpaces;
        }       
    });

    


    ns.WorkSpaceContext = Class.create({
        initialize: function(id, name) {
            this.id = id;
            this.name = name;
            this.active = false;
            this.conceptSpaces = [];
            
            this.data = null;
        },
        
        isActive: function() {
            return this.active;
        },
        
        setActive: function(isActive) {
            this.active = isActive;
        },      
        
        getId: function() {
            return this.id;
        },
        
        getName: function() {
            return this.name;
        },
        
        setName: function(name) {
            this.name = name;
        },
        
        getConceptSpaces: function() {
            return this.conceptSpaces;
        },
        
        addConceptSpace: function() {
            var id = 'conceptSpace' + (this.conceptSpaces.length + 1);            
            var conceptSpace = new ns.ConceptSpaceContext(this, id, id);
            
            var facetTreeConfig = new facete.FacetTreeConfig();
            conceptSpace.setFacetTreeConfig(facetTreeConfig);
            
            this.conceptSpaces.push(conceptSpace);
        },
        
        removeConceptSpace: function(index) {
            var conceptSpace = this.conceptSpaces[index];

            if(conceptSpace.isActive()) {
                //this.selectWorkSpace(null);
                conceptSpace.setActive(false);
            }

            this.conceptSpaces.splice(index, 1);
        },
        
        setData: function(data) {
            this.data = data;
        },
        
        getData: function() {
            return this.data;
        }
    });

    
    ns.ConceptSpaceContext = Class.create({
        initialize: function(workSpaceContext, id, name) {
            this.workSpaceContext = workSpaceContext;
            this.id = id;
            this.name = name;
            this.active = false;
            //this.facetTreeService = facetTreeService;
            
            this.facetTreeConfig = null;
            
            this.data = {};
        },

        getWorkSpace: function() {
            return this.workSpaceContext;
        },
        
        getId: function() {
            return this.id;
        },
        
        getName: function() {
            return this.name;
        },

        isActive: function() {
            return this.active;
        },

        setActive: function(isActive) {
            this.active = isActive;
        },
        
        getWorkSpaceContext: function() {
            return this.workSpaceContext;
        },

        getFacetTreeConfig: function() {
            return this.facetTreeConfig;
        },
        
        setFacetTreeConfig: function(facetTreeConfig) {
            this.facetTreeConfig = facetTreeConfig;
        },
    
        getConstraintManager: function() {
            var result = this.facetTreeConfig.getFacetConfig().getConstraintManager(); 
            return result;
        },
        
        // Tag node objects at a given path using .createConstraintTagger(path).getTags(node)
        createContraintTaggerFactory: function() {
            var constraintManager = this.getConstraintManager();
            var result = new facete.ConstraintTaggerFactory(constraintManager);       
//constraintTaggerFactory
            
            return result;
        },

        setData: function(data) {
            this.data = data;
        },
        
        getData: function() {
            return this.data;
        }

    });

    
    /**
     * Returns all paths and their contexts in an appContext
     * 
     */
    ns.AppContextUtils = { // These are domain specific utils - not generic ones - for the app context
        getMapLinks: function(appContext) {
            //console.log('inside getMapLinks()');
            
            var workSpaces = appContext.getWorkSpaces();
            var conceptSpaces = _(workSpaces).chain().map(function(workSpace) {
                return workSpace.getConceptSpaces();
            }).flatten().value();

            var result = _(conceptSpaces).chain()
                .map(function(conceptSpace) {

                    var data = conceptSpace.getData();

                    var activeMapLinkPaths = data.activeMapLinkPaths ? data.activeMapLinkPaths.getArray() : [];
                    
                    var r = _(activeMapLinkPaths).map(function(path) {
                        return {
                            conceptSpace: conceptSpace.getId(),
                            path: path
                        }
                    })
                    
                    return r;
                })
                .flatten().value();
            
            //result = [];
//            console.log('mapLinks returned:', result);
//            if(result.length !== 0) {
//                debugger;
//            }
            return result;
        }
    };
    

    
    /**
     * MapUtils for a OpenLayers map
     * 
     */
    ns.MapUtilsOpenLayers = {
        getExtent: function(map) {
            var olRawExtent = map.getExtent();
            var e = olRawExtent.transform(map.projection, map.displayProjection);
            
            var result = new geo.Bounds(e.left, e.bottom, e.right, e.top);
            
            return result;
        }                  
    };
    
    
    ns.ViewStateCtrlOpenLayers = Class.create({
        initialize: function(mapWidget) {
            this.mapWidget = mapWidget;
            
            this.oldViewState = null;
        },
        
        showNode: function(node) {
            var mapWidget = this.mapWidget;
            
            if(!node.isLoaded) {
                //console.log('box: ' + node.getBounds());
                mapWidget.addBox('' + node.getBounds(), node.getBounds());
            }
            
            var data = node.data || {};
            var docs = data.docs || [];

            _(docs).each(function(doc) {
                mapWidget.addWkt(doc.id, doc.wkt);
            });                                 
        },
        
        hideNode: function(node) {
            var mapWidget = this.mapWidget;
            
            var data = node.data || {};
            var docs = data.docs || [];

            //console.log('box: ' + node.getBounds());
            mapWidget.removeBox('' + node.getBounds());//, node.getBounds());
            
            _(docs).each(function(doc) {
                mapWidget.removeItem(doc.id);
            });
        },

        
        updateView: function(newViewState) {
            var mapWidget = this.mapWidget;
            var oldViewState = this.oldViewState;
            
            var diff = geo.ViewStateUtils.diffViewStates(newViewState, oldViewState);
            
            console.log('ViewStateDiff: ', diff);
            
            
            
            mapWidget.clearItems();
            
            var self = this;
            //_(diff.removed).each(this.hideNode);
            _(diff.retained).each(function(node) { self.showNode(node); });
            _(diff.added).each(function(node) { self.showNode(node); });
            
            
            
            this.oldViewState = newViewState;
        }
    });
    
    
