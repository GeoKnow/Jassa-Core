var shared = require('./util/shared');
var Promise = require('bluebird');
var AjaxUtils = require('./util/AjaxUtils');

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

/**
 * @Deprecated
 *
 * The global jassa object was originally intended to support
 * customizing the promise and ajax library.
 * However, mixing libraries makes things more complicated than its worth.
 * So we default to bluebird and jQuery.
 */
var Jassa = function(promise, ajaxRequest) {
    //console.log('length is: ' + arguments.length);
    //console.log('promise is: ', promise);

    // If there is just a single argument, then we interpret it as the ajax function
    if(arguments.length === 1) {
        ajaxRequest = arguments[0];
        promise = null;
    }

    // store promise and ajax function
    shared.Promise = promise || Promise;
    shared.ajax = AjaxUtils.createAjaxWrapperFn(ajaxRequest);

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


//jassa = new Jassa(Promise, ajaxWrapper);



Jassa.ext = require('./ext');
Jassa.util = require('./util');
Jassa.rdf = require('./rdf');
Jassa.vocab = require('./vocab');
Jassa.sparql = require('./sparql');
Jassa.service = require('./service');
Jassa.sponate = require('./sponate');
Jassa.facete = require('./facete');



module.exports = Jassa;

