var gulp       = require('gulp')
  , ts         = require('gulp-typescript')
  , tslint     = require('gulp-tslint')
  , mocha      = require('gulp-mocha')
  , babel      = require('gulp-babel');


var project = ts.createProject({
    declarationFiles: false,
    noExternalResolve: true,
    target: 'ES6',
    typescript: require('typescript')
});


gulp.task('lint', function() {
    return gulp.src('computation.ts')
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

gulp.task('test', ['default'], function() {
    return gulp.src('test/computation.test.js', { read: false })
        .pipe(mocha());
});

gulp.task('default', function() {
    return gulp.src(['computation.ts'])
        .pipe(ts(project)).js
        .pipe(babel())
        .pipe(gulp.dest('.'));
});


gulp.task('watch', ['default'], function() {
    gulp.watch('computation.ts', ['default', 'test']);
});
