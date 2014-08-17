    /**
     * Item Tagger that aggregates a set of item taggers
     * 
     */
    ns.ItemTaggerManager = Class.create(ns.ItemTagger, {
        initialize: function() {
            this.taggerMap = {}
        },
        
        getTaggerMap: function() {
            return this.taggerMap;
        },
        
        /**
         * @param item The object for which to create the tags
         */
        createTags: function(item) {
            var result = {};
            _(this.taggerMap).each(function(tagger, key) {
                var tags = tagger.createTags(item);
                
                result[key] = tags;
            });
            
            return result;
        }
    });