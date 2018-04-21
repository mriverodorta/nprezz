import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs-extra';
import slug from 'slug';
import _ from 'lodash';
import matter from 'gray-matter';
import marked from 'marked';
import moment from 'moment';
import Constants from '../constants';
import Log from '../tools/logger';
import Errors from '../tools/errors';
import TemplatesCompiler from './templates-compiler';

export default class PostsCompiler {
  /**
   * Creates an instance of PostsCompiler.
   * @param {App} app App Object
   */
  constructor(app) {
    this.app = app;
    this.ingnores = _.concat(Constants.ignoredGlobs(), app.config.ignoreList || []);

    this.templateCompiler = new TemplatesCompiler(app);
    this.matterOptions = {
      excerpt: true,
      excerpt_separator: this.app.config.excerpt ? this.app.config.excerpt.separator || '<!--more-->' : '<!--more-->',
    };
  }

  watch() {
    const watcher = chokidar.watch(
      [`${this.app.config.posts.dir || '_posts'}/**/*.md`, `${this.app.config.posts.dir || '_posts'}/**/*.markdown`],
      { ignored: this.ingnores }
    );

    watcher.on('all', (e, file) => {
      this.loadPost(file);
    });

    watcher.on('ready', () => {});
  }

  loadPost(file) {
    try {
      // Check if the file exist
      if (!fs.pathExistsSync(file)) return;

      // Read the post file
      const raw = matter.read(file, this.matterOptions);
      // Build meta from frontmatter
      const meta = raw.data;
      // Setting the content
      meta.content = raw.content;

      // Setting the excerpt
      if (meta.excerpt) {
        try {
          meta.excerpt = marked(meta.excerpt);
        } catch (e) {
          /* nothing to do */
        }
      } else if (raw.excerpt) {
        try {
          meta.excerpt = marked(raw.excerpt);
        } catch (e) {
          meta.excerpt = raw.excerpt;
        }
      }

      // Check if there is a minimum of frontmatter (title & date)
      if (!meta.title || !meta.date) {
        Errors.noMinimumFrontmatter(file);
        return;
      }

      // Get the Post id if it is not on the meta and is in the filename
      if (!meta.id && this.getId(file)) {
        meta.id = this.getId(file);
      }

      // Post without id will not be processed
      if (!meta.id) {
        Errors.missingPostId(file, meta);
        return;
      }

      // Set the author
      if (!meta.author && this.app.config.author) {
        meta.author = this.app.config.author;
      } else {
        meta.author = {};
        meta.author.name = 'No Author';
      }

      // set the date as a MomentJS instance
      try {
        meta.date = moment(meta.date);
      } catch (error) {
        Errors.invalidDate(meta.date, file);
        return;
      }

      // Extract Tags
      if (meta.tags) {
        meta.tags.forEach(tag => {
          this.app.tags[slug(tag.toLowerCase())] = tag;
        });
      }

      // Extract Categories
      if (typeof meta.categories === 'string') {
        this.app.categories[slug(meta.categories.toLowerCase())] = meta.categories;
      } else if (Array.isArray(meta.categories)) {
        meta.categories.forEach(cat => {
          this.app.categories[slug(cat.toLowerCase())] = cat;
        });
      }

      // Setting the post content
      meta.content = marked(meta.content);

      // Setting the post Slug
      meta.slug = slug(meta.title.toLowerCase());

      // Build permalink
      meta.permalink = this.buildPermalink(meta);

      const cached = _.findIndex(this.app.posts, { pid: meta.id });
      if (cached > 0) _.pullAt(this.app.posts, cached);
      this.app.posts.push(meta);

      // Compile the post
      this.templateCompiler.compilePost(meta);

      // log.success(`Post ${meta.title} was reloaded.`);
    } catch (error) {
      Log.error(error);
      // log.error('Error loading metadata as JSON in');
      Log.error(file);
    }
  }

  getTags(meta) {
    if (meta.tags) {
      this.app.tags.concat(meta.tags);
    }
  }

  getId(file) {
    const filename = path.basename(file).split('-');
    const pid = Number.parseInt(filename[0], 10);
    if (Number.isInteger(pid)) return pid;
    return false;
  }

  buildPermalink(meta) {
    let permalink = meta.permalink || this.app.config.permalink || '/post/%slug%';
    const tags = {
      year: new RegExp('%year%', 'g'),
      month: new RegExp('%month%', 'g'),
      day: new RegExp('%day%', 'g'),
      hour: new RegExp('%hour%', 'g'),
      minute: new RegExp('%minute%', 'g'),
      second: new RegExp('%second%', 'g'),
      id: new RegExp('%id%', 'g'),
      slug: new RegExp('%slug%', 'g'),
      category: new RegExp('%category%', 'g'),
      author: new RegExp('%author%', 'g'),
    };
    const tagsValues = {
      year: meta.date.format('YYYY'),
      month: meta.date.format('MM'),
      day: meta.date.format('DD'),
      hour: meta.date.format('HH'),
      minute: meta.date.format('mm'),
      second: meta.date.format('ss'),
      id: meta.id,
      slug: meta.slug,
      category: slug(typeof meta.categories === 'string' ? meta.categories : meta.categories[0]),
      author: slug(meta.author.name),
    };

    _.forEach(tags, (regex, key) => {
      permalink = permalink.replace(regex, tagsValues[key]);
    });
    if (permalink.charAt(permalink.length - 1) === '/') {
      permalink += 'index.html';
    } else {
      permalink += '.html';
    }
    return permalink;
  }
}
