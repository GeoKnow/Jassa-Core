var CollectionUtils = {
    /**
     * Toggle the membership of an item in a collection and
     * returns the item's new membership state (true = member, false = not a member)
     *
     *
     * @param {Array} collection
     * @param {Object} item
     *
     */
    toggleItem: function(collection, item) {
        var result;

        if (collection.contains(item)) {
            collection.remove(item);
            result = false;
        } else {
            collection.add(item);
            result = true;
        }

        return result;
    },
};

module.exports = CollectionUtils;
