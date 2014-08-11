//var mergeMapsInPlace = require('./merge-maps-in-place');

/**
 *
 *
 * //FIXME: @param parent
 * @returns {Boolean} true if the node was merged, false otherwise
 */
var tryMergeNode = function() { //parent) {
    return false;

    /*if(!parent) {
        return;
    }

    // If all children are loaded, and the total number
    var itemCount = 0, i, child;
    for(i in parent.children) {
        child = parent.children[i];

        if(!child.isLoaded) {
            return false;
        }

        itemCount += child.itemCount;
    }

    // FIXME: where's that from?
    if(itemCount >= self.maxItemsPerTileCount) {
        return false;
    }

    parent.isLoaded = true;

    for(i in parent.children) {
        child = parent.children[i];

        // FIXME: mergeMapsInPlace not defined
        mergeMapsInPlace(parent.idToPos, child.idToPos);

        // FIXME: mergeMapsInPlace not defined
        mergeMapsInPlace(parent.data.idToLabels, child.data.idToLabels);
        // FIXME: mergeMapsInPlace not defined
        mergeMapsInPlace(parent.data.idToTypes, child.data.idToTypes);

        //parent.data.ids.addAll(child.data.ids);
        //parent.data.addAll(child.data);
    }

    // Unlink children
    parent.children = null;

    console.log('Merged a node');

    return true;*/
};

module.exports = tryMergeNode;
