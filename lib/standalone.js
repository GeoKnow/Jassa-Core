var Jassa = require('./index.js');

if (typeof global.window.define == 'function' && global.window.define.amd) {
    global.window.define('Jassa', function () { return Jassa; });
} else {
    global.window.Jassa = Jassa;
}