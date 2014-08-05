var RdfDatatypes = require('./rdf-datatypes');
var BaseDatatype = require('./base-datatype');

// TODO: expose?
var JenaParameters = {
    enableSilentAcceptanceOfUnknownDatatypes: true
};

// static instance
var staticInstance = null;

// constructor
var TypeMapper = function(uriToDt) {
    this.classLabel = 'TypeMapper';

    // init
    this.initialize(uriToDt);
};

TypeMapper.prototype.getInstance = function() {
    if(staticInstance === null) {
        staticInstance = new TypeMapper(RdfDatatypes);
    }
    
    return staticInstance;
};

TypeMapper.prototype.initialize = function(uriToDt) {
    this.uriToDt = uriToDt;
};

TypeMapper.prototype.getSafeTypeByName = function(uri) {
    var uriToDt = this.uriToDt;
    var dtype = uriToDt[uri];

    if (dtype === null) {
        if (uri === null) {
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
};

TypeMapper.prototype.registerDatatype = function(datatype) {
    var typeUri = datatype.getUri();
    this.uriToDt[typeUri] = datatype;
};

module.exports = TypeMapper;