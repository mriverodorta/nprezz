'use strict';
const path = require('path');
const chokidar = require('chokidar');
const stylesCompiler = require('./compilers/styles-compiler');
const templatesCompiler = require('./compilers/pug-compiler');
const constants = require('./constants');
const log = require('./tools/logger');
const Timer = require('./tools/timer');

module.exports = app => {
  const src = path.join(app.cwd, 'src/');
  const ingnores = constants.ignoredGlobs.concat(app.config.ignoreList || []);
  Timer.start();
  let watcher = chokidar.watch('**/*', { ignored: ingnores, ignoreInitial: true });
  watcher.on('all', (event, file) => {
    stylesCompiler.compile(app, file);
    templatesCompiler.compile(app, file);

  });
  watcher.on('ready', () => {
    Timer.finish();
    log.success('Warcher\'s ready', Timer.getFormattedLapse());
  })
};