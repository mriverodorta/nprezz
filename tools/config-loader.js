'use strict';
const fs = require('fs-extra');
const log = require('./logger');
const chokidar = require('chokidar');
const Timer = require('./timer');
const Errors = require('./errors');
module.exports = {
  load(app) {
    const configFile = app.cwd + '/config.json';
    if (fs.pathExistsSync(configFile)) {
      Timer.start();
      try {
        app.config = JSON.parse(fs.readFileSync(configFile).toString())
      } catch (error) {
        Errors.configParsingError(error);
        if (app.config) {
          Errors.configHasValidPrevious();
          return;
        } else {
          process.exit();
        }
      }
      Timer.finish();
      log.success('Configuration Loaded', Timer.getFormattedLapse());
    } else {
      log.info('Este directorio no contiene un proyecto NPrezz o existen problemas con el archivo de configuracion.')
      process.exit();
    }
  },
  watch(app) {
    chokidar.watch(app.cwd + '/config.json', { ignoreInitial: true })
      .on('all', (e, file) => this.load(app));
  }
}