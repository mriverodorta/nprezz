import chokidar from 'chokidar';
import StylesCompiler from './compilers/styles-compiler';
import TemplatesCompiler from './compilers/templates-compiler';
import Constants from './constants';
import log from './tools/logger';
import Timer from './tools/timer';

export default class PostsCompiler {
  static watch(app) {
    const templater = new TemplatesCompiler(app);
    const styler = new StylesCompiler(app);
    const ingnores = Constants.ignoredGlobs().concat(app.config.ignoreList || []);

    Timer.start();
    const watcher = chokidar.watch('**/*', { ignored: ingnores, ignoreInitial: true });
    watcher.on('all', (event, file) => {
      styler.compile(file);
      templater.compile(file);
    });
    watcher.on('ready', () => {
      Timer.finish();
      log.success('Warcher\'s ready', Timer.getFormattedLapse());
    });
  }
}
