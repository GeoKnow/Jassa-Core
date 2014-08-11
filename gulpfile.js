var gulp = require('./gulp')([
    'jshint',
    'mocha',
    'coverage',
    'jscs',
]);

gulp.task('lint', ['jshint', 'jscs']);
gulp.task('test', ['lint', 'mocha', 'coverage']);
gulp.task('default', ['test']);
