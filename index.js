#!/usr/bin/env node
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _browserSync = require('browser-sync');

var _browserSync2 = _interopRequireDefault(_browserSync);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _logger = require('./tools/logger');

var _logger2 = _interopRequireDefault(_logger);

var _watchers = require('./watchers');

var _watchers2 = _interopRequireDefault(_watchers);

var _configLoader = require('./tools/config-loader');

var _configLoader2 = _interopRequireDefault(_configLoader);

var _postsCompiler = require('./compilers/posts-compiler');

var _postsCompiler2 = _interopRequireDefault(_postsCompiler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bs = _browserSync2.default.create('srv');

// App Object
var app = {
  cwd: process.cwd(),
  bsready: false,
  posts: [],
  tags: [],
  categories: [],
  bsreload: function bsreload() {
    if (this.bsready) app.bs.reload();
    // else Log.error('BrowserSync instance not ready to reload');
  }
};

// Load project configuration file and watch it for changes
var config = new _configLoader2.default(app);
config.load();
if (!app.config) process.exit();
config.watch(app);
// Log.info('Starting...');

// Posts watcher
var Posts = new _postsCompiler2.default(app);
Posts.watch();

var syncOpt = {
  server: {
    baseDir: _path2.default.normalize(app.cwd + '/' + (app.config.server.path || app.config.dist)),
    index: 'index.html'
  },
  port: app.config.server.port || 3000,
  logLevel: app.config.server.logLevel || 'silent',
  open: app.config.server.openBrowserOnReady || false,
  notify: app.config.server.notifyOnChanges || true
};

// bs.watch('dist/**/*').on("all", browserSync.reload);

bs.init(syncOpt, function () {
  app.bsready = true;
  _logger2.default.success('Server Ready on port: ' + syncOpt.port);
});
app.bs = bs;

// Start SRC Watchers
_watchers2.default.watch(app);

// Export the App object so any file can access it's properties.
exports.default = app;