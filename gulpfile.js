'use strict';

var gulp       = require('gulp'),
    minifyHTML = require('gulp-minify-html'),
    sass       = require('gulp-sass'),
    minifyCss  = require('gulp-minify-css'),
    sourcemaps = require('gulp-sourcemaps'),
    streamify  = require('gulp-streamify'),
    browserify = require('browserify'),
    source     = require('vinyl-source-stream'),
    uglify     = require('gulp-uglify'),
    rename     = require('gulp-rename'),
    es         = require('event-stream'),
    imagemin   = require('gulp-imagemin'),
    pngquant   = require('imagemin-pngquant'),
    notify     = require('gulp-notify'),
    path       = require('path'),
    jsonminify = require('gulp-jsonminify');

gulp.task('css', function () {
  gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.init())
    .pipe(minifyCss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('copy', function() {
  
  var files = [
    'manifest.json',
    '_locales/**/*.json'
  ];

  return gulp.src(files, { base: './' })
      .pipe(jsonminify())
      .pipe(gulp.dest('./dist/'));
});

gulp.task('js', function() {

    var files = [
      'js/options.js',
      'js/background.js'
    ];

    var tasks = files.map(function(entry) {
        return browserify({ entries: [entry] })
            .bundle()
            .pipe(source(entry))
            //.pipe(streamify(uglify()))
            .pipe(rename({
                extname: '.min.js'
            }))
            .pipe(gulp.dest('./dist'));
        });

    return es.merge.apply(null, tasks);
});

gulp.task('html', function() {
  var opts = {
    conditionals: true,
    spare:true
  };
 
  return gulp.src('./html/*.html')
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('./dist/html'));
});

gulp.task('images', function() {
  return gulp.src('./images/**/*')
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    }))
    .pipe(gulp.dest('./dist/images/')); 
});

gulp.task('notify', function() {
  return gulp.src("")
    .pipe(notify({
      title: "Jira Search",
      message: "Build Complete!",
      "icon": path.join(__dirname, "images/jira.png"),
    }));
});

gulp.task('build', ['copy', 'css', 'js', 'html', 'images', 'notify']);
gulp.task('package', ['build']);
gulp.task('default', ['build']);

gulp.task('watch', function () {
   gulp.watch('./sass/**/*.scss', ['css']);
   gulp.watch('./js/**/*.js', ['js']);
   gulp.watch('./html/**/*.html', ['html']);
   gulp.watch('./images/**/*', ['images']);
   gulp.watch('./**/*.json', ['copy']);

});