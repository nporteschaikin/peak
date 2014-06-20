var Server = require('../server')
  , Compiler = require('../compiler')

  , when = require('when')
  , request = require('request')
  , chokidar = require('chokidar')
  , path = require('path')

  , join = path.join;

var Watcher = function (peak, options) {
  this.peak = peak;
  this.options = options || {};
  this.emitter = peak.emitter;

  this.compiler = new Compiler(this.peak, this.options);
  this.server = new Server(this.peak, this.options);
  this.watcher = chokidar.watch(this.peak.path, { ignored: /\.peak/ });

  this.path = join(this.peak.path, '.peak');
  this.emitter
    .on('exit', this.stop.bind(this));
}

Watcher.prototype = {

  start: function () {
    return this.compile()
      .with(this)
      .then(this.serve)
      .then(this.watch);
  },

  stop: function () {
    this.watcher.close();
    this.server.stop();
    return true;
  },

  compile: function () {
    return this.compiler.compile_with_tumblr();
  },

  serve: function () {
    return this.server.start();
  },

  watch: function () {
    this.watcher.on('change', this.compile.bind(this));
  }

}

module.exports = Watcher;
