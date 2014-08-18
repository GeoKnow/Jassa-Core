/* global define */
/* global window */

var Jassa = require('./index.js');

if (typeof define == 'function' && define.amd) {
    define('Jassa', function () {
        return Jassa;
    });
} else {
    window.Jassa = Jassa;
}
