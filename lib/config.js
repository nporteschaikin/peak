var yaml = require('js-yaml')
  , fs = require('fs')
  , path = require('path');

var Config = function (peak, options) {
  this.peak = peak;
  this.file_path = path.join(this.peak.path, '.peakconfig.yml');

  this.config = {};
  this.options_argument = options || {};

  this.load_defaults();
  this.load_file();
}

Config.prototype = {

  load_defaults: function () {
    this.config.output_path = '.peak';
    this.config.port = 1111;
  },

  load_file: function () {
    var file;
    if (fs.existsSync(this.file_path)) {
      file = yaml.safeLoad(fs.readFileSync(this.file_path, 'utf8'));
      for (var opt in file) this.config[opt] = file[opt];
    }
  },

  options: function (action) {
    var options = {};


    for (option in this.config) {
      options[option] = this.config[option];
    }

    if (typeof options[action] === 'object') {
      for (option in options[action]) options[option] = options[action][option];
    }

    for (option in this.options_argument) {
      if (this.options_argument[option]) options[option] = this.options_argument[option];
    }

    if (!options.ignore_paths instanceof Array) {
      options.ignore_paths = [];
    }

    if (options.ignore_paths.indexOf(options.output_path) == -1) {
      options.ignore_paths.push(options.output_path);
    }

    return options;
  }

}

module.exports = Config;
