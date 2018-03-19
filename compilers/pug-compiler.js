'use strict';
const path = require('path');
const fs = require('fs-extra');
const log = require('../tools/logger');
const Timer = require('../tools/timer');
const pug = require('pug');
const _ = require('lodash');


// regex for different types of templates
const pugType = /.pug|.jade/;


module.exports = {
  compile(app, file) {
    if (file) {
      switch (this.formatFinder(file)) {
        case 'pug':
          this.compilePug(file, app);
          break;
        default:
          break;
      }
    } else this.compilePug(file, app);
  },
  formatFinder(file) {
    if (pugType.test(file)) return 'pug';
  },
  compilePug(file, app, full) {
    const pugOptions = {
      pretty: app.config.pug.pretty || true,
      basedir: app.config.pug.basedir || './'
    };
    if (haveUnderscores(file)) return;
    Timer.start();
    let template = pug.renderFile(file, _.merge(pugOptions, app));
    saveTemplate(template, file, app);




    // ===================
    // const entry = path.resolve(app.config.styles.entry);
    // const output = path.resolve(app.config.styles.output)
    // const sassOptions = {
    //   file: entry,
    //   includePaths: [path.dirname(entry)],
    //   outputStyle: app.config.styles.outputStyle || 'expanded',
    //   imagePath: app.config.styles.imagePath || path.dirname(entry),
    //   precision: app.config.styles.precision || 3,
    //   errLogToConsole: app.config.styles.errLogToConsole || false
    // }
    // const pleeeaseOpt = {
    //   autoprefixer: { browsers: ['last 2 versions', '> 2%'] },
    //   rem: [app.config.styles.rem || '16px'],
    //   pseudoElements: true,
    //   mqpacker: true,
    //   minifier: app.config.styles.minified || false
    // };
    // Timer.start();
    // sassCompiler.render(sassOptions, (err, styles) => {
    //   if (err) handleErrorSass(err);
    //   else {
    //     let fixed = pleeease.process(styles.css.toString('utf8'), pleeeaseOpt);
    //     fixed.then((styles) => saveStyles(styles, output, app));
    //   }
    // });
  }
}

function haveUnderscores(name) {
  return /\\_[a-zA-Z0-9]/.test(name);
}

function saveTemplate(template, file, app) {
  const base = (app.config.dist || '_dist');
  let newFile = newPath(file, base);
  fs.ensureDirSync(path.dirname(newFile));
  fs.writeFile(newFile, template, err => {
    if (err) log.error(err);
    else {
      Timer.finish();
      log.success(`Template ${path.basename(file)} was compiled.`, Timer.getFormattedLapse());
      app.bsreload();
    }
  });
}

/**
 * @param  {} file
 * @param  {} base
 */
function newPath(file, base) {
  // Get the file name and switch the extension to html
  const filename = path.basename(file, path.extname(file)) + '.html';
  // Get the file new directory
  const dirname = path.join(base, path.dirname(file));
  // return the full addres of the new file.
  return path.join(dirname, filename);
}


// function saveStyles(styles, file, app) {
//   console.log(app.tags);
//   fs.ensureDirSync(path.dirname(file));
//   fs.writeFile(file, styles, err => {
//     if (err) log.error(err);
//     else {
//       Timer.finish();
//       log.success('Styles compiled', Timer.getFormattedLapse());
//       app.bsreload();
//     }
//   });
// }

              // function handleErrorSass(err) {
                //   if (err.file && err.line) {
                  //     let info = `Error in file: ${err.file} on Line: ${err.line}/${err.column}`;
                  //     let message = err.message.indexOf('\n') === -1 ? err.message : err.message.substring(0, err.message.indexOf('\n'));
                  //     log.error([info, message]);
                  //   } else log.error(JSON.stringify(err, undefined, 2));
                  // }