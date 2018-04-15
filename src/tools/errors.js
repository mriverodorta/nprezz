const path = require('path');
const log = require('./logger');

export default class Errors {
  static missingPostId(file, meta) {
    log.warn(`The post ${path.basename(file, path.extname(file))} will not be processed because is lacking the Post ID (pid).
 Make sure to include it in the meta as
 {
   "pid": 5,
   "title": "${meta.title}",
   ...
 }

 or on the file name as
 5-${path.basename(file)}`);
  }
  static configParsingError(err) {
    log.error('There was an error parsing the configuration file');
    log.error(err);
  }
  static configHasValidPrevious() {
    log.info('The application will still run with the previous valid configuration.');
  }
}
