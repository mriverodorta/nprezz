import symbols from 'log-symbols';
import chalk from 'chalk';
import moment from 'moment';

export function logmsg(msg, type, time) {
  const theTime = moment();
  if (Array.isArray(msg)) {
    msg.forEach(one =>
      console.log(
        `${chalk.bgBlueBright.bold(` ${symbols[type]} `)} ${time ||
          chalk.white.bgGreen(` ${theTime.format('HH:mm:ss')} `)} ${one}`
      )
    );
  } else {
    console.log(`${symbols[type]}  ${time || chalk.white.bgGreen(` ${theTime.format('HH:mm:ss')} `)}  ${msg}`);
  }
}

export default class Logger {
  static error(msg, time) {
    logmsg(msg, 'error', time);
  }
  static success(msg, time) {
    logmsg(msg, 'success', time);
  }
  static warn(msg, time) {
    logmsg(msg, 'warning', time);
  }
  static info(msg, time) {
    logmsg(msg, 'info', time);
  }
  static human(msg) {
    try {
      console.log(JSON.stringify(msg, undefined, 2));
    } catch (error) {
      console.error(msg);
    }
  }
}
