var gulp       = require('gulp')
  , ts         = require('gulp-typescript')
  , tslint     = require('gulp-tslint')
  , mocha      = require('gulp-mocha')
  , babel      = require('gulp-babel')
  , merge      = require('merge2');


var project = ts.createProject('tsconfig.json');
var files   = require('./tsconfig.json').files;

gulp.task('lint', function() {
    return gulp
        .src(files)
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

gulp.task('test', ['build'], function() {
    return gulp
        .src('computation.test.js', { read: false })
        .pipe(mocha())
});

gulp.task('build', ['lint'], function() {
    var tsResult = gulp.src(files).pipe(ts(project));

    return merge([
        tsResult.dts.pipe(gulp.dest('.')),
        tsResult.js.pipe(babel({ presets: ['es2015'] })).pipe(gulp.dest('.'))
    ]);
});

gulp.task('watch', ['build'], function() {
    return gulp.watch(files, ['build', 'test']);
});

gulp.task('default', ['build']);
