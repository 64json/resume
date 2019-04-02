'use strict';

import path from 'path';
import gulp from 'gulp';
import gutil from 'gulp-util';
import pug from 'gulp-pug';
import sass from 'gulp-sass';
import pkg from './package.json';

const outputPaths = {
  css: './',
  pug: './',
};

const sassPath = path.join(__dirname, 'stylesheet.sass');
const pugPath = path.join(__dirname, 'resume.pug');

function onError(err) {
  console.log(err);
  this.emit('end');
}

const buildCss = () => {
  gutil.log('\n\nBuild CSS Paths: \n', sassPath, '\n\n');

  return gulp.src(sassPath)
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(gulp.dest(outputPaths.css));
};

const buildPug = () => {
  gutil.log('\n\nBuild pug Paths: \n', pugPath, '\n\n');

  const locals = {
    title: 'Jason Park',
    description: pkg.description,
    author: pkg.author,
  };

  return gulp.src(pugPath)
    .on('error', onError)
    .pipe(pug({ locals }))
    .pipe(gulp.dest(outputPaths.pug));
};


const watch = () => {
  gulp.watch(sassPath, buildCss);
  gulp.watch(pugPath, buildPug);
};

// Build
gulp.task('build', gulp.parallel(buildCss, buildPug));

// Default
gulp.task('default', watch);
