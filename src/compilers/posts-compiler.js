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
    this.ingnores = _.concat(Constants.ignoredGlobs(), app.config.ignoreList);

    // Is the watcher ready
    this.isWatcherReady = false;

    // Current post
    this.thePost = {};

    this.templateCompiler = new TemplatesCompiler(app);
    this.matterOptions = {
      excerpt: true,
      excerpt_separator: this.app.config.excerpt.separator,
    };
  }

  watch() {
    const watcher = chokidar.watch(
      [`${this.app.config.posts.dir}/**/*.md`, `${this.app.config.posts.dir}/**/*.markdown`],
      { ignored: this.ingnores }
    );

    watcher.on('all', (e, file) => {
      // if (!this.isWatcherReady) {
      this.loadPost(file);
      // } else if (path.extname(file) !== '') {
      //   this.firstTimePosts.push(file);
      // }
    });

    watcher.on('ready', () => {
      // Set the watcher as ready
      this.isWatcherReady = true;

      // compile all the loaded post
      this.compilePostCache();
    });
  }

  loadPost(file) {
    this.thePost = {};
    try {
      // Check if the file exist
      if (!fs.pathExistsSync(file)) return;

      // Read the post file
      const raw = matter.read(file, this.matterOptions);
      // Build meta from frontmatter
      this.thePost = raw.data;
      // Setting the content
      this.thePost.content = raw.content;

      // Setting the excerpt
      if (this.thePost.excerpt) {
        try {
          this.thePost.excerpt = marked(this.thePost.excerpt);
        } catch (e) {
          /* nothing to do */
        }
      } else if (raw.excerpt) {
        try {
          this.thePost.excerpt = marked(raw.excerpt);
        } catch (e) {
          this.thePost.excerpt = raw.excerpt;
        }
      }

      // Check if there is a minimum of frontmatter (title & date)
      if (!this.thePost.title || !this.thePost.date) {
        Errors.noMinimumFrontmatter(file);
        return;
      }

      // Get the Post id if it is not on the this.thePost and is in the filename
      if (!this.thePost.id && this.getId(file)) {
        this.thePost.id = this.getId(file);
      }

      // Post without id will not be processed
      if (!this.thePost.id) {
        Errors.missingPostId(file, this.thePost);
        return;
      }

      // Set the author
      if (!this.thePost.author && this.app.config.author) {
        this.thePost.author = this.app.config.author;
      } else {
        this.thePost.author = {};
        this.thePost.author.name = 'No Author';
      }

      // set the date as a MomentJS instance
      try {
        this.thePost.date = moment(this.thePost.date);
      } catch (error) {
        Errors.invalidDate(this.thePost.date, file);
        return;
      }

      // Extract Tags
      if (this.thePost.tags) {
        this.thePost.tags.forEach(tag => {
          this.app.tags[slug(tag.toLowerCase())] = tag;
        });
      }

      // Extract Categories
      if (typeof this.thePost.categories === 'string') {
        this.app.categories[slug(this.thePost.categories.toLowerCase())] = this.thePost.categories;
      } else if (Array.isArray(this.thePost.categories)) {
        this.thePost.categories.forEach(cat => {
          this.app.categories[slug(cat.toLowerCase())] = cat;
        });
      }

      // Setting the post content
      this.thePost.content = marked(this.thePost.content);

      // Setting the post Slug
      this.thePost.slug = slug(this.thePost.title.toLowerCase());

      // Build permalink
      this.thePost.permalink = this.buildPermalink();

      // Save the post to the cache
      const cached = _.findIndex(this.app.posts, { id: this.thePost.id });
      if (cached > 0) _.pullAt(this.app.posts, cached);
      this.app.posts.push(this.thePost);

      // Compile the post if this is not the first time load
      if (this.isWatcherReady) {
        this.templateCompiler.compilePost(this.thePost);
      }

      // log.success(`Post ${this.thePost.title} was reloaded.`);
    } catch (error) {
      Log.error(error);
      // log.error('Error loading metadata as JSON in');
      Log.error(file);
    }
  }

  compilePostCache() {
    const postsCache = this.app.posts;
    postsCache.forEach(post => this.templateCompiler.compilePost(post));
  }

  getTags() {
    if (this.thePost.tags) {
      this.app.tags.concat(this.thePost.tags);
    }
  }

  getId(file) {
    const filename = path.basename(file).split('-');
    const pid = Number.parseInt(filename[0], 10);
    if (Number.isInteger(pid)) return pid;
    return false;
  }

  buildPermalink() {
    let permalink = this.thePost.permalink || this.app.config.permalink;
    const tags = {
      year: new RegExp('%year%', 'g'),
      month: new RegExp('%month%', 'g'),
      day: new RegExp('%day%', 'g'),
      hour: new RegExp('%hour%', 'g'),
      minute: new RegExp('%minute%', 'g'),
      second: new RegExp('%second%', 'g'),
      id: new RegExp('%id%', 'g'),
      title: new RegExp('%title%', 'g'),
      category: new RegExp('%category%', 'g'),
      author: new RegExp('%author%', 'g'),
    };
    const tagsValues = {
      year: this.thePost.date.format('YYYY'),
      month: this.thePost.date.format('MM'),
      day: this.thePost.date.format('DD'),
      hour: this.thePost.date.format('HH'),
      minute: this.thePost.date.format('mm'),
      second: this.thePost.date.format('ss'),
      id: this.thePost.id,
      title: this.thePost.slug,
      category: slug(
        typeof this.thePost.categories === 'string' ? this.thePost.categories : this.thePost.categories[0].toLowerCase()
      ),
      author: slug(this.thePost.author.name),
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
