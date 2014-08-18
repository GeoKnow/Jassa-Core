// var cmd = 'istanbul cover ./node_modules/mocha/bin/_mocha --report lcovonly -- -R spec && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage';

var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var shell = require('gulp-shell');

module.exports = {
    deps: ['test'],
    work: function() {
        return gulp.src(['lib/**/*.js'])
            .pipe(istanbul()) // Covering files
            .on('finish', function() {
                gulp.src(['test/**/*.js'])
                    .pipe(mocha({reporter: 'spec', report: 'lcovonly'}))
                    .pipe(istanbul.writeReports())
                    .pipe(shell('cat ./coverage/lcov.info | ./node_modules/.bin/coveralls')); // Creating the reports after tests runned
            });
    }
};
