var Watcher = require('./watcher')
  , Deployer = require('./deployer')
  , Generator = require('./generator')
  , Config = require('./config')
  , events = require('events')
  , path = require('path')
  , fs = require('fs')

  , resolve = path.resolve
  , lstat = fs.lstatSync
  , exists = fs.existsSync;

var Peak = function (path, options) {
  this.path = resolve(path);
  this.config = new Config(this);
  this.options = this.config.load(options);
  this.emitter = new events.EventEmitter;
}

Peak.prototype = {

  generate: function () {
    var generator = new Generator(this);
    return generator.start()
      .catch(this.error.bind(this));
  },

  watch: function () {
    this.validate_path();

    var watcher = new Watcher(this);
    return watcher.start()
      .catch(this.error.bind(this));
  },

  deploy: function (options) {
    this.validate_path();

    var deployer = new Deployer(this);
    return deployer.start()
      .catch(this.error.bind(this));
  },

  validate_path: function () {
    if (!exists(this.path)) throw new Error('Path doesn\'t exist.');

    this.lstat = lstat(this.path);
    if (!this.lstat.isDirectory()) throw new Error('Path is not a directory.');
  },

  error: function (error) {
    this.emitter.emit('error', error.message);
  }

}

module.exports = Peak;
