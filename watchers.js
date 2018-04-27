'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _stylesCompiler = require('./compilers/styles-compiler');

var _stylesCompiler2 = _interopRequireDefault(_stylesCompiler);

var _templatesCompiler = require('./compilers/templates-compiler');

var _templatesCompiler2 = _interopRequireDefault(_templatesCompiler);

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

var _logger = require('./tools/logger');

var _logger2 = _interopRequireDefault(_logger);

var _timer = require('./tools/timer');

var _timer2 = _interopRequireDefault(_timer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PostsCompiler = function () {
  function PostsCompiler() {
    _classCallCheck(this, PostsCompiler);
  }

  _createClass(PostsCompiler, null, [{
    key: 'watch',
    value: function watch(app) {
      var _this = this;

      // Underscore regex
      this.underscores = /^_[a-zA-Z0-9]+|\\|\/_[a-zA-Z0-9]+/;

      // First Run files
      this.firstTimeFiles = [];

      // Is the watcher ready
      this.isWatcherReady = false;

      // Instantiating the compilers
      var templates = new _templatesCompiler2.default(app);
      var styler = new _stylesCompiler2.default(app);

      // Prepare files to ignore
      var ingnores = _constants2.default.ignoredGlobs().concat(app.config.ignoreList);

      // Start the timer
      this.timer = new _timer2.default();

      // Define the watcher
      var watcher = _chokidar2.default.watch('**/*', { ignored: ingnores });

      // Action on every watched file event
      watcher.on('all', function (event, file) {
        if (!_fsExtra2.default.pathExistsSync(file)) return;

        // Prepare list of files for firs time build
        if (!_this.isWatcherReady && _path2.default.extname(file) !== '' && !_this.underscores.test(file)) {
          _this.firstTimeFiles.push(file);
        }
        if (_this.isWatcherReady) {
          styler.compile(file);
          templates.compile(file);
        }
      });
      watcher.on('ready', function () {
        _this.isWatcherReady = true;

        _this.timer.finish();
        _logger2.default.success('Watcher\'s ready', _this.timer.getFormattedLapse());
        _this.firstTimeFiles.forEach(function (file) {
          templates.compile(file);
        });
        styler.compile();
      });
    }
  }]);

  return PostsCompiler;
}();

exports.default = PostsCompiler;