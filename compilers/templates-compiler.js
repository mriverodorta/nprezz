'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _pug = require('pug');

var _pug2 = _interopRequireDefault(_pug);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _logger = require('../tools/logger');

var _logger2 = _interopRequireDefault(_logger);

var _timer = require('../tools/timer');

var _timer2 = _interopRequireDefault(_timer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PugCompiler = function () {
  function PugCompiler(app) {
    _classCallCheck(this, PugCompiler);

    this.app = app;

    // regex for different types of templates
    this.pugType = /.pug|.jade/;
    this.underscores = /\\_[a-zA-Z0-9]/;
  }

  _createClass(PugCompiler, [{
    key: 'compile',
    value: function compile(file) {
      if (file) {
        switch (this.formatFinder(file)) {
          case 'pug':
            this.compilePug(file);
            break;
          default:
            break;
        }
      } else this.compilePug(file);
    }
  }, {
    key: 'formatFinder',
    value: function formatFinder(file) {
      if (this.pugType.test(file)) return 'pug';
      return false;
    }
  }, {
    key: 'compilePug',
    value: function compilePug(file) {
      var pugOptions = {
        pretty: this.app.config.pug.pretty || true,
        basedir: this.app.config.pug.basedir || './'
      };
      if (this.haveUnderscores(file)) return;
      _timer2.default.start();
      var template = _pug2.default.renderFile(file, _lodash2.default.merge(pugOptions, this.app));
      this.saveTemplate(template, file, this.app);
    }
  }, {
    key: 'haveUnderscores',
    value: function haveUnderscores(name) {
      return this.underscores.test(name);
    }
  }, {
    key: 'saveTemplate',
    value: function saveTemplate(template, file) {
      var _this = this;

      var base = this.app.config.dist || '_dist';
      var newFile = this.newPath(file, base);
      _fsExtra2.default.ensureDirSync(_path2.default.dirname(newFile));
      _fsExtra2.default.writeFile(newFile, template, function (err) {
        if (err) _logger2.default.error(err);else {
          _timer2.default.finish();
          _logger2.default.success('Template ' + _path2.default.basename(file) + ' was compiled.', _timer2.default.getFormattedLapse());
          _this.app.bsreload();
        }
      });
    }

    /**
     * @param  {} file
     * @param  {} base
     */

  }, {
    key: 'newPath',
    value: function newPath(file, base) {
      // Get the file name and switch the extension to html
      var filename = _path2.default.basename(file, _path2.default.extname(file)) + '.html';
      // Get the file new directory
      var dirname = _path2.default.join(base, _path2.default.dirname(file));
      // return the full addres of the new file.
      return _path2.default.join(dirname, filename);
    }
  }]);

  return PugCompiler;
}();

exports.default = PugCompiler;