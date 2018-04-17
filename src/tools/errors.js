const path = require('path');
const Log = require('./logger');

export default class Errors {
  static missingPostId(file, meta) {
    Log.warn(`The post ${path.basename(file, path.extname(file))} will not be processed because is lacking the Post ID (pid).
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
    Log.error('There was an error parsing the configuration file');
    Log.error(err);
  }
  static configHasValidPrevious() {
    Log.info('The application will still run with the previous valid configuration.');
  }

  static noMinimumFrontmatter(file) {
    Log.error(`Is required a minimum of "title" and "date" as frontmatter in ${file}`);
  }

  static invalidDate(date, file) {
    Log.error(`The date (${date}) provided in ${file} is not valid`);
  }
}
