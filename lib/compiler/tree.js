var fs = require('fs')
  , path = require('path')
  , minimatch = require('minimatch');

var Tree = function (source_path, ignore_paths) {
  this.source = source_path;
  this.folders = [];
  this.files = [];
  this.ignore_paths = ignore_paths || [];
}

Tree.prototype = {

  parse: function () {
    this.parse_folder(this.source);
  },

  parse_folder: function (folder) {
    var paths = fs.readdirSync(folder)
      , source_path
      , lstat;

    this.folders.push(folder);

    for (var x=0; x<paths.length; x++) {
      source_path = path.join(folder, paths[x]);
      if (!this.is_ignore_path(source_path)) {
        lstat = fs.lstatSync(source_path);
        if (lstat.isDirectory()) {
          this.parse_folder(source_path);
        } else if (lstat.isFile()) {
          this.files.push(source_path);
        }
      }
    }
  },

  is_ignore_path: function (source_path) {
    for (var x=0; x<this.ignore_paths.length; x++) {
      if (minimatch(path.basename(source_path), this.ignore_paths[x])) return true;
    }
    return false;
  }

}

module.exports = Tree;
