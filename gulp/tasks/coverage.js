var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

module.exports = function() {
    return gulp.src(['lib/**/*.js'])
        .pipe(istanbul()) // Covering files
        .on('finish', function() {
            gulp.src(['test/**/*.js'])
                .pipe(mocha({reporter: 'dot'}))
                .pipe(istanbul.writeReports()); // Creating the reports after tests runned
        });
};
