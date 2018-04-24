import path from 'path';
import fs from 'fs-extra';
import pug from 'pug';
import _ from 'lodash';
import Log from '../tools/logger';
import Timer from '../tools/timer';

export default class PugCompiler {
  constructor(app) {
    this.app = app;

    // Instantiating new Timer
    this.timer = new Timer();

    // Pug Options
    this.pugOptions = {
      pretty: app.config.pug.pretty,
      basedir: app.config.pug.basedir,
    };

    // regex for different types of templates
    this.pugType = /.pug|.jade/;
    this.underscores = /^_[a-zA-Z0-9]+|\\|\/_[a-zA-Z0-9]+/;
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

  compilePost(meta) {
    const templateFile = meta.template || this.app.config.posts.template;
    // const format = this.formatFinder(templateFile);
    this.timer.start();
    if (!fs.pathExistsSync(templateFile)) {
      Log.error(`The posts template ${templateFile} does not exist.`);
    } else {
      this.app.post = meta;
      const template = pug.renderFile(templateFile, _.merge(this.pugOptions, this.app));
      this.saveTemplate(template, meta.permalink);
    }
  }

  formatFinder(file) {
    if (this.pugType.test(file)) return 'pug';
    return false;
  }

  compilePug(file) {
    if (this.haveUnderscores(file)) return;
    this.timer.start();
    const template = pug.renderFile(file, _.merge(this.pugOptions, this.app));
    this.saveTemplate(template, file);
  }

  haveUnderscores(name) {
    return this.underscores.test(name);
  }

  saveTemplate(template, file) {
    const base = this.app.config.dist;
    const newFile = this.newPath(file, base);
    fs.ensureDirSync(path.dirname(newFile));
    fs.writeFile(newFile, template, err => {
      if (err) Log.error(err);
      else {
        this.timer.finish();
        Log.success(`Template ${path.basename(file)} was compiled.`, this.timer.getFormattedLapse());
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
    // return the full address of the new file.
    return path.join(dirname, filename);
  }
}
