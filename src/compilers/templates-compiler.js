import path from 'path';
import fs from 'fs-extra';
import pug from 'pug';
import _ from 'lodash';
import log from '../tools/logger';
import Timer from '../tools/timer';


export default class PugCompiler {
  constructor(app) {
    this.app = app;

    // regex for different types of templates
    this.pugType = /.pug|.jade/;
    this.underscores = /\\_[a-zA-Z0-9]/;
  }

  compile(file) {
    if (file) {
      switch (this.formatFinder(file)) {
        case 'pug':
          this.compilePug(file);
          break;
        default:
          break;
      }
    } else this.compilePug(file);
  }

  formatFinder(file) {
    if (this.pugType.test(file)) return 'pug';
    return false;
  }

  compilePug(file) {
    const pugOptions = {
      pretty: this.app.config.pug.pretty || true,
      basedir: this.app.config.pug.basedir || './',
    };
    if (this.haveUnderscores(file)) return;
    Timer.start();
    const template = pug.renderFile(file, _.merge(pugOptions, this.app));
    this.saveTemplate(template, file, this.app);
  }

  haveUnderscores(name) {
    return this.underscores.test(name);
  }

  saveTemplate(template, file) {
    const base = (this.app.config.dist || '_dist');
    const newFile = this.newPath(file, base);
    fs.ensureDirSync(path.dirname(newFile));
    fs.writeFile(newFile, template, (err) => {
      if (err) log.error(err);
      else {
        Timer.finish();
        log.success(`Template ${path.basename(file)} was compiled.`, Timer.getFormattedLapse());
        this.app.bsreload();
      }
    });
  }

  /**
   * @param  {} file
   * @param  {} base
   */
  newPath(file, base) {
    // Get the file name and switch the extension to html
    const filename = `${path.basename(file, path.extname(file))}.html`;
    // Get the file new directory
    const dirname = path.join(base, path.dirname(file));
    // return the full addres of the new file.
    return path.join(dirname, filename);
  }
}
