import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs-extra';
import slug from 'slug';
import _ from 'lodash';
import Constants from '../constants';
import log from '../tools/logger';
import Errors from '../tools/errors';

export default class PostsCompiler {
  /**
   * Creates an instance of PostsCompiler.
   * @param {App} app App Object
   */
  constructor(app) {
    this.app = app;
    this.ingnores = _.concat(Constants.ignoredGlobs(), (app.config.ignoreList || []));
  }

  watch() {
    const watcher = chokidar.watch([
      `${(this.app.config.postDir || '_posts')}/**/*.md`,
      `${(this.app.config.postDir || '_posts')}/**/*.markdown`,
    ], { ignored: this.ingnores });

    watcher.on('all', (e, file) => {
      this.loadPost(file);
    });

    watcher.on('ready', () => { });
  }

  loadPost(file) {
    try {
      if (!fs.pathExistsSync(file)) return;
      const raw = fs.readFileSync(file, 'utf8');
      const split = raw.split('}---');
      const meta = JSON.parse(`${split[0]}}`);

      // Get the Post Id if is not on the meta and is on the filename
      if (!meta.pid && this.getPid(file)) {
        meta.pid = this.getPid(file);
      }

      // Post widout id will not be proccesed
      if (!meta.pid) {
        Errors.missingPostId(file, meta);
        return;
      }

      // Extract Tags
      if (meta.tags) {
        meta.tags.forEach((tag) => {
          this.app.tags[slug(tag.toLowerCase())] = tag;
        });
      }

      // Extract Categories
      if (typeof meta.categories === 'string') {
        this.app.categories[slug(meta.categories.toLowerCase())] = meta.categories;
      } else if (Array.isArray(meta.categories)) {
        meta.categories.forEach((cat) => {
          this.app.categories[slug(cat.toLowerCase())] = cat;
        });
      }
      meta.content = split[1];
      meta.slug = slug(meta.title.toLowerCase());
      const cached = _.findIndex(this.app.posts, { pid: meta.pid });
      if (cached > 0) _.pullAt(this.app.posts, cached);
      this.app.posts.push(meta);
      // log.success(`Post ${meta.title} was reloaded.`);
    } catch (error) {
      log.error(error);
      // log.error('Error loading metadata as JSON in');
      log.error(file);
    }
  }

  getTags(meta) {
    if (meta.tags) {
      this.app.tags.concat(meta.tags);
    }
  }

  getPid(file) {
    const filename = path.basename(file).split('-');
    const pid = Number.parseInt(filename[0], 10);
    if (Number.isInteger(pid)) return pid;
    return false;
  }
}
