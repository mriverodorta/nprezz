'use strict';
const moment = require('moment');
const log = require('./logger');
const chalk = require('chalk');

let begin, end = null;

module.exports = {
  begin: null,
  end: null,
  start() {
    this.begin = moment();
    return;
  },
  finish() {
    this.end = moment();
    return;
  },
  getLapse() {
    if (this.begin && this.end) {
      const lapse = this.end - this.begin;
      const duration = moment.duration(lapse);
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
  getFormattedLapse() {
    if (this.getLapse()) {
      return chalk.white.bgGreen(' ' +  addSpaces(this.getLapse()) + ' ');
    } else return false;
  }
}

function addSpaces(text) {
  let rest = 8 - text.length;
  let spaces = '';
  for(let index = 0; index < (rest-1); index++) {
    spaces += ' ';
  }
  return spaces + text + ' ';
}