'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nodeSass = require('node-sass');

var _nodeSass2 = _interopRequireDefault(_nodeSass);

var _pleeease = require('pleeease');

var _pleeease2 = _interopRequireDefault(_pleeease);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _logger = require('../tools/logger');

var _logger2 = _interopRequireDefault(_logger);

var _timer = require('../tools/timer');

var _timer2 = _interopRequireDefault(_timer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StylesCompiler = function () {
  /**
   * Creates an instance of StylesCompiler.
   * @param {App} app App Object
   */
  function StylesCompiler(app) {
    _classCallCheck(this, StylesCompiler);

    this.app = app;

    // Instantiatin new Timer
    this.timer = new _timer2.default();

    // regex for different types of styles
    this.sassType = /.sass|.scss/;
  }

  /**
   * Compiles the styles with the right compiler selected from the file extension
   * If no file is provided, the SASS compiler will be default
   * @param {any} file Styles entry point
   */


  _createClass(StylesCompiler, [{
    key: 'compile',
    value: function compile(file) {
      if (file) {
        switch (this.formatFinder(file)) {
          case 'sass':
            this.compileSASS();
            break;
          default:
            break;
        }
      } else this.compileSASS();
    }

    /**
     * Thest a file looking for the right style compiler
     * @param {String} file
     * @returns the compiler that should be be used.
     */

  }, {
    key: 'formatFinder',
    value: function formatFinder(file) {
      if (this.sassType.test(file)) return 'sass';
      return false;
    }

    /**
     * Compiler method for SASS/SCSS type of files
     */

  }, {
    key: 'compileSASS',
    value: function compileSASS() {
      var _this = this;

      var entry = _path2.default.resolve(this.app.config.styles.entry);
      var output = _path2.default.resolve(_path2.default.join(this.app.config.dist || '_dist', this.app.config.styles.output));
      var sassOptions = {
        file: entry,
        includePaths: [_path2.default.dirname(entry)],
        outputStyle: this.app.config.styles.outputStyle || 'expanded',
        imagePath: this.app.config.styles.imagePath || _path2.default.dirname(entry),
        precision: this.app.config.styles.precision || 3,
        errLogToConsole: this.app.config.styles.errLogToConsole || false
      };
      var pleeeaseOpt = {
        autoprefixer: { browsers: ['last 2 versions', '> 2%'] },
        rem: [this.app.config.styles.rem || '16px'],
        pseudoElements: true,
        mqpacker: true,
        minifier: this.app.config.styles.minified || false
      };
      this.timer.start();
      _nodeSass2.default.render(sassOptions, function (err, styles) {
        if (err) {
          _this.handleErrorSass(err);return;
        }
        if (styles.css.toString('utf8')) {
          var fixed = _pleeease2.default.process(styles.css.toString('utf8'), pleeeaseOpt);
          fixed.then(function (css) {
            _this.saveStyles(css, output);
          });
        }
      });
    }

    /**
     * Handler for the SASS/SCSS compiler
     * @param {string} err Error Object
     */

  }, {
    key: 'handleErrorSass',
    value: function handleErrorSass(err) {
      if (err.file && err.line) {
        var info = 'Error in file: ' + err.file + ' on Line: ' + err.line + '/' + err.column;
        var message = err.message.indexOf('\n') === -1 ? err.message : err.message.substring(0, err.message.indexOf('\n'));
        _logger2.default.error([info, message]);
      } else _logger2.default.error(JSON.stringify(err, undefined, 2));
    }

    /**
     * Store the compiled styles
     * @param {string} styles Compiled styles raw string
     * @param {string} file Path to where the file will be stored
     */

  }, {
    key: 'saveStyles',
    value: function saveStyles(styles, file) {
      var _this2 = this;

      _fsExtra2.default.ensureDirSync(_path2.default.dirname(file));
      _fsExtra2.default.writeFile(file, styles, function (err) {
        if (err) _logger2.default.error(err);else {
          _this2.timer.finish();
          _logger2.default.success('Styles compiled', _this2.timer.getFormattedLapse());
          _this2.app.bsreload();
        }
      });
    }
  }]);

  return StylesCompiler;
}();

exports.default = StylesCompiler;