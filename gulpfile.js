var gulp = require('./gulp')([
    'jshint',
    'mocha',
    'coverage',
    'jscs',
    'docs',
    'browserify',
    'coveralls',
]);

gulp.task('lint', ['jshint', 'jscs']);
gulp.task('test', ['lint', 'mocha', 'coverage']);
gulp.task('fulltest', ['test', 'coveralls']);
gulp.task('build', ['browserify']);
gulp.task('default', ['test']);
