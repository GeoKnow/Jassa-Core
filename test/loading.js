/* global describe */
/* global it */

var should = require('should');
var fs = require('fs');

var loadModulesFromFolder = function(folder) {
    var basePath = './lib/' + folder;
    // as test require all files in the folder
    fs.readdirSync(basePath).forEach(function(file) {
        var stat = fs.statSync(basePath + '/' + file);
        if(file.indexOf('.js') !== -1) {
            var module = require('.' + basePath + '/' + file);
            should.exist(module);
        } else if(stat.isDirectory()) {
            loadModulesFromFolder(folder + '/' + file);
        }
    });
};

// tests
describe('Library modules', function(){
    it('#RDF should load', function(){
        loadModulesFromFolder('rdf');
    });

    it('#Service should load', function(){
        loadModulesFromFolder('service');
    });

    it('#Sparql should load', function(){
        loadModulesFromFolder('sparql');
    });

    it('#Util should load', function(){
        loadModulesFromFolder('util');
    });

    it('#Vocab should load', function(){
        loadModulesFromFolder('vocab');
    });
});
