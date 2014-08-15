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

module.exports = function(Promise, ajaxRequest) {
    // store promise and ajax function
    shared.Promise = Promise;
    shared.ajax = ajaxRequest;

    // return jassa object
    return {
        util: require('./util'),
        rdf: require('./rdf'),
        vocab: require('./vocab'),
//        sparql: require('./sparql'),
//        service: require('./service'),
//        sponate: require('./sponate'),
    };
};
