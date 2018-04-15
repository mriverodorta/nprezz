#!/usr/bin/env node
import browserSync from 'browser-sync';
import path from 'path';
import Log from './tools/logger';
import Watchers from './watchers';
import ConfigLoader from './tools/config-loader';
import PostsCompiler from './compilers/posts-compiler';

const bs = browserSync.create('srv');

// App Object
const app = {
  cwd: process.cwd(),
  bsready: false,
  posts: [],
  tags: [],
  categories: [],
  bsreload() {
    if (this.bsready) app.bs.reload();
    else Log.error('BrowserSync instance not ready to reload');
  },
};

// Load project configuration file and watch it for changes
const config = new ConfigLoader(app);
config.load();
if (!app.config) process.exit();
config.watch(app);
Log.info('Starting...');

// Posts watcher
const Posts = new PostsCompiler(app);
Posts.watch();

const syncOpt = {
  server: {
    baseDir: path.normalize(`${app.cwd}/${(app.config.server.path || app.config.dist || '_dist')}`),
    index: 'index.html',
  },
  port: app.config.server.port || 3000,
  logLevel: app.config.server.logLevel || 'silent',
  open: app.config.server.openBrowserOnReady || false,
  notify: app.config.server.notifyOnChanges || true,
};

// bs.watch('dist/**/*').on("all", browserSync.reload);

bs.init(syncOpt, () => {
  app.bsready = true;
  Log.success(`Server Ready on port: ${syncOpt.port}`);
});
app.bs = bs;

// Start SRC Watchers
Watchers.watch(app);

// Export the App object so any file can access it's properties.
export default app;
