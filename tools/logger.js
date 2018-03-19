'use strict';
const symbols = require('log-symbols');
const chalk = require('chalk');
const path = require('path');
const moment = require('moment');

function getTime(lapse) {
  if (lapse.start && lapse.finish) {
    lapse = lapse.finish - lapse.start;
    let duration = moment.duration(lapse);
    return
  }
}
function log(msg, type, time) {
  let theTime = moment();
  if (Array.isArray(msg)) {
    msg.forEach(one => console.log(
      chalk.bgBlueBright.bold(' ' + symbols[type] + ' ')
      + (time ? time : chalk.white.bgGreen(' ' + theTime.format('HH:mm:ss') + ' '))
      + '  ' + one));
  } else {
    console.log(
      // chalk.bgBlueBright.bold(' ' + symbols[type] + ' ')
      // chalk.bgBlueBright.bold(
      ' ' + symbols[type] + ' '
      + (time ? time : chalk.white.bgGreen(' ' + theTime.format('HH:mm:ss') + ' '))
      + '  ' + msg);
  }
}
module.exports = {
  error(msg, time) { log(msg, 'error', time); },
  success(msg, time) { log(msg, 'success', time); },
  warn(msg, time) { log(msg, 'warning', time); },
  info(msg, time) { log(msg, 'info', time); },
  human(msg) {
    try {
      console.log(JSON.stringify(msg, undefined, 2));
    } catch (error) {
      console.error(msg);
    }
  }
}