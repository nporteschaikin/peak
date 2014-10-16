var yaml = require('js-yaml')
  , fs = require('fs')
  , path = require('path');

var Config = function (peak, options) {
  options = options || {};
  this.peak = peak;
  this.file_path = path.join(this.peak.path, '.peakconfig.yml');

  this.load_defaults();
  this.load_file();
  this.load_arg(options);
}

Config.prototype = {

  load_defaults: function () {
    var config = {};

    config.output_path = '.peak';
    config.port = 1111;

    this.config = config;
  },

  load_file: function () {
    var file;
    if (fs.existsSync(this.file_path)) {
      file = yaml.safeLoad(fs.readFileSync(this.file_path, 'utf8'));
      for (var opt in file) this.config[opt] = file[opt];
    }
  },

  load_arg: function (options) {
    for (opt in options) {
      if (typeof options[opt] === 'string') this.config[opt] = options[opt];
    }
  },

  options: function (action) {
    var config = this.config
      , options = {};
    for (option in config) {
      options[option] = config[option];
    }
    if (typeof config[action] === 'object') {
      for (option in config[action]) options[option] = config[action][option];
    }
    return options;
  }

}

module.exports = Config;
