var UriUtils = require('../util/UriUtils');

var TypedValue = require('./rdf_datatype/TypedValue');

var NodeUtils = {

    matches: function(pattern, candidate) {
        var result = candidate && (pattern == null || candidate.equals(pattern));
        //console.log('NodeUtils.matches: ' + pattern + ' with ' + candidate + ' > ' + result);
        return result;
    },

    getSubstitute: function(node, fnNodeMap) {
        var result = fnNodeMap(node);
        if (!result) {
            result = node;
        }

        return result;
    },

    /**
     * Push the node into to the array if it is a variable
     */
    pushVar: function(array, node) {
        if (node.isVariable()) {
            var c = false;
            array.forEach(function(item) {
                c = c || node.equals(item);
            });

            if (!c) {
                array.push(node);
            }
        }
        return array;
    },

    getLang: function(node) {
        var result = node && node.isLiteral() ? node.getLiteralLanguage() : null;
        return result;
    },

    getUri: function(node) {
        var result = node && node.isUri() ? node.getUri() : null;
        return result;
    },

    /**
     * Obtain a "pretty" string from a node object, under an optional prefixMapping.
     * Pretty means, that Uris will be converted to their short form (if a prefix mapping applies) or
     * their local name (otherwise).
     *
     * @param node
     * @param prefixMapping
     * @returns {String}
     */
    toPrettyString: function(node, prefixMapping) {
        var result;

        if(node == null) {
            result = null;
        } else if(node.isUri()) {
            var uri = node.getUri();
            if(prefixMapping) {
                result = prefixMapping.shortForm(uri);

                if(result === uri) {
                    result = UriUtils.extractLabel(uri);
                }
            } else {
                result = UriUtils.extractLabel(uri);
            }
        } else {
            result = '' + this.getValue(node);
        }

        return result;
    },

    // Turn a node of any kind into a javascript literal value
    getValue: function(node) {
        var result;
        if(node == null) {
            result = null;
        } else if(node.isUri()) {
            result = node.getUri();
        } else if(node.isBlank()) {
            result = node.toString();
        } else if(node.isLiteral()) {
            var tmp = node.getLiteralValue();

            result = tmp instanceof TypedValue
                ? tmp.getLexicalValue()
                : tmp
                ;

        } else {
            throw new Error('Unknow node type: ', node);
        }

        //console.log('Returned value: ' + result + '; for node: ' + node);
        return result;
    },

    toTalisRdfJson: function(node) {
        var result;
        if(node == null) {
            result = null; // TODO: Maybe returning an empty object (possibly with type = unknown) would be better?
        } else if(node.isUri()) {
            result = {
                type: 'uri',
                value: node.getUri(),
            };
        } else if(node.isBlank()) {
            result = {
                type: 'bnode',
                value: node.toString()
            };
        } else if(node.isLiteral()) {
            result = {
                type: 'literal',
                value: node.getLiteralLexicalForm(),
                datatype: node.getLiteralDatatypeUri(),
                lang: node.getLiteralLanguage()
            };
        } else {
            result = {
                 type: 'unknown'
            };
        }

        //console.log('Returned value: ' + result + '; for node: ' + node);
        return result;

    }


};

module.exports = NodeUtils;