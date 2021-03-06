
var package = require('./package.json');

var http = require('http');
var path = require('path');
var gulp = require('gulp');

var bower = require('gulp-bower');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var flatten = require("gulp-flatten");

var coffeelint = require('gulp-coffeelint');
var coffee = require('gulp-coffee');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');

var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');

var jade = require('gulp-jade');

var watch = require("gulp-watch");
var nodemon = require("gulp-nodemon");
var livereload = require('gulp-livereload');
var tinylr = require('tiny-lr')();

var LIVERELOAD_PORT = 35729;
var BASEDIR = path.join(__dirname, 'server/views');
var STATIC_PAGES_ROOT = __dirname + '/server/views/pages';
var PAGE_WAIT = 2000;

gulp.task('bower', function(){
  return bower();
});

gulp.task('clean-scripts-build', function() {
  gulp.src('build/scripts/*.*', {read: false})
    .pipe(clean());
});

gulp.task('clean-scripts-dist', function() {
  gulp.src('dist/scripts/*.*', {read: false})
    .pipe(clean());
});

gulp.task('clean-third-party-build', function() {
  gulp.src('build/scripts/third-party/*.*', {read: false})
    .pipe(clean());
});

gulp.task('clean-third-party-dist', function() {
  gulp.src('dist/scripts/third-party/*.*', {read: false})
    .pipe(clean());
});

gulp.task('clean-less-build', function() {
  gulp.src('build/styles/*.css', {read: false})
    .pipe(clean());
});

gulp.task('clean-less-dist', function() {
  gulp.src('dist/styles/*.css', {read: false})
    .pipe(clean());
});

gulp.task('clean-templates-build', function() {
  gulp.src('build/**/*.html', {read: false})
    .pipe(clean());
});

gulp.task('clean-templates-dist', function() {
  gulp.src('dist/**/*.html', {read: false})
    .pipe(clean());
});

gulp.task('clean-server', function() {
  gulp.src('server/**/*.js', {read: false})
    .pipe(clean());
});

gulp.task('copy-to-build', function() {
  gulp.src(['client/**/*.*', '!client/**/*.{coffee,less}'])
    .pipe(gulp.dest('build'));
});

gulp.task('copy-to-dist', function() {
  gulp.src(['client/**/*.*', '!client/**/*.{coffee,less,js,css}'])
    .pipe(flatten())
    .pipe(gulp.dest('dist'));
});

gulp.task('third-party-build', ['clean-third-party-build'], function() {
  gulp.src('third-party/**/dist/*.min.js')
    .pipe(flatten())
    .pipe(gulp.dest('build/scripts'));
});

gulp.task('third-party-dist', ['clean-third-party-dist'], function() {
  gulp.src('third-party/**/dist/*.min.js')
    .pipe(flatten())
    .pipe(gulp.dest('dist'));
});

gulp.task('scripts-build', ['clean-scripts-build'], function() {
  gulp.src(['client/**/*.coffee'])
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())
    .pipe(coffee())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(concat(package.name + '.js'))
    .pipe(gulp.dest('build/scripts'))
    .pipe(rename(package.name + '.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/scripts'))
    .pipe(livereload(tinylr));
});

gulp.task('scripts-dist', ['clean-scripts-dist'], function() {
  gulp.src(['client/**/*.coffee'])
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())
    .pipe(coffee())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(concat(package.name + '.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('scripts-server', function() {
  gulp.src(['server/**/*.coffee'])
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())
    .pipe(coffee())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(gulp.dest('server'));
});

gulp.task('less-build', ['clean-less-build'], function() {
  gulp.src('client/less/*.less')
    .pipe(less())
    .pipe(concat(package.name + '.css'))
    .pipe(gulp.dest('build/styles'))
    .pipe(rename(package.name + '.min.css'))
    .pipe(minifyCSS({ removeEmpty: true }))
    .pipe(gulp.dest('build/styles'))
    .pipe(livereload(tinylr));
});

gulp.task('less-dist', ['clean-less-dist'], function() {
  gulp.src('client/less/*.less')
    .pipe(less())
    .pipe(concat(package.name + '.min.css'))
    .pipe(gulp.dest('dist'));
});

gulp.task('templates-build', ['clean-templates-build'], function() {
  gulp.src('server/views/pages/**/*.jade')
    .pipe(jade({
      basedir: BASEDIR,
      locals: { env: 'dev', liveReloadPort: LIVERELOAD_PORT }
    }))
    .pipe(gulp.dest('build'))
});

gulp.task('templates-dist', ['clean-templates-dist'], function() {
  gulp.src('server/views/pages/**/*.jade')
    .pipe(jade({
      basedir: BASEDIR,
      locals: { env: 'pro' }
    }))
    .pipe(gulp.dest('dist'))
});

gulp.task('serve', function () {
  nodemon({ script: 'server/app.js', ext: 'coffee' })
    .on('restart', ['scripts-server'])
  tinylr.listen(LIVERELOAD_PORT, function() {
    console.log('TinyLR Listening on %s', LIVERELOAD_PORT);
  });
});

gulp.task('watch', function() {
  gulp.watch('client/scripts/*.coffee', ['scripts-build']).on('change', function(file) {
    tinylr.changed(file.path);
  });
  gulp.watch('client/less/*.less', ['less-build']).on('change', function(file) {
    tinylr.changed(file.path);
  });
  gulp.watch('server/views/**/*.jade', ['templates-build']).on('change', function(file) {
    var filename = '/' + path.relative(STATIC_PAGES_ROOT, file.path).replace(/\.jade$/, '.html');
    setTimeout(function(){tinylr.changed({ body: { files: [filename] } });}, PAGE_WAIT);
  });
});

gulp.task('server', [
  'scripts-server',
  'scripts-build',
  'less-build',
  'templates-build',
  'copy-to-build',
  'serve',
  'watch'
]);

gulp.task('dist', [
  'scripts-dist',
  'copy-to-dist',
  'less-dist'
]);
