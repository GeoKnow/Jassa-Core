var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

module.exports = function() {
    var bundler = browserify().add('./lib/index.js');
    var bundlerMin = browserify().add('./lib/index.js').transform('uglifyify');

    bundler.bundle()
        //Pass desired output filename to vinyl-source-stream
        .pipe(source('jassa.js'))
        // Start piping stream to tasks!
        .pipe(gulp.dest('./dist/'));

    return bundlerMin.bundle()
        //Pass desired output filename to vinyl-source-stream
        .pipe(source('jassa.min.js'))
        // Start piping stream to tasks!
        .pipe(gulp.dest('./dist/'));
};
