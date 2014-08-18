var gulp = require('gulp');
var shell = require('gulp-shell');

module.exports = {
    deps: ['browserify-normal'],
    work: shell.task('./node_modules/.bin/uglifyjs ./dist/jassa.js -m -r \'module,define,Jassa,$super\' -o ./dist/jassa.min.js'),
};
