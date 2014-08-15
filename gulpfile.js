var gulp = require('./gulp')([
    'jshint',
    'mocha',
    'coverage',
    'jscs',
    'docs',
    'browserify',
    'coveralls',
]);

//gulp.task('lint', ['jshint', 'jscs']);
gulp.task('lint', ['jshint']);
gulp.task('test', ['lint', 'mocha']);
gulp.task('fulltest', ['test', 'coverage', 'coveralls']);
gulp.task('build', ['browserify']);
gulp.task('default', ['test']);
