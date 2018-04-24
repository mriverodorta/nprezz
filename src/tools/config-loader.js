import fs from 'fs-extra';
import chokidar from 'chokidar';
import _ from 'lodash';
import Log from './logger';
import Timer from './timer';
import Errors from './errors';

export default class ConfigLoader {
  /**
   * Creates an instance of ConfigLoader.
   * @param {Object} app App Object
   */
  constructor(app) {
    this.app = app;

    // Instantiating new Timer
    this.timer = new Timer();

    // Default configurations
    this.defaultConfig = {
      user: 'NPrezz',
      dist: '_dist',
      styles: {
        entry: './_styles/main.sass',
        output: 'assets/styles.css',
        imagePath: './img',
        rem: '16px',
        precision: 4,
        outputStyle: 'expanded',
        minified: false,
        errLogToConsole: false,
      },
      ignoreList: ['_dist'],
      posts: {
        dir: '_posts',
        template: '_single.pug',
        permalink: '/blog/%year%/%month%/%day%/%slug%',
      },
      server: {
        port: 4000,
        path: '_dist',
        logLevel: 'silent',
        openBrowserOnReady: false,
        notifyOnChanges: false,
      },
      pug: {
        pretty: true,
        basedir: './',
      },
    };
  }

  /**
   * Load and parses the config file into the app
   * @memberof ConfigLoader
   */
  load() {
    const configFile = `${this.app.cwd}/config.json`;
    if (fs.pathExistsSync(configFile)) {
      this.timer.start();
      try {
        const loaded = JSON.parse(fs.readFileSync(configFile).toString());
        this.app.config = _.merge(this.defaultConfig, loaded);
      } catch (error) {
        Errors.configParsingError(error);
        if (this.app.config) {
          Errors.configHasValidPrevious();
          return;
        }
        process.exit();
      }
      this.timer.finish();
      Log.success('Configuration Loaded', this.timer.getFormattedLapse());
    } else {
      Log.info('This is not a NPrezz project or there is something wrong in the config.json file.');
      process.exit();
    }
  }

  /**
   * Watch for any changes in the config file and reload
   */
  watch() {
    chokidar.watch(`${this.app.cwd}/config.json`, { ignoreInitial: true }).on('all', () => this.load());
  }
}
