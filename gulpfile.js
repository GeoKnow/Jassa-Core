var gulp = require('./gulp')([
    'jshint',
    'mocha',
    'coverage'
]);

gulp.task('test', ['jshint', 'mocha', 'coverage']);
gulp.task('default', ['test']);