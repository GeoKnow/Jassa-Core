var gulp = require('./gulp')([
    'jshint',
    'mocha',
]);

gulp.task('test', ['jshint', 'mocha']);
gulp.task('default', ['test']);