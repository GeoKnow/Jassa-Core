
    /**
     * 
     * ExpansionSet: Whether a path is expanded at all
     * ExpansionMap: If a path is expanded, whether to fetch the incoming or outgoing properties or both
     * 
     */
    ns.FacetTreeConfig = Class.create({
        classLabel: 'jassa.facete.FacetTreeConfig',
        
        initialize: function(facetConfig, labelMap, expansionSet, expansionMap, facetStateProvider, pathToFilterString) {
            this.facetConfig = facetConfig || ns.FacetConfig.createDefaultFacetConfig();

            //this.labelMap = labelMap; // TODO Use some default (shouldn't the label map be part of the facetConfig???)
            this.expansionSet = expansionSet || new util.HashSet();
            this.expansionMap = expansionMap || new util.HashMap();
            this.facetStateProvider = facetStateProvider || new ns.FacetStateProviderImpl(10);
            this.pathToFilterString = pathToFilterString || new util.HashMap();
        },
        
        getFacetConfig: function() {
            return this.facetConfig;
        },
        
        setFacetConfig: function(facetConfig) {
            this.facetConfig = facetConfig;
        },
        
//        getLabelMap: function() {
//            return this.labelMap;
//        },
        
        getExpansionSet: function() {
            return this.expansionSet;
        },

        getExpansionMap: function() {
            return this.expansionMap;
        },
        
        getFacetStateProvider: function() {
            return this.facetStateProvider;
        },
        
        getPathToFilterString: function() {
            return this.pathToFilterString;
        },
        
        /**
         * The purpose of this method is to detect changes in the configuration!
         * TODO rely on hash codes from child components
         * 
         */
        hashCode: function() {
            var result = util.ObjectUtils.hashCode(this, true);
            return result;
        }
    });
