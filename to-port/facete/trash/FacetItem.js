    
    // TODO Maybe we should just use json instead??
    var FacetItem = Class.create({
        /**
         * doc: The json document returned via the sponate mapping of the labelMap.
         * Should at least contain the fields 'displayLabel' and 'hiddenLabels'.
         * 
         */
        initialize: function(path, node, distinctValueCount, tags, doc) {
            this.path = path;
            this.node = node;
            this.distinctValueCount = distinctValueCount;
            this.tags = tags || {};
            this.doc = doc || {};
        },

//      getUri: functino() {
//          return node.getUri 
//      },
        getNode: function() {
            return this.node;
        },
        
        getPath: function() {
            return this.path;
        },
        
        getDoc: function() {
            return this.doc;
        },

        setDoc: function(doc) {
            this.doc = doc;
        },
        
        getDistinctValueCount: function() {
            return this.distinctValueCount;
        },
        
        getTags: function() {
            return this.tags;
        },
        
        setTags: function(tags) {
            this.tags = tags;
        }
    });
    