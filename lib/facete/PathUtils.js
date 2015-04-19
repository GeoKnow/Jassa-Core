var _ = require('lodash');
//var uniq = require('lodash.uniq');

var NodeFactory = require('../rdf/NodeFactory');

var FacetNode = require('./FacetNode');
var VarUtils = require('../sparql/VarUtils');
var ElementUtils = require('../sparql/ElementUtils');
var Relation = require('../sparql/Relation');
var NodeUtils = require('../rdf/NodeUtils');
var StringUtils = require('../util/StringUtils');


var PathUtils = {
    createRelation: function(path, sourceVar) {
        sourceVar = sourceVar || VarUtils.s;
        var facetNode = FacetNode.createRoot(sourceVar);

        var fn = facetNode.forPath(path);
        var tmp = fn.getElements();

        var element = ElementUtils.groupIfNeeded(tmp);

        //var sourceVar = facetNode.getVar();
        var targetVar = fn.getVar();

        var result = new Relation(element, sourceVar, targetVar);
        return result;
    },


    getUris: function(path) {
        var steps = path ? path.getSteps(): [];

        var propertyUris = steps.map(function(step) {
            return step.getPropertyName();
        });

        var result = _.uniq(propertyUris);

        //var result = propertyUris.map(NodeFactory.createUri);
        return result;
    },

    getNodes: function(path) {
        var uris = PathUtils.getUris(path);
        var result = uris.map(NodeFactory.createUri);
        return result;
    },

    getNodesFromPaths: function(paths) {
        // Get all unique mentioned property names and turn them to jassa nodes
        var nodesArr = paths.map(function(path) {
            var r = PathUtils.getNodes(path);
            return r;
        });

        var nodes = _.flatten(nodesArr);
        var result = NodeUtils.uniq(nodes);
        return result;
    },


    /**
     * Passes an array of items to a lookup service and returns a promise
     * to an array with the original items matched with their lookup
     * value
     *
     * @param lookupService
     * @param items
     * @param keyFn
     * @returns
     */
/*
    zip: function(lookupService, items, keyFn) {
        var keys = items.map(keyFn || identity);
        var result = lookupService.lookup(keys).then(function(map) {
            var r = [];

            for(var i = 0; i < items.length; ++i) {
                var item = items[i];
                var key = keys[i];
                var val = map.get(key);

                //var s = [item, val];
                var s = {
                    item: item,
                    key: key,
                    val: val
                };

                r.push(s);
            }

            return r;
        });

        return result;
    },

    createLabel: function(path, lookupService, emptyLabel, invertFn, stepSepataor) {

        foo.chain(arr).mapAsync(function(key) { lookupService.lookup(key)})

        // zipLookup: for each item get the key and make the lookup



    },

    createLabelHtml: function(path, nodeToLabelInfo) {
        var invertFn = StringUtils.createFnSuffix('&sup1', true);
        var stepSeparator = '&raquo';


        var r = defaultPathLabelHtmlFn(path, nodeToLabelInfo, 'Items', invertFn, stepSeparator);
        return r;
    },
*/
    createLabelFn: function(emptyLabel, invertFnOrStr, stepSeparator) {

        var result = function(path, nodeToLabelInfo) {
            var r = PathUtils.createLabel(path, nodeToLabelInfo, emptyLabel, invertFnOrStr, stepSeparator);
            return r;
        };

        return result;
    },

    createLabel: function(path, nodeToLabelInfo, emptyLabel, invertFnOrStr, stepSeparator) {

        emptyLabel = emptyLabel || 'Items';
        invertFnOrStr = invertFnOrStr || '^-1:';
        stepSeparator = stepSeparator || ' ';

        var invertFn = _.isFunction(invertFnOrStr) ? invertFnOrStr : StringUtils.parseAffixFn(invertFnOrStr);

        var steps = path.getSteps();
        var stepLabels = steps.map(function(step) {

            var property = NodeFactory.createUri(step.getPropertyName());
            var labelInfo = nodeToLabelInfo.get(property);
            var r = labelInfo.displayLabel || '(no label available)'; // TODO Probably the nullLabel is not needed, because the nodeToLabel map should take care of that

            if(step.isInverse()) {
                r = invertFn(r);
            }

            return r;
        });

        var result = stepLabels.join(stepSeparator);
        if(result === '') {
            result = emptyLabel;
        }

        return result;
    }


};


module.exports = PathUtils;
