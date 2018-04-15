import chokidar from 'chokidar';
import fs from 'fs-extra';
import StylesCompiler from './compilers/styles-compiler';
import TemplatesCompiler from './compilers/templates-compiler';
import Constants from './constants';
import Log from './tools/logger';
import Timer from './tools/timer';

export default class PostsCompiler {
  static watch(app) {
    const templater = new TemplatesCompiler(app);
    const styler = new StylesCompiler(app);
    const ingnores = Constants.ignoredGlobs().concat(app.config.ignoreList || []);

    this.timer = new Timer();
    const watcher = chokidar.watch('**/*', { ignored: ingnores, ignoreInitial: true });
    watcher.on('all', (event, file) => {
      if (!fs.pathExistsSync(file)) return;
      styler.compile(file);
      templater.compile(file);
    });
    watcher.on('ready', () => {
      this.timer.finish();
      Log.success('Warcher\'s ready', this.timer.getFormattedLapse());
    });
  }
}
