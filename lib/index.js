'use strict';

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
var jassa = {
    vocab: require('./vocab'),
    rdf: require('./rdf'),

    sparql: {},

    service: {},

    i18n: {},

    util: {
        //collection: {}
    },

    client: {},
};

module.exports = jassa;
