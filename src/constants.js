export default class Constants {
  static ignoredGlobs() {
    return [
      'node_modules',
      'bower_component',
      '.git',
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'yarn-error.log',
    ];
  }
}
