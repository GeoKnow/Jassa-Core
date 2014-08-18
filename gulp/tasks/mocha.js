var gulp = require('gulp');
var mocha = require('gulp-mocha');

module.exports = function(){
    return gulp.src('./test/**/*.js')
        .pipe(mocha({reporter: 'spec', useColors: true}));
};
