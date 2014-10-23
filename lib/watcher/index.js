var Server = require('../server')
  , Compiler = require('../compiler')
  , Tumblr = require('../tumblr')

  , when = require('when')
  , request = require('request')
  , chokidar = require('chokidar')
  , minimatch = require('minimatch')
  , path = require('path');

var Watcher = function (peak, options) {
  this.peak = peak;
  this.options = options || {};
  this.emitter = peak.emitter;

  this.compiler = new Compiler(this.peak, this.options);
  this.server = new Server(this.peak, this.options);

  this.path = path.join(this.peak.path, this.options.output_path);
  this.emitter.on('exit', this.stop.bind(this));
}

Watcher.prototype = {

  start: function () {
    return this.fetch_tumblr_demo_content()
      .with(this)
      .then(this.handle_demo_content)
      .then(this.compile)
      .then(this.watch)
      .then(this.serve);
  },

  stop: function () {
    if (this.watcher) this.watcher.close();
    this.server.stop();
  },

  fetch_tumblr_demo_content: function () {
    if (this.options.blog) {
      var tumblr = new Tumblr(this.peak, this.options);
      return tumblr.fetch_demo_content();
    }
    return when.resolve();
  },

  handle_demo_content: function (response) {
    if (response) this.context = response;
  },

  compile: function () {
    return this.compiler.compile_project(this.context);
  },

  serve: function () {
    return this.server.start();
  },

  watch: function () {
    if (!this.watcher) {
      this.watcher = chokidar.watch(this.peak.path, {
        ignored: this.is_ignore_path.bind(this),
        ignoreInitial: true
      });
    }
    this.watcher.on('change', this.compile.bind(this));
  },

  is_ignore_path: function (p) {
    p = p.replace(this.peak.path, '').slice(1);
    for (var x=0; x<this.options.ignore_paths.length; x++) {
      if (minimatch(p, this.options.ignore_paths[x], { dot: true })) return true;
    }
    return false;
  }

}

module.exports = Watcher;
