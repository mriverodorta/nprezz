import path from 'path';
import sassCompiler from 'node-sass';
import pleeease from 'pleeease';
import fs from 'fs-extra';
import log from '../tools/logger';
import Timer from '../tools/timer';

export default class StylesCompiler {
  /**
   * Creates an instance of StylesCompiler.
   * @param {App} app App Object
   */
  constructor(app) {
    this.app = app;

    // Instantiating new Timer
    this.timer = new Timer();

    // regex for different types of styles
    this.sassType = /.sass|.scss/;
  }

  /**
   * Compiles the styles with the right compiler selected from the file extension
   * If no file is provided, the SASS compiler will be default
   * @param {any} file Styles entry point
   */
  compile(file) {
    if (file) {
      switch (this.formatFinder(file)) {
        case 'sass':
          this.compileSASS();
          break;
        default:
          break;
      }
    } else this.compileSASS();
  }

  /**
   * Test a file looking for the right style compiler
   * @param {String} file
   * @returns the compiler that should be be used.
   */
  formatFinder(file) {
    if (this.sassType.test(file)) return 'sass';
    return false;
  }

  /**
   * Compiler method for SASS/SCSS type of files
   */
  compileSASS() {
    const entry = path.resolve(this.app.config.styles.entry);
    const output = path.resolve(path.join(this.app.config.dist, this.app.config.styles.output));
    const sassOptions = {
      file: entry,
      includePaths: [path.dirname(entry)],
      outputStyle: this.app.config.styles.outputStyle,
      imagePath: this.app.config.styles.imagePath || path.dirname(entry),
      precision: this.app.config.styles.precision,
      errLogToConsole: this.app.config.styles.errLogToConsole,
    };
    this.timer.start();
    sassCompiler.render(sassOptions, (err, styles) => {
      if (err) {
        this.handleErrorSass(err);
        return;
      }
      if (styles.css.toString('utf8')) {
        const fixed = pleeease.process(styles.css.toString('utf8'), this.app.config.styles.pleeeaseOpt);
        fixed.then(css => {
          this.saveStyles(css, output);
        });
      }
    });
  }

  /**
   * Handler for the SASS/SCSS compiler
   * @param {string} err Error Object
   */
  handleErrorSass(err) {
    if (err.file && err.line) {
      const info = `Error in file: ${err.file} on Line: ${err.line}/${err.column}`;
      const message =
        err.message.indexOf('\n') === -1 ? err.message : err.message.substring(0, err.message.indexOf('\n'));
      log.error([info, message]);
    } else log.error(JSON.stringify(err, undefined, 2));
  }

  /**
   * Store the compiled styles
   * @param {string} styles Compiled styles raw string
   * @param {string} file Path to where the file will be stored
   */
  saveStyles(styles, file) {
    fs.ensureDirSync(path.dirname(file));
    fs.writeFile(file, styles, err => {
      if (err) log.error(err);
      else {
        this.timer.finish();
        log.success('Styles compiled', this.timer.getFormattedLapse());
        this.app.bsreload();
      }
    });
  }
}
