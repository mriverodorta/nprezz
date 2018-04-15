'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.log = log;

var _logSymbols = require('log-symbols');

var _logSymbols2 = _interopRequireDefault(_logSymbols);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function log(msg, type, time) {
  var theTime = (0, _moment2.default)();
  if (Array.isArray(msg)) {
    msg.forEach(function (one) {
      return console.log(_chalk2.default.bgBlueBright.bold(' ' + _logSymbols2.default[type] + ' ') + ' ' + (time || _chalk2.default.white.bgGreen(' ' + theTime.format('HH:mm:ss') + ' ')) + ' ' + one);
    });
  } else {
    console.log(_logSymbols2.default[type] + '  ' + (time || _chalk2.default.white.bgGreen(' ' + theTime.format('HH:mm:ss') + ' ')) + '  ' + msg);
  }
}

var Logger = function () {
  function Logger() {
    _classCallCheck(this, Logger);
  }

  _createClass(Logger, null, [{
    key: 'error',
    value: function error(msg, time) {
      log(msg, 'error', time);
    }
  }, {
    key: 'success',
    value: function success(msg, time) {
      log(msg, 'success', time);
    }
  }, {
    key: 'warn',
    value: function warn(msg, time) {
      log(msg, 'warning', time);
    }
  }, {
    key: 'info',
    value: function info(msg, time) {
      log(msg, 'info', time);
    }
  }, {
    key: 'human',
    value: function human(msg) {
      try {
        console.log(JSON.stringify(msg, undefined, 2));
      } catch (error) {
        console.error(msg);
      }
    }
  }]);

  return Logger;
}();

exports.default = Logger;