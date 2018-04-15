'use strict';

var moment = require('moment');
var log = require('./logger');
var chalk = require('chalk');

var begin = void 0,
    end = null;

module.exports = {
  begin: null,
  end: null,
  start: function start() {
    this.begin = moment();
    return;
  },
  finish: function finish() {
    this.end = moment();
    return;
  },
  getLapse: function getLapse() {
    if (this.begin && this.end) {
      var lapse = this.end - this.begin;
      var duration = moment.duration(lapse);
      if (duration.minutes() > 0) {
        return duration.minutes() + 'm';
      } else if (duration.seconds() > 0) {
        return duration.seconds() + 's';
      } else {
        return duration.milliseconds() + 'ms';
      }
    } else {
      log.error('Timer is not finished yet.');
      return false;
    }
  },
  getFormattedLapse: function getFormattedLapse() {
    if (this.getLapse()) {
      return chalk.white.bgGreen(' ' + addSpaces(this.getLapse()) + ' ');
    } else return false;
  }
};

function addSpaces(text) {
  var rest = 8 - text.length;
  var spaces = '';
  for (var index = 0; index < rest - 1; index++) {
    spaces += ' ';
  }
  return spaces + text + ' ';
}