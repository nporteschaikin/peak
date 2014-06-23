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
    return this.init_options(options);
  },

  init_options: function (options) {
    var __this = this;

    options.out_path = function (source_path) {
      var output_path = path.resolve(__this.peak.path, options.output_path);

      if (typeof source_path === 'string')
        return path.join(output_path, path.relative(__this.peak.path, source_path));

      return output_path;
    };

    options.is_ignored = function (basename) {
      var ignore = (options.ignore instanceof Array) ? options.ignore : [];
      ignore.push(options.out_path());

      for (var x=0; x<ignore.length; x++) {
        if (basename == ignore[x]) return true;
      };
    };

    options.toYaml = function () {
      var opts = {};

      for (var option in options)
        if (!(typeof options[option] === 'function')) opts[option] = options[option];

      return yaml.safeDump(opts);
    };

    return options;
  }

}

module.exports = Config;
