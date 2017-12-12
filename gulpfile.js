// including plugins
var gulp = require('gulp')
, minifyHtml = require("gulp-minify-html")
, minifyCss = require("gulp-minify-css")
//, watch = require("gulp-watch")
, rename = require("gulp-rename");

gulp.task('minify',function () {
    gulp.src('./app/*.css') // path to your file
    .pipe(minifyCss())
    .pipe(rename({
            suffix: '.min'
        }))
    .pipe(gulp.dest('./app/dist'));
    gulp.src('./app/*.html') // path to your files
    .pipe(minifyHtml())
    .pipe(rename({
            suffix: '.min'
        }))
    .pipe(gulp.dest('./app/dist/'));
});
/*gulp.task('watch',function(){
  gulp.watch('app/*.css',['minify']);
  gulp.watch('app/*.html',['minify']);
});*/
