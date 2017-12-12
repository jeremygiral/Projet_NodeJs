// including plugins
var gulp = require('gulp')
, sass = require("gulp-sass")
, rename = require("gulp-rename");

gulp.task('minify',function () {

  gulp.src('./app/src/sass/**/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest('./app/dist/css'));

});