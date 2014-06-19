var Server = require('./server')
  , Compiler = require('../compiler')

  , when = require('when')
  , request = require('request')
  , chokidar = require('chokidar')
  , path = require('path')

  , join = path.join;

var Watcher = function (peak) {
  this.peak = peak;
  this.options = peak.options;
  this.emitter = peak.emitter;

  this.path = join(this.peak.path, '.peak');
  this.emitter
    .on('exit', this.stop.bind(this));
}

Watcher.prototype = {

  start: function () {
    this.compile()
      .with(this)
      .then(this.serve)
      .then(this.watch);
  },

  stop: function () {
    if (this.server) this.server.stop();
    if (this.watcher) this.watcher.stop();
    return true;
  },

  compile: function () {
    this.compiler = new Compiler(this.peak.path, this.path);
    return this.compiler.compile();
  },

  serve: function () {
    this.server = new Server(this.path, this.options.port, this.options.index);
    return this.server.start();
  },

  watch: function () {
    this.watcher = chokidar.watch(this.peak.path, { ignored: /\.peak/ });
    this.watcher.on('change', this.compile.bind(this));
  }

}

module.exports = Watcher;
