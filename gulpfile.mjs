import gulp from 'gulp';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import cleanCSS from 'gulp-clean-css';
import ejs from 'gulp-ejs';
import rename from 'gulp-rename';
import { deleteSync } from 'del';
import webserver from 'gulp-webserver';

const { src, dest, watch } = gulp;
const sass = gulpSass(dartSass);

// Define paths for various assets
const paths = {
  styles: {
    src: 'src/styles/*.scss',
    dest: 'dist/css/',
  },
  scripts: {
    src: 'src/scripts/*.js',
    dest: 'dist/js/',
  },
  html: {
    src: 'src/**/*.ejs',
    dest: 'dist/',
    watch: 'src/templates/**/*.ejs',
  },
};

// Task to clean the dist directory
const clean = async () => deleteSync(['dist']);

// Task to compile SCSS to CSS, minify it, and output to the destination folder
const styles = () =>
  src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(dest(paths.styles.dest));

// Task to transpile JavaScript using Babel, minify it, and output to the destination folder
const scripts = () =>
  src(paths.scripts.src, { sourcemaps: false })
    .pipe(babel())
    .pipe(uglify())
    .pipe(dest(paths.scripts.dest));

// Task to process EJS templates, rename them, and output to the destination folder
const html = () => src(paths.html.src)
  .pipe(ejs().on('error', console.error))
  .pipe(rename({ basename: 'index', extname: '.html' }))
  .pipe(dest(paths.html.dest))

// Task to start a web server with live reload
const server = () => {
  return src(paths.html.dest)
    .pipe(webserver({
      livereload: true,
      open: 'http://localhost:8000',
    }));
}

// Task to watch for changes in files and re-run respective tasks
const watchFiles = () => {
  watch(paths.scripts.src, scripts);
  watch(paths.styles.src, styles);
  watch([paths.html.src, paths.html.watch], html);
};

// Export tasks
export const build = gulp.series(clean, gulp.parallel(styles, scripts, html));
export const serve = gulp.series(build, gulp.parallel(watchFiles, server));
