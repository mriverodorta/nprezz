'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Timer = function () {
  function Timer() {
    _classCallCheck(this, Timer);

    this.begin = (0, _moment2.default)();
  }

  /**
   * Start the timer
   */


  _createClass(Timer, [{
    key: 'start',
    value: function start() {
      this.begin = (0, _moment2.default)();
    }

    /**
     * Finish the timer
     */

  }, {
    key: 'finish',
    value: function finish() {
      this.end = (0, _moment2.default)();
    }
  }, {
    key: 'getLapse',
    value: function getLapse() {
      if (this.begin && this.end) {
        var lapse = this.end - this.begin;
        var duration = _moment2.default.duration(lapse);
        if (duration.minutes() > 0) {
          return duration.minutes() + 'm';
        } else if (duration.seconds() > 0) {
          return duration.seconds() + 's';
        }
        return duration.milliseconds() + 'ms';
      }
      _logger2.default.error('Timer is not finished yet.');
      return false;
    }
  }, {
    key: 'getFormattedLapse',
    value: function getFormattedLapse() {
      if (this.getLapse()) {
        return _chalk2.default.white.bgGreen(' ' + this.addSpaces(this.getLapse()) + ' ');
      }
      return false;
    }
  }, {
    key: 'addSpaces',
    value: function addSpaces(text) {
      return text.padStart(7) + ' ';
    }
  }]);

  return Timer;
}();

exports.default = Timer;