
    /**
     * Item Tagger for paths of whether they are linked as a table column
     * 
     */
    ns.ItemTaggerMembership = Class.create(ns.ItemTagger, {
        initialize: function(collection) {
            this.collection = collection;
        },
        
        createTags: function(item) {
            var isContained = this.collection.contains(item);
            
            var result = { isContained: isContained };
            //console.log('table: ' + path, isContained);
            return result;
        }
    });