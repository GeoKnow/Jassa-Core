var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

module.exports = {
    deps: ['browserify-normal'],
    work: function () {
        return gulp.src('./dist/jassa.js')
        .pipe(uglify({mangle: false}))
        .pipe(rename('jassa.min.js'))
        .pipe(gulp.dest('./dist/'));
    },
};
