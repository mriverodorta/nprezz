import fs from 'fs-extra';
import chokidar from 'chokidar';
import log from './logger';
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
        this.app.config = JSON.parse(fs.readFileSync(configFile).toString());
      } catch (error) {
        Errors.configParsingError(error);
        if (this.app.config) {
          Errors.configHasValidPrevious();
          return;
        }
        process.exit();
      }
      this.timer.finish();
      log.success('Configuration Loaded', this.timer.getFormattedLapse());
    } else {
      log.info('Este directorio no contiene un proyecto NPrezz o existen problemas con el archivo de configuracion.');
      process.exit();
    }
  }

  /**
   * Watch for any changes in the config file and reload
   */
  watch() {
    chokidar.watch(`${this.app.cwd}/config.json`, { ignoreInitial: true })
      .on('all', () => this.load());
  }
}
