'use strict'

const CSS_INPUT_DIRECTORY = './assets/css/**/*.css'
const CSS_OUTPUT_DIRECTORY = './dist/css/'
const JS_INPUT_DIRECTORY = './assets/js/'
const JS_OUTPUT_DIRECTORY = './dist/js/'
const JS_SCRIPTS = [
  'study-photos',
  'memory-test',
  'global',
  'form',
  'break'
]

const gulp = require('gulp')
const browserify = require('browserify')
const buffer = require('vinyl-buffer')
const clean = require('gulp-clean-css')
const concat = require('gulp-concat')
const del = require('del')
const source = require('vinyl-source-stream')
const postcss = require('gulp-postcss')
const sourcemaps = require('gulp-sourcemaps')
const terser = require('gulp-terser')

const Build = {}

Build.css = function css () {
  return gulp.src(CSS_INPUT_DIRECTORY)
    .pipe(postcss([
      require('tailwindcss')(require('./tailwind.config')),
      require('autoprefixer')
    ]))
    .pipe(concat({ path: 'main.min.css' }))
    .pipe(clean())
    .pipe(gulp.dest(CSS_OUTPUT_DIRECTORY))
}

Build.js = gulp.parallel(JS_SCRIPTS.map(src => {
  const task = function () {
    // set up the browserify instance on a task basis
    const b = browserify({
      entries: `${JS_INPUT_DIRECTORY}${src}.js`,
      debug: true
    })

    return b.bundle()
      .pipe(source(`${src}.min.js`))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      // Add transformation tasks to the pipeline here.
      .pipe(terser())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(JS_OUTPUT_DIRECTORY))
  }
  Object.defineProperty(task, 'name', {
    writable: false,
    value: `js > ${src}`
  })
  return task
}))

const Clean = {
  css: function cleanCSS () {
    return del(CSS_OUTPUT_DIRECTORY)
  },
  js: function cleanJS () {
    return del(`${JS_OUTPUT_DIRECTORY}/**/*.js`)
  }
}

const CleanAndBuild = {
  css: gulp.series(Clean.css, Build.css),
  js: gulp.series(Clean.js, Build.js)
}

const Watch = {
  css: function watchCSS () {
    return gulp.watch(CSS_INPUT_DIRECTORY, CleanAndBuild.css)
  },
  js: function watchJS () {
    return gulp.watch(`${JS_INPUT_DIRECTORY}/**/*.js`, CleanAndBuild.js)
  }
}

exports.default = gulp.parallel(CleanAndBuild.css, CleanAndBuild.js)
exports.css = CleanAndBuild.css
exports.js = CleanAndBuild.js
exports.watch = gulp.parallel(Watch.css, Watch.js)
