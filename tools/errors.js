'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var log = require('./logger');

var Errors = function () {
  function Errors() {
    _classCallCheck(this, Errors);
  }

  _createClass(Errors, null, [{
    key: 'missingPostId',
    value: function missingPostId(file, meta) {
      log.warn('The post ' + path.basename(file, path.extname(file)) + ' will not be processed because is lacking the Post ID (pid).\n Make sure to include it in the meta as\n {\n   "pid": 5,\n   "title": "' + meta.title + '",\n   ...\n }\n\n or on the file name as\n 5-' + path.basename(file));
    }
  }, {
    key: 'configParsingError',
    value: function configParsingError(err) {
      log.error('There was an error parsing the configuration file');
      log.error(err);
    }
  }, {
    key: 'configHasValidPrevious',
    value: function configHasValidPrevious() {
      log.info('The application will still run with the previous valid configuration.');
    }
  }]);

  return Errors;
}();

exports.default = Errors;