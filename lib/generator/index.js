var path = require('path')
  , fs = require('fs')
  , path = require('path')
  , when = require('when')
  , yaml = require('js-yaml')

  , mkdir = fs.mkdirSync
  , write = fs.writeFileSync
  , resolve = path.resolve;

var Generator = function (peak) {
  this.peak = peak;
  this.options = peak.options;
  this.emitter = peak.emitter;
}

Generator.prototype = {

  start: function () {
    return when.try(this.create_folder.bind(this))
      .with(this)
      .then(this.define_index)
      .then(this.create_index)
      .then(this.create_configuration_file)
      .then(this.emit);
  },

  create_folder: function () {
    mkdir(this.peak.path);
  },

  define_index: function () {
    if (!this.options.index)
      this.options.index = 'index.jade';
  },

  create_index: function () {
    write(resolve(this.peak.path, this.options.index), '');
  },

  create_configuration_file: function () {
    write(this.peak.config.file_path, yaml.safeDump(this.options));
  },

  emit: function () {
    this.emitter.emit('misc', 'created', this.peak.path);
  }

}

module.exports = Generator;
