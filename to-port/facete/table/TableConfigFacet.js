
    // TODO: Maybe this class should be TableModFacet and inherit from TableMod?
    ns.TableConfigFacet = Class.create({
        initialize: function(facetConfig, tableMod, paths) {
            this.facetConfig = facetConfig;
            this.tableMod = tableMod || new ns.TableMod();
            this.paths = paths || new util.ArrayList();
        },
        
        getFacetConfig: function() {
            return this.facetConfig;
        },

        getTableMod: function() {
            return this.tableMod;
        },

        getPaths: function() {
            return this.paths;
        },        
                
        /**
         * Return the path for a given column id
         */
        getPath: function(colId) {
            var index = _(this.tableMod.getColumnIds()).indexOf(colId);
            var result = this.paths.get(index);
            return result;
        },
        
        getColumnId: function(path) {
            var index = this.paths.firstIndexOf(path);
            var result = this.tableMod.getColumnIds()[index];
            return result;
        },
        
        removeColumn: function(colId) {
            var path = this.getPath(colId);
            this.paths.remove(path);
        },

        getColIdForPath: function(path) {
            var rootFacetNode = this.facetConfig.getRootFacetNode();
            var facetNode = rootFacetNode.forPath(path);
            var result = facetNode.getVar().getName();
            
            return result;
        },
        
        togglePath: function(path) {
            // Updates the table model accordingly
            var status = util.CollectionUtils.toggleItem(this.paths, path);

            var varName = this.getColIdForPath(path);
            
            if(status) {
                this.tableMod.addColumn(varName);
            }
            else {
                this.tableMod.removeColumn(varName);
            }
        },
        
        createDataConcept: function() {
            var emptyPath = new ns.Path();
            var paths = this.paths.getArray().slice(0);

            if(!this.paths.contains(emptyPath)) {
                paths.push(emptyPath);
            }
            
            var dataElementFactory = new ns.ElementFactoryFacetPaths(this.facetConfig, paths);
            var dataElement = dataElementFactory.createElement();
            
            var rootFacetNode = this.facetConfig.getRootFacetNode();
            var dataVar = rootFacetNode.getVar();
            
            var result = new ns.Concept(dataElement, dataVar);

            return result;
        }