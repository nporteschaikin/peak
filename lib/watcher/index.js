var Server = require('../server')
  , Compiler = require('../compiler')
  , Tumblr = require('../tumblr')

  , when = require('when')
  , request = require('request')
  , chokidar = require('chokidar')
  , path = require('path');

var Watcher = function (peak, options) {
  this.peak = peak;
  this.options = options || {};
  this.emitter = peak.emitter;

  this.compiler = new Compiler(this.peak, this.options);
  this.server = new Server(this.peak, this.options);
  this.tumblr = new Tumblr(this.peak, this.options);
  this.watcher = chokidar.watch(this.peak.path, { ignored: /\.peak$/ });

  this.path = path.join(this.peak.path, '.peak');
  this.emitter.on('exit', this.stop.bind(this));
}

Watcher.prototype = {

  start: function () {
    return this.fetch_tumblr()
      .with(this)
      .then(this.compile)
      .then(this.serve)
      .then(this.watch);
  },

  stop: function () {
    this.watcher.close();
    this.server.stop();
  },

  fetch_tumblr: function () {
    return this.tumblr.fetch_demo_content();
  },

  compile: function (context) {
    return this.compiler.compile_project(context);
  },

  serve: function () {
    return this.server.start();
  },

  watch: function () {
    // this.watcher.on('change', this.compile.bind(this));
  }

}

module.exports = Watcher;
