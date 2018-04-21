'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Errors = function () {
  function Errors() {
    _classCallCheck(this, Errors);
  }

  _createClass(Errors, null, [{
    key: 'missingPostId',
    value: function missingPostId(file, meta) {
      _logger2.default.warn('The post ' + _path2.default.basename(file, _path2.default.extname(file)) + ' will not be processed because is lacking the Post ID (id).\n Make sure to include it in the meta as\n {\n   "id": 5,\n   "title": "' + meta.title + '",\n   ...\n }\n\n or on the file name as\n 5-' + _path2.default.basename(file));
    }
  }, {
    key: 'configParsingError',
    value: function configParsingError(err) {
      _logger2.default.error('There was an error parsing the configuration file');
      _logger2.default.error(err);
    }
  }, {
    key: 'configHasValidPrevious',
    value: function configHasValidPrevious() {
      _logger2.default.info('The application will still run with the previous valid configuration.');
    }
  }, {
    key: 'noMinimumFrontmatter',
    value: function noMinimumFrontmatter(file) {
      _logger2.default.error('Is required a minimum of "title" and "date" as frontmatter in ' + file);
    }
  }, {
    key: 'invalidDate',
    value: function invalidDate(date, file) {
      _logger2.default.error('The date (' + date + ') provided in ' + file + ' is not valid');
    }
  }]);

  return Errors;
}();

exports.default = Errors;