var AnonIdStr = require('./anon-id-str');
var Var = require('./var');
var Node_Uri = require('./node/uri');
var Node_Blank = require('./node/blank');
var Node_Literal = require('./node/literal');
var LiteralLabel = require('./literal-label');
var RdfDatatypes = require('./rdf-datatypes');
var TypeMapper = require('./type-mapper');

// TODO Move to util package
// http://stackoverflow.com/questions/249791/regex-for-quoted-string-with-escaping-quotes
var strRegex = /"([^"\\]*(\\.[^"\\]*)*)"/;
var parseUri = function(str, prefixes) {
  var result;

  if(str.charAt(0) === '<') {
    result = str.slice(1, -1);

  } else {
    console.log('[ERROR] Cannot deal with ' + str);
    throw 'Not implemented';
  }
  return result;
};


var NodeFactory = {
    createAnon: function(anonId) {
        return new Node_Blank(anonId);
    },

    createUri: function(uri) {
        return new Node_Uri(uri);
    },

    createVar: function(name) {
        return new Var(name);
    },

    createPlainLiteral: function(value, lang) {
        if (lang === null) {
            lang = '';
        }

        var label = new LiteralLabel(value, value, lang);

        return new Node_Literal(label);
    },

    /** The value needs to be unparsed first (i.e. converted to string) */
    createTypedLiteralFromValue: function(val, typeUri) {
        var dtype = RdfDatatypes[typeUri];

        if (!dtype) {
            var typeMapper = TypeMapper.getInstance();
            dtype = typeMapper.getSafeTypeByName(typeUri);
        }

        var lex = dtype.unparse(val);
        var lang = null;
        var literalLabel = new LiteralLabel(val, lex, lang, dtype);

        return new Node_Literal(literalLabel);
    },

    /** The string needs to be parsed first (i.e. converted to the value) */
    createTypedLiteralFromString: function(str, typeUri) {
        var dtype = RdfDatatypes[typeUri];

        if (!dtype) {
            var typeMapper = TypeMapper.getInstance();
            dtype = typeMapper.getSafeTypeByName(typeUri);
        }

        var val = dtype.parse(str);
        var lex = str;
        var lang = ''; // TODO Use null instead of empty string???
        var literalLabel = new LiteralLabel(val, lex, lang, dtype);

        return new Node_Literal(literalLabel);
    },

    createFromTalisRdfJson: function(talisJson) {
        if (!talisJson || typeof(talisJson.type) === 'undefined') {
            throw 'Invalid node: ' + JSON.stringify(talisJson);
        }
        var result;

        switch (talisJson.type) {
            case 'bnode':
                var anonId = new AnonIdStr(talisJson.value);
                result = new NodeFactory.createAnon(anonId);
                break;

            case 'uri':
                result = NodeFactory.createUri(talisJson.value);
                break;

            case 'literal':
                // Virtuoso at some version had a bug with langs - note: || is coalesce
                var lang = talisJson.lang || talisJson['xml:lang'];
                result = NodeFactory.createPlainLiteral(talisJson.value, lang);
                break;

            case 'typed-literal':
                result = NodeFactory.createTypedLiteralFromString(talisJson.value, talisJson.datatype);
                break;

            default:
                console.log('Unknown type: \'' + talisJson.type + '\'');
                throw 'Bailing out';
        }

        return result;
    },

    /**
     * Parses an RDF term and returns an rdf.Node object
     *
     * blankNode: _:
     * uri: <http://foo>
     * plainLiteral ""@foo
     * typedLiteral""^^<>
     */
    parseRdfTerm: function(str, prefixes) {
        if (!str) {
            console.log('[ERROR] Null Pointer Exception');
            throw 'Bailing out';
        }

        str = str.trim();

        if (str.length === 0) {
            console.log('[ERROR] Empty string');
            throw 'Bailing out';
        }

        var c = str.charAt(0);
        var result;

        switch (c) {
            case '<':
                var uriStr = str.slice(1, -1);
                result = NodeFactory.createUri(uriStr);
                break;

            case '_':
                var anonId = new AnonIdStr(c);
                result = NodeFactory.createAnon(anonId);
                break;

            case '"':
                var matches = strRegex.exec(str);
                var match = matches[0];
                var val = match.slice(1, -1);
                var l = match.length;
                var d = str.charAt(l);

                if (!d) {
                    result = NodeFactory.createTypedLiteralFromString(val, 'http://www.w3.org/2001/XMLSchema#string');
                }

                switch (d) {
                    case '':
                    case '@':
                        var langTag = str.substr(l + 1);
                        result = NodeFactory.createPlainLiteral(val, langTag);
                        break;

                    case '^':
                        var type = str.substr(l + 2);
                        var typeStr = parseUri(type);
                        result = NodeFactory.createTypedLiteralFromString(val, typeStr);
                        break;

                    default:
                        console.log('[ERROR] Excepted @ or ^^');
                        throw 'Bailing out';
                }
                break;

            default:
                console.log('Could not parse ' + str);
                // Assume an uri in prefix notation
                throw 'Not implemented';
        }

        return result;
    }
};

module.exports = NodeFactory;
