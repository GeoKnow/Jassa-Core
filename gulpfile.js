var gulp = require('./gulp')([
    'jshint',
    'mocha',
    'coverage',
    'jscs',
    'docs',
    'browserify-normal',
    'browserify-min',
    'coveralls',
]);

//gulp.task('lint', ['jshint', 'jscs']);
gulp.task('lint', ['jshint']);
gulp.task('test', ['lint', 'mocha']);
gulp.task('fulltest', ['test', 'coverage', 'coveralls']);
gulp.task('browserify', ['browserify-normal', 'browserify-min']);
gulp.task('build', ['browserify']);
gulp.task('default', ['test']);
