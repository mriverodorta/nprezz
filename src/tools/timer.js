import moment from 'moment';
import chalk from 'chalk';
import Log from './logger';


export default class Timer {
  constructor() {
    this.begin = moment();
  }

  /**
   * Start the timer
   */
  start() {
    this.begin = moment();
  }

  /**
   * Finish the timer
   */
  finish() {
    this.end = moment();
  }

  getLapse() {
    if (this.begin && this.end) {
      const lapse = this.end - this.begin;
      const duration = moment.duration(lapse);
      if (duration.minutes() > 0) {
        return `${duration.minutes()}m`;
      } else if (duration.seconds() > 0) {
        return `${duration.seconds()}s`;
      }
      return `${duration.milliseconds()}ms`;
    }
    Log.error('Timer is not finished yet.');
    return false;
  }

  getFormattedLapse() {
    if (this.getLapse()) {
      return chalk.white.bgGreen(` ${this.addSpaces(this.getLapse())} `);
    }
    return false;
  }

  addSpaces(text) {
    const rest = 8 - text.length;
    return `${text.padStart(rest)} `;
  }
}
