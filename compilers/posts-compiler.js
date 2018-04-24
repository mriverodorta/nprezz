'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _slug = require('slug');

var _slug2 = _interopRequireDefault(_slug);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _grayMatter = require('gray-matter');

var _grayMatter2 = _interopRequireDefault(_grayMatter);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _constants = require('../constants');

var _constants2 = _interopRequireDefault(_constants);

var _logger = require('../tools/logger');

var _logger2 = _interopRequireDefault(_logger);

var _errors = require('../tools/errors');

var _errors2 = _interopRequireDefault(_errors);

var _templatesCompiler = require('./templates-compiler');

var _templatesCompiler2 = _interopRequireDefault(_templatesCompiler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PostsCompiler = function () {
  /**
   * Creates an instance of PostsCompiler.
   * @param {App} app App Object
   */
  function PostsCompiler(app) {
    _classCallCheck(this, PostsCompiler);

    this.app = app;
    this.ingnores = _lodash2.default.concat(_constants2.default.ignoredGlobs(), app.config.ignoreList || []);

    // Is the watcher ready
    this.isWatcherReady = false;

    // Current post
    this.thePost = {};

    this.templateCompiler = new _templatesCompiler2.default(app);
    this.matterOptions = {
      excerpt: true,
      excerpt_separator: this.app.config.excerpt ? this.app.config.excerpt.separator || '<!--more-->' : '<!--more-->'
    };
  }

  _createClass(PostsCompiler, [{
    key: 'watch',
    value: function watch() {
      var _this = this;

      var watcher = _chokidar2.default.watch([(this.app.config.posts.dir || '_posts') + '/**/*.md', (this.app.config.posts.dir || '_posts') + '/**/*.markdown'], { ignored: this.ingnores });

      watcher.on('all', function (e, file) {
        // if (!this.isWatcherReady) {
        _this.loadPost(file);
        // } else if (path.extname(file) !== '') {
        //   this.firstTimePosts.push(file);
        // }
      });

      watcher.on('ready', function () {
        // Set the watcher as ready
        _this.isWatcherReady = true;

        // compile all the loaded post
        _this.compilePostCache();
      });
    }
  }, {
    key: 'loadPost',
    value: function loadPost(file) {
      var _this2 = this;

      this.thePost = {};
      try {
        // Check if the file exist
        if (!_fsExtra2.default.pathExistsSync(file)) return;

        // Read the post file
        var raw = _grayMatter2.default.read(file, this.matterOptions);
        // Build meta from frontmatter
        this.thePost = raw.data;
        // Setting the content
        this.thePost.content = raw.content;

        // Setting the excerpt
        if (this.thePost.excerpt) {
          try {
            this.thePost.excerpt = (0, _marked2.default)(this.thePost.excerpt);
          } catch (e) {
            /* nothing to do */
          }
        } else if (raw.excerpt) {
          try {
            this.thePost.excerpt = (0, _marked2.default)(raw.excerpt);
          } catch (e) {
            this.thePost.excerpt = raw.excerpt;
          }
        }

        // Check if there is a minimum of frontmatter (title & date)
        if (!this.thePost.title || !this.thePost.date) {
          _errors2.default.noMinimumFrontmatter(file);
          return;
        }

        // Get the Post id if it is not on the this.thePost and is in the filename
        if (!this.thePost.id && this.getId(file)) {
          this.thePost.id = this.getId(file);
        }

        // Post without id will not be processed
        if (!this.thePost.id) {
          _errors2.default.missingPostId(file, this.thePost);
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
          this.thePost.date = (0, _moment2.default)(this.thePost.date);
        } catch (error) {
          _errors2.default.invalidDate(this.thePost.date, file);
          return;
        }

        // Extract Tags
        if (this.thePost.tags) {
          this.thePost.tags.forEach(function (tag) {
            _this2.app.tags[(0, _slug2.default)(tag.toLowerCase())] = tag;
          });
        }

        // Extract Categories
        if (typeof this.thePost.categories === 'string') {
          this.app.categories[(0, _slug2.default)(this.thePost.categories.toLowerCase())] = this.thePost.categories;
        } else if (Array.isArray(this.thePost.categories)) {
          this.thePost.categories.forEach(function (cat) {
            _this2.app.categories[(0, _slug2.default)(cat.toLowerCase())] = cat;
          });
        }

        // Setting the post content
        this.thePost.content = (0, _marked2.default)(this.thePost.content);

        // Setting the post Slug
        this.thePost.slug = (0, _slug2.default)(this.thePost.title.toLowerCase());

        // Build permalink
        this.thePost.permalink = this.buildPermalink();

        // Save the post to the cache
        var cached = _lodash2.default.findIndex(this.app.posts, { id: this.thePost.id });
        if (cached > 0) _lodash2.default.pullAt(this.app.posts, cached);
        this.app.posts.push(this.thePost);

        // Compile the post if this is not the first time load
        if (this.isWatcherReady) {
          this.templateCompiler.compilePost(this.thePost);
        }

        // log.success(`Post ${this.thePost.title} was reloaded.`);
      } catch (error) {
        _logger2.default.error(error);
        // log.error('Error loading metadata as JSON in');
        _logger2.default.error(file);
      }
    }
  }, {
    key: 'compilePostCache',
    value: function compilePostCache() {
      var _this3 = this;

      var postsCache = this.app.posts;
      postsCache.forEach(function (post) {
        return _this3.templateCompiler.compilePost(post);
      });
    }
  }, {
    key: 'getTags',
    value: function getTags() {
      if (this.thePost.tags) {
        this.app.tags.concat(this.thePost.tags);
      }
    }
  }, {
    key: 'getId',
    value: function getId(file) {
      var filename = _path2.default.basename(file).split('-');
      var pid = Number.parseInt(filename[0], 10);
      if (Number.isInteger(pid)) return pid;
      return false;
    }
  }, {
    key: 'buildPermalink',
    value: function buildPermalink() {
      var permalink = this.thePost.permalink || this.app.config.permalink || '/post/%slug%';
      var tags = {
        year: new RegExp('%year%', 'g'),
        month: new RegExp('%month%', 'g'),
        day: new RegExp('%day%', 'g'),
        hour: new RegExp('%hour%', 'g'),
        minute: new RegExp('%minute%', 'g'),
        second: new RegExp('%second%', 'g'),
        id: new RegExp('%id%', 'g'),
        slug: new RegExp('%slug%', 'g'),
        category: new RegExp('%category%', 'g'),
        author: new RegExp('%author%', 'g')
      };
      var tagsValues = {
        year: this.thePost.date.format('YYYY'),
        month: this.thePost.date.format('MM'),
        day: this.thePost.date.format('DD'),
        hour: this.thePost.date.format('HH'),
        minute: this.thePost.date.format('mm'),
        second: this.thePost.date.format('ss'),
        id: this.thePost.id,
        slug: this.thePost.slug,
        category: (0, _slug2.default)(typeof this.thePost.categories === 'string' ? this.thePost.categories : this.thePost.categories[0]),
        author: (0, _slug2.default)(this.thePost.author.name)
      };

      _lodash2.default.forEach(tags, function (regex, key) {
        permalink = permalink.replace(regex, tagsValues[key]);
      });
      if (permalink.charAt(permalink.length - 1) === '/') {
        permalink += 'index.html';
      } else {
        permalink += '.html';
      }
      return permalink;
    }
  }]);

  return PostsCompiler;
}();

exports.default = PostsCompiler;