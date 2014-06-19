var Watcher = require('./watcher')
  , Deployer = require('./deployer')
  , Generator = require('./generator')
  , Config = require('./config')
  , Compiler = require('./compiler')
  , events = require('events')
  , path = require('path')
  , when = require('when')
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
    return generator.start();
  },

  watch: function () {
    var watcher = new Watcher(this);
    return when.try(this.validate_path.bind(this))
      .then(watcher.start.bind(watcher));
  },

  deploy: function (options) {
    var deployer = new Deployer(this);
    return when.try(this.validate_path.bind(this))
      .then(deployer.start.bind(deployer));
  },

  validate_path: function () {
    if (!exists(this.path)) throw new Error('Path doesn\'t exist.');

    this.lstat = lstat(this.path);
    if (!this.lstat.isDirectory()) throw new Error('Path is not a directory.');
  }

}

module.exports = Peak;
