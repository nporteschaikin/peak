var yaml = require('js-yaml')
  , fs = require('fs')
  , path = require('path')

  , exists = fs.existsSync
  , read = fs.readFileSync
  , readdir = fs.readdirSync
  , join = path.join
  , resolve = path.resolve
  , basename = path.basename;

var Config = function (peak) {
  this.peak = peak;
  this.file_path = join(this.peak.path, '.peakconfig.yml');
  this.config = {};
}

Config.prototype = {

  load: function (options) {
    this.load_defaults();
    this.load_file();
    this.load_arg(options);
    return this.config;
  },

  load_defaults: function () {
    this.config.watch = {};
    this.config.deploy = {};
  },

  load_file: function () {
    var file;
    if (exists(this.file_path)) {
      file = yaml.safeLoad(read(this.file_path, 'utf8'));
      for (var opt in file) this.config[opt] = file[opt];
    }
  },

  load_arg: function (options) {
    for (opt in options) {
      if (typeof options[opt] === 'string') this.config[opt] = options[opt];
    }
  }

}

module.exports = Config;
