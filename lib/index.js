var shared = require('./util/shared');

/**
 * Defines the global variable into which the modules
 * will add their content
 *
 * A note on naming convention:
 * The root objectand classes is spelled with upper camel case.
 * modules, functions and objects are in lower camel case.
 * (modules are just namespaces, and it feels pretty obstrusive writing them in upper camel case)
 *
 */

var Jassa = function(Promise, ajaxRequest) {
    // store promise and ajax function
    shared.Promise = Promise;
    shared.ajax = ajaxRequest;

    // return jassa object
    return {
        ext: require('./ext'),
        util: require('./util'),
        rdf: require('./rdf'),
        io: require('./io'),
        vocab: require('./vocab'),
        sparql: require('./sparql'),
        service: require('./service'),
        sponate: require('./sponate'),
        facete: require('./facete'),
        geo: require('./geo')
    };
};

Jassa.ext = require('./ext');

/*
Jassa.util = require('./util');
Jassa.rdf = require('./rdf');
Jassa.vocab = require('./vocab');
Jassa.sparql = require('./sparql');
Jassa.service = require('./service');
Jassa.sponate = require('./sponate');
Jassa.facete = require('./facete');
*/


module.exports = Jassa;

