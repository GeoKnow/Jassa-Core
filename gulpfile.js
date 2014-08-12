var gulp = require('./gulp')([
    'jshint',
    'mocha',
    'coverage',
    'jscs',
    'docs',
    'browserify',
]);

gulp.task('lint', ['jshint', 'jscs']);
gulp.task('test', ['lint', 'mocha', 'coverage']);
gulp.task('build', ['browserify']);
gulp.task('default', ['test']);
