
var CurieUtils = {
// http://www.w3.org/TR/sparql11-query/#rPN_LOCAL
//        (PN_CHARS_U | ':' | [0-9] | PLX ) ((PN_CHARS | '.' | ':' | PLX)* (PN_CHARS | ':' | PLX) )?
        // TODO: Implement this property - right now we just ditch slashes and whitespaces
    pnLocalPattern: /^[^\s/]+$/,

    isValidSparqlLocalName: function(str) {
        var match = this.pnLocalPattern.exec(str);
        var result = !!match;
        return result;
    }
};

module.exports = CurieUtils;
