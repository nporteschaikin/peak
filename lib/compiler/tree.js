var fs = require('fs')
  , path = require('path')

  , readdir = fs.readdirSync
  , lstat = fs.lstatSync
  , join = path.join;

var Tree = function (source_path, ignored_paths) {
  this.source = source_path;
  this.folders = [];
  this.files = [];
  this.ignored_paths = (ignored_paths || []);
}

Tree.prototype = {

  parse: function () {
    this.parse_folder(this.source);
  },

  parse_folder: function (folder) {
    var paths = readdir(folder)
      , path
      , stat;

    this.folders.push(folder);

    for (var x=0; x<paths.length; x++) {
      path = join(folder, paths[x]);
      stat = lstat(path);
      if (!this.is_ignored_path(paths[x])) {
        if (stat.isDirectory()) {
          this.parse_folder(path);
        } else if (stat.isFile()) {
          this.files.push(path);
        }
      }
    }
  },

  is_ignored_path: function (path) {
    var ignored_paths = this.ignored_paths;
    for (var x=0; x<ignored_paths.length; x++) {
      if (ignored_paths[x] == path) return true;
    }
  }

}

module.exports = Tree;
