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

    this.templateCompiler = new _templatesCompiler2.default(app);
  }

  _createClass(PostsCompiler, [{
    key: 'watch',
    value: function watch() {
      var _this = this;

      var watcher = _chokidar2.default.watch([(this.app.config.posts.dir || '_posts') + '/**/*.md', (this.app.config.posts.dir || '_posts') + '/**/*.markdown'], { ignored: this.ingnores });

      watcher.on('all', function (e, file) {
        _this.loadPost(file);
      });

      watcher.on('ready', function () {});
    }
  }, {
    key: 'loadPost',
    value: function loadPost(file) {
      var _this2 = this;

      try {
        if (!_fsExtra2.default.pathExistsSync(file)) return;
        var raw = _fsExtra2.default.readFileSync(file, 'utf8');
        var split = raw.split('}---');
        var meta = JSON.parse(split[0] + '}');

        // Get the Post Id if is not on the meta and is on the filename
        if (!meta.pid && this.getPid(file)) {
          meta.pid = this.getPid(file);
        }

        // Post widout id will not be proccesed
        if (!meta.pid) {
          _errors2.default.missingPostId(file, meta);
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
        meta.date = (0, _moment2.default)(meta.date);

        // Extract Tags
        if (meta.tags) {
          meta.tags.forEach(function (tag) {
            _this2.app.tags[(0, _slug2.default)(tag.toLowerCase())] = tag;
          });
        }

        // Extract Categories
        if (typeof meta.categories === 'string') {
          this.app.categories[(0, _slug2.default)(meta.categories.toLowerCase())] = meta.categories;
        } else if (Array.isArray(meta.categories)) {
          meta.categories.forEach(function (cat) {
            _this2.app.categories[(0, _slug2.default)(cat.toLowerCase())] = cat;
          });
        }

        // Setting the post content
        meta.content = (0, _marked2.default)(split[1]);

        // Setting the post Slug
        meta.slug = (0, _slug2.default)(meta.title.toLowerCase());

        // Build permalink
        meta.permalink = this.buildPermalink(meta);

        var cached = _lodash2.default.findIndex(this.app.posts, { pid: meta.pid });
        if (cached > 0) _lodash2.default.pullAt(this.app.posts, cached);
        this.app.posts.push(meta);

        // Compile the post
        this.templateCompiler.compilePost(meta);

        // log.success(`Post ${meta.title} was reloaded.`);
      } catch (error) {
        _logger2.default.error(error);
        // log.error('Error loading metadata as JSON in');
        _logger2.default.error(file);
      }
    }
  }, {
    key: 'getTags',
    value: function getTags(meta) {
      if (meta.tags) {
        this.app.tags.concat(meta.tags);
      }
    }
  }, {
    key: 'getPid',
    value: function getPid(file) {
      var filename = _path2.default.basename(file).split('-');
      var pid = Number.parseInt(filename[0], 10);
      if (Number.isInteger(pid)) return pid;
      return false;
    }
  }, {
    key: 'buildPermalink',
    value: function buildPermalink(meta) {
      var permalink = meta.permalink || this.app.config.permalink || '/post/%slug%';
      var tags = {
        year: new RegExp('%year%', 'g'),
        month: new RegExp('%month%', 'g'),
        day: new RegExp('%day%', 'g'),
        hour: new RegExp('%hour%', 'g'),
        minute: new RegExp('%minute%', 'g'),
        second: new RegExp('%second%', 'g'),
        pid: new RegExp('%pid%', 'g'),
        slug: new RegExp('%slug%', 'g'),
        category: new RegExp('%category%', 'g'),
        author: new RegExp('%author%', 'g')
      };
      var tagsValues = {
        year: meta.date.format('YYYY'),
        month: meta.date.format('MM'),
        day: meta.date.format('DD'),
        hour: meta.date.format('HH'),
        minute: meta.date.format('mm'),
        second: meta.date.format('ss'),
        pid: meta.pid,
        slug: meta.slug,
        category: (0, _slug2.default)(typeof meta.categories === 'string' ? meta.categories : meta.categories[0]),
        author: (0, _slug2.default)(meta.author.name)
      };

      _lodash2.default.forEach(tags, function (regex, key) {
        permalink = permalink.replace(regex, tagsValues[key]);
      });
      if (permalink.charAt(permalink.length - 1) === '/') {
        permalink += 'index.html';
      } else {
        permalink += '.html';
      }
      console.log(permalink);
      return permalink;
    }
  }]);

  return PostsCompiler;
}();

exports.default = PostsCompiler;