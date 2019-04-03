'use strict';

import path from 'path';
import gulp from 'gulp';
import pug from 'gulp-pug';
import sass from 'gulp-sass';
import pdf from 'gulp-html-pdf';
import gutil from 'gulp-util';
import through from 'through2';
import puppeteer from 'puppeteer';
import connect from 'gulp-connect';

const srcPath = path.join(__dirname, 'src');
const indexPath = path.join(srcPath, 'index.html');
const sassPath = path.join(srcPath, 'stylesheet.sass');
const pugPath = path.join(srcPath, 'resume.pug');
const builtPath = './built';
const port = 8080;

gulp.task('copyIndex', () =>
  gulp.src(indexPath)
    .pipe(gulp.dest(builtPath)),
);

gulp.task('buildSass', () =>
  gulp
    .src(sassPath)
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(gulp.dest(builtPath))
    .pipe(connect.reload()),
);

gulp.task('buildPug', () =>
  gulp
    .src(pugPath)
    .pipe(pug({}))
    .pipe(gulp.dest(builtPath))
    .pipe(connect.reload()),
);

gulp.task('createPDF', () =>
  gulp
    .src('built/resume.html')
    .pipe(through.obj(function (file, enc, cb) {
      if (file.isNull()) {
        cb(null, file);
        return;
      }
      (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`http://localhost:${port}/resume.html`, { waitUntil: 'networkidle2' });
        const buffer = await page.pdf({ printBackground: true });
        await browser.close();
        file.contents = buffer;
        file.path = gutil.replaceExtension(file.path, '.pdf');
        cb(null, file);
      })();
    }))
    .pipe(gulp.dest(builtPath)),
);

gulp.task('openServer', done => {
  connect.server({
    port,
    root: builtPath,
    livereload: true,
  });
  done();
});

gulp.task('closeServer', done => {
  connect.serverClose();
  done();
});

gulp.task('watch', done => {
  gulp.watch(sassPath, gulp.series('buildSass'));
  gulp.watch(pugPath, gulp.series('buildPug'));
  done();
});

gulp.task('build', gulp.series(
  'openServer',
  'copyIndex',
  gulp.parallel('buildSass', 'buildPug'),
  'createPDF',
  'closeServer',
));

gulp.task('default', gulp.series(
  'openServer',
  'copyIndex',
  gulp.parallel('buildSass', 'buildPug'),
  'watch',
));
