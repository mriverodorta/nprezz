'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _timer = require('./timer');

var _timer2 = _interopRequireDefault(_timer);

var _errors = require('./errors');

var _errors2 = _interopRequireDefault(_errors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ConfigLoader = function () {
  /**
   * Creates an instance of ConfigLoader.
   * @param {Object} app App Object
   */
  function ConfigLoader(app) {
    _classCallCheck(this, ConfigLoader);

    this.app = app;

    // Instantiating new Timer
    this.timer = new _timer2.default();

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
        pleeeaseOpt: {
          autoprefixer: { browsers: ['last 2 versions', '> 2%'] },
          rem: ['16px'],
          pseudoElements: true,
          mqpacker: true,
          minifier: this.defaultConfig.styles.minified || false
        }
      },
      ignoreList: [],
      posts: {
        dir: '_posts',
        template: '_single.pug',
        permalink: '/blog/%title%'
      },
      excerpt: {
        separator: '<!--more-->'
      },
      server: {
        port: 4000,
        path: '_dist',
        logLevel: 'silent',
        openBrowserOnReady: false,
        notifyOnChanges: false
      },
      pug: {
        pretty: true,
        basedir: './'
      }
    };
  }

  /**
   * Load and parses the config file into the app
   * @memberof ConfigLoader
   */


  _createClass(ConfigLoader, [{
    key: 'load',
    value: function load() {
      var configFile = this.app.cwd + '/config.json';
      if (_fsExtra2.default.pathExistsSync(configFile)) {
        this.timer.start();
        try {
          var loaded = JSON.parse(_fsExtra2.default.readFileSync(configFile).toString());
          this.app.config = _lodash2.default.merge(this.defaultConfig, loaded);
        } catch (error) {
          _errors2.default.configParsingError(error);
          if (this.app.config) {
            _errors2.default.configHasValidPrevious();
            return;
          }
          process.exit();
        }
        this.timer.finish();
        _logger2.default.success('Configuration Loaded', this.timer.getFormattedLapse());
      } else {
        _logger2.default.info('This is not a NPrezz project or there is something wrong in the config.json file.');
        process.exit();
      }
    }

    /**
     * Watch for any changes in the config file and reload
     */

  }, {
    key: 'watch',
    value: function watch() {
      var _this = this;

      _chokidar2.default.watch(this.app.cwd + '/config.json', { ignoreInitial: true }).on('all', function () {
        return _this.load();
      });
    }
  }]);

  return ConfigLoader;
}();

exports.default = ConfigLoader;