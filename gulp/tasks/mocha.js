var gulp = require('gulp');
var mocha = require('gulp-mocha');
var exit = require('gulp-exit');

module.exports = function(){
    return gulp.src('./test/**/*.js')
        .pipe(mocha({reporter: 'spec'}))
        .pipe(exit());
};
