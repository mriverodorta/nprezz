import chokidar from 'chokidar';
import fs from 'fs-extra';
import StylesCompiler from './compilers/styles-compiler';
import TemplatesCompiler from './compilers/templates-compiler';
import Constants from './constants';
import Log from './tools/logger';
import Timer from './tools/timer';

export default class PostsCompiler {
  static watch(app) {
    const templates = new TemplatesCompiler(app);
    const styler = new StylesCompiler(app);
    const ingnores = Constants.ignoredGlobs().concat(app.config.ignoreList || []);

    this.timer = new Timer();
    const watcher = chokidar.watch('**/*', { ignored: ingnores, ignoreInitial: true });
    watcher.on('all', (event, file) => {
      if (!fs.pathExistsSync(file)) return;
      styler.compile(file);
      templates.compile(file);
    });
    watcher.on('ready', () => {
      this.timer.finish();
      console.log(JSON.stringify(watcher.getWatched()));
      Log.success(`Watcher's ready`, this.timer.getFormattedLapse());
    });
  }
}
