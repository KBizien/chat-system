var gulp = require('gulp'),
  watch = require('gulp-watch'),
  sass = require('gulp-ruby-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  minifycss = require('gulp-minify-css'),
  livereload = require('gulp-livereload');

gulp.task('sass', function() {
  return gulp.src('app/assets/scss/app.scss')
    .pipe(sass({style: ['expanded']}))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
    .pipe(minifycss())
    .pipe(gulp.dest('app/assets/css'))
    .pipe(livereload({ auto: false }));
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('app/assets/scss/**/*.scss', ['sass']);
});

gulp.task('default', ['watch'], function() {});