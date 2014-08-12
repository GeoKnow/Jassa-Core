var gulp = require('gulp');
var jsdoc = require('gulp-jsdoc');

module.exports = function() {
    return gulp.src(['lib/**/*.js'])
        .pipe(jsdoc.parser())
        .pipe(jsdoc.generator('./docs', {
            path: 'ink-docstrap',
            systemName: 'Jassa-Core',
            footer: 'AKSW',
            copyright: 'AKSW 2014',
            navType: 'vertical',
            linenums: true,
            collapseSymbols: false,
            inverseNav: false
        }));
};
