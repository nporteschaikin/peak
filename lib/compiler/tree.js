var fs = require('fs')
  , path = require('path')

  , readdir = fs.readdirSync
  , lstat = fs.lstatSync
  , join = path.join;

var Tree = function (source_path, ignored_paths) {
  this.source = source_path;
  this.folders = [];
  this.files = [];
  this.ignored_paths = ignored_paths || [];
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
      if (!this.is_ignored_path(paths[x])) {
        lstat = fs.lstatSync(source_path);
        if (lstat.isDirectory()) {
          this.parse_folder(source_path);
        } else if (lstat.isFile()) {
          this.files.push(source_path);
        }
      }
    }
  },

  is_ignored_path: function (source_path) {
    var ignored_paths = this.ignored_paths;
    for (var x=0; x<ignored_paths.length; x++) {
      if (ignored_paths[x] == source_path) return true;
    }
  }

}

module.exports = Tree;
