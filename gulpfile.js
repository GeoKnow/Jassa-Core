var gulp = require('./gulp')([
    'jshint',
    'mocha',
    'coverage',
    'jscs',
]);

gulp.task('test', ['jshint', 'jscs', 'mocha', 'coverage']);
gulp.task('default', ['test']);