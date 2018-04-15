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

var _constants = require('../constants');

var _constants2 = _interopRequireDefault(_constants);

var _logger = require('../tools/logger');

var _logger2 = _interopRequireDefault(_logger);

var _errors = require('../tools/errors');

var _errors2 = _interopRequireDefault(_errors);

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
  }

  _createClass(PostsCompiler, [{
    key: 'watch',
    value: function watch() {
      var _this = this;

      var watcher = _chokidar2.default.watch([(this.app.config.postDir || '_posts') + '/**/*.md', (this.app.config.postDir || '_posts') + '/**/*.markdown'], { ignored: this.ingnores });

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
        meta.content = split[1];
        meta.slug = (0, _slug2.default)(meta.title.toLowerCase());
        var cached = _lodash2.default.findIndex(this.app.posts, { pid: meta.pid });
        if (cached > 0) _lodash2.default.pullAt(this.app.posts, cached);
        this.app.posts.push(meta);
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
  }]);

  return PostsCompiler;
}();

exports.default = PostsCompiler;