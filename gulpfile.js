var gulp = require('gulp');
var gutil = require('gulp-util');
var ftp = require( 'vinyl-ftp' );
var $ = require('gulp-load-plugins')();
//var browserify = require('browserify');
var watchify = require('watchify');
//var babelify = require('babelify');
//var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
var reload = browserSync.reload;
var credentials = require("./config/credentials");

// Bundle files with browserify
gulp.task('scripts', function() {
  var rebundle = function() {
    return gulp.src('game/js/*.js')
      .on('error', $.util.log)
      //.pipe(source('app.js'))
      .pipe(buffer())
      .pipe($.sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .on('error', $.util.log)
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest('.tmp/js'));
  }

  return rebundle();

});

// Bundle files for distribuition
gulp.task('scripts:dist', function () {
  // set up the browserify instance on a task basis
  return gulp.src('game/js/*.js')
    //.pipe(source('app.js'))
    .pipe(buffer())
    .pipe($.uglify())
    .on('error', $.util.log)
    .pipe(gulp.dest('dist/js'));
});

// Copy svg without optimazing
gulp.task('svg', function () {
  return gulp.src(
    'app/css/images/*.svg')
    .pipe(gulp.dest('dist/css/images'));
});

// Copy gif's files without optimazing
gulp.task('svg', function () {
  return gulp.src(
    'game/img/*.gif')
    .pipe(gulp.dest('dist/img'));
});


// Optimize images
gulp.task('images', ['svg'], function () {
return gulp.src(['game/img/**/*.png','game/img/**/*.jpg','game/img/**/*.ico'])
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/img'))
    .pipe($.size({title: 'img'}));
});

// Copy web fonts to dist
gulp.task('fonts', function () {
  return gulp.src([
    'game/{,css/}fonts/**/*'
  ])
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'));
});

// Compile and automatically prefix stylesheets
gulp.task('styles', function() {
  return gulp.src('game/css/*.css')
    .pipe($.sourcemaps.init())
    .pipe($.postcss([
      require('autoprefixer')({browsers: ['last 1 version']})
    ]))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/css'))
    .pipe(reload({ stream: true }));
});

// Compile and automatically prefix stylesheets
gulp.task('styles:dist', function() {
  return gulp.src('game/css/*.css')
    .pipe($.sourcemaps.init())
    .pipe($.postcss([
      require('autoprefixer')({browsers: ['last 1 version']})
    ]))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('dist/css'))
    .pipe(reload({ stream: true }));
});

// Scan your HTML for assets & optimize them
gulp.task('html', ['styles:dist'], function () {
  //var assets = $.useref.assets({ searchPath: ['.tmp', 'app', '.'] });

  return gulp.src('game/*.html')
    .pipe($.htmlReplace({ js: ['js/*.js' ],css:['css/*.css'] }))
    //.pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    //.pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({ conditionals: true, loose: true })))
    .pipe(gulp.dest('dist'));
});


// Clean output directory and cached images
gulp.task('clean', function (callback) {
  var del = require('del');
  return del(['.tmp', 'dist'], function () {
    $.cache.clearAll(callback);
  });
});

// Copy assets to distribution path
gulp.task('extras', function () {
  return gulp.src([
    'game/*.*',
    '!game/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

// Run tests and report for ci
gulp.task('test', function(callback) {
  return gulp.src('game/scripts/**/__tests__')
    .pipe($.jest({
      scriptPreprocessor: __dirname + '/node_modules/babel-jest',
      unmockedModulePathPatterns: [
        __dirname + '/node_modules/react',
        __dirname + '/node_modules/react-tools'
      ],
      moduleFileExtensions: ['js', 'json', 'jsx']
    }));
});

// Run test in tdd mode
gulp.task('tdd', ['test'], function(callback) {
  gulp.watch('game/scripts/**/*.js', ['test']);
});

// Run development server environmnet
gulp.task('serve', ['scripts', 'styles'], function () {
  browserSync({
    notify: false,
    port: 9000,
    ui: {
      port: 9001
    },
    server: {
      baseDir: ['.tmp', 'game'],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  });

  // watch for changes
  gulp.watch([
    'game/*.html',
    'game/js/**/*.js',
    'game/img/**/*',
    '.tmp/js/**/*.js',
  ]).on('change', reload);

  gulp.watch('game/css/**/*.css', ['styles']);
});

// Run web server on distribution files
gulp.task('serve:dist', function() {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

// Build the project for distribution
gulp.task('build', ['scripts:dist', 'html', 'images', 'fonts', 'extras'], function () {
  var size = $.size({title: 'build', gzip: true });
  return gulp.src('dist/**/*')
    .pipe(size)
    .pipe($.notify({
      onLast: true,
      title: 'Build complete',
      message: function() {
        return 'Total scripts size (gzip) ' + size.prettySize;
      }
    }));
});

//Deploy to server
gulp.task('deploy', ['default'], function() {
  var conn = ftp.create({
    host: credentials.host,
    user: credentials.user,
    pass: credentials.pass,
    parallel: 10,
    log: gutil.log
  });
  var globs = ['dist/**'];
  return gulp.src(globs, {base: './dist/', buffer: false})
         //.pipe(conn.newer(credentials.remote_dir))
         .pipe(conn.dest(credentials.remote_dir));
});

// Clean all and build from scratch
gulp.task('default', ['clean'], function(cb) {
  runSequence('build', cb);
});

