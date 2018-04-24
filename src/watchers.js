import chokidar from 'chokidar';
import fs from 'fs-extra';
import path from 'path';
import StylesCompiler from './compilers/styles-compiler';
import TemplatesCompiler from './compilers/templates-compiler';
import Constants from './constants';
import Log from './tools/logger';
import Timer from './tools/timer';

export default class PostsCompiler {
  static watch(app) {
    // Underscore regex
    this.underscores = /^_[a-zA-Z0-9]+|\\|\/_[a-zA-Z0-9]+/;

    // First Run files
    this.firstTimeFiles = [];

    // Is the watcher ready
    this.isWatcherReady = false;

    // Instantiating the compilers
    const templates = new TemplatesCompiler(app);
    const styler = new StylesCompiler(app);

    // Prepare files to ignore
    const ingnores = Constants.ignoredGlobs().concat(app.config.ignoreList);

    // Start the timer
    this.timer = new Timer();

    // Define the watcher
    const watcher = chokidar.watch('**/*', { ignored: ingnores });

    // Action on every watched file event
    watcher.on('all', (event, file) => {
      if (!fs.pathExistsSync(file)) return;

      // Prepare list of files for firs time build
      if (!this.isWatcherReady && path.extname(file) !== '' && !this.underscores.test(file)) {
        this.firstTimeFiles.push(file);
      } else {
        styler.compile(file);
        templates.compile(file);
      }
    });
    watcher.on('ready', () => {
      this.isWatcherReady = true;

      this.timer.finish();
      Log.success(`Watcher's ready`, this.timer.getFormattedLapse());
      this.firstTimeFiles.forEach(file => {
        styler.compile(file);
        templates.compile(file);
      });
    });
  }
}
