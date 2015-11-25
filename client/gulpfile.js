'use strict';

var gulp = require('gulp');
var browserify = require('gulp-browserify');
var babelify = require("babelify");
var sass = require("gulp-sass");
var livereload = require('gulp-livereload');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var rename = require("gulp-rename");

//
// Frontend Tasks
//
gulp.task('browserify', function () {
  gulp.src('src/js/app.js', {entry: true})
    .pipe(browserify({
      transform: ['babelify']
    }))
    .pipe(gulp.dest('./../web/compiled/assets/js'))
    .pipe(livereload());
});

gulp.task('sass', function () {
  gulp.src('./src/scss/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('./../web/compiled/assets/css'))
});

gulp.task('images', function () {
  gulp.src('./src/img/**/*.*')
    .pipe(gulp.dest('./../web/compiled/assets/img'));
});

gulp.task('fonts', function () {
  gulp.src('./src/fonts/**/*.*')
    .pipe(gulp.dest('./../web/compiled/assets/fonts'));
});


gulp.task('jsmin', function () {
  gulp.src('src/js/app.js', {entry: true})
    .pipe(browserify({
      transform: ['babelify']
    }))
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(rename("app.min.js"))
    .pipe(gulp.dest('./../web/compiled/assets/js'));
});

gulp.task('cssmin', function () {
  gulp.src('./src/scss/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(minifyCss({compatibility: 'ie9'}))
    .pipe(rename("main.min.css"))
    .pipe(gulp.dest('./../web/compiled/assets/css'))
});

gulp.task('frontend', ['browserify', 'jsmin', 'sass', 'cssmin', 'images', 'fonts']);



//
// ADMIN tasks
//
gulp.task('admin', function () {
  gulp.src('./../client/node_modules/bootstrap/dist/css/bootstrap**min.css')
      .pipe(gulp.dest('./../web/compiled/admin/assets/css'));
  gulp.src('./src/admin/*.css')
      .pipe(gulp.dest('./../web/compiled/admin/assets/css'));

  gulp.src('./../client/node_modules/bootstrap/dist/fonts/*.*')
      .pipe(gulp.dest('./../web/compiled/admin/assets/fonts'));

  gulp.src('./../client/node_modules/bootstrap/dist/js/**min.js')
      .pipe(gulp.dest('./../web/compiled/admin/assets/js'));
  gulp.src('./../client/node_modules/jquery/dist/**min.js')
      .pipe(gulp.dest('./../web/compiled/admin/assets/js'));

});

//
// Main tasks, build ALL
//
gulp.task('default', ['frontend', 'admin']);

gulp.task('prod', ['jsmin','cssmin']);

gulp.task('watch', function () {
  livereload.listen();
  gulp.watch('src/**/*.*', ['default']);
});
