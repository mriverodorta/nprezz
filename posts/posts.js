'use strict';
const glob = require('glob');
const Timer = require('../tools/timer');
const constants = require('../constants');
const log = require('../tools/logger');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs-extra');
const slug = require('slug');
const _ = require('lodash');
const pug = require('pug');
const Errors = require('../tools/errors');

module.exports = (app) => {
  const postDir = path.join(app.cwd, app.config.postDir || '_posts');
  const ingnores = constants.ignoredGlobs.concat(app.config.ignoreList || []);
  return {
    watch() {
      let watcher = chokidar.watch([(app.config.postDir || '_posts') + '/**/*.md', (app.config.postDir || '_posts') + '/**/*.markdown'], { ignored: ingnores });
      watcher.on('all', (e, file) => {
        loadPost(file, app);
      });
      watcher.on('ready', (e) => {
        // const pugOptions = { pretty: true, basedir: './src/views' };
        // app.posts = _.compact(app.posts);
        // let template = pug.renderFile('./post.pug', app);
        // _.forIn(app.posts, post => {
        //   console.log(post.title);
        // })
        // app.posts = _.union(app.posts);
        // app.posts.forEach((post, pid) => {
        //   console.log(pid);
        // })
        // app.posts = app.posts.map((post, id) => id? id: false)
        // console.log(app.posts[0]);
      })
    }
  }
}

function loadPost(file, app) {
  // console.log(app.tags);
  try {
    let filename = path.basename(file);
    if (!fs.pathExistsSync(file)) return;
    const raw = fs.readFileSync(file, 'utf8');
    const split = raw.split('}---');
    let meta = JSON.parse(split[0] + '}');
    // Get the Post Id if is not on the meta and is on the filename
    if (!meta.pid && getPid(file)) {
      meta.pid = getPid(file);
    }
    // Post widout id will not be proccesed
    if (!meta.pid) {
      Errors.missingPostId(file, meta);
      return;
    };
    // Extract Tags
    if (meta.tags) meta.tags.forEach(tag => app.tags[slug(tag.toLowerCase())] = tag)
    // Extract Categories
    if (typeof meta.categories === 'string') app.categories[slug(meta.categories.toLowerCase())] = meta.categories;
    else if (Array.isArray(meta.categories)) meta.categories.forEach(cat => app.categories[slug(cat.toLowerCase())] = cat)
    meta.content = split[1];
    meta.slug = slug(meta.title.toLowerCase());
    let cached = _.findIndex(app.posts, { pid: meta.pid });
    if (cached > 0) _.pullAt(app.posts, cached);
    app.posts.push(meta);
    // log.success(`Post ${meta.title} was reloaded.`);
  } catch (error) {
    log.error(error)
    // log.error('Error loading metadata as JSON in');
    log.error(file);
  }
}

function getTags(meta, app) {
  if (meta.tags) {
    app.tags.concat(meta.tags);
  }
}
function getPid(file) {
  let filename = path.basename(file).split('-');
  let pid = Number.parseInt(filename[0]);
  if (Number.isInteger(pid)) return pid;
  else return false;
}