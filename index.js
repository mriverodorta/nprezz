#!/usr/bin/env node
'use strict';
const Timer = require('./tools/timer');
const log = require('./tools/logger');
const watch = require('./watchers');
const configLoader = require('./tools/config-loader');
let browserSync = require('browser-sync').create('srv');
const path = require('path');

// App Object
let app = {
  cwd: process.cwd(),
  bsready: false,
  posts: [],
  tags: [],
  categories: [],
  bsreload(){
    if (this.bsready) app.bs.reload();
    else log.error('BrowserSync instance not ready to reload');
  }
}


// Load project configuration file and watch it for changes
configLoader.load(app);
if (!app.config) process.exit();
configLoader.watch(app);
log.info('Starting...')

const posts = require('./posts/posts')(app);
posts.watch();

const syncOpt = {
  server: {
    baseDir: path.normalize(app.cwd + '/' +(app.config.server.path || app.config.dist || '_dist')),
    index: 'index.html'
  },
  port: app.config.server.port || 3000,
  logLevel: app.config.server.logLevel || 'silent',
  open: app.config.server.openBrowserOnReady || false,
  notify: app.config.server.notifyOnChanges || true
};

// browserSync.watch('dist/**/*').on("all", browserSync.reload);

browserSync.init(syncOpt, ()=> {
  app.bsready = true;
  log.success(`Server Ready on port: ${syncOpt.port}`);
});
app.bs = browserSync;

// Start SRC Watchers
watch(app);


// Export the App object so any file can access it's properties.
module.exports = app;

