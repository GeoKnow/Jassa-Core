    ns.ItemTaggerFilterString = Class.create(ns.ItemTagger, {
        initialize: function(pathToFilterString) {
            this.pathToFilterString = pathToFilterString;
        },
        
        createTags: function(path) {
            var filterString = this.pathToFilterString.get(path);
            //var isContained = paths.contains(path);
            
            var result = { filterString: filterString };
            //console.log('table: ' + path, isContained);
            return result;
        }
    });
