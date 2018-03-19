'use strict';
const path = require('path');
const sassCompiler = require('node-sass');
const mkdirp = require('mkdirp');
const pleeease = require('pleeease');
const fs = require('fs-extra');
const log = require('../tools/logger');
const Timer = require('../tools/timer');
const chalk = require('chalk');


// regex for different types of styles
const sassType = /.sass|.scss/;

module.exports = {
  compile(app, file) {
    if (file) {
      switch (this.formatFinder(file)) {
        case 'sass':
        this.compileSASS(app);
        break;
        default:
        break;
      }
    } else this.compileSASS(app);
  },
  formatFinder(file) {
    if (sassType.test(file)) return 'sass';
  },
  compileSASS(app) {
    const entry = path.resolve(app.config.styles.entry);
    const output = path.resolve(path.join(app.config.dist || '_dist', app.config.styles.output))
    const sassOptions = {
      file: entry,
      includePaths: [path.dirname(entry)],
      outputStyle: app.config.styles.outputStyle || 'expanded',
      imagePath: app.config.styles.imagePath || path.dirname(entry),
      precision: app.config.styles.precision || 3,
      errLogToConsole: app.config.styles.errLogToConsole || false
    }
    const pleeeaseOpt = {
      autoprefixer: { browsers: ['last 2 versions', '> 2%'] },
      rem: [app.config.styles.rem || '16px'],
      pseudoElements: true,
      mqpacker: true,
      minifier: app.config.styles.minified || false
    };
    Timer.start();
    sassCompiler.render(sassOptions, (err, styles) => {
      if (err) handleErrorSass(err);
      else {
        if (styles.css.toString('utf8')) {
          let fixed = pleeease.process(styles.css.toString('utf8'), pleeeaseOpt);
          fixed.then((styles) => saveStyles(styles, output, app));
        }
      }
    });
  }
}

function handleErrorSass(err) {
  if (err.file && err.line) {
    let info = `Error in file: ${err.file} on Line: ${err.line}/${err.column}`;
    let message = err.message.indexOf('\n') === -1 ? err.message : err.message.substring(0, err.message.indexOf('\n'));
    log.error([info, message]);
  } else log.error(JSON.stringify(err, undefined, 2));
}

function saveStyles(styles, file, app) {
  fs.ensureDirSync(path.dirname(file));
  fs.writeFile(file, styles, err => {
    if (err) log.error(err);
    else {
      Timer.finish();
      log.success('Styles compiled', Timer.getFormattedLapse());
      app.bsreload();
    }
  });
}