var Watcher = require('./watcher')
  , Deployer = require('./deployer')
  , Generator = require('./generator')
  , Config = require('./config')
  , Compiler = require('./compiler')

  , events = require('events')
  , path = require('path')
  , when = require('when')
  , fs = require('fs');

var Peak = function (root_path, options) {
  this.path = path.resolve(root_path);
  this.config = config = new Config(this, options);
  this.emitter = new events.EventEmitter;
}

Peak.prototype = {

  generate: function () {
    var generator = new Generator(this, this.config.options());
    return generator.start();
  },

  watch: function () {
    var watcher = new Watcher(this, this.config.options('watch'));
    return when.try(this.validate_path.bind(this))
      .then(watcher.start.bind(watcher));
  },

  deploy: function (options) {
    var deployer = new Deployer(this, this.config.options('deploy'));
    return when.try(this.validate_path.bind(this))
      .then(deployer.start.bind(deployer));
  },

  validate_path: function () {
    if (!fs.existsSync(this.path)) throw new Error('Path doesn\'t exist.');

    this.lstat = fs.lstatSync(this.path);
    if (!this.lstat.isDirectory()) throw new Error('Path is not a directory.');
  }

}

module.exports = Peak;
