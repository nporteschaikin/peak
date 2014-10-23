var path = require('path')
  , fs = require('fs')
  , path = require('path')
  , when = require('when')
  , yaml = require('js-yaml');

var Generator = function (peak, options) {
  this.peak = peak;
  this.options = options;
  this.emitter = peak.emitter;
}

Generator.prototype = {

  start: function () {
    return when.try(this.create_folder.bind(this))
      .with(this)
      .then(this.create_index)
      .then(this.create_configuration_file)
      .then(this.emit);
  },

  create_folder: function () {
    fs.mkdirSync(this.peak.path);
  },

  create_index: function () {
    fs.writeFileSync(path.resolve(this.peak.path, this.options.index), '');
  },

  create_configuration_file: function () {
    fs.writeFileSync(this.peak.config.file_path, yaml.safeDump(this.options));
  },

  emit: function () {
    this.emitter.emit('misc', 'created', this.peak.path);
  }

}

module.exports = Generator;
