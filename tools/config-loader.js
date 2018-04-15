'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

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
          this.app.config = JSON.parse(_fsExtra2.default.readFileSync(configFile).toString());
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
        _logger2.default.info('Este directorio no contiene un proyecto NPrezz o existen problemas con el archivo de configuracion.');
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