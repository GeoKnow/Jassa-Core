var Class = require('../ext/Class');
var DefaultRdfDatatypes = require('./rdf_datatype/DefaultRdfDatatypes');
var BaseDatatype = require('./rdf_datatype/BaseDatatype');

// TODO: expose?
var JenaParameters = {
    enableSilentAcceptanceOfUnknownDatatypes: true
};

// static instance
var staticInstance = null;

// constructor
var TypeMapper = Class.create({
    classLabel: 'jassa.rdf.TypeMapper',

    initialize: function(uriToDt) {
        this.uriToDt = uriToDt;
    },

    getSafeTypeByName: function(uri) {
        var uriToDt = this.uriToDt;
        var dtype = uriToDt[uri];

        if (dtype == null) {
            if (uri == null) {
                // Plain literal
                return null;
            } else {
                // Uknown datatype
                if (JenaParameters.enableSilentAcceptanceOfUnknownDatatypes) {
                    dtype = new BaseDatatype(uri);
                    this.registerDatatype(dtype);
                } else {
                    console.log('Attempted to created typed literal using an unknown datatype - ' + uri);
                    throw 'Bailing out';
                }
            }
        }
        return dtype;
    },

    registerDatatype: function(datatype) {
        var typeUri = datatype.getUri();
        this.uriToDt[typeUri] = datatype;
    }
});

TypeMapper.staticInstance = null;

TypeMapper.getInstance = function() {

    if (TypeMapper.staticInstance == null) {
        TypeMapper.staticInstance = new TypeMapper(DefaultRdfDatatypes);
    }

    return TypeMapper.staticInstance;
};

module.exports = TypeMapper;
